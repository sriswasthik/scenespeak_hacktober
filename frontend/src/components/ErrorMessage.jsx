import React from 'react';
import { AlertCircle, X, ExternalLink } from 'lucide-react';

export default function ErrorMessage({ error, onDismiss }) {
  if (!error) return null;

  return (
    <div className="rounded-xl border border-rose-500/30 bg-rose-950/40 backdrop-blur-md p-4 text-rose-200 text-xs sm:text-sm flex items-start justify-between shadow-lg animate-fadeIn">
      <div className="flex items-start space-x-3">
        <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-semibold text-rose-300">
            {error.message || 'An error occurred while communicating with SceneSpeak.'}
          </p>
          {error.suggestion && (
            <p className="text-rose-300/80 leading-relaxed">{error.suggestion}</p>
          )}
          {error.code === 'MISSING_API_KEY' && (
            <div className="pt-2">
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center space-x-1 text-indigo-400 hover:text-indigo-300 underline font-medium"
              >
                <span>Get a free Gemini API Key at Google AI Studio</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          )}
        </div>
      </div>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="text-rose-400 hover:text-rose-200 p-1 rounded-lg hover:bg-rose-900/40 transition-colors shrink-0"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
