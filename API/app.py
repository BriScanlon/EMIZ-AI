import os
import subprocess
from tempfile import NamedTemporaryFile
from fastapi import FastAPI, HTTPException, File, UploadFile, Body, Query
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


# initialise FastAPI
app = FastAPI()


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
                    # ✅ Unique chunk ID using document_id + chunk_id
                    unique_chunk_id = f"{document_id}_{i}"

                    # ✅ Store vector as a proper float array
                    session.run(
                        """
                        CREATE (c:Chunk {chunk_id: $chunk_id, document_id: $document_id, text: $text, vector: $vector})
                        """,
                        chunk_id=unique_chunk_id,
                        document_id=document_id,
                        text=chunk,
                        vector=chunk_embeddings[
                            i
                        ].tolist(),  # ✅ FIXED: Now stores as an array
                    )

                    # ✅ Sequentially link chunks WITHIN the same document
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
                            document_id=document_id,  # ✅ Only link within the same document
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
    # Variables the query from the request
    query = request.query
    chat_name = request.chat_name
    system_prompt = request.system_prompt
    debug_test = request.debug_test
    
    # Check if debug_test is enabled and return the canned response if true
    if debug_test:
        logging.info("Debug test enabled. Returning canned response.")
        return {
            "status": 200,
            "query": query,
            "chat_name": "Canned response",
            "debug_test": True,
            "results": canned_response(),
        }
    
    # Safety check for empty query
    if query is None or query.strip() == "":
        msg = f"Query string is empty or missing"
        logging.warning(msg)
        raise HTTPException(
            status_code=418,
            detail=msg,
        )
    
    # Generate chat name if empty
    if chat_name is None or chat_name.strip() == "":
        chat_name = query[:12].replace(" ", "_")#
        msg = f"Chat name is empty, generating new one: {chat_name}"
        logging.info(msg)
        
    # Use default system rompt if empty
    if system_prompt is None or system_prompt.strip() == "":
        system_prompt = "You are a helpful AI assistant."
    
    try:
        # Run the query through the chain
        #response = cypher_chain.invoke(query)
        response = "TODO: placeholder response."
        
        return {
            "status": 200,
            "query": query,
            "results": response,
        }

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