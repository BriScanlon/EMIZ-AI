# helpers/vector_search.py

import os
import logging
from sentence_transformers import SentenceTransformer
from neo4j import GraphDatabase

# Configure logging to show debug messages
logging.basicConfig(level=logging.DEBUG)

# Load SentenceTransformer model.
MODEL_NAME = os.getenv("SENTENCE_TRANSFORMER_MODEL", "all-MiniLM-L6-v2")
model = SentenceTransformer(MODEL_NAME)

# Neo4j connection parameters
NEO4J_URI = os.getenv("NEO4J_URI", "bolt://neo4j-db-container")
NEO4J_USER = os.getenv("NEO4J_USER", "neo4j")
NEO4J_PASSWORD = os.getenv("NEO4J_PASSWORD", "TestPassword")


def fetch_similar_chunks(tx, query_embedding, top_n):
    """
    Runs a Cypher query to compute cosine similarity between the query embedding
    and each Chunk node's stored vector.
    """
    cypher_query = """
    WITH $query_embedding AS query
    MATCH (c:Chunk)
    WHERE c.vector IS NOT NULL
    WITH c, gds.similarity.cosine(query, c.vector) AS similarity
    RETURN c, similarity
    ORDER BY similarity DESC
    LIMIT $top_n;
    """

    # Debug: Print the Cypher query (you may want to remove or mask this in production)
    logging.debug("Executing Cypher Query:\n%s", cypher_query)

    result = tx.run(cypher_query, query_embedding=query_embedding, top_n=top_n)
    results = []
    for record in result:
        node = record["c"]
        similarity = record["similarity"]
        results.append(
            {"id": node.id, "properties": dict(node), "similarity": similarity}
        )

    # Debug: Log the response from the database
    logging.debug("Database response: %s", results)

    return results


def vector_search(query: str, top_n: int = 5):
    """
    Computes the embedding for the provided query and retrieves the top_n similar chunks from Neo4j.
    """
    # Debug: Log the received query.
    logging.debug("Received query: %s", query)

    # Compute the embedding for the query text.
    query_embedding = model.encode(query).tolist()

    # Debug: Log the embedding values.
    logging.debug("Computed query embedding: %s", query_embedding)

    # Initialize the Neo4j driver.
    driver = GraphDatabase.driver(NEO4J_URI, auth=(NEO4J_USER, NEO4J_PASSWORD))
    try:
        with driver.session() as session:
            results = session.read_transaction(
                fetch_similar_chunks, query_embedding, top_n
            )
        return results
    finally:
        driver.close()
