import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import useClipboard from "../hooks/useClipboard";

/**
 * Renders a single chat message bubble for either user or AI.
 *
 * @param {Object} props
 * @param {{ role: string, content: string, timestamp: string, isStreaming: boolean }} props.message
 * @param {Function} props.onRegenerate - Called when user clicks "Regenerate"
 * @param {boolean} props.isLastAI - Whether this is the last AI message (shows action buttons)
 * @param {boolean} props.canRegenerate - Whether regeneration is possible
 */
const MessageBubble = ({ message, onRegenerate, isLastAI = false, canRegenerate = false }) => {
  const { role, content, timestamp, isStreaming } = message;
  const isUser = role === "user";
  const { copied, copyToClipboard } = useClipboard();
  const [showActions, setShowActions] = useState(false);

  const formattedTime = timestamp
    ? new Date(timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : "";

  return (
    <div
      className={`flex items-start gap-3 group ${isUser ? "flex-row-reverse" : "flex-row"} animate-slide-up`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {/* Avatar */}
      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shadow-lg ${
        isUser
          ? "bg-gradient-to-br from-slate-600 to-slate-500 text-slate-200"
          : "bg-gradient-to-br from-brand-600 to-accent-purple text-white"
      }`}>
        {isUser ? (
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/>
          </svg>
        ) : (
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 2L2 7l10 5 10-5-10-5z" />
            <path d="M2 17l10 5 10-5" />
            <path d="M2 12l10 5 10-5" />
          </svg>
        )}
      </div>

      {/* Bubble */}
      <div className={`flex flex-col max-w-[80%] ${isUser ? "items-end" : "items-start"}`}>
        {/* Sender label */}
        <span className="text-xs text-slate-500 mb-1 px-1 font-medium">
          {isUser ? "You" : "NexusAI"}{formattedTime ? ` · ${formattedTime}` : ""}
        </span>

        {/* Message content */}
        <div className={`relative rounded-2xl px-4 py-3 ${
          isUser
            ? "message-bubble-user"
            : "message-bubble-ai"
        }`}>
          {isUser ? (
            <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">{content}</p>
          ) : (
            <div className="text-sm markdown-content">
              {content ? (
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
              ) : isStreaming ? null : (
                <span className="text-slate-500 italic">Empty response</span>
              )}
              {/* Cursor blink while streaming */}
              {isStreaming && (
                <span className="inline-block w-0.5 h-4 bg-brand-400 ml-0.5 animate-pulse align-middle" />
              )}
            </div>
          )}
        </div>

        {/* Action buttons (AI only) */}
        {!isUser && !isStreaming && content && (
          <div className={`flex items-center gap-1 mt-1.5 px-1 transition-all duration-200 ${
            showActions || isLastAI ? "opacity-100" : "opacity-0"
          }`}>
            {/* Copy button */}
            <button
              id={`copy-btn-${message._id || "msg"}`}
              onClick={() => copyToClipboard(content)}
              title="Copy to clipboard"
              className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-300 
                         bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 
                         rounded-lg px-2.5 py-1.5 transition-all duration-150"
            >
              {copied ? (
                <>
                  <svg className="w-3.5 h-3.5 text-green-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span className="text-green-400">Copied!</span>
                </>
              ) : (
                <>
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                    <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
                  </svg>
                  <span>Copy</span>
                </>
              )}
            </button>

            {/* Regenerate button (only on last AI message) */}
            {isLastAI && canRegenerate && (
              <button
                id="regenerate-btn"
                onClick={onRegenerate}
                title="Regenerate response"
                className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-300 
                           bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 
                           rounded-lg px-2.5 py-1.5 transition-all duration-150"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="1 4 1 10 7 10" />
                  <path d="M3.51 15a9 9 0 102.13-9.36L1 10" />
                </svg>
                <span>Regenerate</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageBubble;
