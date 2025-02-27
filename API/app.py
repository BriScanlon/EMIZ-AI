# Standard Library Imports
import os
import json
import logging
import io
import asyncio
from datetime import datetime
from fastapi.responses import StreamingResponse

# Third-Party Imports
from fastapi import FastAPI, HTTPException, File, UploadFile, Body, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from sentence_transformers import SentenceTransformer

# LangChain & LLM-Related Imports
from langchain_community.document_loaders import TextLoader
from langchain.schema import Document
from langchain_community.graphs import Neo4jGraph
from langchain_community.vectorstores import Neo4jVector
from langchain_experimental.graph_transformers import LLMGraphTransformer
from langchain.chains import GraphCypherQAChain
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_ollama.llms import OllamaLLM
from langchain.prompts import PromptTemplate

# Neo4j Database
from neo4j import GraphDatabase

# Helper Functions & Configurations
from helpers.process_document import process_document
from helpers.chunk_text import chunk_text
from helpers.vector_search import vector_search
from llmconfig.system_prompts import TEXT_SYSTEM_PROMPT
from llmconfig.canned_response import canned_response
from utils import slugify, save_file, load_file
from helpers.embed_text import embed_text
from helpers.split_message import split_message_object

# environment settings
NEO4J_URI = "bolt://neo4j-db-container"
NEO4J_USER = os.getenv("NEO4J_USER", "neo4j")
NEO4J_PASSWORD = os.getenv("NEO4J_PASSWORD", "TestPassword")

# ollama settings
llm_default_model = "phi4"
llm_max_ctx_model = "phi4_max_ctx"
llm_default_temp = 0
llm_port = os.getenv("OLLAMA_PORT_I", "11434")
llm_base_url = "http://ollama-container:{}".format(llm_port)
llm_graph = OllamaLLM(
    base_url=llm_base_url, model=llm_max_ctx_model, temperature=llm_default_temp
)  # Used by the cypher query
llm_text_response = OllamaLLM(
    base_url=llm_base_url, model=llm_default_model, temperature=llm_default_temp
)  # Used to create the final text output
llm_transformer = LLMGraphTransformer(llm=llm_graph)

llm_current_chat_name = None
llm_current_chat_history = []

model = SentenceTransformer("all-MiniLM-L6-v2")

# chunk settings
CHUNK_SIZE = 1000
CHUNK_OVERLAP = 200

# Neo4j settings
graph_driver = Neo4jGraph(NEO4J_URI, NEO4J_USER, NEO4J_PASSWORD)

graph_driver.refresh_schema()


# Define a Pydantic model for the request body
class QueryRequest(BaseModel):
    query: str
    system_prompt: str = Field(
        None, description="System prompt to use, overrides the default one."
    )
    chat_name: str = Field(None, description="Chat session identifier.")
    debug_test: bool = Field(
        False,
        description="If you set this to true making a request you will get a canned response back",
    )
    verbose: bool = Field(
        False,
        description="If set to true this will include some additional debugging information not required to function, such as the system prompt.",
    )


# Cypher query connector
cypher_chain = GraphCypherQAChain.from_llm(
    cypher_llm=llm_graph,
    qa_llm=llm_graph,
    graph=graph_driver,
    verbose=True,
    allow_dangerous_requests=True,
)

# Ensure ChatLogs folder exists
CHAT_LOGS_DIR = "ChatLogs"
os.makedirs(CHAT_LOGS_DIR, exist_ok=True)

# initialise FastAPI
app = FastAPI()

