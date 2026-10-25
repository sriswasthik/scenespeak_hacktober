import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Volume2,
  VolumeX,
  Copy,
  Check,
  Sparkles,
  Bot,
  User,
  ArrowRight,
  HelpCircle,
  Search,
  Tag,
  FileText
} from 'lucide-react';
import MarkdownRenderer from './MarkdownRenderer';

const STARTER_PROMPTS = [
  { label: 'Explain simply', icon: Search, question: 'Explain what is happening in this image in simple terms.' },
  { label: 'Identify objects', icon: Tag, question: 'Identify the key objects or parts visible and explain their purpose.' },
  { label: 'Read & explain text', icon: FileText, question: 'Read all visible text in this photo and explain what it means.' },
  { label: 'How does it work?', icon: HelpCircle, question: 'How does this work, and what should a beginner know about it?' }
];

export default function ChatPanel({
  messages,
  onSendMessage,
  isLoading,
  hasImage,
  suggestedQuestions = []
}) {
  const [input, setInput] = useState('');
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [speakingIndex, setSpeakingIndex] = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Clean up speech synthesis when component unmounts
  useEffect(() => {
    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading || !hasImage) return;
    const q = input.trim();
    setInput('');
    onSendMessage(q);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const copyToClipboard = (text, index) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const toggleSpeak = (text, index) => {
    if (!window.speechSynthesis) return;

    if (speakingIndex === index) {
      window.speechSynthesis.cancel();
      setSpeakingIndex(null);
      return;
    }

    window.speechSynthesis.cancel();
    // Strip markdown formatting for cleaner speech
    const cleanText = text
      .replace(/[*#`_~]/g, '')
      .replace(/\[(.*?)\]\(.*?\)/g, '$1')
      .replace(/SUGGESTED_QUESTIONS:[\s\S]*/, '')
      .trim();

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.onend = () => setSpeakingIndex(null);
    utterance.onerror = () => setSpeakingIndex(null);

    setSpeakingIndex(index);
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="flex flex-col h-full rounded-2xl glass-panel border border-slate-800 shadow-xl overflow-hidden">
      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
        {/* Welcome Empty State */}
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center p-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-3 shadow-sm">
              <Bot className="w-6 h-6" />
            </div>

            <h3 className="text-base font-semibold text-white mb-1">
              {hasImage ? 'Visual scene loaded! Ask anything.' : 'Upload an image to start'}
            </h3>
            <p className="text-xs text-slate-400 max-w-sm mb-6">
              {hasImage
                ? 'Choose a quick starter prompt or type your own question below.'
                : 'SceneSpeak uses multimodal Gemma 4 intelligence to answer questions about any photograph in plain English.'}
            </p>

            {/* Quick Starters */}
            {hasImage && (
              <div className="w-full max-w-md space-y-2">
                <span className="text-[11px] font-medium uppercase tracking-wider text-slate-400 block mb-1">
                  Suggested starters
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-left">
                  {STARTER_PROMPTS.map((prompt, idx) => {
                    const Icon = prompt.icon;
                    return (
                      <button
                        key={idx}
                        onClick={() => onSendMessage(prompt.question)}
                        disabled={isLoading}
                        className="flex items-center space-x-2.5 p-3 rounded-xl bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800 hover:border-indigo-500/40 text-xs text-slate-200 transition-all group"
                      >
                        <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 group-hover:bg-indigo-500/20">
                          <Icon className="w-4 h-4" />
                        </div>
                        <span className="font-medium truncate">{prompt.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Message Stream */}
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex flex-col ${
              msg.role === 'user' ? 'items-end' : 'items-start'
            }`}
          >
            {/* Sender header */}
            <div className="flex items-center space-x-2 mb-1.5 px-1 text-xs text-slate-400">
              {msg.role === 'user' ? (
                <>
                  <span>You</span>
                  <div className="w-5 h-5 rounded-full bg-slate-700 flex items-center justify-center text-slate-200">
                    <User className="w-3 h-3" />
                  </div>
                </>
              ) : (
                <>
                  <div className="w-5 h-5 rounded-full bg-indigo-600 flex items-center justify-center text-white">
                    <Sparkles className="w-3 h-3" />
                  </div>
                  <span className="font-medium text-indigo-400">SceneSpeak</span>
                  {msg.model && (
                    <span className="text-[10px] text-slate-400 px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700">
                      {msg.model}
                    </span>
                  )}
                </>
              )}
            </div>

            {/* Message Bubble */}
            <div
              className={`relative max-w-[92%] sm:max-w-[85%] rounded-2xl p-4 sm:p-5 text-sm shadow-md ${
                msg.role === 'user'
                  ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-tr-xs'
                  : 'bg-slate-900/90 border border-slate-800 text-slate-100 rounded-tl-xs glass-card'
              }`}
            >
              {msg.role === 'user' ? (
                <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p>
              ) : (
                <div className="space-y-3">
                  <MarkdownRenderer content={msg.text} />

                  {/* Actions toolbar */}
                  <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-800/80 text-xs text-slate-400">
                    <div className="flex items-center space-x-2">
                      {/* Text to Speech Button */}
                      <button
                        onClick={() => toggleSpeak(msg.text, idx)}
                        className={`flex items-center space-x-1 px-2 py-1 rounded-md transition-colors ${
                          speakingIndex === idx
                            ? 'bg-indigo-500/20 text-indigo-300'
                            : 'hover:bg-slate-800 hover:text-slate-200'
                        }`}
                        title={speakingIndex === idx ? 'Stop speaking' : 'Read aloud'}
                      >
                        {speakingIndex === idx ? (
                          <>
                            <VolumeX className="w-3.5 h-3.5" />
                            <span>Stop</span>
                          </>
                        ) : (
                          <>
                            <Volume2 className="w-3.5 h-3.5" />
                            <span>Listen</span>
                          </>
                        )}
                      </button>

                      {/* Copy Button */}
                      <button
                        onClick={() => copyToClipboard(msg.text, idx)}
                        className="flex items-center space-x-1 px-2 py-1 rounded-md hover:bg-slate-800 hover:text-slate-200 transition-colors"
                        title="Copy answer"
                      >
                        {copiedIndex === idx ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            <span className="text-emerald-400">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    </div>

                    <span className="text-[10px] text-slate-400">Multimodal Reasoner</span>
                  </div>

                  {/* Dynamic Follow-up Suggestions Chips */}
                  {msg.suggestedQuestions && msg.suggestedQuestions.length > 0 && (
                    <div className="pt-2 mt-2 space-y-1.5">
                      <span className="text-[11px] font-medium text-indigo-400/90 block">
                        Suggested follow-ups:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {msg.suggestedQuestions.map((q, qIdx) => (
                          <button
                            key={qIdx}
                            onClick={() => onSendMessage(q)}
                            disabled={isLoading}
                            className="text-left text-xs px-2.5 py-1 rounded-lg bg-indigo-950/40 hover:bg-indigo-900/60 text-indigo-200 border border-indigo-800/40 transition-colors flex items-center space-x-1 group"
                          >
                            <span>{q}</span>
                            <ArrowRight className="w-3 h-3 text-indigo-400 group-hover:translate-x-0.5 transition-transform" />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Loading State Skeleton */}
        {isLoading && (
          <div className="flex flex-col items-start space-y-2">
            <div className="flex items-center space-x-2 px-1 text-xs text-indigo-400">
              <Sparkles className="w-3.5 h-3.5 animate-spin" />
              <span>Gemma 4 is inspecting the scene...</span>
            </div>
            <div className="max-w-[85%] rounded-2xl rounded-tl-xs p-4 bg-slate-900/90 border border-slate-800 space-y-2.5 w-72 sm:w-96 animate-pulse">
              <div className="h-3.5 bg-slate-800 rounded w-3/4" />
              <div className="h-3 bg-slate-800/80 rounded w-full" />
              <div className="h-3 bg-slate-800/60 rounded w-5/6" />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-3 sm:p-4 border-t border-slate-800/80 bg-slate-950/60 backdrop-blur-md">
        <form onSubmit={handleSubmit} className="relative flex items-center">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              hasImage
                ? 'Ask a question or follow-up about the photo...'
                : 'Please upload an image first to start asking...'
            }
            disabled={!hasImage || isLoading}
            className="w-full pl-4 pr-12 py-3 rounded-xl bg-slate-900/80 border border-slate-700/80 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-hidden text-sm text-white placeholder-slate-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          />

          <button
            type="submit"
            disabled={!hasImage || !input.trim() || isLoading}
            className="absolute right-2 p-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 text-white disabled:text-slate-500 transition-all disabled:opacity-40"
            title="Send question"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
