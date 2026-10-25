import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: process.env.PORT || 5000,
  geminiApiKey: process.env.GEMINI_API_KEY || '',
  // Supported Gemma / Gemini multimodal model in Google AI Studio
  // Can be configured to 'gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash',
  // or Gemma multimodal checkpoints (e.g., 'gemma-3-27b-it')
  modelName: process.env.GEMMA_MODEL || process.env.GEMINI_MODEL || 'gemini-3.8-flash',
  maxFileSizeBytes: (parseInt(process.env.MAX_FILE_SIZE_MB, 10) || 10) * 1024 * 1024,
  allowedMimeTypes: [
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
    'image/bmp'
  ]
};
