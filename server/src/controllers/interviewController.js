import { InterviewSession } from '../models/InterviewSession.js';
import { Resume } from '../models/Resume.js';
import { Settings } from '../models/Settings.js';
import { isMongoConnected } from '../config/db.js';
import { memoryStore } from '../config/memoryStore.js';
import { getQuestionsForSession, generateResumeQuestions } from '../services/questionBank.js';
import { evaluateInterviewAnswer, isGeminiConfigured, getGeminiModel } from '../services/geminiService.js';

function formatSessionResponse(session) {
  return {
    id: String(session._id || session.id),
    target_role: session.target_role,
    interview_type: session.interview_type,
    difficulty: session.difficulty,
    question_count: session.question_count,
    status: session.status,
    mode: session.mode,
    input_mode: session.input_mode || 'text',
    created_at: session.createdAt || session.created_at,
    completed_at: session.completed_at,
    current_question_index: session.current_question_index || 1,
    questions: (session.questions || []).map(q => ({
      id: q._id ? String(q._id) : q.question_index,
      question_index: q.question_index,
      question_text: q.question_text,
      topic: q.topic,
      reference_answer: q.reference_answer,
      checklist: q.checklist || [],
      user_answer: q.user_answer || null,
      feedback: q.feedback || null,
      score: q.score !== undefined ? q.score : null,
      skipped: Boolean(q.skipped),
      answered_at: q.answered_at,
    })),
  };
}

export async function startInterview(req, res, next) {
  try {
    const userId = String(req.user._id || req.user.id);
    const {
      target_role = 'MERN Stack Developer',
      interview_type = 'Technical',
      difficulty = 'Intermediate',
      question_count = 5,
      input_mode = 'text',
    } = req.body;

    const count = parseInt(question_count, 10) || 5;

    // Check user AI settings for mode label
    let settings = null;
    if (isMongoConnected()) {
      settings = await Settings.findOne({ userId: req.user._id });
    } else {
      settings = memoryStore.findSettingsByUserId(userId);
    }

    let mode = 'Basic Practice Mode';
    if (settings && settings.ai_provider === 'ollama') mode = 'Local AI';
    if (settings && settings.ai_provider === 'cloud') mode = 'Cloud AI';

    // Generate questions
    let questions = [];
    if (interview_type === 'Resume-Based') {
      let userResume = null;
      if (isMongoConnected()) {
        userResume = await Resume.findOne({ userId: req.user._id });
      } else {
        userResume = memoryStore.findResumeByUserId(userId);
      }
      const skills = userResume ? userResume.skills : [];
      questions = generateResumeQuestions(skills, target_role, count);
    } else {
      questions = getQuestionsForSession(target_role, interview_type, difficulty, count);
    }

    const sessionPayload = {
      userId,
      target_role,
      interview_type,
      difficulty,
      question_count: count,
      status: 'in_progress',
      mode,
      input_mode,
      current_question_index: 1,
      questions,
    };

    let session = null;
    if (isMongoConnected()) {
      session = await InterviewSession.create(sessionPayload);
    } else {
      session = memoryStore.saveSession(sessionPayload);
    }

    return res.status(200).json(formatSessionResponse(session));
  } catch (err) {
    next(err);
  }
}

export async function getSession(req, res, next) {
  try {
    const userId = String(req.user._id || req.user.id);
    const { sessionId } = req.params;

    let session = null;
    if (isMongoConnected()) {
      session = await InterviewSession.findById(sessionId);
    } else {
      session = memoryStore.findSessionById(sessionId);
    }

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Interview session not found.',
      });
    }

    // Enforce data ownership isolation: User cannot access someone else's session
    if (String(session.userId) !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: You do not have permission to access this interview session.',
      });
    }

    return res.status(200).json(formatSessionResponse(session));
  } catch (err) {
    next(err);
  }
}

