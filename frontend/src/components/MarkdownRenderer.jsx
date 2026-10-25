import React from 'react';

/**
 * Lightweight, zero-dependency Markdown renderer tailored for AI responses.
 * Supports headings, bold, italic, code blocks, bullet points, and clean paragraphs.
 */
export default function MarkdownRenderer({ content }) {
  if (!content) return null;

  // Split lines
  const lines = content.split('\n');
  const elements = [];
  let currentList = [];
  let inCodeBlock = false;
  let codeBlockLines = [];

  const flushList = () => {
    if (currentList.length > 0) {
      elements.push(
        <ul key={`list-${elements.length}`} className="my-2 space-y-1.5 list-disc pl-5 text-slate-300">
          {currentList.map((item, i) => (
            <li key={i} className="leading-relaxed">
              {formatInline(item)}
            </li>
          ))}
        </ul>
      );
      currentList = [];
    }
  };

  const flushCodeBlock = () => {
    if (codeBlockLines.length > 0) {
      elements.push(
        <pre
          key={`code-${elements.length}`}
          className="my-3 p-3 rounded-lg bg-slate-950/80 border border-slate-800 font-mono text-xs text-emerald-400 overflow-x-auto"
        >
          <code>{codeBlockLines.join('\n')}</code>
        </pre>
      );
      codeBlockLines = [];
    }
  };

  const formatInline = (text) => {
    // Process bold, italic, inline code
    const parts = [];
    // Regex matches **bold**, `code`, *italic*
    const tokenRegex = /(\*\*[^*]+\*\*|`[^`]+`|\*[^*]+\*)/g;
    let lastIdx = 0;
    let match;

    while ((match = tokenRegex.exec(text)) !== null) {
      if (match.index > lastIdx) {
        parts.push(text.substring(lastIdx, match.index));
      }
      const raw = match[0];
      if (raw.startsWith('**') && raw.endsWith('**')) {
        parts.push(
          <strong key={match.index} className="font-semibold text-slate-100">
            {raw.slice(2, -2)}
          </strong>
        );
      } else if (raw.startsWith('`') && raw.endsWith('`')) {
        parts.push(
          <code key={match.index} className="px-1.5 py-0.5 rounded bg-slate-800 text-indigo-300 font-mono text-xs">
            {raw.slice(1, -1)}
          </code>
        );
      } else if (raw.startsWith('*') && raw.endsWith('*')) {
        parts.push(
          <em key={match.index} className="italic text-slate-200">
            {raw.slice(1, -1)}
          </em>
        );
      }
      lastIdx = tokenRegex.lastIndex;
    }

    if (lastIdx < text.length) {
      parts.push(text.substring(lastIdx));
    }

    return parts.length > 0 ? parts : text;
  };

  lines.forEach((line, index) => {
    const trimmed = line.trim();

    // Check code blocks
    if (trimmed.startsWith('```')) {
      if (inCodeBlock) {
        flushCodeBlock();
        inCodeBlock = false;
      } else {
        flushList();
        inCodeBlock = true;
      }
      return;
    }

    if (inCodeBlock) {
      codeBlockLines.push(line);
      return;
    }

    // Bullet points
    if (trimmed.startsWith('- ') || trimmed.startsWith('* ') || trimmed.startsWith('• ')) {
      currentList.push(trimmed.substring(2));
      return;
    }

    // Numbered lists
    const numMatch = trimmed.match(/^(\d+)\.\s+(.*)/);
    if (numMatch) {
      currentList.push(numMatch[2]);
      return;
    }

    // Non-list line encountered
    flushList();

    if (!trimmed) {
      // Empty line spacer
      return;
    }

    // Headings
    if (trimmed.startsWith('### ')) {
      elements.push(
        <h4 key={index} className="mt-4 mb-2 text-base font-semibold text-indigo-300">
          {formatInline(trimmed.substring(4))}
        </h4>
      );
    } else if (trimmed.startsWith('## ')) {
      elements.push(
        <h3 key={index} className="mt-5 mb-2 text-lg font-bold text-slate-100">
          {formatInline(trimmed.substring(3))}
        </h3>
      );
    } else if (trimmed.startsWith('# ')) {
      elements.push(
        <h2 key={index} className="mt-6 mb-3 text-xl font-bold text-white">
          {formatInline(trimmed.substring(2))}
        </h2>
      );
    } else {
      elements.push(
        <p key={index} className="my-2 leading-relaxed text-slate-200">
          {formatInline(trimmed)}
        </p>
      );
    }
  });

  flushList();
  flushCodeBlock();

  return <div className="space-y-1 text-sm md:text-base">{elements}</div>;
}