origins = ["*"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Test Service running endpoint
@app.get("/")
def read_root():
    return {"message": "Service is running."}


# upload document, process and transform to knowledge graph data
@app.post("/documents")
async def post_documents(file: UploadFile = File(...)):
    """
    Uploads a PDF file, extracts text using `process_document()`, stores chunked text with vectors in Neo4j.
    Ensures each chunk has a globally unique ID and is linked correctly only within its document.
    """
    if not file:
        raise HTTPException(status_code=400, detail="File is required")

    # Validate file type (PDF only)
    allowed_extensions = {"pdf"}
    file_extension = file.filename.split(".")[-1].lower()
    if file_extension not in allowed_extensions:
        raise HTTPException(status_code=400, detail="Unsupported file type")

    # Read file content
    file_content = await file.read()
    if not file_content:
        raise HTTPException(status_code=400, detail="File is empty or unreadable")

    try:
        # Generate a unique document ID
        document_id = file.filename.split(".")[0]  # Use filename as document ID

        # Call `process_document()` to extract text from PDF
        processed_data = process_document(file_content, file_extension)
        if not processed_data or "text" not in processed_data:
            raise HTTPException(
                status_code=500, detail="Error processing PDF: no content extracted"
            )

        processed_text = processed_data["text"]

        # Chunk the extracted text
        text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=CHUNK_SIZE, chunk_overlap=CHUNK_OVERLAP
        )
        chunks = text_splitter.split_text(processed_text)

        # Generate vector embeddings
        chunk_embeddings = model.encode(chunks, convert_to_numpy=True)

        # Store in Neo4j
        with GraphDatabase.driver(
            NEO4J_URI, auth=(NEO4J_USER, NEO4J_PASSWORD)
        ) as driver:
            with driver.session() as session:
                for i, chunk in enumerate(chunks):
                    unique_chunk_id = f"{document_id}_{i}"
                    session.run(
                        """
                        CREATE (c:Chunk {chunk_id: $chunk_id, document_id: $document_id, text: $text, vector: $vector})
                        """,
                        chunk_id=unique_chunk_id,
                        document_id=document_id,
                        text=chunk,
                        vector=chunk_embeddings[i].tolist(),
                    )

                    if i > 0:
                        prev_chunk_id = f"{document_id}_{i - 1}"
                        session.run(
                            """
                            MATCH (c1:Chunk {chunk_id: $chunk1, document_id: $document_id}),
                                  (c2:Chunk {chunk_id: $chunk2, document_id: $document_id})
                            CREATE (c1)-[:NEXT]->(c2)
                            """,
                            chunk1=prev_chunk_id,
                            chunk2=unique_chunk_id,
                            document_id=document_id,
                        )

        return {
            "message": f"Document '{file.filename}' processed and stored in Neo4j.",
            "document_id": document_id,
            "total_chunks": len(chunks),
        }

    except Exception as e:
        logging.error(f"Error processing PDF: {e}")
        raise HTTPException(
            status_code=500, detail=f"Internal error during processing: {e}"
        )


@app.post("/query")
async def query_graph_with_cypher(request: QueryRequest):
    """
    Endpoint to query the Neo4j database using GraphCypherQAChain with Ollama.
    """
    req_data = dict(request)

    user_query = req_data.get("query", "").strip()
    chat_name = req_data["chat_name"]

    # Optional fields
    system_prompt = req_data["system_prompt"]
    debug_test = req_data.get("debug_test", False)
    verbose = req_data.get("verbose", False)

    # Predefine an empty response dictionary
    response_data = {}  # Initialize an empty dictionary

    # Check for empty query
    if not user_query or user_query.strip() == "":
        msg = "Query string is empty or missing"
        logging.warning(msg)
        raise HTTPException(status_code=418, detail=msg)

    # Generate chat name if empty
    if not chat_name or chat_name.strip() == "":
        chat_name = slugify(user_query[:12])
        logging.info(f"Chat name was empty, generated new one: {chat_name}")
    else:
        chat_name = slugify(chat_name)

    # Use default system prompt if empty
    if not isinstance(system_prompt, str) or not system_prompt.strip():
        system_prompt = TEXT_SYSTEM_PROMPT

    # Debug mode: Return canned response
    if debug_test:
        logging.info("Debug test enabled, returning canned response.")

        # Add properties incrementally
        response_data["status"] = 200
        response_data["query"] = (
            "You asked for a canned response so the query was not used."
        )
        response_data["chat_name"] = "Canned response"
        if verbose:
            response_data["system_prompt"] = system_prompt
        response_data["results"] = canned_response()

        return response_data

    try:
        # Perform vector search
        results = vector_search(user_query, top_n=5) or []

        # Ensure results is a list of dictionaries
        if not isinstance(results, list):
            raise ValueError(
                "Unexpected results format, expected a list of dictionaries."
            )

    except ValueError as ve:
        logging.error(f"Data format error: {ve}")
        raise HTTPException(status_code=500, detail=f"Data format error: {ve}")
    except Exception as e:
        logging.error(f"Vector search failed: {e}")
        results = []

    neo4j_response = []

    for result in results:
        # for each result get the text value of property
        properties = result.get("properties", {})
        text = properties.get("text", "")
        # get the text value of the property
        if text:
            # append text to neo4j_response
            neo4j_response.append(text)
        else:
            logging.warning("No text object included in neo4j responsee.")

    try:

        # send the response to ollama llm with the original query
        # response = llm_graph.invoke(f"{user_query}, {neo4j_response}", max_tokens=16000, temperature=0.0)
        response = query_llm(
            user_query,
            neo4j_response,
            system_prompt=system_prompt,
            chat_name=chat_name,
            model_name=llm_default_model,
        )

        logging.info(f"Neo4j Response: {json.dumps(neo4j_response)}")
        print("DEBUG: Raw LLM Response:", response)  # Log LLM output

        # split the response text into message and node graph
        if isinstance(response, str):
            try:
                response = json.loads(response)  # Convert string to dictionary
            except json.JSONDecodeError:
                raise HTTPException(status_code=500, detail="LLM response is not valid JSON")

        print("DEBUG: Response received before splitting:", type(response), response)

        final_response = split_message_object(response)

        # Add properties incrementally
        response_data["status"] = 200
        response_data["query"] = user_query
        response_data["chat_name"] = chat_name
        if verbose:
            response_data["system_prompt"] = system_prompt
        response_data["results"] = [
            {
                "message": final_response.get("message")
            },
            {"graph": final_response.get("node_graph")},
        ]
        # Save and return
        save_chat_log(chat_name, user_query, response_data)
        return response_data

    except Exception as e:
        logging.error(f"Error querying llm: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"An error occurred while querying that LLM : {e}",
        )


