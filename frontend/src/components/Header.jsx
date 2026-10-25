import React, { useState } from 'react';
import { Sparkles, Eye, Info, RefreshCw, CheckCircle2, AlertTriangle, XCircle, X } from 'lucide-react';

export default function Header({ apiStatus, onReset, hasImage }) {
  const [showInfo, setShowInfo] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo & Tagline */}
          <div className="flex items-center space-x-3">
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 shadow-lg shadow-indigo-500/20">
              <Eye className="w-5 h-5 text-white" />
              <Sparkles className="w-3.5 h-3.5 text-amber-300 absolute -top-1 -right-1 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xl font-bold bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
                  SceneSpeak
                </span>
                {/* <span className="hidden sm:inline-flex text-[11px] font-medium tracking-wide uppercase px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  Multimodal AI
                </span> */}
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                See anything. Understand everything.
              </p>
            </div>
          </div>

          {/* Right Status & Actions */}
          <div className="flex items-center space-x-3">
            {/* Backend Health Badge */}
            <div
              className="flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-medium border bg-slate-900/60"
              title={
                apiStatus.online
                  ? apiStatus.apiKeyConfigured
                    ? `Connected to ${apiStatus.model}`
                    : 'Backend running, but GEMINI_API_KEY is not set'
                  : 'Backend server unreachable at http://localhost:5000'
              }
            >
              {apiStatus.online ? (
                apiStatus.apiKeyConfigured ? (
                  <>
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-emerald-400 hidden md:inline">Gemma 4 Ready</span>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                    <span className="text-amber-400 hidden md:inline">Key Missing</span>
                  </>
                )
              ) : (
                <>
                  <XCircle className="w-3.5 h-3.5 text-rose-400" />
                  <span className="text-rose-400 hidden md:inline">Offline</span>
                </>
              )}
            </div>

            {/* Reset Button (active when an image or conversation is loaded) */}
            {hasImage && (
              <button
                onClick={onReset}
                className="flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 bg-slate-800/80 hover:bg-slate-700 hover:text-white border border-slate-700/60 transition-colors"
                title="Start a new scene"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">New Scene</span>
              </button>
            )}

            {/* Info / About Button */}
            <button
              onClick={() => setShowInfo(true)}
              className="p-2 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800/60 transition-colors"
              aria-label="About SceneSpeak"
            >
              <Info className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Info Modal */}
      {showInfo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-lg rounded-2xl glass-panel p-6 shadow-2xl border border-slate-700/70">
            <button
              onClick={() => setShowInfo(false)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-indigo-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">About SceneSpeak</h3>
                <p className="text-xs text-indigo-400">See anything. Understand everything.</p>
              </div>
            </div>

            <p className="text-sm text-slate-300 leading-relaxed mb-4">
              SceneSpeak lets anyone upload an image or capture a live photo and have an interactive
              conversation with it. Powered by Gemma 4 / Gemini multimodal AI, it converts complex
              visual information into simple, plain English answers.
            </p>

            <div className="space-y-2 mb-6">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Core Capabilities</h4>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800">
                  <span className="font-semibold text-slate-200">🔍 Explain Simply</span>
                  <p className="text-slate-400 mt-0.5">Translates technical jargon with analogies.</p>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800">
                  <span className="font-semibold text-slate-200">🏷️ Identify Objects</span>
                  <p className="text-slate-400 mt-0.5">Names components and describes their purpose.</p>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800">
                  <span className="font-semibold text-slate-200">📝 Read & Interpret</span>
                  <p className="text-slate-400 mt-0.5">Transcribes and interprets notes & menus.</p>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800">
                  <span className="font-semibold text-slate-200">💬 Multi-turn Chat</span>
                  <p className="text-slate-400 mt-0.5">Remembers conversation context seamlessly.</p>
                </div>
              </div>
            </div>

            <div className="text-xs text-slate-400 border-t border-slate-800 pt-3 flex justify-between items-center">
              <span>Model: <code className="text-indigo-300">{apiStatus.model || 'Gemma 4 / Gemini'}</code></span>
              <button
                onClick={() => setShowInfo(false)}
                className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs transition-colors"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
