import os
from pathlib import Path
from pydantic import BaseModel
from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent.parent
WORKSPACE_DIR = BASE_DIR.parent

# Load optional .env file from workspace root
dotenv_path = WORKSPACE_DIR / ".env"
if dotenv_path.exists():
    load_dotenv(dotenv_path)

DATA_DIR = BASE_DIR / "data"
DATA_DIR.mkdir(parents=True, exist_ok=True)

DB_PATH = DATA_DIR / "interviewcoach.db"
DATABASE_URL = f"sqlite:///{DB_PATH}"

# Host & Port configuration
BACKEND_HOST = os.getenv("BACKEND_HOST", "127.0.0.1")
BACKEND_PORT = int(os.getenv("BACKEND_PORT", "8000"))

# Default Local AI inference server settings (e.g. Ollama, LM Studio, llama.cpp)
DEFAULT_AI_ENDPOINT = os.getenv("LOCAL_AI_ENDPOINT", "http://127.0.0.1:11434/v1")
DEFAULT_MODEL_NAME = os.getenv("LOCAL_AI_MODEL", "llama3:8b")
DEFAULT_AI_TIMEOUT = float(os.getenv("LOCAL_AI_TIMEOUT_SECONDS", "20.0"))

# Allowed Origins for CORS - strictly local and local file:// launcher
CORS_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:5500",
    "http://127.0.0.1:5500",
    "http://localhost:8000",
    "http://127.0.0.1:8000",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "null",  # Allow local file:// HTML launcher (e.g., index.html opened from filesystem)
]

