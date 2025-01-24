import os
import pprint
from tempfile import NamedTemporaryFile
from fastapi import FastAPI, HTTPException

from langchain_community.document_loaders import TextLoader
from langchain.schema import Document
from langchain_community.graphs import Neo4jGraph
from langchain_community.vectorstores import Neo4jVector
from langchain_experimental.graph_transformers import LLMGraphTransformer
from langchain.text_splitter import RecursiveCharacterTextSplitter

from langchain_ollama.llms import OllamaLLM
from neo4j import GraphDatabase
import pandas as pd

# environment settings
NEO4J_CONNECTION = "bolt://neo4j-db-container"
NEO4J_USER = os.getenv("NEO4J_USER", "neo4j")
NEO4J_PASSWORD = "TestPassword"

# ollama settings
llm = OllamaLLM(base_url="http://127.0.0.1:11434", model="phi4", temperature=0)
llm_transformer = LLMGraphTransformer(llm=llm)

# chunk settings
CHUNK_SIZE = 1000
CHUNK_OVERLAP = 50

# Load Text Data directly as a Document
text = """Synopsis
The pilot, believing that he had an electrical fire,
undertook a precautionary landing. During the ground
run the nose wheel hit a rut causing the aircraft to turn
over on to its back. Both the pilot and passenger were
uninjured. An engineering investigation found that the
alternator drive belt had failed.
History of the flight
The pilot carried out the pre-flight check during which he
confirmed that there was sufficient oil in the engine and
then departed from his home airfield at Andrewsfield on a
local cross country flight. After flying for approximately
35 minutes at a height of 1,800 ft the pilot noticed blue
smoke coming out of the forward section of both sides of
the engine cowling. At the same time the pilot became
aware of a strong smell of electrical burning and
reported hearing a change in the engine noise similar to
when the magneto checks are carried out. He checked
the engine indications, which appeared normal, and
noticed that the low voltage warning light was glowing
very brightly.
The pilot, believing that he had an electrical fire, decided
to make an immediate landing in a large field of wheat
directly ahead of the aircraft. As he closed the throttle
to idle the smoke appeared to stop; nevertheless, he
made a Mayday call to Andrewsfield Radio on 130.55
Mhz and continued with the precautionary landing. The
pilot states that he consulted the emergency checklist
for fire in flight, but elected to leave the electrical
Master Switch ON so that he could operate the flaps
and radio. The aircraft was established on a stable
approach, with a 5 kt tail wind, and once full flaps were
selected, the pilot stated that he turned off the Master
Switch and subsequently held the aircraft in the flare
until the mainwheels touched down at approximately
50 kt. However, as the nose was lowered the aircraft
appeared to come to an abrupt halt and turned over on to
its back. The engine stopped as the propeller struck the
ground and the pilot exited the aircraft through his door
and then assisted the passenger to vacate the aircraft.
Shortly afterwards two farmers and the Police and
Air Ambulance helicopters arrived to offer assistance.
Both the pilot and passenger were unhurt.
Damage to aircraft
The nose landing gear leg was bent back against the
fuselage; the fin, rudder and wings were buckled and
distorted; the windscreen was cracked; one blade on
the propeller was bent; the engine was shock loaded,
the casing on the alternator had suffered impact damage
and the drive belt had failed. There was no evidence of
a fire having occurred.
Comment
From photographs of the accident site and comments
from an engineer who inspected the aircraft it was
established that the aircraft touched down on all three
wheels in a level attitude. The engineer stated that there
was a large rut across the field approximately 12 m
after the touch down point, which he believes caused
the nose landing gear to collapse and the aircraft to turn
over. The flaps were found in the retracted position.
Another battery was fitted to the aircraft and its electrical
systems were operated for 15 minutes and found to
operate normally with no evidence of any electrical
burning smells. The engine oil level was found to be
satisfactory with no indication of there having been
either an oil leak or spillage.
It is believed that the blue smoke and the illumination of
the low voltage warning light were both caused when the
alternator drive belt failed."""


# Neo4j settings
graph = Neo4jGraph("bolt://127.0.0.1:7687", NEO4J_USER, NEO4J_PASSWORD)

# create Document Object directly for test text
docs = [Document(page_content=text)]


# split text into chunks
text_splitter = RecursiveCharacterTextSplitter(
    chunk_size=CHUNK_SIZE, chunk_overlap=CHUNK_OVERLAP
)
documents = text_splitter.split_documents(documents=docs)

try:
    graph_documents = llm_transformer.convert_to_graph_documents(documents)
    graph.add_graph_documents(
        graph_documents, baseEntityLabel=True, include_source=True
    )
except Exception as e:
    raise Exception(f"Error: {e}")

print("Number of documents processed:", len(documents))
for doc in graph_documents:
    print(doc)


pprint.pprint(graph.query("MATCH (s)-[r:MENTIONS]->(t) RETURN s,r,t LIMIT 50"))
