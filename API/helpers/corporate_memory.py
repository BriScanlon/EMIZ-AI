from neo4j import GraphDatabase
import os
import dotenv
import logging
import json

dotenv.load_dotenv()

NEO4J_URI = os.getenv("NEO4J_URI", "bolt://127.0.0.1:7687")
NEO4J_USER = os.getenv("NEO4J_USER", "neo4j")
NEO4J_PASSWORD = os.getenv("NEO4J_PASSWORD", "TestPassword")

def get_corporate_memory_graph() -> dict:
    """
    Fetches all nodes with the CM_Category label and the relationships between them
    from Neo4j, then assigns sequential integer IDs (starting at 0) to each node.
    
    Returns:
        dict: A dictionary with two keys:
              - "nodes": a list of node objects, each with an "id", "name", and additional properties.
              - "links": a list of relationship objects, where the source and target use the new sequential IDs.
    """
    driver = GraphDatabase.driver(NEO4J_URI, auth=(NEO4J_USER, NEO4J_PASSWORD))
    nodes = []
    categories = []
    links = []
    
    # A mapping from the original Neo4j element ID (as a string) to our new sequential integer ID.
    node_id_map = {}
    
    with driver.session() as session:
        # Query nodes with their original element IDs.
        node_query = "MATCH (n:CM_Category) RETURN elementId(n) AS old_id, n"
        node_result = session.run(node_query)
        
        # Assign sequential integer IDs starting at 0.
        for new_id, record in enumerate(node_result):
            old_id = record["old_id"]
            node = record["n"]
            node_props = dict(node)
            # Use the node's 'name' property if available.
            node_name = node_props.get("name", "")
            node_obj = {
                "id": new_id,
                "name": "Example " + node_name,
                "category": new_id  # Include any additional properties if needed.
            }
            category_obj = {
                "id": new_id,
                "name": node_name
            }
            nodes.append(node_obj)
            categories.append(category_obj)
            node_id_map[old_id] = new_id
        
        # Query relationships between CM_Category nodes.
        rel_query = (
            "MATCH (n:CM_Category)-[r]->(m:CM_Category) "
            "RETURN elementId(n) AS source, elementId(m) AS target, type(r) AS type, r"
        )
        rel_result = session.run(rel_query)
        for record in rel_result:
            old_source = record["source"]
            old_target = record["target"]
            new_source = node_id_map.get(old_source)
            new_target = node_id_map.get(old_target)
            # Only include the relationship if both nodes are in our mapping.
            if new_source is not None and new_target is not None:
                links.append({
                    "source": new_source,
                    "target": new_target                  
                })
    
    driver.close()
    return {"nodes": nodes, "links": links, "categories": categories}

# Example usage:
if __name__ == "__main__":
    corp_memory = get_corporate_memory_graph()
    print(json.dumps(corp_memory, indent=2))
