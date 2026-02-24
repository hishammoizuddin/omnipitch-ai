import os
from pinecone import Pinecone, ServerlessSpec
from langchain_openai import OpenAIEmbeddings
from langchain_pinecone import PineconeVectorStore

INDEX_NAME = "omnipitch-ai"

def get_pinecone_index():
    api_key = os.environ.get("PINECONE_API_KEY")
    if not api_key:
        raise ValueError("PINECONE_API_KEY environment variable not set")
        
    pc = Pinecone(api_key=api_key)
    
    # Check if index exists, map by name
    existing_indexes = [index.name for index in pc.list_indexes()]
    
    if INDEX_NAME not in existing_indexes:
        print(f"Creating Pinecone index: {INDEX_NAME}")
        pc.create_index(
            name=INDEX_NAME,
            dimension=1536, # Default dimension for text-embedding-ada-002 or text-embedding-3-small
            metric="cosine",
            spec=ServerlessSpec(
                cloud="aws",
                region="us-east-1"
            )
        )
    return pc.Index(INDEX_NAME)

def get_vector_store():
    # Initialize index if it doesn't exist
    get_pinecone_index()
    
    embeddings = OpenAIEmbeddings(model="text-embedding-3-small")
    return PineconeVectorStore(
        index_name=INDEX_NAME,
        embedding=embeddings
    )