def get_neo4j_query():
    # sends a query to the llm and get s a no4j query back.
    # Checks if query is valid with test function
    # Checks if query is valud with llm query
    # returns the neo4j query string.
    return "Placeholder for node graph"


def get_graph_data(database_query):
    # call database
    # This is a placeholder, someone else is implementing this
    # return a node graph. (json formatted)
    pass


def query_llm(
    user_query,
    neo4j_response,
    system_prompt=TEXT_SYSTEM_PROMPT,
    chat_name="",
    model_name="phi4",
    max_tokens=16000,
):
    """
    Sends a formatted query to the LLM with structured chat history, system prompt, and Neo4j graph data.
    Ensures the total token count does not exceed max_tokens.
    """
    global llm_current_chat_name, llm_current_chat_history

    # Load the correct chat history to prevent cross-conversation contamination
    load_chat_history(chat_name)

    # Start with system prompt
    message_history = [{"role": "system", "content": system_prompt}]

    # Token count starts with system prompt tokens
    token_count = len(system_prompt.split())

    logging.info(f"🔹 Processing chat history for chat: {chat_name}")
    messages_added = 0

    # Process chat history (latest messages first)
    for entry in reversed(llm_current_chat_history):
        user_message = {"role": "user", "content": entry["query"]}
        assistant_messages = entry.get("results", [])

        # Compute token count for user message
        user_message_tokens = len(user_message["content"].split())

        # Ensure there's an assistant response
        if assistant_messages:
            assistant_message = {
                "role": "assistant",
                "content": assistant_messages[0].get("message", ""),
            }
            assistant_message_tokens = len(assistant_message["content"].split())
        else:
            logging.warning(f"❌ No response message found for: {entry['query']}")
            continue  # Skip adding this entry if there's no response

        # Check if adding both messages exceeds max token limit
        estimated_tokens = user_message_tokens + assistant_message_tokens

        if token_count + estimated_tokens < max_tokens:
            message_history.append(user_message)
            message_history.append(assistant_message)
            token_count += estimated_tokens
            messages_added += 2
            logging.info(
                f"✅ Added: User({user_message_tokens} tokens), Assistant({assistant_message_tokens} tokens), Total({token_count}/{max_tokens})"
            )
        else:
            logging.warning(
                f"❌ Skipping due to token limit: User({user_message_tokens} tokens), Assistant({assistant_message_tokens} tokens), Total({token_count}/{max_tokens})"
            )
            break  # Stop adding history if token limit is reached

    logging.info(f"🔹 Total messages included: {messages_added}")

    # Append current user query and Neo4j response
    user_query_entry = {"role": "user", "content": user_query}
    user_query_tokens = len(user_query.split())

    if token_count + user_query_tokens < max_tokens:
        message_history.append(user_query_entry)
        token_count += user_query_tokens

    # If Neo4j response exists, include it as "assistant" message
    if neo4j_response:
        neo4j_entry = {
            "role": "assistant",
            "content": json.dumps(neo4j_response, indent=2),
        }
        neo4j_tokens = len(json.dumps(neo4j_response).split())

        if token_count + neo4j_tokens < max_tokens:
            message_history.append(neo4j_entry)
            token_count += neo4j_tokens

    # Print structured conversation history for debugging
    print("\n" + "=" * 50)
    print("🔹 Formatted Conversation Sent to LLM 🔹")
    print("=" * 50)
    print(json.dumps(message_history, indent=2))
    print("=" * 50 + "\n")

    # Call LLM with full conversation history in structured JSON format
    return llm_text_response.invoke(json.dumps(message_history))


