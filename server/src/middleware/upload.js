import multer from 'multer';
import { MAX_PDF_SIZE_BYTES } from '../services/pdfService.js';

const storage = multer.memoryStorage();

function fileFilter(req, file, cb) {
  if (file.mimetype === 'application/pdf' || file.originalname.toLowerCase().endsWith('.pdf')) {
    cb(null, true);
  } else {
    cb(new Error('Only PDF resume documents (.pdf) are supported.'), false);
  }
}

export const uploadPdf = multer({
  storage,
  limits: {
    fileSize: MAX_PDF_SIZE_BYTES, // 5MB
  },
  fileFilter,
});
