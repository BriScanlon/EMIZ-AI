# embeds text passed to it and returns as a list of vector id's

import os
import logging
from sentence_transformers import SentenceTransformer

# Configure logging to show debug messages
logging.basicConfig(level=logging.DEBUG)

# Load SentenceTransformer model.
MODEL_NAME = os.getenv("SENTENCE_TRANSFORMER_MODEL", "all-MiniLM-L6-v2")
model = SentenceTransformer(MODEL_NAME)



def embed_text(query: str):
    """
    Takes the passed text and creates sentenceTransformer emdeddings and returns them as a list.
    """
    # Debug: Log the received query.
    logging.debug("Received query: %s", query)

    # Compute the embedding for the query text.
    query_embedding = model.encode(query).tolist()

    # Debug: Log the embedding values.
    logging.debug("Computed query embedding: %s", query_embedding)

    return [query_embedding]