export async function submitAnswer(req, res, next) {
  try {
    const userId = String(req.user._id || req.user.id);
    const { question_id, user_answer } = req.body;

    if (!user_answer || user_answer.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an answer before submitting.',
      });
    }

    // Find active session for user
    let session = null;
    if (isMongoConnected()) {
      session = await InterviewSession.findOne({
        userId: req.user._id,
        status: 'in_progress',
      });
    } else {
      const all = memoryStore.findSessionsByUserId(userId);
      session = all.find(s => s.status === 'in_progress');
    }

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'No active in-progress interview session found.',
      });
    }

    // Enforce ownership
    if (String(session.userId) !== userId) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    // Locate question
    const qIndex = session.questions.findIndex(
      q => String(q._id || q.question_index) === String(question_id) || q.question_index === Number(question_id)
    );

    if (qIndex === -1) {
      return res.status(404).json({
        success: false,
        message: `Question with ID ${question_id} not found in this session.`,
      });
    }

    const currentQ = session.questions[qIndex];

    // 1. Always persist the candidate answer immediately to avoid data loss
    currentQ.user_answer = user_answer;
    currentQ.skipped = false;
    currentQ.answered_at = new Date();

    if (isMongoConnected()) {
      await session.save();
    } else {
      memoryStore.saveSession(session);
    }

    // 2. Evaluate answer using Gemini AI (or Demo Mode rubric)
    let feedbackResult = null;
    try {
      feedbackResult = await evaluateInterviewAnswer({
        questionText: currentQ.question_text,
        topic: currentQ.topic,
        referenceAnswer: currentQ.reference_answer,
        checklist: currentQ.checklist,
        userAnswer: user_answer,
        targetRole: session.target_role,
        difficulty: session.difficulty,
      });
      currentQ.feedback = feedbackResult;
      currentQ.score = feedbackResult.score;
    } catch (evalErr) {
      console.warn('[InterviewController] Evaluation error:', evalErr.message);
      feedbackResult = {
        score: 70,
        overall_score: 7.0,
        score_percentage: 70,
        feedback_mode: 'Demo Mode: Placement Practice Rubric',
        is_ai_generated: false,
        strengths: ['Answer recorded and saved successfully.'],
        missing_points: ['Live AI evaluation was temporarily unavailable.'],
        actionable_tips: ['Compare your response against the model answer.'],
        improved_answer: currentQ.reference_answer,
        topics_to_revise: [currentQ.topic],
      };
      currentQ.feedback = feedbackResult;
      currentQ.score = 70;
    }

    // Check if all questions have been answered or skipped
    const allAnswered = session.questions.every(q => q.user_answer || q.skipped);
    if (allAnswered || session.current_question_index >= session.question_count) {
      session.status = 'completed';
      session.completed_at = new Date();
    }

    if (isMongoConnected()) {
      await session.save();
    } else {
      memoryStore.saveSession(session);
    }

    return res.status(200).json({
      success: true,
      session_id: String(session._id || session.id),
      question_id,
      user_answer,
      feedback: feedbackResult,
      score: feedbackResult.score,
      overall_score: feedbackResult.overall_score || Number((feedbackResult.score / 10).toFixed(1)),
      rubric: feedbackResult.rubric || null,
      session_completed: session.status === 'completed',
      is_completed: session.status === 'completed',
      next_question_index: session.current_question_index,
    });
  } catch (err) {
    next(err);
  }
}

export async function evaluateAnswer(req, res, next) {
  try {
    const userId = String(req.user._id || req.user.id);
    const { questionId } = req.params;

    let session = null;
    if (isMongoConnected()) {
      session = await InterviewSession.findOne({
        userId: req.user._id,
        $or: [
          { 'questions._id': questionId },
          { 'questions.question_index': Number(questionId) || 0 }
        ]
      });
    } else {
      const all = memoryStore.findSessionsByUserId(userId);
      session = all.find(s => s.questions.some(q => String(q._id || q.question_index) === String(questionId) || q.question_index === Number(questionId)));
    }

    if (!session) {
      return res.status(404).json({ success: false, message: 'Question or session not found.' });
    }

    if (String(session.userId) !== userId) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    const currentQ = session.questions.find(
      q => String(q._id || q.question_index) === String(questionId) || q.question_index === Number(questionId)
    );

    if (!currentQ || !currentQ.user_answer) {
      return res.status(400).json({ success: false, message: 'No candidate answer has been recorded for this question.' });
    }

    const feedbackResult = await evaluateInterviewAnswer({
      questionText: currentQ.question_text,
      topic: currentQ.topic,
      referenceAnswer: currentQ.reference_answer,
      checklist: currentQ.checklist,
      userAnswer: currentQ.user_answer,
      targetRole: session.target_role,
      difficulty: session.difficulty,
    });

    currentQ.feedback = feedbackResult;
    currentQ.score = feedbackResult.score;

    if (isMongoConnected()) {
      await session.save();
    } else {
      memoryStore.saveSession(session);
    }

    return res.status(200).json({
      success: true,
      feedback: feedbackResult,
      score: feedbackResult.score,
    });
  } catch (err) {
    next(err);
  }
}

