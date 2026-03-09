# auth.py
from fastapi import HTTPException, status, Depends
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from pydantic import BaseModel, EmailStr
from motor.motor_asyncio import AsyncIOMotorClient
from passlib.context import CryptContext
from jose import JWTError, jwt
from datetime import datetime, timedelta
from typing import Optional

# -------------------------------
# CONFIG
# -------------------------------
MONGO_URL = "mongodb://localhost:27017"  # replace with your MongoDB URI
DATABASE_NAME = "fastapi_auth"
SECRET_KEY = "YOUR_SECRET_KEY"  # change this to a strong secret
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

# -------------------------------
# INIT
# -------------------------------
client = AsyncIOMotorClient(MONGO_URL)
db = client[DATABASE_NAME]
# use a backend that doesn't depend on the external `bcrypt` C extension
# to avoid runtime issues in some environments. `sha256_crypt` is pure
# python/passlib and is suitable for development; for production consider
# using a hardened KDF (argon2) or ensure a proper bcrypt build is available.
pwd_context = CryptContext(schemes=["sha256_crypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# -------------------------------
# MODELS
# -------------------------------
class User(BaseModel):
    email: EmailStr
    password: str
    full_name: str

class Token(BaseModel):
    access_token: str
    token_type: str

# -------------------------------
# UTILS
# -------------------------------
def get_password_hash(password: str):
    # ensure we operate on a string
    if password is None:
        raise HTTPException(status_code=400, detail="Password required")

    password = str(password).strip()

    if not password:
        raise HTTPException(status_code=400, detail="Password required")

    # simple hashing using the configured CryptContext; keep the input as
    # a string. `sha256_crypt` does not have the 72-byte bcrypt limit.
    return pwd_context.hash(password)



def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

async def get_user(email: str):
    return await db.users.find_one({"email": email})

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=15))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

async def authenticate_user(email: str, password: str):
    user = await get_user(email)
    if not user:
        return False

    print("Stored password:", user["hashed_password"])  # 👈 DEBUG

    if not verify_password(password, user["hashed_password"]):
        return False
    return user


async def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    user = await get_user(email)
    if user is None:
        raise credentials_exception
    return user
