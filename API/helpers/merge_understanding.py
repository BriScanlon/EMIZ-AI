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

    # 1. Ensure the ID counter exists and is stored as an integer
    with driver.session() as session:
        session.run(
            """
            MERGE (m:Meta {key: 'corporateUnderstandingId'})
            ON CREATE SET m.value = 0
            ON MATCH SET m.value = toInteger(m.value)
            """
        )

    # 2. Merge Corporate Understanding nodes using their unique "name"
    with driver.session() as session:
        for node in understanding_graph.get("nodes", []):
            query = """
            MERGE (n:CorporateUnderstanding {name: $name})
            ON CREATE SET n.category = $category, 
                          n.text = coalesce($text, '')

            WITH n
            OPTIONAL MATCH (m:Meta {key: 'corporateUnderstandingId'})
            WHERE n.id IS NULL

            CALL apoc.atomic.add(m, 'value', 1) YIELD newValue
            SET n.id = coalesce(n.id, toInteger(newValue))
            RETURN n
            """
            session.run(
                query,
                name=node["name"],
                category=int(node["category"]),
                text=node.get("text", ""),
            )

    # 3. Merge relationships between Corporate Understanding nodes
    with driver.session() as session:
        for link in understanding_graph.get("links", []):
            query = """
            MATCH (a:CorporateUnderstanding {name: $source}),
                  (b:CorporateUnderstanding {name: $target})
            MERGE (a)-[:CONNECTED_TO]->(b)
            """
            session.run(query, source=link["source"], target=link["target"])

    # 4. Merge Chunk nodes and link them to the appropriate Corporate Understanding node
    with driver.session() as session:
        for chunk in chunks:
            query = """
            MERGE (c:Chunk {chunk_id: $chunk_id})
            ON CREATE SET c.text = $text
            ON MATCH SET c.text = coalesce($text, c.text)
            
            WITH c
            MATCH (n:CorporateUnderstanding {name: $componentName})
            MERGE (c)-[:BELONGS_TO]->(n)
            """
            session.run(
                query,
                chunk_id=chunk["chunk_id"],
                text=chunk.get("text", ""),
                componentName=chunk["componentName"],
            )

    driver.close()
