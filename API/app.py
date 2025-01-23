import os
import pprint
from tempfile import NamedTemporaryFile
from fastapi import FastAPI

from langchain_community.document_loaders import TextLoader
from langchain_community.graphs import Neo4jGraph
from langchain_community.vectorstores import Neo4jVector
from langchain_experimental.graph_transformers import LLMGraphTransformer
from neo4j import GraphDatabase
import pandas as pd

app = FastAPI()

# Load Text Data directly as a Document
text = """Brian is an employee at Bloc Digital, a leading technology company based in Derby. He has been working there for the past
2 years as a software engineer. Ben is also an employee at Bloc Digital, where he works as the Team Leader. He joined the company after
completing a knowledge transfer partnership.
Bloc Digital is a well known technology company that specializes in creative solutions, and Industry 4.0 expertise.  
Both Brian and Ben are highly skilled individuals who contribute significantly to Bloc Digital's success.
They work closely with their respective teams to develop innovative products and services that meet the evolving needs of the company's clients."""

@app.get("/")
def read_root():
  return {"message": "Service is running."}