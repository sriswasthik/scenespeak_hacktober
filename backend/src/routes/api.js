import express from 'express';
import { upload } from '../middleware/upload.js';
import { analyzeScene } from '../services/aiService.js';
import { config } from '../config.js';

const router = express.Router();

/**
 * Health check endpoint
 */
router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    app: 'SceneSpeak API',
    model: config.modelName,
    apiKeyConfigured: Boolean(config.geminiApiKey && config.geminiApiKey.length > 5)
  });
});

/**
 * Curated sample use cases and questions for instant demo
 */
router.get('/samples', (req, res) => {
  res.json({
    useCases: [
      {
        id: 'circuit',
        title: 'Electrical Circuit',
        description: 'Understand schematics, identify components, and learn how circuits work.',
        suggestedQuestions: [
          'What is this circuit, and what does it do?',
          'Explain how this circuit works in simple steps.',
          'What happens if one of the resistors or switches is removed?'
        ]
      },
      {
        id: 'menu',
        title: 'Restaurant Menu',
        description: 'Translate culinary terms, spot dietary preferences, and explain ingredients.',
        suggestedQuestions: [
          'Which dishes are vegetarian or plant-based?',
          'Explain what these dishes are in simple English.',
          'What are the key ingredients and flavors in the main dishes?'
        ]
      },
      {
        id: 'notes',
        title: 'Study Notes & Diagrams',
        description: 'Decode handwritten notes, scientific diagrams, and complex charts.',
        suggestedQuestions: [
          'What is the core concept explained in these notes?',
          'Break down this diagram step-by-step for a beginner.',
          'Give me a 3-question quick quiz based on these notes.'
        ]
      }
    ]
  });
});

/**
 * Main multimodal analysis and conversation endpoint.
 * Supports:
 * 1. multipart/form-data: with an uploaded 'image' file, 'question', and 'history' (JSON string)
 * 2. application/json: with 'imageBase64', 'mimeType', 'question', and 'history' (array)
 */
router.post('/analyze', upload.single('image'), async (req, res, next) => {
  try {
    let imageBase64;
    let mimeType;
    let question;
    let history = [];

    // Case 1: Uploaded via multipart form (File upload or Camera snapshot blob)
    if (req.file) {
      imageBase64 = req.file.buffer.toString('base64');
      mimeType = req.file.mimetype;
      question = req.body.question;
      if (req.body.history) {
        try {
          history = typeof req.body.history === 'string'
            ? JSON.parse(req.body.history)
            : req.body.history;
        } catch {
          history = [];
        }
      }
    }
    // Case 2: Sent as JSON (e.g., follow-up message with cached base64)
    else if (req.body && req.body.imageBase64) {
      imageBase64 = req.body.imageBase64;
      mimeType = req.body.mimeType || 'image/jpeg';
      question = req.body.question;
      history = Array.isArray(req.body.history) ? req.body.history : [];
    }

    if (!imageBase64) {
      const error = new Error('No image was provided in the request.');
      error.code = 'MISSING_IMAGE';
      error.status = 400;
      throw error;
    }

    const result = await analyzeScene({
      imageBase64,
      mimeType,
      question: question || 'What is in this image? Explain it simply.',
      history
    });

    res.json({
      success: true,
      data: {
        answer: result.answer,
        suggestedQuestions: result.suggestedQuestions,
        model: result.model
      }
    });
  } catch (err) {
    next(err);
  }
});

export default router;
