import chromadb

client = chromadb.Client()
collection = client.get_or_create_collection("legal_docs")

def store_embeddings(chunks, embeddings):
    ids = [f"id_{i}" for i in range(len(chunks))]
    collection.add(documents=chunks, embeddings=embeddings, ids=ids)

def search_embeddings(query, top_k=5):
    results = collection.query(query_texts=[query], n_results=top_k)
    return results["documents"][0]
