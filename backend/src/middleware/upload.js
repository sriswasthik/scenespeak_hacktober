import multer from 'multer';
import { config } from '../config.js';

// Memory storage keeps uploaded images in memory buffer (efficient & stateless)
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (config.allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    const error = new Error(
      `Unsupported file type: ${file.mimetype}. Please upload a JPEG, PNG, WebP, or GIF image.`
    );
    error.code = 'UNSUPPORTED_MEDIA_TYPE';
    error.status = 415;
    cb(error, false);
  }
};

export const upload = multer({
  storage,
  limits: {
    fileSize: config.maxFileSizeBytes,
    files: 1
  },
  fileFilter
});
