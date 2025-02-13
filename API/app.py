import os
import subprocess
import asyncio
import json
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

# environment settings
NEO4J_URI = "bolt://neo4j-db-container"
NEO4J_USER = os.getenv("NEO4J_USER", "neo4j")
NEO4J_PASSWORD = "TestPassword"

# ollama settings
llm_model="phi4"
llm_port = os.getenv("OLLAMA_PORT_I", "11434")
llm = OllamaLLM(base_url="http://ollama-container:{}".format(llm_port), model=llm_model, temperature=0)
llm_transformer = LLMGraphTransformer(llm=llm)

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
    system_prompt = request.system_prompt
    debug_test = request.debug_test

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
        system_prompt = """**Objective:** Analyze the provided engineering text and categorize significant engineering concepts into four groups: Component, Failure Mode, Root Cause, and Mitigation. Each concept should be represented as a unique node, and nodes should be logically linked to illustrate the relationships between components, failure modes, root causes, and mitigations.

  ### Instructions
  
  1. **Initialize the Node Structure:**
     - Start by creating the "System" node as the root of your Component hierarchy.
     - For each component mentioned in the text, create a unique node under the 'Component' category. These nodes should be linked directly or indirectly to the 'System' node to maintain a clear component hierarchy.
  
  2. **Create and Connect Failure Mode Nodes:**
     - Identify all failure modes described in the text. Create a unique node for each failure mode under the 'Failure Mode' category.
     - Connect each failure mode node to its corresponding component node(s) based on the text descriptions. If a failure mode affects multiple components, ensure there is a link from each relevant component node to the failure mode node.
  
  3. **Identify and Link Root Causes:**
     - For each root cause mentioned, create a node under the 'Root Cause' category.
     - Link all relevant failure mode nodes to their respective root cause nodes, demonstrating which failure modes are associated with which root causes.
  
  4. **Detail Mitigations and Recommendations:**
     - Create nodes for all mitigations and any engineering recommendations under the 'Mitigation' category.
     - Connect these mitigation nodes to the root cause nodes they address. If specific failure modes are directly alleviated or addressed by particular mitigations, also link these mitigations to the respective failure mode nodes.
  
  5. **Ensure Full Connectivity:**
     - Verify that the graph maintains the hierarchy: Component -> Failure Mode -> Root Cause -> Mitigation. There should be no isolated nodes, and apart from the initial 'System' node, every node should have at least one incoming link.
     - Ensure that the failure mode or root cause is accurately linked to the component node as per the text. It shouldn't usually be linked to the system node.
  
  6. **Handle Variations and Commonalities:**
     - If the text indicates variations in how failure modes or root causes present under different circumstances (e.g., based on environmental factors or operating conditions), ensure these variations are captured as separate nodes with appropriate links to illustrate their relationships.
  
  7. **Finalize the Graph Structure:**
     - Review the graph to ensure it accurately represents all described engineering aspects and that the structure provides a clear and comprehensive view of the relationships from component to mitigation.
  
  ### Expected JSON Structure
  
  The graph should be summarized in the following JSON format, showing nodes, links, and categories, do not return any other data than the JSON object:
  
  json
  {
    "nodes": [
      {"id": "0", "name": "System", "category": 0},
      {"id": "1", "name": "example component", "category": 0},
      {"id": "2", "name": "example failure mode", "category": 1},
      {"id": "3", "name": "example root cause", "category": 2},
      {"id": "4", "name": "example mitigation", "category": 3}
    ],
    "links": [
      {"source": "0", "target": "1"},
      {"source": "1", "target": "2"},
      {"source": "2", "target": "3"},
      {"source": "3", "target": "4"}
    ],
    "categories": [
      {"id": "0", "name": "Component"},
      {"id": "1", "name": "Failure Mode"},
      {"id": "2", "name": "Root Cause"},
      {"id": "3", "name": "Mitigation"}
    ]
  }
  """

    # Debug mode: Return canned response
    if debug_test:
        logging.info("Debug test enabled, returning canned response.")
        response_data = {
            "status": 200,
            "query": query,
            "chat_name": "Canned response",
            "system_prompt": system_prompt,
            "results": canned_response()
        }
        save_chat_log(chat_name, query, response_data)  # Store chat log
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

        # Structure the response correctly
        response_data = {
            "status": 200,
            "query": query,
            "chat_name": chat_name,
            "system_prompt": system_prompt,
            "results": [{"message": response}],
        }

        # Save chat history
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


def canned_response():
    nodes = [
        {"id": "1", "name": "DHC-8-402 Dash 8, G-JEDI", "category": "Aircraft"},
        {"id": "2", "name": "AC Electrical System", "category": "System"},
        {"id": "3", "name": "Wiring Loom", "category": "Component"},
        {"id": "4", "name": "Chafing due to blind rivet", "category": "FailureMode"},
        {"id": "5", "name": "AC bus and generator warnings", "category": "Symptom"},
        {"id": "6", "name": "Replace blind rivets with solid rivets", "category": "Resolution"},
        {"id": "7", "name": "Incident: AC System Failure", "category": "Incident"},
    ]
    links = [
        {"source": "1", "target": "7", "label": "OCCURRED_ON"},
        {"source": "2", "target": "3", "label": "PART_OF"},
        {"source": "4", "target": "2", "label": "AFFECTS"},
        {"source": "4", "target": "5", "label": "LEADS_TO"},
        {"source": "4", "target": "6", "label": "RESOLVED_BY"},
    ]
    categories = [
        {"name": "Aircraft"},
        {"name": "System"},
        {"name": "Component"},
        {"name": "FailureMode"},
        {"name": "Symptom"},
        {"name": "Resolution"},
        {"name": "Incident"},
    ]

    messages = [
        "Hello! I'm a friendly AI, here's a node graph for you.",
        "Hey! This message has no graph, just checking in!",
        "Here’s another graph! Let me know what you think.",
        "Hope you're enjoying this! No graph this time.",
        "Here's a final graph to wrap things up!"
    ]

    responses = []

    for i, msg in enumerate(messages):
        response = {"message": msg}
        
        # Only add a graph if `i` is even
        if i % 2 == 0:
            response["graph"] = {
                "nodes": nodes,
                "links": links,
                "categories": categories,
            }
        
        responses.append(response)

    return responses

def save_chat_log(chat_name: str, query: str, response: dict):
    """Append a structured entry to the chat log file, maintaining history."""
    chat_file = os.path.join(CHAT_LOGS_DIR, f"{chat_name}.json")

    # Create the structured log entry
    log_entry = {
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "response": response
    }

    # Load existing chat history if it exists
    if os.path.exists(chat_file):
        with open(chat_file, "r", encoding="utf-8") as file:
            try:
                chat_history = json.load(file)
                if not isinstance(chat_history, list):  # Safety check
                    chat_history = []
            except json.JSONDecodeError:
                chat_history = []  # If file is corrupted, start fresh
    else:
        chat_history = []

    # Append new entry and save
    chat_history.append(log_entry)
    with open(chat_file, "w", encoding="utf-8") as file:
        json.dump(chat_history, file, indent=4)

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