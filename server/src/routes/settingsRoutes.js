import express from 'express';
import { getSettings, updateSettings, testConnection } from '../controllers/settingsController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.get('/', getSettings);
router.put('/', updateSettings);
router.post('/test-connection', testConnection);
router.get('/transcription-status', (req, res) => {
  res.status(200).json({
    browser_speech_recognition: true,
    speech_synthesis: true,
    backend_stt: 'Browser Web Speech API (Lightweight & zero RAM model overhead)',
  });
});

export default router;