def save_chat_log(chat_name: str, query: str, response: dict):
    """
    Append a structured entry to the chat log file, maintaining in-memory history.
    Uses `save_file()` and `load_file()` from utils.py for file handling.
    """
    global llm_current_chat_name, llm_current_chat_history

    chat_file = load_chat_history(chat_name)

    # Create structured log entry (removing unnecessary fields)
    log_entry = {
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "query": query,  # User input
        "results": response.get(
            "results", []
        ),  # Extract only the results, keeping the format
    }

    # Append new entry to in-memory history
    llm_current_chat_history.append(log_entry)

    # Save updated history to file
    save_file(llm_current_chat_history, chat_file, CHAT_LOGS_DIR)

    logging.info(f"✅ Chat log updated for '{chat_name}' with new entry.")


def load_chat_history(chat_name):
    global llm_current_chat_name, llm_current_chat_history

    chat_name = slugify(chat_name)  # Ensure a safe filename
    chat_file = f"{chat_name}.json"

    # If switching to a new chat, reset and load from file
    if llm_current_chat_name != chat_name:
        llm_current_chat_name = chat_name
        llm_current_chat_history = load_file(chat_file, CHAT_LOGS_DIR) or []

    return chat_file


@app.get("/chats")
async def get_chats():
    """
    Retrieves a list of all stored chat sessions.
    """
    try:
        # List all files in the ChatLogs directory
        chat_files = [
            f.replace(".json", "")
            for f in os.listdir(CHAT_LOGS_DIR)
            if f.endswith(".json")
        ]
        return {"chats": chat_files}
    except Exception as e:
        logging.error(f"Error retrieving chat list: {e}")
        raise HTTPException(status_code=500, detail="Error retrieving chat list.")


@app.get("/chat_history/{chat_name}")
async def get_chat_history(chat_name: str):
    """
    Retrieves chat history for a given chat name.
    Returns only the relevant `results` section.
    """
    chat_file = f"{chat_name}.json"  # Only store the filename

    try:
        # Load chat history
        chat_history = load_file(chat_file, CHAT_LOGS_DIR)

        # Extract responses sorted by timestamp
        sorted_responses = sorted(
            chat_history, key=lambda x: x["timestamp"], reverse=True
        )

        return {"status": 200, "chat_name": chat_name, "chat_history": sorted_responses}

    except json.JSONDecodeError:
        logging.error(f"❌ Chat history JSON is corrupted: {chat_name}")
        raise HTTPException(status_code=500, detail="Chat history file is corrupted.")
    except Exception as e:
        logging.error(f"❌ Error retrieving chat history: {e}")
        raise HTTPException(status_code=500, detail="Error retrieving chat history.")


