# entity_relationship_extractor.py

from neo4j import GraphDatabase
from neo4j_graphrag.experimental.pipeline.kg_builder import SimpleKGPipeline
from langchain_ollama.llms import OllamaLLM
import os

# helpers
from helpers.embed_text import embed_text
from chunk_text import chunk_text

# Reuse existing Neo4j and Ollama LLM settings from the main app
NEO4J_URI = "bolt://neo4j-db-container"
NEO4J_USER = os.getenv("NEO4J_USER", "neo4j")
NEO4J_PASSWORD = os.getenv("NEO4J_PASSWORD", "TestPassword")

# Ollama LLM configuration
llm_port = os.getenv("OLLAMA_PORT_I", "11434")
llm_base_url = f"http://ollama-container:{llm_port}"
llm_model = "phi4_max_ctx"
llm_ollama = OllamaLLM(base_url=llm_base_url, model=llm_model, temperature=0)

# Neo4j driver
neo4j_driver = GraphDatabase.driver(NEO4J_URI, auth=(NEO4J_USER, NEO4J_PASSWORD))

# Corporate Memory node labels
node_labels = [
    "Concept",
    "Aircraft",
    "Component",
    "Feature",
    "Failure",
    "Root_Cause",
    "Mitigation",
]

# Corporate Memory relationship types
rel_types = ["HAS"]

# embedder
embedder = embed_text()

# chunker
text_splitter = chunk_text()

async def entity_relationship_extractor(processed_text: str):
    """
    Runs the entity and relationship extraction pipeline based on the Corporate Memory schema.
    """

    # Step 1: Create and Run the KG Pipeline
    kg_builder = SimpleKGPipeline(
        llm=llm_ollama,
        driver=neo4j_driver,
        embedder=embedder,
        text_splitter=text_splitter,
        from_pdf=False,  # We're using processed text
        entities=[
            {"label": label, "properties": [{"name": "name", "type": "STRING"}]}
            for label in node_labels
        ],
        relations=[{"label": rel} for rel in rel_types],
        perform_entity_resolution=True,  # Merge duplicates
        neo4j_database="neo4j",
        on_error="RAISE",
    )

    await kg_builder.run_async(text=processed_text)
    return {"message": "Entity and relationship extraction completed successfully."}
