import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from server directory
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export const config = {
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  mongodbUri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/interviewcoach',
  jwtSecret: process.env.JWT_SECRET || 'interviewcoach_ai_secret_jwt_key_2026_dev_mode',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  aiProvider: process.env.AI_PROVIDER || 'practice', // 'practice' | 'ollama' | 'cloud'
  ollamaEndpoint: process.env.OLLAMA_ENDPOINT || 'http://127.0.0.1:11434/v1',
  ollamaModel: process.env.OLLAMA_MODEL || 'llama3:8b',
  cloudApiEndpoint: process.env.CLOUD_API_ENDPOINT || 'https://api.openai.com/v1',
  cloudApiKey: process.env.CLOUD_API_KEY || '',
  cloudModel: process.env.CLOUD_MODEL || 'gpt-4o-mini',
  corsOrigins: (process.env.CORS_ORIGIN || 'http://127.0.0.1:5173,http://localhost:5173,http://127.0.0.1:5500,http://localhost:5500,http://127.0.0.1:5000,http://localhost:5000')
    .split(',')
    .map(origin => origin.trim()),
  uploadDir: path.resolve(__dirname, '../../uploads'),
};