@app.delete("/chat/{chat_name}")
async def delete_chat(chat_name: str):
    """
    Deletes a chat history file by name.
    """
    chat_file = os.path.join(CHAT_LOGS_DIR, f"{chat_name}.json")

    # Check if chat history exists
    if not os.path.exists(chat_file):
        raise HTTPException(status_code=404, detail="Chat history not found.")

    try:
        os.remove(chat_file)
        return {"message": f"Chat '{chat_name}' has been deleted."}
    except Exception as e:
        logging.error(f"Error deleting chat history: {e}")
        raise HTTPException(status_code=500, detail="Error deleting chat history.")


@app.put("/rename_chat/{chat_name}")
async def rename_chat(chat_name: str, new_chat_name: str = Body(..., embed=True)):
    """
    Renames a chat history file from `chat_name.json` to `new_chat_name.json`.
    """
    old_chat_file = os.path.join(CHAT_LOGS_DIR, f"{chat_name}.json")
    new_chat_file = os.path.join(CHAT_LOGS_DIR, f"{new_chat_name}.json")

    # Check if the original chat exists
    if not os.path.exists(old_chat_file):
        raise HTTPException(status_code=404, detail="Chat history not found.")

    # Ensure the new chat name is valid
    if not new_chat_name.strip():
        raise HTTPException(status_code=400, detail="New chat name cannot be empty.")

    # Prevent overwriting an existing chat
    if os.path.exists(new_chat_file):
        raise HTTPException(
            status_code=400, detail="A chat with the new name already exists."
        )

    try:
        os.rename(old_chat_file, new_chat_file)
        return {"message": f"Chat '{chat_name}' has been renamed to '{new_chat_name}'."}
    except Exception as e:
        logging.error(f"Error renaming chat history: {e}")
        raise HTTPException(status_code=500, detail="Error renaming chat history.")


@app.get("/debug_chat_memory")
async def debug_chat_memory():
    """
    Returns the currently loaded chat name and in-memory chat history.
    """
    global llm_current_chat_name, llm_current_chat_history

    return {
        "status": 200,
        "current_chat_name": llm_current_chat_name or "No chat loaded",
        "chat_history": llm_current_chat_history or [],
    }


@app.get("/batch")
async def process_batch():
    """
    Processes all files in the 'batch' folder by sending them one at a time to the '/documents' endpoint.
    Deletes each file after successful processing and streams real-time progress updates.
    """
    batch_folder = "batch"

    # Ensure the batch folder exists
    if not os.path.exists(batch_folder):
        raise HTTPException(status_code=400, detail="Batch folder does not exist.")

    files = [
        f
        for f in os.listdir(batch_folder)
        if os.path.isfile(os.path.join(batch_folder, f))
    ]

    if not files:
        raise HTTPException(
            status_code=400, detail="No files to process in the batch folder."
        )

    total_files = len(files)

    async def process_files():
        for idx, filename in enumerate(files, start=1):
            file_path = os.path.join(batch_folder, filename)

            try:
                with open(file_path, "rb") as file:
                    file_content = file.read()
                    file_like = io.BytesIO(
                        file_content
                    )  # Convert bytes into a file-like object

                    file_upload = UploadFile(filename=filename, file=file_like)

                    # Send file to /documents endpoint
                    response = await post_documents(file_upload)

                    # Delete the file after successful processing
                    os.remove(file_path)

                    yield f'data: {{"file": "{filename}", "status": "processed", "progress": "{idx} of {total_files}"}}\n\n'

                # Simulate a small delay (optional, for better streaming effect)
                await asyncio.sleep(0.5)

            except Exception as e:
                logging.error(f"Error processing file {filename}: {e}")
                yield f'data: {{"file": "{filename}", "status": "failed: {str(e)}", "progress": "{idx} of {total_files}"}}\n\n'

        yield f'data: {{"message": "Batch processing completed."}}\n\n'

    return StreamingResponse(process_files(), media_type="text/event-stream")


# endpoint for saving query to the database
@app.post("/query/save/")
async def save_query():
    # define the query and response to be saved
    query = llm_current_chat_history[0].get("query")
    message = llm_current_chat_history[0].get("results"[0].get("message"))

    # check that query and message exists
    if not query and message:
        return HTTPException(status_code=400, detail="No chat currently loaded")

    # embed text into vector IDs
    query_embeddings = embed_text(query)
    message_embeddings = embed_text(message)

    # save embeddings to neo4j database as entity type response and connect to chunks that the response is related to

    print()
