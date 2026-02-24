import os
import sys
from dotenv import load_dotenv
from langchain_core.documents import Document

# Add parent directory to path to import utils
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from utils.pinecone_db import get_vector_store

# Load environment variables
load_dotenv()

def seed_database():
    print("Connecting to vector store and ensuring index exists...")
    vector_store = get_vector_store()
    
    print("Preparing documents...")
    documents = [
        Document(
            page_content="TOGAF: The Open Group Architecture Framework is an enterprise architecture methodology that offers a high-level framework for enterprise software development.",
            metadata={"category": "Enterprise Term", "term": "TOGAF"}
        ),
        Document(
            page_content="ITIL: Information Technology Infrastructure Library is a set of detailed practices for IT service management (ITSM) that focuses on aligning IT services with the needs of business.",
            metadata={"category": "Enterprise Term", "term": "ITIL"}
        ),
        Document(
            page_content="Total Cost of Ownership (TCO): A financial estimate intended to help buyers and owners determine the direct and indirect costs of a product or system.",
            metadata={"category": "Enterprise Term", "term": "TCO"}
        ),
        Document(
            page_content="Change Management: The discipline that guides how we prepare, equip and support individuals to successfully adopt change in order to drive organizational success and outcomes.",
            metadata={"category": "Enterprise Term", "term": "Change Management"}
        ),
        Document(
            page_content="Brand Guidelines: The parent company is 'Aisynch Labs'. The primary color palette is Slate Gray and Deep Blue. The primary logo mark is strictly 'AL'. Do not use any other acronyms for the logo.",
            metadata={"category": "Brand Guideline", "company": "Aisynch Labs"}
        )
    ]
    
    print(f"Upserting {len(documents)} documents into Pinecone...")
    vector_store.add_documents(documents)
    print("Seeding complete! You can now query the 'omnipitch-ai' index.")

if __name__ == "__main__":
    seed_database()
