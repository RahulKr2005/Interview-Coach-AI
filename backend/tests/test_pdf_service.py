import pytest
import io
from pypdf import PdfWriter
from app.services.pdf_service import (
    extract_text_from_pdf,
    extract_skills_heuristic,
    extract_projects_heuristic,
    extract_experience_heuristic,
    MAX_PDF_SIZE_BYTES
)

def create_in_memory_pdf(text: str) -> bytes:
    # Use pypdf to generate a valid PDF in memory
    writer = PdfWriter()
    writer.add_blank_page(width=72, height=72)
    # Note: blank page has no text, which helps test scanned/empty handling
    buf = io.BytesIO()
    writer.write(buf)
    return buf.getvalue()

def test_extract_skills_heuristic():
    sample_text = """
    Software Engineer with strong background in React, TypeScript, Python, and FastAPI.
    Experienced in building responsive web applications using Tailwind CSS and Vite.
    Database management with PostgreSQL and Redis.
    Deployed applications using Docker and Kubernetes on Linux.
    """
    skills = extract_skills_heuristic(sample_text)
    assert "React" in skills
    assert "TypeScript" in skills
    assert "Python" in skills
    assert "FastAPI" in skills
    assert "Tailwind CSS" in skills
    assert "Docker" in skills
    assert "Kubernetes" in skills
    # Ensure no random words got hallucinated
    assert "Java" not in skills

def test_empty_or_scanned_pdf_detection():
    pdf_bytes = create_in_memory_pdf("")
    text, is_scanned, msg = extract_text_from_pdf(pdf_bytes)
    assert is_scanned is True
    assert "scanned image or contains no selectable text" in msg

def test_oversized_pdf_rejection():
    # Simulate oversized bytes
    oversized_bytes = b"0" * (MAX_PDF_SIZE_BYTES + 1024)
    text, is_scanned, msg = extract_text_from_pdf(oversized_bytes)
    assert text == ""
    assert "exceeds maximum allowed size" in msg
