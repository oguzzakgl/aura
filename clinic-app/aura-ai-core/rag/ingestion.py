import os
import re
import glob
from pathlib import Path
from dotenv import load_dotenv

# LangChain Imports
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.document_loaders import PyPDFLoader, TextLoader

# Supabase & Gemini Imports
from supabase import create_client, Client
from google import genai

# Load environment variables
load_dotenv()

# Configuration
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY") # We need service role for writing vector data if RLS is on
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    print("WARNING: Supabase URL or Key not found in .env. Will use mock upload for testing.")
if not GEMINI_API_KEY:
    print("WARNING: GEMINI_API_KEY not found in .env.")

# Initialize Gemini Client
gemini_client = None
if GEMINI_API_KEY:
    gemini_client = genai.Client(api_key=GEMINI_API_KEY)

# Initialize Supabase (Mock if not configured)
supabase: Client = None
if SUPABASE_URL and SUPABASE_KEY:
    supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

KNOWLEDGE_BASE_DIR = Path(__file__).parent.parent / "knowledge_base"


def anonymize_text(text: str) -> str:
    """
    Simulates a PII (Personally Identifiable Information) masking tool.
    In a real production environment, use Microsoft Presidio.
    Here we mask TC Identity Numbers (11 digits), and common phone number patterns.
    """
    # Mask 11-digit TC numbers
    text = re.sub(r'\b[1-9][0-9]{10}\b', '[TC_ID_MASKED]', text)
    # Mask phone numbers (basic Turkish format like 05XX XXX XX XX)
    text = re.sub(r'\b05\d{2}\s?\d{3}\s?\d{2}\s?\d{2}\b', '[PHONE_MASKED]', text)
    return text


def load_documents(directory: Path):
    """
    Scans the directory for .txt, .md, and .pdf files and loads their text.
    """
    docs = []
    
    # Text and Markdown files
    for ext in ["*.txt", "*.md"]:
        for file_path in directory.glob(ext):
            loader = TextLoader(str(file_path), encoding='utf-8')
            loaded_docs = loader.load()
            for doc in loaded_docs:
                doc.metadata['source_file'] = file_path.name
                doc.metadata['doc_type'] = 'text/markdown'
                docs.append(doc)
                
    # PDF files
    for file_path in directory.glob("*.pdf"):
        try:
            loader = PyPDFLoader(str(file_path))
            loaded_docs = loader.load()
            # Combine pages into one logical document or keep pages separate
            for doc in loaded_docs:
                doc.metadata['source_file'] = file_path.name
                doc.metadata['doc_type'] = 'pdf'
                docs.append(doc)
        except Exception as e:
            print(f"Error loading PDF {file_path.name}: {e}")
            
    return docs


def generate_embedding(text: str) -> list[float]:
    """
    Calls Google Gemini text-embedding-004 to convert text into a vector.
    """
    if not gemini_client:
        # Mock embedding for testing without API key
        return [0.0] * 768

    result = gemini_client.models.embed_content(
        model="gemini-embedding-2",
        contents=text
    )
    return result.embeddings[0].values


def run_ingestion():
    print(f"Starting ingestion process from {KNOWLEDGE_BASE_DIR}...")
    
    # 1. Load Documents
    raw_docs = load_documents(KNOWLEDGE_BASE_DIR)
    print(f"Loaded {len(raw_docs)} documents/pages.")
    
    # 2. Text Splitter (Chunking) - Semantically aware
    # Dental protocols usually have clear paragraph breaks.
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=1000,
        chunk_overlap=200,
        length_function=len,
        separators=["\n\n", "\n", ".", " ", ""]
    )
    
    chunks = text_splitter.split_documents(raw_docs)
    print(f"Split documents into {len(chunks)} chunks.")
    
    # 3. Anonymization & Embedding
    processed_records = []
    
    import time
    for i, chunk in enumerate(chunks):
        # Apply KVKK Masking
        safe_content = anonymize_text(chunk.page_content)
        
        # Get Vector Representation
        print(f"Embedding chunk {i+1}/{len(chunks)}...")
        try:
            vector = generate_embedding(safe_content)
        except Exception as e:
            if "429" in str(e) or "RESOURCE_EXHAUSTED" in str(e):
                print(f"[AURA RAG KOTA UYARISI]: Gemini ücretsiz API sınırına ulaşıldı (100 İstek/Dakika). 35 saniye bekleniyor...")
                time.sleep(35)
                # Retry once
                vector = generate_embedding(safe_content)
            else:
                raise e
        
        record = {
            "content": safe_content,
            "embedding": vector,
            "metadata": {
                "source": chunk.metadata.get("source_file", "unknown"),
                "page": chunk.metadata.get("page", 0),
                "doc_type": chunk.metadata.get("doc_type", "unknown")
            }
        }
        processed_records.append(record)
        
    print(f"Successfully vectorized {len(processed_records)} chunks.")
    
    # 4. Upload to Supabase (Vector DB)
    if supabase:
        print("Uploading to Supabase PGVector 'clinic_knowledge_base' table...")
        # Note: 'clinic_knowledge_base' table must exist with 'content' (text), 'embedding' (vector(768)), 'metadata' (jsonb)
        try:
            # We use chunks of 50 to avoid payload size limits
            batch_size = 50
            for i in range(0, len(processed_records), batch_size):
                batch = processed_records[i:i+batch_size]
                supabase.table("clinic_knowledge_base").insert(batch).execute()
            print("Upload complete!")
        except Exception as e:
            print(f"Failed to upload to Supabase: {e}")
            print("Make sure the table exists and pgvector extension is enabled.")
    else:
        print("Supabase credentials not found. Upload skipped. Mock successful.")


if __name__ == "__main__":
    run_ingestion()
