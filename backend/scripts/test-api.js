import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runTest() {
  console.log('--- Testing SceneSpeak Backend API ---');

  // 1. Health check
  try {
    const healthRes = await fetch('http://localhost:5000/api/health');
    const healthData = await healthRes.json();
    console.log('✅ Health Check:', healthData);
  } catch (err) {
    console.error('❌ Health check failed. Is the server running? Run `npm run backend` first.');
    return;
  }

  // 2. Test Multimodal Analysis with Sample Image
  const samplePath = path.resolve(__dirname, '../../demo_assets/circuit.jpg');
  if (!fs.existsSync(samplePath)) {
    console.log('⚠️ Sample image not found at', samplePath);
    return;
  }

  const imageBuffer = fs.readFileSync(samplePath);
  const base64Data = imageBuffer.toString('base64');

  console.log('Sending circuit image to /api/analyze...');

  try {
    const analyzeRes = await fetch('http://localhost:5000/api/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        imageBase64: base64Data,
        mimeType: 'image/jpeg',
        question: 'What is in this image? Explain it simply for a beginner.'
      })
    });

    const analyzeData = await analyzeRes.json();
    console.log('Response Status:', analyzeRes.status);
    console.log('Result:', JSON.stringify(analyzeData, null, 2));
  } catch (err) {
    console.error('❌ Analysis failed:', err.message);
  }
}

runTest();
