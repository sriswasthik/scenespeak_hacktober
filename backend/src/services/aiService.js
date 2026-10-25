import { GoogleGenAI } from '@google/genai';
import { config } from '../config.js';

// Lazy-initialize client when API key is present
let aiClient = null;

function getAiClient() {
  if (!config.geminiApiKey) {
    const error = new Error(
      'Gemini API key is not configured. Please set GEMINI_API_KEY in backend/.env'
    );
    error.code = 'MISSING_API_KEY';
    error.status = 401;
    throw error;
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({ apiKey: config.geminiApiKey });
  }
  return aiClient;
}

const SYSTEM_INSTRUCTION = `You are SceneSpeak, an expert multimodal AI assistant whose purpose is to help anyone understand what they are seeing ("See anything. Understand everything.").

Guidelines for your answers:
1. EXPLAIN SIMPLY: Explain what you see so a beginner or an 8th-grade student can easily understand it. Avoid technical jargon whenever possible. If a specialized term is necessary (e.g., "potentiometer", "gluten", "photosynthesis"), explain it right away with a simple everyday analogy.
2. IDENTIFY & PURPOSE: Identify key visible objects, components, or subjects, and state what they do and why they are there.
3. READ & INTERPRET TEXT: If text, labels, schematics, nutrition labels, or handwriting are visible, read and interpret their meaning in plain terms (e.g., vegetarian indicators on a menu, circuit symbols, handwritten formulas).
4. STRUCTURE & FORMATTING:
   - Start with a direct, friendly 1-2 sentence overview.
   - Use concise bullet points for key components, steps, or observations.
   - Include a brief "In Plain English" summary or practical takeaway.
   - Use clean Markdown with bold headings and bullet lists.
5. SUGGESTED FOLLOW-UPS:
   At the very end of your response, ALWAYS suggest 2 to 3 helpful, curious follow-up questions related to the image and conversation. Format this section strictly as:
   SUGGESTED_QUESTIONS:
   - [Question 1]
   - [Question 2]
   - [Question 3]`;

/**
 * Parses out suggested follow-up questions from the response text
 */
function parseSuggestedQuestions(rawText) {
  const suggestionsIndex = rawText.indexOf('SUGGESTED_QUESTIONS:');
  if (suggestionsIndex === -1) {
    return {
      answer: rawText.trim(),
      suggestedQuestions: [
        'Can you explain this in simpler terms?',
        'What are the key objects or text visible here?',
        'What should I be careful about with this?'
      ]
    };
  }

  const answer = rawText.substring(0, suggestionsIndex).trim();
  const suggestionsText = rawText.substring(suggestionsIndex + 'SUGGESTED_QUESTIONS:'.length);

  const lines = suggestionsText
    .split('\n')
    .map(line => line.trim().replace(/^[-*•\d.]+\s*/, '').trim())
    .filter(line => line.length > 5 && line.endsWith('?'));

  return {
    answer,
    suggestedQuestions: lines.length > 0 ? lines.slice(0, 3) : [
      'Can you explain this in simpler terms?',
      'What are the most important details here?',
      'How does this work in real life?'
    ]
  };
}

/**
 * Analyzes an image and answers questions, supporting multi-turn conversation.
 *
 * @param {Object} params
 * @param {Buffer|string} params.imageBase64 Base64-encoded image data
 * @param {string} params.mimeType MIME type of the image
 * @param {string} params.question The user question
 * @param {Array} [params.history] Array of previous turns: [{ role: 'user'|'model', text: string }]
 * @returns {Promise<{ answer: string, suggestedQuestions: string[], model: string }>}
 */
export async function analyzeScene({ imageBase64, mimeType, question, history = [] }) {
  const client = getAiClient();

  if (!imageBase64) {
    const error = new Error('No image provided for visual analysis.');
    error.code = 'MISSING_IMAGE';
    error.status = 400;
    throw error;
  }

  if (!question || typeof question !== 'string' || !question.trim()) {
    question = 'What is in this image? Explain it simply.';
  }

  // Construct conversation contents for Gemini / Gemma multimodal API
  const contents = [];

  // Multimodal prompt: Include image in the first user turn
  if (!history || history.length === 0) {
    contents.push({
      role: 'user',
      parts: [
        {
          inlineData: {
            mimeType: mimeType || 'image/jpeg',
            data: imageBase64
          }
        },
        { text: question }
      ]
    });
  } else {
    // Replay prior history so model maintains context of the image and previous questions
    history.forEach((turn, index) => {
      const role = turn.role === 'assistant' ? 'model' : turn.role;
      if (index === 0 && role === 'user') {
        contents.push({
          role: 'user',
          parts: [
            {
              inlineData: {
                mimeType: mimeType || 'image/jpeg',
                data: imageBase64
              }
            },
            { text: turn.text }
          ]
        });
      } else {
        contents.push({
          role,
          parts: [{ text: turn.text }]
        });
      }
    });

    // Append the latest question
    contents.push({
      role: 'user',
      parts: [{ text: question }]
    });
  }

  try {
    const response = await client.models.generateContent({
      model: config.modelName,
      contents,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.4
      }
    });

    const rawText = response.text || '';
    const { answer, suggestedQuestions } = parseSuggestedQuestions(rawText);

    return {
      answer,
      suggestedQuestions,
      model: config.modelName
    };
  } catch (err) {
    console.error('Gemini API Error:', err);

    // Provide friendly error message based on error details
    const error = new Error(
      err.message || 'Failed to analyze the image with Gemma multimodal model.'
    );
    error.code = 'AI_API_ERROR';
    error.status = err.status || 500;
    error.details = err.details || err.message;
    throw error;
  }
}
