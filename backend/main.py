
from fastapi import FastAPI,HTTPException
from datetime import timedelta
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from rag import search_faiss, detect_legal_domain

from llm_client import ask_local_llm
from sentence_transformers import SentenceTransformer, util
from auth import authenticate_user, create_access_token, get_current_user, get_password_hash, User, db
from fastapi import Depends
from fastapi.security import OAuth2PasswordRequestForm
# rag.py
from config import LAW_DOMAINS

# ------------------------------
# Setup
# ------------------------------
app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    # during local development allow the frontend dev server origins
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class AskRequest(BaseModel):
    question: str
    lang: str = "en"
    user_id: str = "default"

# Load embedding model
intent_model = SentenceTransformer("all-MiniLM-L6-v2")


CHAT_HISTORY = {}

def detect_intent_llm(question):

    q = question.lower()

    # 🔹 RULE-BASED LEGAL OVERRIDE
    legal_keywords = [
    # General legal terms
    "law", "legal", "regulation", "act", "statute", "code", "article",
    "decree", "legislation", "constitution", "court", "judge", "trial",
    "appeal", "case", "verdict", "authority", "compliance", "obligation",
    "provision", "clause", "amendment", "jurisdiction", "precedent",

    # Criminal law
    "crime", "offense", "felony", "misdemeanor", "punishment", "penalty",
    "prosecution", "investigation", "arrest", "jail", "prison", "police",
    "evidence", "guilt", "conviction", "murder", "theft", "fraud", "assault",

    # Civil & property law
    "contract", "agreement", "tort", "property", "ownership", "tenant",
    "lease", "dispute", "liability", "compensation", "claim", "damage",
    "rights", "inheritance", "estate", "mortgage", "possession", "lawsuit",

    # Family law
    "marriage", "divorce", "spouse", "child", "custody", "alimony",
    "guardianship", "adoption", "dowry", "annulment", "engagement",
    "matrimonial", "family court", "parental rights",

    # Moroccan-specific
    "moudawana", "penal code", "civil code", "law no.", "royal decree",
    "judicial system", "legal reform", "Moroccan law"
]



    if any(word in q for word in legal_keywords):
        return "legal"
    prompt = f"""
You are an assistant that classifies questions into three categories:
1. casual: greetings or general conversation.
2. legal: questions related to Moroccan law.
3. non_legal: anything else not related to law.

Classify the following question into one of these categories only:
Question: "{question}"

Answer with only one word: casual, legal, or non_legal.
"""
    intent = ask_local_llm(prompt).strip().lower()
    if intent not in ["casual", "legal", "non_legal"]:
        intent = "non_legal"
    return intent

@app.get("/validate-token")
async def validate_token(user=Depends(get_current_user)):
    return {"email": user["email"], "full_name": user["full_name"]}

@app.post("/signup")
async def signup(user: User):
    print("SIGNUP DATA:", user)
    existing_user = await db.users.find_one({"email": user.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    hashed_password = get_password_hash(user.password)  # ✅ bcrypt hash

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
    access_token = create_access_token({"sub": user["email"]}, expires_delta=timedelta(minutes=60))
    return {"access_token": access_token, "token_type": "bearer"}

CHAT_HISTORY = {}
# ------------------------------
# API
# ------------------------------


@app.post("/ask")
def ask(req: AskRequest, user=Depends(get_current_user)):
    user_text = req.question.strip()
    user_id = user["email"]

    if user_id not in CHAT_HISTORY:
        CHAT_HISTORY[user_id] = []

    CHAT_HISTORY[user_id].append({"user": user_text})
    CHAT_HISTORY[user_id] = CHAT_HISTORY[user_id][-10:]

    intent = detect_intent_llm(user_text)

    # -------- CASUAL --------
    if intent == "casual":
        prompt = f"""
You are a friendly AI chatbot.
User message: "{user_text}"
Respond briefly and friendly.
"""
        reply = ask_local_llm(prompt)
        CHAT_HISTORY[user_id].append({"bot": reply})
        return {"answer": reply}

    # -------- NON-LEGAL --------
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
        return {"answer": "I'm sorry, I do not have specific information on that in my documents."}

    context = "\n\n".join(docs)

    prompt = f"""
You are a Moroccan Legal Expert AI.

Legal Text:
{context}

Question:
{user_text}
"""
    reply = ask_local_llm(prompt)
    CHAT_HISTORY[user_id].append({"bot": reply})
    return {"answer": reply}
