import os
import subprocess
import asyncio
import json
import requests
from tempfile import NamedTemporaryFile
from datetime import datetime
from fastapi import FastAPI, HTTPException, File, UploadFile, Body, Query
from fastapi.middleware.cors import CORSMiddleware
from langchain_community.document_loaders import TextLoader
from langchain.schema import Document
from langchain_community.graphs import Neo4jGraph
from langchain_community.vectorstores import Neo4jVector
from langchain_experimental.graph_transformers import LLMGraphTransformer
from langchain.chains import GraphCypherQAChain
from langchain.text_splitter import RecursiveCharacterTextSplitter
from neo4j import GraphDatabase
import logging
from helpers.process_document import process_document
from helpers.chunk_text import chunk_text
from langchain_ollama.llms import OllamaLLM
from langchain.prompts import PromptTemplate
from neo4j import GraphDatabase
from sentence_transformers import SentenceTransformer
import pandas as pd
from pydantic import BaseModel, Field
from helpers.vector_search import vector_search
from llmconfig.system_prompts import TEXT_SYSTEM_PROMPT
from llmconfig.canned_response import canned_response

# environment settings
NEO4J_URI = "bolt://neo4j-db-container"
NEO4J_USER = os.getenv("NEO4J_USER", "neo4j")
NEO4J_PASSWORD = os.getenv("NEO4J_PASSWORD", "TestPassword")

# ollama settings
llm_model="phi4"
llm_port = os.getenv("OLLAMA_PORT_I", "11434")
llm = OllamaLLM(base_url="http://ollama-container:{}".format(llm_port), model=llm_model, temperature=0)
llm_transformer = LLMGraphTransformer(llm=llm)

llm_current_chat_name = None
llm_current_chat_history = None

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
    system_prompt: str = Field(None, description = "System prompt to use, overrides the default one.")
    chat_name: str = Field(None, description = "Chat session identifier.")
    debug_test: bool = Field(False, description = "If you set this to true making a request you will get a canned response back")
    verbose: bool  = Field(False, description = "If set to true this will include some additional debugging information not required to function, such as the system prompt.")

