from fastapi import FastAPI, HTTPException, Depends
from datetime import timedelta
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from rag import search_faiss, detect_legal_domain
from llm_client import ask_local_llm
from sentence_transformers import SentenceTransformer, util
from auth import authenticate_user, create_access_token, get_current_user, get_password_hash, User, db
from fastapi.security import OAuth2PasswordRequestForm
from config import LAW_DOMAINS

# ------------------------------
# Setup
# ------------------------------
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ------------------------------
# Request Model
# ------------------------------
class AskRequest(BaseModel):
    question: str
    lang: str = "en"
    user_id: str = "default"


# ------------------------------
# Load Embedding Model
# ------------------------------
intent_model = SentenceTransformer("all-MiniLM-L6-v2")


# ------------------------------
# Intent Examples (Mini Dataset)
# ------------------------------
intent_examples = {

    "casual": [
        "hello",
        "hi",
        "good morning",
        "how are you",
        "hey there",
        "what's up"
    ],

    "legal": [
        "marriage law in Morocco",
        "divorce legal process",
        "punishment for theft",
        "legal age for marriage",
        "property ownership law",
        "inheritance law",
        "criminal punishment",
        "court procedure"
    ],

    "non_legal": [
        "weather today",
        "football match score",
        "movie recommendation",
        "best restaurant",
        "how to cook pasta",
        "latest technology news"
    ]
}

# ------------------------------
# Create Intent Embeddings
# ------------------------------
intent_embeddings = {}

for intent, examples in intent_examples.items():
    intent_embeddings[intent] = intent_model.encode(examples)


# ------------------------------
# Intent Detection Using Embeddings
# ------------------------------
def detect_intent_embedding(question):

    q_emb = intent_model.encode([question])

    best_intent = None
    best_score = -1

    for intent, emb in intent_embeddings.items():

        scores = util.cos_sim(q_emb, emb)
        score = scores.max().item()

        if score > best_score:
            best_score = score
            best_intent = intent

    return best_intent


# ------------------------------
# Auth APIs
# ------------------------------
@app.get("/validate-token")
async def validate_token(user=Depends(get_current_user)):
    return {
        "email": user["email"],
        "full_name": user["full_name"]
    }


@app.post("/signup")
async def signup(user: User):

    existing_user = await db.users.find_one({"email": user.email})

    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    hashed_password = get_password_hash(user.password)

    await db.users.insert_one({
        "email": user.email,
        "full_name": user.full_name,
        "hashed_password": hashed_password
    })

    access_token = create_access_token({"sub": user.email})

    return {
        "access_token": access_token,
        "token_type": "bearer"
    }


@app.post("/token")
async def login(form_data: OAuth2PasswordRequestForm = Depends()):

    user = await authenticate_user(form_data.username, form_data.password)

    if not user:
        return {"error": "Invalid credentials"}

    access_token = create_access_token(
        {"sub": user["email"]},
        expires_delta=timedelta(minutes=60)
    )

    return {
        "access_token": access_token,
        "token_type": "bearer"
    }


# ------------------------------
# Chat Memory
# ------------------------------
CHAT_HISTORY = {}


# ------------------------------
# Ask API
# ------------------------------
@app.post("/ask")
def ask(req: AskRequest, user=Depends(get_current_user)):

    user_text = req.question.strip()
    user_id = user["email"]

    if user_id not in CHAT_HISTORY:
        CHAT_HISTORY[user_id] = []

    CHAT_HISTORY[user_id].append({"user": user_text})
    CHAT_HISTORY[user_id] = CHAT_HISTORY[user_id][-10:]

    # Detect Intent
    intent = detect_intent_embedding(user_text)

    # -------- CASUAL --------
    if intent == "casual":

        prompt = f"""
You are a friendly AI chatbot.

User message:
{user_text}

Respond briefly and friendly.
"""

        reply = ask_local_llm(prompt)

        CHAT_HISTORY[user_id].append({"bot": reply})

        return {"answer": reply}

    # -------- NON LEGAL --------
    if intent == "non_legal":

        reply = "I can help only with Moroccan legal questions."

        CHAT_HISTORY[user_id].append({"bot": reply})

        return {"answer": reply}

    # -------- LEGAL --------
    domain = detect_legal_domain(user_text)

    if not domain:
        return {"answer": "Please ask a question related to Moroccan law."}

    docs = search_faiss(user_text, domain)

    if not docs:
        return {
            "answer": "I'm sorry, I do not have specific information on that in my documents."
        }

    context = "\n\n".join(docs)

    prompt = f"""
You are a Moroccan Legal Expert AI.

Legal Text:
{context}

Question:
{user_text}

Provide a clear legal explanation.
"""

    reply = ask_local_llm(prompt)

    CHAT_HISTORY[user_id].append({"bot": reply})

    return {"answer": reply}