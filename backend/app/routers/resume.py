import json
from fastapi import APIRouter, UploadFile, File, HTTPException
from pydantic import BaseModel
from typing import Dict, Any, List
from app.database import get_db
from app.schemas import ResumeResponse, ResumeUpdateSchema
from app.services.pdf_service import (
    extract_text_from_pdf,
    extract_skills_heuristic,
    extract_projects_heuristic,
    extract_experience_heuristic,
    MAX_PDF_SIZE_BYTES
)

router = APIRouter(prefix="/resume", tags=["Resume"])

class PasteResumeRequest(BaseModel):
    text: str

@router.get("", response_model=ResumeResponse)
def get_resume():
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM resume_data WHERE id = 1")
        row = cursor.fetchone()
        if not row:
            return {
                "raw_text": "",
                "edited_text": "",
                "extracted_skills": [],
                "extracted_projects": [],
                "extracted_experience": [],
                "updated_at": ""
            }
        return {
            "raw_text": row["raw_text"],
            "edited_text": row["edited_text"],
            "extracted_skills": json.loads(row["extracted_skills"]),
            "extracted_projects": json.loads(row["extracted_projects"]),
            "extracted_experience": json.loads(row["extracted_experience"]),
            "updated_at": row["updated_at"]
        }

@router.post("/upload")
async def upload_pdf(file: UploadFile = File(...)) -> Dict[str, Any]:
    # Check mime type or extension
    if not (file.content_type == "application/pdf" or file.filename.lower().endswith(".pdf")):
        raise HTTPException(status_code=400, detail="Invalid file type. Only PDF documents are supported.")
    
    file_bytes = await file.read()
    if len(file_bytes) > MAX_PDF_SIZE_BYTES:
        raise HTTPException(
            status_code=400,
            detail=f"File exceeds maximum allowed size of 5MB ({len(file_bytes) / 1024 / 1024:.1f}MB uploaded)."
        )

    text, is_scanned, msg = extract_text_from_pdf(file_bytes)
    
    if not text and not is_scanned:
        raise HTTPException(status_code=400, detail=msg)

    skills = extract_skills_heuristic(text) if text else []
    projects = extract_projects_heuristic(text) if text else []
    experience = extract_experience_heuristic(text) if text else []

    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("""
        INSERT INTO resume_data (id, raw_text, edited_text, extracted_skills, extracted_projects, extracted_experience, updated_at)
        VALUES (1, ?, ?, ?, ?, ?, datetime('now'))
        ON CONFLICT(id) DO UPDATE SET
            raw_text = excluded.raw_text,
            edited_text = excluded.edited_text,
            extracted_skills = excluded.extracted_skills,
            extracted_projects = excluded.extracted_projects,
            extracted_experience = excluded.extracted_experience,
            updated_at = datetime('now')
        """, (
            text,
            text,
            json.dumps(skills),
            json.dumps(projects),
            json.dumps(experience)
        ))

    return {
        "success": True,
        "is_scanned": is_scanned,
        "message": msg,
        "raw_text": text,
        "edited_text": text,
        "extracted_skills": skills,
        "extracted_projects": projects,
        "extracted_experience": experience
    }

@router.post("/paste")
def paste_resume(data: PasteResumeRequest) -> Dict[str, Any]:
    text = data.text.strip()
    if not text:
        raise HTTPException(status_code=400, detail="Pasted text cannot be empty.")

    skills = extract_skills_heuristic(text)
    projects = extract_projects_heuristic(text)
    experience = extract_experience_heuristic(text)

    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("""
        INSERT INTO resume_data (id, raw_text, edited_text, extracted_skills, extracted_projects, extracted_experience, updated_at)
        VALUES (1, ?, ?, ?, ?, ?, datetime('now'))
        ON CONFLICT(id) DO UPDATE SET
            raw_text = excluded.raw_text,
            edited_text = excluded.edited_text,
            extracted_skills = excluded.extracted_skills,
            extracted_projects = excluded.extracted_projects,
            extracted_experience = excluded.extracted_experience,
            updated_at = datetime('now')
        """, (
            text,
            text,
            json.dumps(skills),
            json.dumps(projects),
            json.dumps(experience)
        ))

    return {
        "success": True,
        "is_scanned": False,
        "message": "Resume text saved successfully.",
        "raw_text": text,
        "edited_text": text,
        "extracted_skills": skills,
        "extracted_projects": projects,
        "extracted_experience": experience
    }

@router.put("")
def update_resume(data: ResumeUpdateSchema):
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("""
        UPDATE resume_data
        SET edited_text = ?, extracted_skills = ?, extracted_projects = ?, extracted_experience = ?, updated_at = datetime('now')
        WHERE id = 1
        """, (
            data.edited_text,
            json.dumps(data.extracted_skills),
            json.dumps(data.extracted_projects),
            json.dumps(data.extracted_experience)
        ))
        
        cursor.execute("SELECT * FROM resume_data WHERE id = 1")
        row = cursor.fetchone()
        return {
            "raw_text": row["raw_text"],
            "edited_text": row["edited_text"],
            "extracted_skills": json.loads(row["extracted_skills"]),
            "extracted_projects": json.loads(row["extracted_projects"]),
            "extracted_experience": json.loads(row["extracted_experience"]),
            "updated_at": row["updated_at"]
        }
