from neo4j import GraphDatabase
import os
import dotenv
import logging

dotenv.load_dotenv()

NEO4J_URI = os.getenv("NEO4J_URI")
NEO4J_USER = os.getenv("NEO4J_USER")
NEO4J_PASSWORD = os.getenv("NEO4J_PASSWORD")


def get_corporate_memory_graph() -> dict:
    """
    Fetches the entire corporate memory graph from Neo4j.

    Parameters:
    - driver: Neo4j driver object

    Returns:
    - dict: A dictionary representing the corporate memory graph
    """
    driver = GraphDatabase.driver(NEO4J_URI, auth=(NEO4J_USER, NEO4J_PASSWORD))

    with driver.session() as session:
        # Retrieve nodes along with their internal IDs
        node_query = "MATCH (n:CM_Category) RETURN elementId(n) AS id, n"
        logging.debug()
        node_result = session.run(node_query)
        nodes = []
        for record in node_result:
            node_id = record["id"]
            # Conbine the internal id with node properties
            node_data = record["n"]._properties
            node_data["id"] = node_id
            nodes.append(node_data)

        # Retrive relationships between CM_Category nodes with their source and target IDs
        rel_query = (
            "MATCH (n:CM_Category)-[r]->(m:CM_Category) "
            "RETURN elementId(n) AS source, elementId(m) AS target, type(r) AS type, r"
        )

    rel_result = session.run(rel_query)
    relationships = []
    for record in rel_result:
        relationships.append(
            {
                "source": record["source"],
                "target": record["target"],
                "type": record["type"],
                "properties": record["r"]._properties,
            }
        )

    return {"nodes": nodes, "relationships": relationships}
