from langchain.text_splitter import RecursiveCharacterTextSplitter

# Chunking settings
CHUNK_SIZE = 1000
CHUNK_OVERLAP = 200

def chunk_text(text: str, chunk_size: int = CHUNK_SIZE, chunk_overlap: int = CHUNK_OVERLAP):
    """
    Splits text into chunks of specified size with overlap.

    :param text: The full text to be chunked.
    :param chunk_size: The maximum size of each chunk.
    :param chunk_overlap: The number of overlapping characters between chunks.
    :return: A list of chunked text segments.
    """
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=chunk_size, chunk_overlap=chunk_overlap
    )
    return text_splitter.split_text(text)
