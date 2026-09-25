import express from 'express';
import { uploadResumePdf, pasteResumeText, getResume, updateResume, deleteResume, getResumeSuggestions } from '../controllers/resumeController.js';
import { protect } from '../middleware/auth.js';
import { uploadPdf } from '../middleware/upload.js';
import { aiLimiter } from '../middleware/rateLimit.js';

const router = express.Router();

router.use(protect); // All resume routes are protected

router.get('/', getResume);
router.put('/', updateResume);
router.post('/upload', uploadPdf.single('file'), uploadResumePdf);
router.post('/paste', pasteResumeText);
router.post('/suggestions', aiLimiter, getResumeSuggestions);
router.delete('/', deleteResume);

export default router;
