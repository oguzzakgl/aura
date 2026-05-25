import os
from dotenv import load_dotenv

# Supabase & Gemini Imports
from supabase import create_client, Client
from google import genai

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_ANON_KEY")  # For reading, anon key is usually sufficient, but depends on RLS
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

gemini_client = None
if GEMINI_API_KEY:
    gemini_client = genai.Client(api_key=GEMINI_API_KEY)

# Initialize Supabase
supabase: Client = None
if SUPABASE_URL and SUPABASE_KEY:
    supabase = create_client(SUPABASE_URL, SUPABASE_KEY)


def get_query_embedding(query: str) -> list[float]:
    """Converts the text query into a vector using Gemini."""
    if not gemini_client:
        return [0.0] * 768

    result = gemini_client.models.embed_content(
        model="gemini-embedding-2",
        contents=query
    )
    return result.embeddings[0].values


def retrieve_context(query: str, match_threshold: float = 0.5, match_count: int = 3) -> str:
    """
    Searches the PGVector database for the most relevant medical chunks based on the query.
    Returns a formatted string containing the relevant context and their sources.
    """
    print(f"RAG Retriever searching for: '{query}'")
    
    if not supabase:
        print("WARNING: Supabase is not configured. Returning empty context.")
        return "RAG Sistemi şu an aktif değil (Veritabanı bağlantısı yok)."
        
    query_vector = get_query_embedding(query)
    
    try:
        # Call the RPC function we created in the SQL migration
        response = supabase.rpc(
            "match_clinic_documents",
            {
                "query_embedding": query_vector,
                "match_threshold": match_threshold,
                "match_count": match_count
            }
        ).execute()
        
        results = response.data
        if not results:
            return "Kliniğin bilgi bankasında bu bulguya/sorguya uygun bir kural bulunamadı."
            
        context_parts = []
        for index, row in enumerate(results):
            source = row['metadata'].get('source', 'Bilinmeyen Kaynak')
            content = row['content']
            similarity = row['similarity']
            
            # Format strictly for Citation (Atıf)
            formatted_chunk = f"[Kaynak: {source} (Benzerlik: {similarity:.2f})]\n{content}\n"
            context_parts.append(formatted_chunk)
            
        final_context = "\n".join(context_parts)
        return final_context
        
    except Exception as e:
        print(f"Error during RAG retrieval: {e}")
        return "RAG Arama motoru hatası."

# Test the retriever if run directly
if __name__ == "__main__":
    test_query = "Hastanın 38 numaralı dişi yarı gömülü ve ağrı yapıyor."
    context = retrieve_context(test_query)
    print("\n--- BULUNAN KLİNİK PROTOKOLLER ---")
    print(context)
