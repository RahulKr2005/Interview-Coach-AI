from fastapi import APIRouter, HTTPException, UploadFile, File
from typing import Dict, Any
from app.schemas import (
    StartInterviewRequest,
    InterviewSessionDetail,
    SubmitAnswerRequest,
    SubmitAnswerResponse,
    TranscribeAudioResponse
)
from app.services.interview_service import InterviewService
from app.services.stt_service import transcribe_audio_safe

router = APIRouter(prefix="/interview", tags=["Interview"])

@router.post("/start", response_model=InterviewSessionDetail)
def start_interview(payload: StartInterviewRequest):
    try:
        session = InterviewService.create_session(
            target_role=payload.target_role,
            interview_type=payload.interview_type,
            difficulty=payload.difficulty,
            question_count=payload.question_count,
            input_mode=payload.input_mode
        )
        return session
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/transcribe", response_model=TranscribeAudioResponse)
async def transcribe_audio(file: UploadFile = File(...)):
    try:
        file_bytes = await file.read()
        res = await transcribe_audio_safe(
            file_bytes=file_bytes,
            filename=file.filename or "recording.webm",
            mime_type=file.content_type or "audio/webm"
        )
        if not res.get("success") and res.get("status") in ["invalid_format", "file_too_large"]:
            raise HTTPException(status_code=400, detail=res.get("message", "Invalid audio upload"))
        return res
    except HTTPException:
        raise
    except Exception as e:
        return {
            "success": False,
            "transcript": "",
            "status": "error",
            "message": f"Audio processing failed: {str(e)}"
        }

@router.get("/{session_id}", response_model=InterviewSessionDetail)
def get_session(session_id: str):
    session = InterviewService.get_session_detail(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Interview session not found.")
    return session

@router.post("/submit", response_model=SubmitAnswerResponse)
async def submit_answer(payload: SubmitAnswerRequest):
    try:
        result = await InterviewService.submit_answer(
            question_id=payload.question_id,
            user_answer=payload.user_answer
        )
        return result
    except ValueError as ve:
        raise HTTPException(status_code=404, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to evaluate answer: {str(e)}")

@router.post("/question/{question_id}/skip")
def skip_question(question_id: int):
    try:
        result = InterviewService.skip_question(question_id)
        return result
    except ValueError as ve:
        raise HTTPException(status_code=404, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/{session_id}/end", response_model=InterviewSessionDetail)
def end_session(session_id: str):
    session = InterviewService.end_session(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found.")
    return session
