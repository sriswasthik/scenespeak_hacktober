import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import ImageUploader from './components/ImageUploader';
import ChatPanel from './components/ChatPanel';
import ErrorMessage from './components/ErrorMessage';

export default function App() {
  const [image, setImage] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [apiStatus, setApiStatus] = useState({
    online: false,
    apiKeyConfigured: false,
    model: ''
  });

  // Check backend server health on mount
  useEffect(() => {
    checkHealth();
  }, []);

  const checkHealth = async () => {
    try {
      const res = await fetch('/api/health');
      if (res.ok) {
        const data = await res.json();
        setApiStatus({
          online: true,
          apiKeyConfigured: data.apiKeyConfigured,
          model: data.model
        });
      } else {
        setApiStatus({ online: false, apiKeyConfigured: false, model: '' });
      }
    } catch {
      setApiStatus({ online: false, apiKeyConfigured: false, model: '' });
    }
  };

  const handleImageSelected = (newImage) => {
    setImage(newImage);
    setMessages([]);
    setError(null);

    // If preset sample has an initial question, automatically trigger it or prepare it
    if (newImage.suggestedInitialQuestion) {
      setTimeout(() => {
        handleSendMessage(newImage.suggestedInitialQuestion, newImage);
      }, 200);
    }
  };

  const handleClearImage = () => {
    setImage(null);
    setMessages([]);
    setError(null);
  };

  const handleReset = () => {
    handleClearImage();
  };

  const handleSendMessage = async (questionText, currentImg = image) => {
    if (!currentImg) {
      setError({
        message: 'No photo selected',
        suggestion: 'Please upload an image or select a sample scene first.'
      });
      return;
    }

    setError(null);

    // 1. Add user message to conversation list
    const userMessage = { role: 'user', text: questionText };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setIsLoading(true);

    try {
      // 2. Prepare conversation history for multimodal context
      const historyPayload = messages.map((m) => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        text: m.text
      }));

      let response;

      // Send multipart form-data if raw File is available, otherwise send JSON with base64
      if (currentImg.file) {
        const formData = new FormData();
        formData.append('image', currentImg.file);
        formData.append('question', questionText);
        formData.append('history', JSON.stringify(historyPayload));

        response = await fetch('/api/analyze', {
          method: 'POST',
          body: formData
        });
      } else {
        response = await fetch('/api/analyze', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            imageBase64: currentImg.base64,
            mimeType: currentImg.mimeType,
            question: questionText,
            history: historyPayload
          })
        });
      }

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw result.error || new Error('Failed to analyze image with Gemma 4.');
      }

      // 3. Append assistant response
      const assistantMessage = {
        role: 'assistant',
        text: result.data.answer,
        model: result.data.model,
        suggestedQuestions: result.data.suggestedQuestions
      };

      setMessages([...updatedMessages, assistantMessage]);
    } catch (err) {
      console.error('Analysis request error:', err);
      setError({
        code: err.code || 'REQUEST_FAILED',
        message: err.message || 'Unable to analyze the image right now.',
        suggestion:
          err.suggestion ||
          (err.message && err.message.includes('API key')
            ? 'Set GEMINI_API_KEY in backend/.env file and restart backend.'
            : 'Check backend server console or verify network connectivity.')
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0b0f19] text-slate-100">
      {/* Top Navigation */}
      <Header
        apiStatus={apiStatus}
        onReset={handleReset}
        hasImage={Boolean(image)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex flex-col space-y-4">
        {/* Error notification if any */}
        {error && (
          <ErrorMessage error={error} onDismiss={() => setError(null)} />
        )}

        {/* 2-Column Responsive Workspace */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 min-h-[580px]">
          {/* Left Column: Visual Scene & Uploader (5 cols) */}
          <div className="lg:col-span-5 flex flex-col space-y-4">
            <div className="glass-panel rounded-2xl p-4 sm:p-5 border border-slate-800 shadow-xl space-y-4">
              <div>
                <h2 className="text-base font-semibold text-white flex items-center space-x-2">
                  <span>Visual Scene</span>
                  <span className="text-[10px] font-normal uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                    Input
                  </span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Upload an image, snap a photo, or test with prepared demo scenes.
                </p>
              </div>

              <ImageUploader
                image={image}
                onImageSelected={handleImageSelected}
                onClearImage={handleClearImage}
                isLoading={isLoading}
              />
            </div>

            {/* Quick Tips Box
            <div className="hidden lg:block p-4 rounded-2xl bg-slate-900/40 border border-slate-800/80 text-xs text-slate-400 space-y-2">
              <span className="font-semibold text-slate-300 flex items-center space-x-1.5">
                <span>💡 Hackathon Demo Tips</span>
              </span>
              <ul className="list-disc pl-4 space-y-1 text-slate-400">
                <li>Click any <strong>Sample Scene</strong> above for an instant 1-click test.</li>
                <li>Ask follow-up questions to test conversational memory over the same image.</li>
                <li>Click <strong>Listen</strong> on any answer to hear the explanation read aloud.</li>
              </ul>
            </div> */}
          </div>

          {/* Right Column: SceneSpeak Conversation (7 cols) */}
          <div className="lg:col-span-7 flex flex-col min-h-[520px]">
            <ChatPanel
              messages={messages}
              onSendMessage={handleSendMessage}
              isLoading={isLoading}
              hasImage={Boolean(image)}
            />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/60 py-3 px-4 text-center text-xs text-slate-400">
        <p>
          SceneSpeak — Powered by Google Gen AI SDK & Gemma 4 Multimodal Intelligence.
        </p>
      </footer>
    </div>
  );
}
