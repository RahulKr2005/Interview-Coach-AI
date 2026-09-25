import { Settings } from '../models/Settings.js';
import { isMongoConnected } from '../config/db.js';
import { memoryStore } from '../config/memoryStore.js';
import { LocalAIProvider, CloudAIProvider } from '../services/aiService.js';
import { isGeminiConfigured, getGeminiModel } from '../services/geminiService.js';

export async function getSettings(req, res, next) {
  try {
    const userId = String(req.user._id || req.user.id);
    let settings = null;

    if (isMongoConnected()) {
      settings = await Settings.findOne({ userId: req.user._id });
    } else {
      settings = memoryStore.findSettingsByUserId(userId);
    }

    const geminiActive = isGeminiConfigured();
    const currentModel = getGeminiModel();

    if (!settings) {
      return res.status(200).json({
        ai_provider: geminiActive ? 'gemini' : 'practice',
        use_local_ai: false,
        gemini_configured: geminiActive,
        gemini_model: currentModel,
        mode: geminiActive ? `Google Gemini (${currentModel})` : 'Demo Mode: Placement Practice Rubric',
        ollama_endpoint: 'http://127.0.0.1:11434/v1',
        ollama_model: 'llama3:8b',
        cloud_provider: 'gemini',
        cloud_model: currentModel,
        has_cloud_key: geminiActive,
        timeout_seconds: 20.0,
      });
    }

    return res.status(200).json({
      ai_provider: settings.ai_provider || (geminiActive ? 'gemini' : 'practice'),
      use_local_ai: settings.ai_provider === 'ollama',
      gemini_configured: geminiActive,
      gemini_model: currentModel,
      mode: geminiActive ? `Google Gemini (${currentModel})` : 'Demo Mode: Placement Practice Rubric',
      ollama_endpoint: settings.ollama_endpoint || 'http://127.0.0.1:11434/v1',
      ollama_model: settings.ollama_model || 'llama3:8b',
      cloud_provider: settings.cloud_provider || 'gemini',
      cloud_model: settings.cloud_model || currentModel,
      has_cloud_key: geminiActive || Boolean(settings.cloud_api_key),
      timeout_seconds: settings.timeout_seconds || 20.0,
    });
  } catch (err) {
    next(err);
  }
}

export async function updateSettings(req, res, next) {
  try {
    const userId = String(req.user._id || req.user.id);
    const {
      ai_provider,
      ollama_endpoint,
      ollama_model,
      cloud_provider,
      cloud_api_key,
      cloud_model,
      timeout_seconds,
    } = req.body;

    const updatePayload = {};
    if (ai_provider !== undefined) updatePayload.ai_provider = ai_provider;
    if (ollama_endpoint !== undefined) updatePayload.ollama_endpoint = ollama_endpoint;
    if (ollama_model !== undefined) updatePayload.ollama_model = ollama_model;
    if (cloud_provider !== undefined) updatePayload.cloud_provider = cloud_provider;
    if (cloud_api_key !== undefined) updatePayload.cloud_api_key = cloud_api_key;
    if (cloud_model !== undefined) updatePayload.cloud_model = cloud_model;
    if (timeout_seconds !== undefined) updatePayload.timeout_seconds = timeout_seconds;

    let settings = null;
    if (isMongoConnected()) {
      settings = await Settings.findOneAndUpdate(
        { userId: req.user._id },
        updatePayload,
        { upsert: true, new: true }
      );
    } else {
      settings = memoryStore.saveSettings(userId, updatePayload);
    }

    return res.status(200).json({
      success: true,
      message: 'Settings updated successfully.',
      settings: {
        ai_provider: settings.ai_provider,
        use_local_ai: settings.ai_provider === 'ollama',
        ollama_endpoint: settings.ollama_endpoint,
        ollama_model: settings.ollama_model,
        cloud_provider: settings.cloud_provider,
        cloud_model: settings.cloud_model,
        has_cloud_key: Boolean(settings.cloud_api_key),
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function testConnection(req, res, next) {
  try {
    const { provider = 'ollama', endpoint, model, api_key } = req.body;

    if (provider === 'ollama') {
      const tester = new LocalAIProvider(endpoint || 'http://127.0.0.1:11434/v1', model || 'llama3:8b');
      const result = await tester.testConnection();
      return res.status(200).json(result);
    }

    if (provider === 'gemini') {
      const active = isGeminiConfigured();
      return res.status(200).json({
        connected: active,
        status: active ? 'ready' : 'demo_mode',
        message: active
          ? `Connected to Google Gemini (${getGeminiModel()}). Live AI evaluation active.`
          : 'GEMINI_API_KEY is not configured in server/.env. Running in Demo Mode with deterministic placement practice rubrics.',
      });
    }

    if (provider === 'cloud') {
      const tester = new CloudAIProvider(endpoint, api_key, model);
      const result = await tester.testConnection();
      return res.status(200).json(result);
    }

    return res.status(200).json({
      connected: true,
      status: 'ready',
      message: 'Basic Practice Mode (Offline) is active and ready.',
    });
  } catch (err) {
    next(err);
  }
}
