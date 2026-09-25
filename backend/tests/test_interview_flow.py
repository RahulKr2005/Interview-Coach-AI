import pytest
import asyncio
from app.database import init_db, get_db
from app.services.interview_service import InterviewService

@pytest.fixture(autouse=True)
def setup_db():
    init_db()

@pytest.mark.asyncio
async def test_interview_session_lifecycle():
    # 1. Start a 5-question technical session
    session = InterviewService.create_session(
        target_role="Frontend Developer",
        interview_type="Technical",
        difficulty="Intermediate",
        question_count=5
    )
    assert session is not None
    session_id = session["id"]
    assert session["question_count"] == 5
    assert len(session["questions"]) == 5
    assert session["current_question_index"] == 1
    assert session["status"] == "in_progress"

    # 2. Answer question 1
    q1 = session["questions"][0]
    result1 = await InterviewService.submit_answer(
        question_id=q1["id"],
        user_answer="The Virtual DOM is a lightweight in-memory representation of the real DOM. React uses a diffing algorithm during reconciliation to apply minimal updates."
    )
    assert result1["session_completed"] is False
    assert result1["feedback"]["score"] >= 40
    assert result1["next_question_index"] == 2

    # 3. Verify refresh state recovery: get_session_detail returns current_question_index = 2
    recovered = InterviewService.get_session_detail(session_id)
    assert recovered["current_question_index"] == 2
    assert recovered["questions"][0]["user_answer"] is not None

    # 4. Skip question 2
    q2 = session["questions"][1]
    result2 = InterviewService.skip_question(question_id=q2["id"])
    assert result2["session_completed"] is False
    assert result2["next_question_index"] == 3

    # 5. End session early
    ended = InterviewService.end_session(session_id)
    assert ended["status"] == "completed"
