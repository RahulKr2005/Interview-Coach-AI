from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

class UserProfileSchema(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    target_role: str = Field(..., min_length=2, max_length=100)
    experience_level: str = Field(..., min_length=2, max_length=50)

class UserProfileResponse(UserProfileSchema):
    created_at: str
    updated_at: str

class ResumeUpdateSchema(BaseModel):
    edited_text: str
    extracted_skills: List[str] = []
    extracted_projects: List[str] = []
    extracted_experience: List[str] = []

class ResumeResponse(BaseModel):
    raw_text: str
    edited_text: str
    extracted_skills: List[str]
    extracted_projects: List[str]
    extracted_experience: List[str]
    updated_at: str

class SettingsSchema(BaseModel):
    ai_endpoint: str = Field(..., description="Local OpenAI-compatible base URL")
    model_name: str = Field(..., description="Local model name")
    use_local_ai: bool = Field(False, description="Enable local AI inference if available")
    stt_endpoint: str = Field("", description="Local Whisper-compatible STT endpoint")
    stt_model: str = Field("whisper-1", description="Local Whisper model name")
    stt_provider_type: str = Field("local_whisper", description="STT provider type")

class SettingsResponse(SettingsSchema):
    updated_at: str
    connection_status: Optional[str] = None
    stt_status: Optional[str] = None

class ConnectionTestRequest(BaseModel):
    ai_endpoint: str
    model_name: str

class ConnectionTestResponse(BaseModel):
    connected: bool
    status_code: Optional[int] = None
    message: str
    latency_ms: Optional[float] = None
    available_models: List[str] = []

class TranscriptionStatusResponse(BaseModel):
    ready: bool
    provider: str
    endpoint: str
    model: str
    status: str
    message: str
    setup_instructions: Optional[str] = None

class TranscribeAudioResponse(BaseModel):
    success: bool
    transcript: str
    status: str
    message: str
    latency_ms: Optional[float] = None
    setup_instructions: Optional[str] = None

class StartInterviewRequest(BaseModel):
    target_role: str
    interview_type: str = Field(..., pattern="^(Technical|HR|Resume-Based)$")
    difficulty: str = Field("Intermediate", pattern="^(Beginner|Intermediate|Advanced)$")
    question_count: int = Field(5, ge=5, le=15)
    input_mode: str = Field("text", pattern="^(text|voice)$")

class InterviewQuestionResponse(BaseModel):
    id: int
    question_index: int
    question_text: str
    topic: str
    reference_answer: Optional[str] = None
    checklist: List[str] = []
    user_answer: Optional[str] = None
    feedback: Optional[Dict[str, Any]] = None
    score: Optional[int] = None
    skipped: bool = False
    answered_at: Optional[str] = None

class InterviewSessionDetail(BaseModel):
    id: str
    target_role: str
    interview_type: str
    difficulty: str
    question_count: int
    status: str
    mode: str
    input_mode: str = "text"
    created_at: str
    completed_at: Optional[str] = None
    current_question_index: int
    questions: List[InterviewQuestionResponse] = []

class SubmitAnswerRequest(BaseModel):
    question_id: int
    user_answer: str

class FeedbackDetail(BaseModel):
    strengths: List[str] = Field(..., description="What the candidate answered well")
    missing_points: List[str] = Field(..., description="Key technical or communication aspects missed")
    actionable_tips: List[str] = Field(..., description="Direct ways to improve")
    improved_answer: str = Field(..., description="Exemplary model answer incorporating feedback")
    score: int = Field(..., ge=0, le=100, description="Coaching practice score (not hiring prediction)")
    feedback_mode: str = Field(..., description="'Local AI' or 'Basic Practice Mode'")
    checklist_results: Optional[List[Dict[str, Any]]] = None

class SubmitAnswerResponse(BaseModel):
    question_id: int
    feedback: FeedbackDetail
    session_completed: bool
    next_question_index: Optional[int] = None

class DashboardSummaryResponse(BaseModel):
    total_sessions: int
    completed_sessions: int
    total_questions_attempted: int
    average_score: Optional[float] = None
    practice_streak_days: int = 1
    target_role: str
    active_mode: str
    topics_needing_practice: List[Dict[str, Any]] = []
    recent_sessions: List[Dict[str, Any]] = []
    score_trend: List[Dict[str, Any]] = []
