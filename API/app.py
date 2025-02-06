import os
import logging
import json
import uuid  # For generating unique queryIds
from fastapi import FastAPI, HTTPException, File, UploadFile
from pydantic import BaseModel

from neo4j import GraphDatabase
from langchain_community.graphs import Neo4jGraph
from langchain_community.vectorstores import Neo4jVector
from sentence_transformers import SentenceTransformer

from helpers.process_document import process_document  # Existing function
from helpers.chunk_text import chunk_text

# Define SentenceTransformer Model
embedding_model = SentenceTransformer("all-MiniLM-L6-v2")


# Create a Wrapper Class for SentenceTransformer Embeddings
class SentenceTransformerEmbeddings:
    """
    Wrapper for SentenceTransformer to work with Neo4jVector.
    """
   


    def __init__(self, model):
        self.model = model

    def embed_query(self, text):
        """
        Generate an embedding for a single query string.
        """
        return self.model.encode(text, convert_to_numpy=True).tolist()

    def embed_documents(self, texts):
        """
        Generate embeddings for multiple documents.
        """
        return self.model.encode(texts, convert_to_numpy=True).tolist()


# Environment settings
NEO4J_URI = "bolt://neo4j-db-container"
NEO4J_USER = os.getenv("NEO4J_USER", "neo4j")
NEO4J_PASSWORD = "TestPassword"



# ollama settings
llm_model="phi4"
llm_port = os.getenv("OLLAMA_PORT_I", "11434")
llm = OllamaLLM(base_url="http://ollama-container:{}".format(llm_port), model=llm_model, temperature=0)
llm_transformer = LLMGraphTransformer(llm=llm)

# chunk settings

CHUNK_SIZE = 1000
CHUNK_OVERLAP = 200

# Initialise FastAPI app
app = FastAPI()

# Initialise Neo4j driver
graph_driver = Neo4jGraph(NEO4J_URI, NEO4J_USER, NEO4J_PASSWORD)

# Initialise SentenceTransformer Embeddings Wrapper
embedding_function = SentenceTransformerEmbeddings(embedding_model)

# Initialise Vector Storage within Neo4j
vector_store = Neo4jVector(
    url=NEO4J_URI,
    username=NEO4J_USER,
    password=NEO4J_PASSWORD,
    embedding=embedding_function,
)


# Define Pydantic models
class QueryRequest(BaseModel):
    query: str


class RatingRequest(BaseModel):
    queryId: str
    chunkId: int
    score: int


@app.get("/")
def read_root():
    return {"message": "KG-RAG Service is running."}


# 1️⃣ Upload & Process Document
@app.post("/documents")
async def post_documents(file: UploadFile = File(...)):
    """
    Uploads a PDF file, extracts text, stores chunked text with vectors in Neo4j.
    """
    if not file:
        raise HTTPException(status_code=400, detail="File is required")

    # Validate file type (PDF only)
    allowed_extensions = {"pdf"}
    file_extension = file.filename.split(".")[-1].lower()
    if file_extension not in allowed_extensions:
        raise HTTPException(status_code=400, detail="Unsupported file type")

    # Read file content
    file_content = await file.read()
    if not file_content:
        raise HTTPException(status_code=400, detail="File is empty or unreadable")

    try:
        # Extract text from PDF
        processed_data = process_document(file_content, file_extension)
        if not processed_data or "text" not in processed_data:
            raise HTTPException(
                status_code=500, detail="Error processing PDF: no content extracted"
            )

        processed_text = processed_data["text"]

        # Chunk the processed text
        chunks = chunk_text(
            processed_text, chunk_size=CHUNK_SIZE, chunk_overlap=CHUNK_OVERLAP
        )

        # Store in Neo4j with embedded vectors
        with GraphDatabase.driver(
            NEO4J_URI, auth=(NEO4J_USER, NEO4J_PASSWORD)
        ) as driver:
            with driver.session() as session:
                for i, chunk in enumerate(chunks):
                    embedding_vector = embedding_function.embed_query(chunk)
                    session.run(
                        """
                        CREATE (c:Chunk {
                            chunk_id: $chunk_id,
                            text: $text,
                            vector: $vector
                        })
                        """,
                        chunk_id=i,
                        text=chunk,
                        vector=embedding_vector,
                    )
                    # Create sequential relationships
                    if i > 0:
                        session.run(
                            """
                            MATCH (c1:Chunk {chunk_id: $chunk1}),
                                  (c2:Chunk {chunk_id: $chunk2})
                            CREATE (c1)-[:NEXT]->(c2)
                            """,
                            chunk1=i - 1,
                            chunk2=i,
                        )

        return {
            "message": f"Document '{file.filename}' processed and stored in Neo4j.",
            "total_chunks": len(chunks),
        }

    except Exception as e:
        logging.error(f"Error processing PDF: {e}")
        raise HTTPException(
            status_code=500, detail=f"Internal error during processing: {e}"
        )

