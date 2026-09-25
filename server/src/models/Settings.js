import mongoose from 'mongoose';

const settingsSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    ai_provider: {
      type: String,
      default: 'practice',
      enum: ['practice', 'ollama', 'cloud'],
    },
    ollama_endpoint: {
      type: String,
      default: 'http://127.0.0.1:11434/v1',
    },
    ollama_model: {
      type: String,
      default: 'llama3:8b',
    },
    cloud_provider: {
      type: String,
      default: 'openai',
    },
    cloud_api_key: {
      type: String,
      default: '',
    },
    cloud_model: {
      type: String,
      default: 'gpt-4o-mini',
    },
    timeout_seconds: {
      type: Number,
      default: 20.0,
    },
  },
  {
    timestamps: true,
  }
);

export const Settings = mongoose.model('Settings', settingsSchema);
