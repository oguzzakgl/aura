-- Enable the pgvector extension to work with embedding vectors
CREATE EXTENSION IF NOT EXISTS vector;

-- Create a table to store your clinic knowledge base documents
CREATE TABLE clinic_knowledge_base (
    id bigserial primary key,
    content text, -- corresponds to chunked document text
    metadata jsonb, -- corresponds to metadata (source file, doc_type etc.)
    embedding vector(768) -- 768 dimensions is standard for Google's text-embedding-004
);

-- Create a function to search for documents
-- Uses cosine distance operator `<=>` which is standard for embeddings
CREATE OR REPLACE FUNCTION match_clinic_documents (
  query_embedding vector(768),
  match_threshold float,
  match_count int
)
RETURNS TABLE (
  id bigint,
  content text,
  metadata jsonb,
  similarity float
)
LANGUAGE sql STABLE
AS $$
  SELECT
    clinic_knowledge_base.id,
    clinic_knowledge_base.content,
    clinic_knowledge_base.metadata,
    1 - (clinic_knowledge_base.embedding <=> query_embedding) as similarity
  FROM clinic_knowledge_base
  WHERE 1 - (clinic_knowledge_base.embedding <=> query_embedding) > match_threshold
  ORDER BY clinic_knowledge_base.embedding <=> query_embedding
  LIMIT match_count;
$$;
