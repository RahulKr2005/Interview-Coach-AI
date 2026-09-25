import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

import { config } from './config/config.js';
import { connectDB, getDbStatus } from './config/db.js';
import { errorHandler } from './middleware/errorHandler.js';

import authRoutes from './routes/authRoutes.js';
import resumeRoutes from './routes/resumeRoutes.js';
import interviewRoutes from './routes/interviewRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import settingsRoutes from './routes/settingsRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Initialize Database connection asynchronously (non-blocking for resilient boot)
connectDB();

// CORS Configuration - Allows credentials for HttpOnly cookies across local dev servers
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, or server-to-server)
      if (!origin) return callback(null, true);
      // Allow local development origins (localhost, 127.0.0.1 on any port)
      if (/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) {
        return callback(null, true);
      }
      if (config.corsOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(null, true); // Permissive for local development
    },
    credentials: true,
  })
);

// Body parsers & Cookie parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Health & Status Endpoint (safe: never leaks credentials)
app.get('/api/health', (req, res) => {
  const dbStatus = getDbStatus();
  res.status(200).json({
    status: 'healthy',
    service: 'InterviewCoach AI Backend (MERN Stack)',
    version: '2.0.0',
    database: dbStatus,
    ai_provider: config.aiProvider === 'practice' ? 'Basic Practice Mode (Offline)' : config.aiProvider,
    uptime_seconds: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/resume', resumeRoutes);
app.use('/api/interview', interviewRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/settings', settingsRoutes);

// Compatibility Aliases for Frontend Client
app.use('/api/reports', interviewRoutes);
app.use('/api/profile', authRoutes);

// Serve Frontend Production Build if dist exists
const frontendDist = path.resolve(__dirname, '../../frontend/dist');
if (fs.existsSync(frontendDist)) {
  app.use(express.static(frontendDist));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(frontendDist, 'index.html'));
  });
}

// Global Centralized Error Handler
app.use(errorHandler);

// Start HTTP Server
const server = app.listen(config.port, '0.0.0.0', () => {
  console.log(`\n=====================================================================`);
  console.log(`  InterviewCoach AI - MERN Server Active`);
  console.log(`  - Local Endpoint:  http://127.0.0.1:${config.port}`);
  console.log(`  - API Health:      http://127.0.0.1:${config.port}/api/health`);
  console.log(`  - Environment:     ${config.nodeEnv}`);
  console.log(`=====================================================================\n`);
});

export default app;
