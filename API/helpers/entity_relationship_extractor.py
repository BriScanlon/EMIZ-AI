# entity_relationship_extractor.py

from neo4j import GraphDatabase
from neo4j_graphrag.experimental.pipeline.kg_builder import SimpleKGPipeline
from neo4j_graphrag.experimental.components.schema import (
    SchemaBuilder,
    SchemaEntity,
    SchemaProperty,
    SchemaRelation,
)
from langchain_ollama.llms import OllamaLLM
import os

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


async def entity_relationship_extractor(processed_text: str):
    """
    Runs the entity and relationship extraction pipeline based on the Corporate Memory schema.
    """

    # Step 1: Define Corporate Memory Schema
    schema_builder = SchemaBuilder()
    await schema_builder.run(
        entities=[
            SchemaEntity(
                label="Concept", properties=[SchemaProperty(name="name", type="STRING")]
            ),
            SchemaEntity(
                label="Aircraft",
                properties=[SchemaProperty(name="name", type="STRING")],
            ),
            SchemaEntity(
                label="Component",
                properties=[SchemaProperty(name="name", type="STRING")],
            ),
            SchemaEntity(
                label="Feature", properties=[SchemaProperty(name="name", type="STRING")]
            ),
            SchemaEntity(
                label="Failure", properties=[SchemaProperty(name="name", type="STRING")]
            ),
            SchemaEntity(
                label="Root_Cause",
                properties=[SchemaProperty(name="name", type="STRING")],
            ),
            SchemaEntity(
                label="Mitigation",
                properties=[SchemaProperty(name="name", type="STRING")],
            ),
        ],
        relations=[SchemaRelation(label="HAS")],
        possible_schema=[
            ("Concept", "HAS", "Aircraft"),
            ("Aircraft", "HAS", "Component"),
            ("Component", "HAS", "Feature"),
            ("Feature", "HAS", "Failure"),
            ("Failure", "HAS", "Root_Cause"),
            ("Root_Cause", "HAS", "Mitigation"),
        ],
    )

    # Step 2: Create and Run the KG Pipeline
    kg_builder = SimpleKGPipeline(
        llm=llm_ollama,
        driver=neo4j_driver,
        from_pdf=False,  # We're using processed text
        entities=[
            {"label": "Concept", "properties": [{"name": "name", "type": "STRING"}]},
            {"label": "Aircraft", "properties": [{"name": "name", "type": "STRING"}]},
            {"label": "Component", "properties": [{"name": "name", "type": "STRING"}]},
            {"label": "Feature", "properties": [{"name": "name", "type": "STRING"}]},
            {"label": "Failure", "properties": [{"name": "name", "type": "STRING"}]},
            {"label": "Root_Cause", "properties": [{"name": "name", "type": "STRING"}]},
            {"label": "Mitigation", "properties": [{"name": "name", "type": "STRING"}]},
        ],
        relations=[{"label": "HAS"}],
        possible_schema=[
            ("Concept", "HAS", "Aircraft"),
            ("Aircraft", "HAS", "Component"),
            ("Component", "HAS", "Feature"),
            ("Feature", "HAS", "Failure"),
            ("Failure", "HAS", "Root_Cause"),
            ("Root_Cause", "HAS", "Mitigation"),
        ],
        perform_entity_resolution=True,  # Merge duplicates
        neo4j_database="neo4j",
        on_error="RAISE",
    )

    await kg_builder.run_async(text=processed_text)
    return {"message": "Entity and relationship extraction completed successfully."}