export async function skipQuestion(req, res, next) {
  try {
    const userId = String(req.user._id || req.user.id);
    const { questionId } = req.params;

    let session = null;
    if (isMongoConnected()) {
      session = await InterviewSession.findOne({
        userId: req.user._id,
        status: 'in_progress',
      });
    } else {
      const all = memoryStore.findSessionsByUserId(userId);
      session = all.find(s => s.status === 'in_progress');
    }

    if (!session) {
      return res.status(404).json({ success: false, message: 'No active session found.' });
    }

    const qIndex = session.questions.findIndex(
      q => String(q._id || q.question_index) === String(questionId) || q.question_index === Number(questionId)
    );

    if (qIndex !== -1) {
      session.questions[qIndex].skipped = true;
      session.questions[qIndex].score = 0;
      session.questions[qIndex].answered_at = new Date();
    }

    if (session.current_question_index < session.question_count) {
      session.current_question_index += 1;
    } else {
      session.status = 'completed';
      session.completed_at = new Date();
    }

    if (isMongoConnected()) {
      await session.save();
    } else {
      memoryStore.saveSession(session);
    }

    return res.status(200).json({
      success: true,
      is_completed: session.status === 'completed',
      next_question_index: session.current_question_index,
    });
  } catch (err) {
    next(err);
  }
}

export async function endSession(req, res, next) {
  try {
    const userId = String(req.user._id || req.user.id);
    const { sessionId } = req.params;

    let session = null;
    if (isMongoConnected()) {
      session = await InterviewSession.findById(sessionId);
    } else {
      session = memoryStore.findSessionById(sessionId);
    }

    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found.' });
    }

    if (String(session.userId) !== userId) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    session.status = 'completed';
    session.completed_at = new Date();

    if (isMongoConnected()) {
      await session.save();
    } else {
      memoryStore.saveSession(session);
    }

    return res.status(200).json(formatSessionResponse(session));
  } catch (err) {
    next(err);
  }
}

export async function getAllSessions(req, res, next) {
  try {
    const userId = String(req.user._id || req.user.id);

    let sessions = [];
    if (isMongoConnected()) {
      sessions = await InterviewSession.find({ userId: req.user._id }).sort({ createdAt: -1 });
    } else {
      sessions = memoryStore.findSessionsByUserId(userId);
    }

    return res.status(200).json(sessions.map(formatSessionResponse));
  } catch (err) {
    next(err);
  }
}

export async function deleteSession(req, res, next) {
  try {
    const userId = String(req.user._id || req.user.id);
    const { sessionId } = req.params;

    if (isMongoConnected()) {
      const session = await InterviewSession.findById(sessionId);
      if (!session) return res.status(404).json({ success: false, message: 'Session not found' });
      if (String(session.userId) !== userId) return res.status(403).json({ success: false, message: 'Access denied' });
      await InterviewSession.findByIdAndDelete(sessionId);
    } else {
      const deleted = memoryStore.deleteSessionById(sessionId, userId);
      if (!deleted) return res.status(404).json({ success: false, message: 'Session not found or access denied' });
    }

    return res.status(200).json({ success: true, message: 'Session deleted successfully.' });
  } catch (err) {
    next(err);
  }
}

export async function deleteAllData(req, res, next) {
  try {
    const userId = String(req.user._id || req.user.id);

    if (isMongoConnected()) {
      await InterviewSession.deleteMany({ userId: req.user._id });
      await Resume.deleteMany({ userId: req.user._id });
    } else {
      const sessions = memoryStore.findSessionsByUserId(userId);
      for (const s of sessions) {
        memoryStore.deleteSessionById(s.id || s._id, userId);
      }
      memoryStore.deleteResumeByUserId(userId);
    }

    return res.status(200).json({ success: true, message: 'All user data successfully cleared.' });
  } catch (err) {
    next(err);
  }
}
