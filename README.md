SceneSpeak ​
"See anything. Understand everything."
SceneSpeak lets anyone upload an image or capture a live photo and have an interactive conversation with it, turning complex visual information into simple, understandable answers using Gemma 4 multimodal intelligence.
 Project Overview (For Judges & Mentors)
Goal in One Sentence:SceneSpeak lets anyone upload an image and have a conversation with it, turning visual information into understandable answers using Gemma 4's multimodal intelligence.
Target Audience: Students, curious learners, technicians, cooks, and anyone encountering unfamiliar visual information.
Multimodal Engine: Google Gen AI SDK (@google/genai) connecting to Gemma 4 multimodal models via the official Google AI Studio Gemini API endpoint.
Architecture: Zero-persistence, privacy-friendly, stateless architecture (no database, no credentials leaked to client).
 Project Structure
SceneSpeak/
├── backend/
│   ├── src/
│   │   ├── config.js              # Environment settings & model configuration
│   │   ├── server.js              # Express app setup, CORS, and request logging
│   │   ├── routes/
│   │   │   └── api.js             # /api/health, /api/samples, /api/analyze endpoints
│   │   ├── middleware/
│   │   │   ├── upload.js          # Multer memory storage & MIME/size validation
│   │   │   └── errorHandler.js    # Friendly error responses (413, 415, 401, 500)
│   │   └── services/
│   │       └── aiService.js       # @google/genai SDK integration & prompt reasoning
│   ├── scripts/
│   │   └── test-api.js            # Automated backend testing script
│   ├── .env.example               # Template for environment variables
│   ├── .env                       # Local secrets (API key, server port)
│   └── package.json               # Backend dependencies
│
├── frontend/
│   ├── public/
│   │   └── samples/               # Prepared demo assets (circuit, menu, notes)
│   ├── src/
│   │   ├── components/
│   │   │   ├── Header.jsx         # App navigation, health indicator & info modal
│   │   │   ├── ImageUploader.jsx  # Drag-and-drop, live camera capture & sample picker
│   │   │   ├── ChatPanel.jsx      # Conversation stream, TTS, and follow-up chips
│   │   │   ├── MarkdownRenderer.jsx # Zero-dependency custom markdown parser
│   │   │   └── ErrorMessage.jsx   # Contextual error alerts with fix links
│   │   ├── App.jsx                # Main application state orchestration
│   │   ├── index.css              # Modern glassmorphism & typography
│   │   └── main.jsx               # React entry point
│   ├── index.html                 # App metadata and Google Fonts (Inter + Outfit)
│   ├── vite.config.js             # Vite configuration with Tailwind CSS v4 & proxy
│   └── package.json               # Frontend dependencies
│
├── demo_assets/                   # High-res sample photos for live demonstrations
│   ├── circuit.jpg                # Electronics breadboard with MCU & LED
│   ├── menu.jpg                   # Trattoria menu with prices & dietary icons
│   └── notes.jpg                  # Handwritten biology notes & chloroplast diagram
│
├── package.json                   # Root workspace scripts
└── README.md                      # Complete guide, prompt design & demo script
​
 Quick Start Guide
Prerequisites
Node.js: v18.0.0 or higher (v20+ recommended)
Google Gemini API Key: Free key from Google AI Studio
1. Clone & Configure Backend
# Navigate to backend directory
cd backend

# Install backend dependencies
npm install

# Create .env from template
cp .env.example .env
​
Open backend/.env and insert your Gemini API Key:
PORT=5000
GEMINI_API_KEY=your_actual_api_key_here
GEMMA_MODEL=gemini-2.5-flash
MAX_FILE_SIZE_MB=10
​
2. Configure & Start Frontend
# From workspace root, navigate to frontend
cd ../frontend

# Install frontend dependencies
npm install

# Start Vite development server
npm run dev
​
3. Start Backend Server
In a separate terminal:
cd backend
npm run dev
​
Frontend Application: http://localhost:3000
Backend API: http://localhost:5000/api/health
 Multimodal Prompt Design
SceneSpeak uses a structured system instruction combined with conversation history and image payloads.
System Prompt
You are SceneSpeak, an expert multimodal AI assistant whose purpose is to help anyone
understand what they are seeing ("See anything. Understand everything.").

Guidelines for your answers:
1. EXPLAIN SIMPLY: Explain what you see so a beginner or an 8th-grade student can easily
   understand it. Avoid technical jargon whenever possible. If a specialized term is
   necessary (e.g., "potentiometer", "gluten", "photosynthesis"), explain it right away
   with a simple everyday analogy.
