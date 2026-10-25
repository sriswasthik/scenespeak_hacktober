import multer from 'multer';

/**
 * Centralized error handler returning structured JSON errors.
 */
export function errorHandler(err, req, res, next) {
  console.error(`[Error] ${err.name || 'Error'}: ${err.message}`);

  // Handle Multer upload errors
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({
        success: false,
        error: {
          code: 'FILE_TOO_LARGE',
          message: 'The uploaded image exceeds the maximum size limit of 10MB.',
          suggestion: 'Please compress the image or choose a photo under 10MB.'
        }
      });
    }
    return res.status(400).json({
      success: false,
      error: {
        code: 'UPLOAD_ERROR',
        message: `File upload error: ${err.message}`
      }
    });
  }

  // Handle custom known application errors
  if (err.code === 'UNSUPPORTED_MEDIA_TYPE') {
    return res.status(415).json({
      success: false,
      error: {
        code: 'UNSUPPORTED_MEDIA_TYPE',
        message: err.message,
        suggestion: 'Accepted formats are JPEG, PNG, WebP, and GIF.'
      }
    });
  }

  if (err.code === 'MISSING_API_KEY') {
    return res.status(401).json({
      success: false,
      error: {
        code: 'MISSING_API_KEY',
        message: 'Google Gemini API key is missing.',
        suggestion: 'Add GEMINI_API_KEY to backend/.env and restart the server. Get your key at https://aistudio.google.com/app/apikey'
      }
    });
  }

  if (err.code === 'MISSING_IMAGE') {
    return res.status(400).json({
      success: false,
      error: {
        code: 'MISSING_IMAGE',
        message: 'No photo was provided to analyze.',
        suggestion: 'Upload an image file or take a snapshot with your camera.'
      }
    });
  }

  // Handle Google GenAI or Upstream Network errors
  const status = err.status || 500;
  return res.status(status).json({
    success: false,
    error: {
      code: err.code || 'SERVER_ERROR',
      message: err.message || 'An unexpected error occurred during image reasoning.',
      suggestion: status === 429 ? 'Rate limit exceeded. Please wait a few seconds and try again.' : undefined
    }
  });
}
