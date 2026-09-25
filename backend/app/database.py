import sqlite3
import json
from contextlib import contextmanager
from typing import Generator
from app.config import DB_PATH, DEFAULT_AI_ENDPOINT, DEFAULT_MODEL_NAME

def get_db_connection() -> sqlite3.Connection:
    conn = sqlite3.connect(DB_PATH, timeout=10)
    conn.row_factory = sqlite3.Row
    return conn

@contextmanager
def get_db() -> Generator[sqlite3.Connection, None, None]:
    conn = get_db_connection()
    try:
        yield conn
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()

def init_db() -> None:
    with get_db() as conn:
        cursor = conn.cursor()
        
        # User profile table
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS user_profile (
            id INTEGER PRIMARY KEY CHECK (id = 1),
            name TEXT NOT NULL,
            target_role TEXT NOT NULL,
            experience_level TEXT NOT NULL,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL
        )
        """)

        # Resume data table
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS resume_data (
            id INTEGER PRIMARY KEY CHECK (id = 1),
            raw_text TEXT NOT NULL,
            edited_text TEXT NOT NULL,
            extracted_skills TEXT NOT NULL,
            extracted_projects TEXT NOT NULL,
            extracted_experience TEXT NOT NULL,
            updated_at TEXT NOT NULL
        )
        """)

        # Settings table
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS settings (
            id INTEGER PRIMARY KEY CHECK (id = 1),
            ai_endpoint TEXT NOT NULL,
            model_name TEXT NOT NULL,
            use_local_ai INTEGER NOT NULL DEFAULT 0,
            stt_endpoint TEXT NOT NULL DEFAULT '',
            stt_model TEXT NOT NULL DEFAULT 'whisper-1',
            stt_provider_type TEXT NOT NULL DEFAULT 'local_whisper',
            updated_at TEXT NOT NULL
        )
        """)

        # Safe migration for settings columns if created earlier
        cursor.execute("PRAGMA table_info(settings)")
        setting_cols = [col[1] for col in cursor.fetchall()]
        if "stt_endpoint" not in setting_cols:
            cursor.execute("ALTER TABLE settings ADD COLUMN stt_endpoint TEXT NOT NULL DEFAULT ''")
        if "stt_model" not in setting_cols:
            cursor.execute("ALTER TABLE settings ADD COLUMN stt_model TEXT NOT NULL DEFAULT 'whisper-1'")
        if "stt_provider_type" not in setting_cols:
            cursor.execute("ALTER TABLE settings ADD COLUMN stt_provider_type TEXT NOT NULL DEFAULT 'local_whisper'")

        # Interview sessions table
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS interview_sessions (
            id TEXT PRIMARY KEY,
            target_role TEXT NOT NULL,
            interview_type TEXT NOT NULL,
            difficulty TEXT NOT NULL,
            question_count INTEGER NOT NULL,
            status TEXT NOT NULL,
            mode TEXT NOT NULL,
            input_mode TEXT NOT NULL DEFAULT 'text',
            created_at TEXT NOT NULL,
            completed_at TEXT
        )
        """)

        # Safe migration for input_mode if table created earlier
        cursor.execute("PRAGMA table_info(interview_sessions)")
        sess_cols = [col[1] for col in cursor.fetchall()]
        if "input_mode" not in sess_cols:
            cursor.execute("ALTER TABLE interview_sessions ADD COLUMN input_mode TEXT NOT NULL DEFAULT 'text'")

        # Interview questions and answers table
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS interview_questions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            session_id TEXT NOT NULL,
            question_index INTEGER NOT NULL,
            question_text TEXT NOT NULL,
            topic TEXT NOT NULL,
            reference_answer TEXT NOT NULL,
            checklist TEXT NOT NULL,
            user_answer TEXT,
            feedback_json TEXT,
            score INTEGER,
            skipped INTEGER NOT NULL DEFAULT 0,
            answered_at TEXT,
            FOREIGN KEY (session_id) REFERENCES interview_sessions (id) ON DELETE CASCADE
        )
        """)

        # Seed default settings if empty
        cursor.execute("SELECT id FROM settings WHERE id = 1")
        if not cursor.fetchone():
            cursor.execute("""
            INSERT INTO settings (id, ai_endpoint, model_name, use_local_ai, stt_endpoint, stt_model, stt_provider_type, updated_at)
            VALUES (1, ?, ?, 0, '', 'whisper-1', 'local_whisper', datetime('now'))
            """, (DEFAULT_AI_ENDPOINT, DEFAULT_MODEL_NAME))

        # Seed default profile if empty
        cursor.execute("SELECT id FROM user_profile WHERE id = 1")
        if not cursor.fetchone():
            cursor.execute("""
            INSERT INTO user_profile (id, name, target_role, experience_level, created_at, updated_at)
            VALUES (1, 'Placement Candidate', 'Frontend Developer', 'Entry Level', datetime('now'), datetime('now'))
            """)
