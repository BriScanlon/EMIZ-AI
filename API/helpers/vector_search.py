# helpers/vector_search.py

import os
from sentence_transformers import SentenceTransformer
from neo4j import GraphDatabase

# Load the SentenceTransformer model.
# You can override the model name using the SENTENCE_TRANSFORMER_MODEL environment variable.
MODEL_NAME = os.getenv("SENTENCE_TRANSFORMER_MODEL", "all-MiniLM-L6-v2")
model = SentenceTransformer(MODEL_NAME)

# Neo4j connection parameters (override via environment variables if needed)
NEO4J_URI = os.getenv("NEO4J_URI", "bolt://neo4j-db-container")
NEO4J_USER = os.getenv("NEO4J_USER", "neo4j")
NEO4J_PASSWORD = os.getenv("NEO4J_PASSWORD", "TestPassword")


def fetch_similar_chunks(tx, query_embedding, top_n):
    """
    Runs a Cypher query that computes cosine similarity between the query embedding
    and each Chunk node's stored vector (in property `vector`).
    Returns the top_n nodes with the highest cosine similarity.
    """
    cypher_query = """
    WITH $query_embedding AS query
    MATCH (c:Chunk)
    WHERE exists(c.vector)
    WITH c, query,
         // Compute dot product between the query and the node's vector.
         reduce(dot = 0.0, i in range(0, size(query)) | dot + c.vector[i] * query[i]) AS dotProduct,
         // Compute the L2 norm of the query vector.
         sqrt(reduce(s = 0.0, i in range(0, size(query)) | s + query[i]*query[i])) AS normQuery,
         // Compute the L2 norm of the node's vector.
         sqrt(reduce(s = 0.0, i in range(0, size(c.vector)) | s + c.vector[i]*c.vector[i])) AS normChunk
    WHERE normQuery <> 0 AND normChunk <> 0
    WITH c, dotProduct/(normQuery*normChunk) AS cosineSimilarity
    ORDER BY cosineSimilarity DESC
    LIMIT $top_n
    RETURN c, cosineSimilarity AS similarity
    """
    result = tx.run(cypher_query, query_embedding=query_embedding, top_n=top_n)
    results = []
    for record in result:
        node = record["c"]
        similarity = record["similarity"]
        results.append({
            "id": node.id,
            "properties": dict(node),
            "similarity": similarity
        })
    return results


def vector_search(query: str, top_n: int = 5):
    """
    Given a text query, compute its embedding and retrieve the top_n similar chunks from Neo4j.
    
    Args:
        query (str): The input text query.
        top_n (int): The number of similar chunks to return.
    
    Returns:
        list: A list of dictionaries, each containing node information and a similarity score.
    """
    # Compute the embedding for the query text.
    query_embedding = model.encode(query).tolist()

    # Initialize the Neo4j driver.
    driver = GraphDatabase.driver(NEO4J_URI, auth=(NEO4J_USER, NEO4J_PASSWORD))
    try:
        with driver.session() as session:
            results = session.read_transaction(fetch_similar_chunks, query_embedding, top_n)
        return results
    finally:
        driver.close()