@app.post("/query_sample")
async def query_sample_data(request: QueryRequest):
    """
    Endpoint which will give a hard coded response to for testing.
    """
    try:
        # Extract the query from the request - We are only doing this to test a request has been sent in teh correct format
        query = request.query

        # Run the query through the chain
        response = {
            "nodes": [
                {"id": "1", "name": "DHC-8-402 Dash 8, G-JEDI", "category": "Aircraft"},
                {"id": "2", "name": "AC Electrical System", "category": "System"},
                {"id": "3", "name": "Wiring Loom", "category": "Component"},
                {"id": "4", "name": "Chafing due to blind rivet", "category": "FailureMode"},
                {"id": "5", "name": "AC bus and generator warnings", "category": "Symptom"},
                {"id": "6", "name": "Replace blind rivets with solid rivets", "category": "Resolution"},
                {"id": "7", "name": "Incident: AC System Failure", "category": "Incident"},
            ],
            "links": [
                {"source": "1", "target": "7", "label": "OCCURRED_ON"},
                {"source": "2", "target": "3", "label": "PART_OF"},
                {"source": "4", "target": "2", "label": "AFFECTS"},
                {"source": "4", "target": "5", "label": "LEADS_TO"},
                {"source": "4", "target": "6", "label": "RESOLVED_BY"},
            ],
            "categories": [
                {"name": "Aircraft"},
                {"name": "System"},
                {"name": "Component"},
                {"name": "FailureMode"},
                {"name": "Symptom"},
                {"name": "Resolution"},
                {"name": "Incident"},
            ],
        }


        return {
            "status": 200,
            "query": query,
            "node_graph": response,
            "llm_response": f"Hello,  I am a useful llm and I have given you some great data, using model {llm_model}"
        }

    except Exception as e:
        logging.error(f"Error querying Neo4j with GraphCypherQAChain: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"An error occurred while querying the database: {e}",
        )
        


@app.post("/query")
async def query_graph_with_vector_search(request: QueryRequest):
    """
    Perform a vector similarity search in Neo4j.
    """
    try:
        # Create a unique queryId for reference
        query_id = str(uuid.uuid4())

        # Generate embedding
        query_embedding = embedding_function.embed_query(request.query)

        with GraphDatabase.driver(
            NEO4J_URI, auth=(NEO4J_USER, NEO4J_PASSWORD)
        ) as driver:
            with driver.session() as session:
                # Create a Query node to store the query text for future reference
                session.run(
                    """
                    CREATE (q:Query {
                        queryId: $queryId,
                        text: $queryText
                    })
                    """,
                    queryId=query_id,
                    queryText=request.query,
                )

                # Vector similarity search
                result = session.run(
                    """
                    MATCH (c:Chunk)
                    WITH c, gds.similarity.cosine($vector, c.vector) AS similarity
                    RETURN c.chunk_id AS chunk_id, c.text AS chunk_text, similarity
                    ORDER BY similarity DESC
                    LIMIT 3
                    """,
                    vector=query_embedding,
                )

                # Convert records to a list
                chunks = [
                    {
                        "chunk_id": record["chunk_id"],
                        "text": record["chunk_text"],
                        "similarity": record["similarity"],
                    }
                    for record in result
                ]

        return {
            "queryId": query_id,  # Return the queryId for use in ratings
            "query": request.query,
            "results": chunks,
        }

    except Exception as e:
        logging.error(f"Error querying Neo4J: {e}")
        raise HTTPException(
            status_code=500, detail=f"An error occurred while querying Neo4j: {e}"
        )


# 3️⃣ Rate a Query Result
@app.post("/rate")
def rate_query_result(rating_req: RatingRequest):
    """
    Stores a user's rating (1-5) for a chunk in response to a specific query.
    """
    # Validate the rating
    if not (1 <= rating_req.score <= 5):
        raise HTTPException(status_code=400, detail="Score must be between 1 and 5.")

    try:
        with GraphDatabase.driver(
            NEO4J_URI, auth=(NEO4J_USER, NEO4J_PASSWORD)
        ) as driver:
            with driver.session() as session:
                # Create a relationship from the Query node to the Chunk node
                session.run(
                    """
                    MATCH (q:Query {queryId: $queryId}),
                          (c:Chunk {chunk_id: $chunkId})
                    MERGE (q)-[r:RATED]->(c)
                    SET r.score = $score
                    """,
                    queryId=rating_req.queryId,
                    chunkId=rating_req.chunkId,
                    score=rating_req.score,
                )

        return {
            "message": "Rating saved successfully.",
            "queryId": rating_req.queryId,
            "chunkId": rating_req.chunkId,
            "score": rating_req.score,
        }

    except Exception as e:
        logging.error(f"Error storing rating: {e}")
        raise HTTPException(
            status_code=500, detail=f"An error occurred while storing the rating: {e}"
        )
