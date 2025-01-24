import os
import pprint
from tempfile import NamedTemporaryFile
from fastapi import FastAPI, HTTPException

from langchain_community.document_loaders import TextLoader
from langchain_community.graphs import Neo4jGraph
from langchain_community.vectorstores import Neo4jVector
from langchain_experimental.graph_transformers import LLMGraphTransformer
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_ollama.llms import OllamaLLM
from neo4j import GraphDatabase
import pandas as pd

# environment settings
NEO4J_CONNECTION = os.getenv("DATABASE_URL")
NEO4J_USER = os.getenv("NEO4J_USER")
NEO4J_PASSWORD = "TestPassword"

# ollama settings
llm = OllamaLLM(base_url = "http://ollama-container:11434", model="phi4", temperature=0)
llm_transformer = LLMGraphTransformer(llm=llm)

# chunk settings
CHUNK_SIZE = 300
CHUNK_OVERLAP = 30

# Load Text Data directly as a Document
text = """Brian is an employee at Bloc Digital, a leading technology company based in Derby. He has been working there for the past
2 years as a software engineer. Ben is also an employee at Bloc Digital, where he works as the Team Leader. He joined the company after
completing a knowledge transfer partnership.
Bloc Digital is a well known technology company that specializes in creative solutions, and Industry 4.0 expertise.  
Both Brian and Ben are highly skilled individuals who contribute significantly to Bloc Digital's success.
They work closely with their respective teams to develop innovative products and services that meet the evolving needs of the company's clients."""


# create neo4j driver instance
try: 
  driver = GraphDatabase.driver(NEO4J_CONNECTION, auth=(NEO4J_USER, NEO4J_PASSWORD))
except Exception as e:
  raise Exception(f"Failed to connect to Neo4j: {str(e)}")

# Neo4j settings
graph = Neo4jGraph()
graph.query('MATCH (n) DETACH DELETE n;')

# create text loader
loader = TextLoader(file_path=text, encoding = 'UTF-8')
docs = loader.load()

# split text into chunks
text_splitter = RecursiveCharacterTextSplitter(chunk_size=CHUNK_SIZE, chunk_overlap=CHUNK_OVERLAP)
documents = text_splitter.split_documents(documents=docs)

graph_documents = llm_transformer.convert_to_graph_documents(documents)
graph.add_graph_documents(
  graph_documents,
  baseEntityLabel=True,
  include_source=True
)

pprint.pprint(graph.query("MATCH (s)-[r:!MENTIONS]->(t) RETURN s,r,t LIMIT 50"))

# initialise FastAPI
app = FastAPI()




# Test Service running endpoint
@app.get("/")
def read_root():
  return {"message": "Service is running."}

# test connection to database
@app.get("/neo4j-info")
def get_neo4j_info():
  try:
    with driver.session() as session:
      result = session.run("RETURN 'Neo4j connection successful' AS message")
      return {"message": result.single()["message"]}
  except Exception as e:
    raise HTTPException(status_code=500, detail=f"Failed to query Neo4j: {str(e)}")