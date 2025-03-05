import json
from neo4j import GraphDatabase
import dotenv
import os
import logging


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

    first_node_name = None  # Store first node's name for chunk linking
    node_id_map = {}  # Store mapping from node names to their CUKG IDs

    # Extract category mappings from the graph response
    category_map = {
        cat["id"]: cat["name"] for cat in understanding_graph.get("categories", [])
    }

    # 2. Merge Corporate Understanding nodes and track new IDs
    with driver.session() as session:
        nodes = understanding_graph.get("nodes", [])

        for index, node in enumerate(nodes):
            # Handle category lookup from categories array (backward compatibility)
            category_id = node.get("category")
            category_name = (
                category_map.get(category_id, "Unknown")
                if category_id is not None
                else node.get("type", "Unknown")
            )

            query = """
            MERGE (n:CorporateUnderstanding {name: $name})
            ON CREATE SET n.category = $category, 
                          n.text = coalesce($text, '')

            WITH n
            OPTIONAL MATCH (m:Meta {key: 'corporateUnderstandingId'})
            WHERE n.id IS NULL
            CALL apoc.atomic.add(m, 'value', 1) YIELD newValue
            SET n.id = coalesce(n.id, toInteger(newValue))
            RETURN n.id, n.name
            """
            result = session.run(
                query,
                name=node["name"],
                category=category_name,
                text=node.get("text", ""),
            )

            record = result.single()
            if record:
                new_id, node_name = record["n.id"], record["n.name"]
                node_id_map[node_name] = new_id  # Store mapped ID

                # Capture the first node name for linking to chunks
                if index == 0:
                    first_node_name = node_name

    # 3. Merge relationships between Corporate Understanding nodes using tracked IDs
    with driver.session() as session:
        edges = understanding_graph.get("links", understanding_graph.get("edges", []))

        for edge in edges:
            source_name = nodes[edge["source"]]["name"]
            target_name = nodes[edge["target"]]["name"]

            source_id = node_id_map.get(source_name)
            target_id = node_id_map.get(target_name)

            if source_id is not None and target_id is not None:
                query = """
                MATCH (a:CorporateUnderstanding {id: $source_id}),
                      (b:CorporateUnderstanding {id: $target_id})
                MERGE (a)-[:CONNECTED_TO]->(b)
                """
                session.run(query, source_id=source_id, target_id=target_id)

    # 4. Link chunks ONLY to the first CorporateUnderstanding node
    if first_node_name:
        with driver.session() as session:
            for chunk in chunks:
                query = """
                MERGE (c:Chunk {chunk_id: $chunk_id})
                ON CREATE SET c.text = $text
                ON MATCH SET c.text = coalesce($text, c.text)
                
                WITH c
                MATCH (n:CorporateUnderstanding {name: $firstNodeName})
                MERGE (c)-[:BELONGS_TO]->(n)
                """
                session.run(
                    query,
                    chunk_id=chunk["chunk_id"],
                    text=chunk.get("text", ""),
                    firstNodeName=first_node_name,
                )

    driver.close()
