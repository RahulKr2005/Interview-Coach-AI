import express from 'express';
import {
  startInterview,
  getSession,
  submitAnswer,
  evaluateAnswer,
  skipQuestion,
  endSession,
  getAllSessions,
  deleteSession,
  deleteAllData,
} from '../controllers/interviewController.js';
import { protect } from '../middleware/auth.js';
import { aiLimiter } from '../middleware/rateLimit.js';

const router = express.Router();

router.use(protect); // All interview routes require auth

router.post('/start', startInterview);
router.post('/submit', aiLimiter, submitAnswer);
router.post('/question/:questionId/evaluate', aiLimiter, evaluateAnswer);
router.post('/question/:questionId/skip', skipQuestion);
router.post('/:sessionId/end', endSession);
router.get('/sessions', getAllSessions);
router.get('/:sessionId', getSession);
router.delete('/session/:sessionId', deleteSession);
router.delete('/all-data', deleteAllData);

export default router;
