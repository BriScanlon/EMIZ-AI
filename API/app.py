import os
import pprint
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
from process_document import process_document
from langchain_ollama.llms import OllamaLLM
from langchain.prompts import PromptTemplate
from neo4j import GraphDatabase
import pandas as pd
from pydantic import BaseModel

# environment settings
NEO4J_URI = "bolt://neo4j-db-container"
NEO4J_USER = os.getenv("NEO4J_USER", "neo4j")
NEO4J_PASSWORD = "TestPassword"

# ollama settings
llm = OllamaLLM(base_url="http://ollama-container:11434", model="phi4", temperature=0)
llm_transformer = LLMGraphTransformer(llm=llm)

# chunk settings
CHUNK_SIZE = 3000
CHUNK_OVERLAP = 150

# Neo4j settings
graph_driver = Neo4jGraph(NEO4J_URI, NEO4J_USER, NEO4J_PASSWORD)

graph_driver.refresh_schema()


# Define a Pydantic model for the request body
class QueryRequest(BaseModel):
    query: str


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
    # check for file
    if not file:
        raise HTTPException(status_code=400, detail="File is required")

    # check for supported file type
    allowed_extenssions = {"pdf"}
    file_extension = file.filename.split(".")[-1].lower()
    if file_extension not in allowed_extenssions:
        raise HTTPException(status_code=400, detail="Unsupported file type")

    # reset file pointer for processing
    file.file.seek(0)

    # process the file to extract text for neo4j insertion
    try:
        file_content = file.file.read()
        if not file_content:
            raise HTTPException(status_code=400, detail="File is empty or unreadable")

        processed_data = process_document(file_content, file_extension)
        if not processed_data or "text" not in processed_data:
            raise HTTPException(
                status_code=500, detail="Error processing file: no content extracted"
            )

        processed_text = processed_data["text"]

        # create Document Object directly for test text
        docs = [Document(page_content=processed_text)]

        # split text into chunks
        text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=CHUNK_SIZE, chunk_overlap=CHUNK_OVERLAP
        )

        documents = text_splitter.split_documents(documents=docs)

        graph_documents = llm_transformer.convert_to_graph_documents(documents)
        graph_driver.add_graph_documents(
            graph_documents, baseEntityLabel=True, include_source=True
        )

        return {
            "status": 200,
            "message": f"Document '{file.filename}' succesfully processed and added to Neo4j.",
            "graph_documents_count": len(graph_documents),
            "graph_documents": graph_documents,
        }
    except Exception as e:
        raise HTTPException(
            status_code=500, detail={f"An internal error occured duing processing: {e}"}
        )


@app.post("/query")
async def query_graph_with_cypher(request: QueryRequest):
    """
    Endpoint to query the Neo4j database using GraphCypherQAChain with Ollama.
    """
    try:
        # Extract the query from the request
        query = request.query

        # Run the query through the chain
        response = cypher_chain.invoke(query)

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
