import os
from sentence_transformers import SentenceTransformer

from config import EMBED_MODEL

model = SentenceTransformer(EMBED_MODEL)

def embed_text(text: str):
    return model.encode(text).tolist()
