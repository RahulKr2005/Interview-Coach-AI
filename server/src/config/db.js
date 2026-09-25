import mongoose from 'mongoose';
import { config } from './config.js';

export const dbState = {
  connected: false,
  mode: 'disconnected',
  message: 'Connecting...',
};

export async function connectDB() {
  try {
    const conn = await mongoose.connect(config.mongodbUri, {
      serverSelectionTimeoutMS: 3000,
    });
    dbState.connected = true;
    dbState.mode = 'mongodb';
    dbState.message = `Connected to MongoDB at ${conn.connection.host}:${conn.connection.port}/${conn.connection.name}`;
    console.log(`[MongoDB] ${dbState.message}`);
    return true;
  } catch (err) {
    dbState.connected = false;
    dbState.mode = 'in-memory-fallback';
    dbState.message = 'Local MongoDB service is not currently active. Resilient in-memory fallback enabled.';
    
    console.warn('\n=====================================================================');
    console.warn('[InterviewCoach AI - Database Status Notice]');
    console.warn(`Could not connect to MongoDB at: ${config.mongodbUri.replace(/\/\/.*@/, '//<credentials>@')}`);
    console.warn('Reason: ' + err.message);
    console.warn('\nHow to start persistent MongoDB:');
    console.warn('  Option 1 (Local): Ensure MongoDB Community Server is running:');
    console.warn('           Windows: "net start MongoDB" or run "mongod" in command prompt');
    console.warn('  Option 2 (Atlas): Set MONGODB_URI in server/.env with your connection string:');
    console.warn('           e.g. MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/interviewcoach');
    console.warn('\n[*] Resilient In-Memory Fallback ACTIVATED:');
    console.warn('    Registration, login, resume analysis, and mock interviews will work');
    console.warn('    seamlessly in memory during this session without crashing.');
    console.warn('=====================================================================\n');
    return false;
  }
}

export function isMongoConnected() {
  return dbState.connected && mongoose.connection.readyState === 1;
}

export function getDbStatus() {
  return {
    connected: isMongoConnected(),
    mode: isMongoConnected() ? 'MongoDB (Mongoose)' : 'In-Memory Fallback',
    info: isMongoConnected() ? 'Connected and persistent' : 'Resilient local mode active. Start mongod or configure Atlas for persistence.'
  };
}