2. IDENTIFY & PURPOSE: Identify key visible objects, components, or subjects, and state
   what they do and why they are there.
3. READ & INTERPRET TEXT: If text, labels, schematics, nutrition labels, or handwriting
   are visible, read and interpret their meaning in plain terms.
4. STRUCTURE & FORMATTING:
   - Start with a direct, friendly 1-2 sentence overview.
   - Use concise bullet points for key components, steps, or observations.
   - Include a brief "In Plain English" summary or practical takeaway.
   - Use clean Markdown with bold headings and bullet lists.
5. SUGGESTED FOLLOW-UPS:
   At the very end of your response, ALWAYS suggest 2 to 3 helpful, curious follow-up
   questions related to the image and conversation. Format this section strictly as:
   SUGGESTED_QUESTIONS:
   - [Question 1]
   - [Question 2]
   - [Question 3]
​
Multimodal Multi-Turn Context Flow
To keep conversation state lightweight and stateless:
Turn 1 (Initial Ask):
The image inline buffer (image/jpeg, base64) is passed along with the user's first question inside the initial user turn:
{
  "role": "user",
  "parts": [
    { "inlineData": { "mimeType": "image/jpeg", "data": "<BASE64>" } },
    { "text": "What is in this image?" }
  ]
}
​
Turn 2+ (Follow-up Chat):
The client sends the prior turns in history. The server prepends the image to the first user turn and appends subsequent model and user text turns, allowing Gemma 4 to answer questions like "What happens if this component is removed?" while maintaining the visual context of the original photo.
 Error Handling
Scenario
HTTP Status
Response Code
User Experience
Upload exceeds 10MB
413 Payload Too Large
FILE_TOO_LARGE
Clean banner asking to compress or pick a smaller photo
Unsupported file (e.g., PDF)
415 Unsupported Media Type
UNSUPPORTED_MEDIA_TYPE
Informs user that only JPEG, PNG, WebP, GIF are supported
Missing GEMINI_API_KEY
401 Unauthorized
MISSING_API_KEY
Yellow header badge + direct link to Google AI Studio
Camera denied / unavailable
Client-side catch
CAMERA_ERROR
Friendly modal alert offering file upload alternative
Gemini API rate limit
429 Too Many Requests
AI_API_ERROR
Instructs user to wait a few seconds before retrying
 3-Minute Hackathon Demo Script
SceneSpeak comes with three prepared demo images in demo_assets/ and built-in 1-click presets in the UI:
Scene 1: Electrical Circuit (Breadboard with Microcontroller & LED)
Click  Electrical Circuit in the preset bar.
The circuit photo loads automatically with the question:"What is this circuit, and how does it work?"
Observation: Gemma 4 identifies the ATmega microcontroller chip, green LED, current-limiting resistors, and capacitors. It explains how electricity flows from the power rails through the chip to light the LED.
Follow-up Test: Click the suggested chip:"What happens if one of the resistors is removed?"
Gemma explains that removing the resistor breaks the circuit loop or can burn out the LED with excess current.
Click Listen to demonstrate audio text-to-speech.
Scene 2: Restaurant Menu (Trattoria Luna)
Click  Restaurant Menu in the preset bar.
Ask: "Which dishes are vegetarian, and what do they contain?"
Observation: Gemma reads the Italian names and leaf icons, listing the Bruschetta Mista, Burrata Caprese, Ravioli di Spinaci, and Gnocchi al Pomodoro, defining ingredients like burrata, pesto, and sage butter in simple English.
Follow-up Test: Ask:"I have a nut allergy. Is there any dish I should avoid?"
Gemma identifies the Ravioli di Spinaci (contains toasted walnuts) and warns the user.
Scene 3: Handwritten Biology Notes (Photosynthesis & Chloroplasts)
Click  Study Notes & Diagram in the preset bar.
Ask: "Explain this diagram and summarize the main concepts."
Observation: Gemma decodes the student's handwriting, reads the chemical equation (
6
𝐶
𝑂
2
+
6
𝐻
2
𝑂
→
𝐶
6
𝐻
12
𝑂
6
+
6
𝑂
2
6CO 
2
​
 +6H 
2
​
 O→C 
6
​
 H 
12
​
 O 
6
​
 +6O 
2
​
 ), explains the role of thylakoids and chlorophyll, and breaks down the Calvin cycle into simple steps.
Follow-up Test: Ask:"Give me a 3-question quick quiz based on these notes."
Gemma generates a beginner-friendly quiz to test the user's understanding.
 License
MIT License. Created for the Multimodal AI Hackathon.
