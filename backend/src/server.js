import express from 'express';
import cors from 'cors';
import { config } from './config.js';
import apiRouter from './routes/api.js';
import { errorHandler } from './middleware/errorHandler.js';

const app = express();

// Middleware
app.use(cors({
  origin: '*', // Allow frontend development server
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Allow up to 15MB for JSON payloads (useful for follow-up questions with base64 cached images)
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// Request logger for debugging during hackathons
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} -> ${res.statusCode} (${duration}ms)`);
  });
  next();
});

// API Routes
app.use('/api', apiRouter);

// Root informational endpoint
app.get('/', (req, res) => {
  res.json({
    app: 'SceneSpeak API Server',
    tagline: 'See anything. Understand everything.',
    status: 'online',
    version: '1.0.0',
    documentation: 'Send POST /api/analyze with an image file and question.'
  });
});

// 404 Route Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: `The endpoint ${req.method} ${req.url} does not exist.`
    }
  });
});

// Global Error Handler
app.use(errorHandler);

// Start server
const server = app.listen(config.port, () => {
  console.log('==================================================');
  console.log(`  SceneSpeak Backend Server is running!`);
  console.log(`  Port: http://localhost:${config.port}`);
  console.log(`  Model: ${config.modelName}`);
  console.log(`  API Key: ${config.geminiApiKey ? 'Configured (Active)' : 'Missing (Set in .env)'}`);
  console.log('==================================================');
});

export default app;
