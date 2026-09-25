import pytest
from app.question_bank import QUESTION_BANK, get_questions_for_session

EXPECTED_ROLES = [
    "Frontend Developer",
    "Backend Developer",
    "Full Stack Developer",
    "Java Developer",
    "Data Analyst",
    "DevOps Engineer"
]

def test_roles_have_at_least_10_questions():
    for role in EXPECTED_ROLES:
        questions = QUESTION_BANK.get(role, [])
        assert len(questions) >= 10, f"Role '{role}' has only {len(questions)} questions; expected at least 10."
        for q in questions:
            assert q.get("question"), "Question text cannot be empty."
            assert q.get("topic"), "Topic cannot be empty."
            assert q.get("reference_answer"), "Reference answer cannot be empty."
            assert len(q.get("checklist", [])) >= 2, "Checklist should have at least 2 key criteria."

def test_hr_bank_has_at_least_10_questions():
    hr_questions = QUESTION_BANK.get("HR", [])
    assert len(hr_questions) >= 10, f"HR bank has only {len(hr_questions)} questions; expected at least 10."
    for q in hr_questions:
        assert q.get("question"), "Question text cannot be empty."
        assert q.get("reference_answer"), "Reference answer cannot be empty."
        assert len(q.get("checklist", [])) >= 2, "Checklist should have at least 2 items."

def test_session_question_selection_no_duplicates():
    selected = get_questions_for_session("Frontend Developer", "Technical", "Intermediate", 10)
    assert len(selected) == 10
    ids = [q["id"] for q in selected]
    assert len(ids) == len(set(ids)), "Selected questions must not contain duplicates."
