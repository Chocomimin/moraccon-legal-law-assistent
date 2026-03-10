import os
import pickle
from pathlib import Path
from sentence_transformers import SentenceTransformer, util

import faiss
from PyPDF2 import PdfReader
# rag.py
from config import LAW_DOMAINS

# ---------------- Configuration ----------------
DB_DIR = Path("data/faiss_index")
DB_DIR.mkdir(parents=True, exist_ok=True)

PDF_DIR = Path("data/pdfs")  # Put your PDFs here
CHUNK_SIZE = 500
CHUNK_OVERLAP = 50

MODEL_NAME = "all-MiniLM-L6-v2"  # SentenceTransformers model
# -----------------------------------------------
domain_model = SentenceTransformer(MODEL_NAME)
model = SentenceTransformer(MODEL_NAME)
domain_names = list(LAW_DOMAINS.keys())
domain_texts = [LAW_DOMAINS[d]["description"] for d in domain_names]
domain_embeddings = domain_model.encode(domain_texts, convert_to_tensor=True)

def detect_legal_domain(question, threshold=0.25):
    q_emb = domain_model.encode(question, convert_to_tensor=True)
    scores = util.cos_sim(q_emb, domain_embeddings)[0]

    best_idx = scores.argmax().item()
    best_score = scores[best_idx].item()

    if best_score < threshold:
        return None

    return domain_names[best_idx]
# Load embedding model
model = SentenceTransformer(MODEL_NAME)

TXT_DIR = Path("data/txts")  # folder containing translated .txt files

def extract_text_from_txts(txt_dir=TXT_DIR):
    """Extract text from all .txt files"""
    texts = []
    for txt_file in txt_dir.glob("*.txt"):
        with open(txt_file, "r", encoding="utf-8") as f:
            texts.append(f.read())
    return texts

import re



def chunk_text(text):
    """
    Chunk legal text by Articles (Article 1, Article 17, etc.)
    """
    articles = re.split(r"(Article\s+\d+)", text)
    chunks = []

    for i in range(1, len(articles), 2):
        article_title = articles[i]
        article_body = articles[i + 1] if i + 1 < len(articles) else ""
        chunks.append(f"{article_title}\n{article_body}")

    return chunks

def build_faiss_index():
    print("Extracting TXT text...")

    all_chunks = []

    for txt_file in TXT_DIR.glob("*.txt"):
        with open(txt_file, "r", encoding="utf-8") as f:
            text = f.read()

        chunks = chunk_text(text)

        for chunk_text_item in chunks:
            all_chunks.append({
                "text": chunk_text_item,
                "source": txt_file.name
            })

    print(f"Total chunks: {len(all_chunks)}")

    # 🔹 Embed ONLY text
    texts = [c["text"] for c in all_chunks]
    embeddings = model.encode(texts, show_progress_bar=True)
    dim = embeddings.shape[1]

    index = faiss.IndexFlatL2(dim)
    index.add(embeddings)

    faiss.write_index(index, str(DB_DIR / "faiss.index"))

    with open(DB_DIR / "chunks.pkl", "wb") as f:
        pickle.dump(all_chunks, f)

    print("FAISS index built and saved!")

def search_faiss(query, domain, top_k=3, min_score=0.2):

    # Safety check
    if not domain or domain not in LAW_DOMAINS:
        print(f"Invalid domain: {domain}")
        return []

    faiss_index_path = DB_DIR / "faiss.index"
    chunks_path = DB_DIR / "chunks.pkl"

    if not faiss_index_path.exists() or not chunks_path.exists():
        build_faiss_index()

    index = faiss.read_index(str(faiss_index_path))
    with open(chunks_path, "rb") as f:
        chunks = pickle.load(f)

    # 🔴 Direct article match
    import re
    article_match = re.search(r"article\s+(\d+)", query.lower())
    if article_match:
        article_num = article_match.group(1)
        for c in chunks:
            if c["text"].lower().startswith(f"article {article_num}"):
                return [c["text"]]

    # Semantic search fallback
    query_embedding = model.encode([query])
    distances, indices = index.search(query_embedding, top_k)

    results = []
    for dist, idx in zip(distances[0], indices[0]):
        chunk = chunks[idx]

        # 🔒 DOMAIN FILTER (Safe check)


        score = 1 / (1 + dist)
        if score >= min_score:
            results.append(chunk["text"])

    return results

if __name__ == "__main__":
    query = "Explain Moroccan marriage law"

    # Detect the legal domain first
    domain = detect_legal_domain(query)
    if not domain:
        print("No legal domain detected for the query. Please ask a question related to Moroccan law.")
    else:
        # Search FAISS using the detected domain
        results = search_faiss(query, domain)
        if not results:
            print("No relevant documents found in the FAISS index.")
        else:
            print("\nTop results:\n")
            for i, res in enumerate(results, 1):
                print(f"{i}. {res}\n")

