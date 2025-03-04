import json
from neo4j import GraphDatabase
import dotenv
import os


def merge_corporate_understanding_graph(graph_json: dict):
    """
    Given a corporate udnerstanding graph JSON (with keys 'nodes', 'links', and optionally 'categories'),
    generate and execute a merge Cypher script to store the graph in Neo4j.

    This function does not perform any schema validation on the categories; it simply passes
    through the values as provided in the graph JSON.

    Parameters:
        graph_json (dict): The corporate memory graph JSON.
    """
    # enable dotenv variables
    dotenv.load_dotenv()

    NEO4J_URI = os.getenv("NEO4J_URI")
    NEO4J_USER = os.getenv("NEO4J_USER")
    NEO4J_PASSWORD = os.getenv("NEO4J_PASSWORD")

    nodes = graph_json.get("nodes", [])
    links = graph_json.get("links", [])

    cypher_statements = []

    # Build Cypher statements for the nodes.
    for node in nodes:
        # Directly use the node's 'category' value as provided.
        node_statement = (
            f"MERGE (n:CorporateUnderstanding {{id: '{node['id']}'}}) "
            f"SET n.name = '{node['name']}', n.category = '{node['category']}';"
        )
        cypher_statements.append(node_statement)

    # Build Cypher statements for the relationships.
    for link in links:
        rel_statement = (
            f"MATCH (a:CorporateUnderstanding {{id: '{link['source']}'}}), "
            f"(b:CorporateUnderstanding {{id: '{link['target']}'}}) "
            f"MERGE (a)-[:CONNECTED_TO]->(b);"
        )
        cypher_statements.append(rel_statement)

    # Combine all statements into one Cypher script.
    full_cypher = "\n".join(cypher_statements)
    print("Generated Cypher script for the graph:")
    print(full_cypher)

    # Connect to Neo4j and execute the Cypher script.
    driver = GraphDatabase.driver(NEO4J_URI, auth=(NEO4J_USER, NEO4J_PASSWORD))
    with driver.session() as session:
        session.run(full_cypher)
    driver.close()


def merge_understanding_graph_and_link_chunks(
    understanding_graph, chunks, uri, user, password
):
    driver = GraphDatabase.driver(uri, auth=(user, password))

    # 1️⃣ Merge Corporate Understanding nodes using their unique "name"
    with driver.session() as session:
        for node in understanding_graph.get("nodes", []):
            query = """
            MERGE (n:CorporateUnderstanding {name: $name})
            ON CREATE SET n.category = $category, 
                          n.text = coalesce($text, '')
            """
            session.run(
                query,
                name=node["name"],
                category=int(node["category"]),
                text=node.get("text", ""),
            )

    # 2️⃣ Merge relationships between Corporate Understanding nodes
    with driver.session() as session:
        for link in understanding_graph.get("links", []):
            query = """
            MATCH (a:CorporateUnderstanding {name: $source}),
                  (b:CorporateUnderstanding {name: $target})
            MERGE (a)-[:CONNECTED_TO]->(b)
            """
            session.run(query, source=link["source"], target=link["target"])

    # 3️⃣ Link the Chunks (by ID) to the CUKG Nodes We Just Created
    with driver.session() as session:
        for node in understanding_graph.get("nodes", []):
            for chunk in chunks:
                query = """
                MATCH (c:Chunk {chunk_id: $chunk_id})  // Find chunk by ID
                MATCH (n:CorporateUnderstanding {name: $name})  // Find CUKG node
                MERGE (c)-[:BELONGS_TO]->(n)  // Create link
                MERGE (n)-[:CONTAINS]->(c)  // Bidirectional relationship
                """
                session.run(
                    query,
                    chunk_id=chunk["chunk_id"],
                    name=node["name"],
                )

    driver.close()