# Cypher query connector
cypher_chain = GraphCypherQAChain.from_llm(
    cypher_llm=llm,
    qa_llm=llm,
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
                        vector=chunk_embeddings[
                            i
                        ].tolist(),
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
    query = request.query
    chat_name = request.chat_name
    
    # Optional field, usualyl should not be letting the user specify the system prompt.
    system_prompt = request.system_prompt
    debug_test = request.debug_test
    verbose = request.verbose
    
    # Predefine an empty response dictionary
    response_data = {}  # Initialize an empty dictionary

    # Check for empty query
    if not query or query.strip() == "":
        msg = "Query string is empty or missing"
        logging.warning(msg)
        raise HTTPException(status_code=418, detail=msg)

    # Generate chat name if empty
    if not chat_name or chat_name.strip() == "":
        chat_name = query[:12].replace(" ", "_")
        logging.info(f"Chat name is empty, generating new one: {chat_name}")

    # Use default system prompt if empty
    if not system_prompt or system_prompt.strip() == "":
        system_prompt = TEXT_SYSTEM_PROMPT

    # Debug mode: Return canned response
    if debug_test:
        logging.info("Debug test enabled, returning canned response.")        

        # Add properties incrementally
        response_data["status"] = 200
        response_data["query"] = "You asked for a canned response so the query was not used."
        response_data["chat_name"] = "Canned response"
        if verbose: response_data["system_prompt"] = system_prompt
        response_data["results"] = canned_response()

        return response_data
   

    try:
        # Perform vector search
        results = vector_search(query, top_n=5)

        # Ensure results is a list of dictionaries
        if not isinstance(results, list):
            raise ValueError("Unexpected results format, expected a list of dictionaries.")

        neo4j_response = []
        
        for result in results:
            # for each result get the text value of property
            text = result.get("properties").get("text")
            # get the text value of the property
            if text:
                # append text to neo4j_response
                neo4j_response.append(text)

        #send the response to ollama llm with the original query
        response = llm.invoke(f"{query}, {neo4j_response}", max_tokens=16000, temperature=0.0)

        logging.info(f"Neo4j Response: {json.dumps(neo4j_response)}")

        # Add properties incrementally
        response_data["status"] = 200
        response_data["query"] = query
        response_data["chat_name"] = chat_name
        if verbose: response_data["system_prompt"] = system_prompt        
        response_data["results"] = [
            {
                "message": response 
            }
        ]
        # Save and return
        save_chat_log(chat_name, query, response_data)
        return response_data

    except ValueError as ve:
        logging.error(f"Data format error: {ve}")
        raise HTTPException(status_code=500, detail=f"Data format error: {ve}")

    except Exception as e:
        logging.error(f"Error querying Neo4j with GraphCypherQAChain: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"An error occurred while querying the database: {e}",
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


def save_chat_log(chat_name: str, query: str, response: dict):
    """Append a structured entry to the chat log file, maintaining in-memory history."""
    global llm_current_chat_name, llm_current_chat_history

    chat_file = os.path.join(CHAT_LOGS_DIR, f"{chat_name}.json")

    # If switching to a new chat, reset and load from file
    if llm_current_chat_name != chat_name:
        llm_current_chat_name = chat_name
        llm_current_chat_history = []

        # Load previous chat history if the file exists
        if os.path.exists(chat_file):
            with open(chat_file, "r", encoding="utf-8") as file:
                try:
                    chat_data = json.load(file)
                    if isinstance(chat_data, list):  # Ensure valid structure
                        llm_current_chat_history = chat_data
                except json.JSONDecodeError:
                    llm_current_chat_history = []  # Reset on corruption

    # Create structured log entry
    log_entry = {
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "query": query,  # User input
        "response": response  # LLM response
    }

    # Append new entry to in-memory history
    llm_current_chat_history.append(log_entry)

    # Ensure chat logs directory exists
    os.makedirs(CHAT_LOGS_DIR, exist_ok=True)

    # Save updated history to file
    with open(chat_file, "w", encoding="utf-8") as file:
        json.dump(llm_current_chat_history, file, indent=4)

    print(f"Chat log updated for '{chat_name}'.")

@app.get("/chats")
async def get_chats():
    """
    Retrieves a list of all stored chat sessions.
    """
    try:
        # List all files in the ChatLogs directory
        chat_files = [
            f.replace(".json", "") for f in os.listdir(CHAT_LOGS_DIR) if f.endswith(".json")
        ]
        return {"chats": chat_files}
    except Exception as e:
        logging.error(f"Error retrieving chat list: {e}")
        raise HTTPException(status_code=500, detail="Error retrieving chat list.")
    
@app.get("/chat_history/{chat_name}")
async def get_chat_history(chat_name: str):
    """
    Retrieves chat history for a given chat name.
    Returns only the results from each response in an array.
    """
    chat_file = os.path.join(CHAT_LOGS_DIR, f"{chat_name}.json")

    # Check if chat history exists
    if not os.path.exists(chat_file):
        raise HTTPException(status_code=404, detail="Chat history not found.")

    try:
        # Load chat history
        with open(chat_file, "r", encoding="utf-8") as file:
            chat_history = json.load(file)

        # Extract responses sorted by timestamp
        sorted_responses = sorted(chat_history, key=lambda x: x["timestamp"], reverse=True)


        # Prepare response format with only `response["results"]`
        formatted_history = {
            "status": 200,
            "chat_name": chat_name,
            "results": [result for entry in sorted_responses for result in entry["response"]["results"]]
        }

        return formatted_history

    except json.JSONDecodeError:
        logging.error(f"Chat history JSON is corrupted: {chat_name}")
        raise HTTPException(status_code=500, detail="Chat history file is corrupted.")
    except Exception as e:
        logging.error(f"Error retrieving chat history: {e}")
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
        raise HTTPException(status_code=400, detail="A chat with the new name already exists.")

    try:
        os.rename(old_chat_file, new_chat_file)
        return {"message": f"Chat '{chat_name}' has been renamed to '{new_chat_name}'."}
    except Exception as e:
        logging.error(f"Error renaming chat history: {e}")
        raise HTTPException(status_code=500, detail="Error renaming chat history.")