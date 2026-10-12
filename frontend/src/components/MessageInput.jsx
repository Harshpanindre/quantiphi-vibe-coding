import React, { useState, useRef, useEffect, useCallback } from "react";
import { useChat } from "../context/ChatContext";

/**
 * Message input field with textarea auto-resize, character count,
 * keyboard shortcut (Enter to send), and send/stop buttons.
 *
 * @param {Object} props
 * @param {Function} props.onSend - Called with message text
 * @param {Function} props.onCancel - Called to stop streaming
 */
const MessageInput = ({ onSend, onCancel }) => {
  const [value, setValue] = useState("");
  const textareaRef = useRef(null);
  const { isStreaming } = useChat();

  // Auto-resize textarea as user types
  const autoResize = useCallback(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = `${Math.min(ta.scrollHeight, 200)}px`;
  }, []);

  useEffect(() => {
    autoResize();
  }, [value, autoResize]);

  // Focus on mount
  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  const handleSend = () => {
    const text = value.trim();
    if (!text || isStreaming) return;
    onSend(text);
    setValue("");
    // Reset height
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleKeyDown = (e) => {
    // Send on Enter (without Shift)
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const charCount = value.length;
  const maxChars = 4000;
  const isOverLimit = charCount > maxChars;
  const canSend = value.trim().length > 0 && !isStreaming && !isOverLimit;

  return (
    <div className="relative">
      {/* Input container */}
      <div className={`glass rounded-2xl border transition-all duration-200 ${
        isOverLimit
          ? "border-red-500/50 ring-1 ring-red-500/20"
          : "border-white/10 focus-within:border-brand-500/50 focus-within:ring-1 focus-within:ring-brand-500/20"
      }`}>
        <div className="flex items-end gap-2 p-3">
          {/* Textarea */}
          <textarea
            ref={textareaRef}
            id="message-input"
            value={value}
            onChange={(e) => {
              setValue(e.target.value);
            }}
            onKeyDown={handleKeyDown}
            placeholder={isStreaming ? "NexusAI is responding..." : "Message NexusAI... (Enter to send, Shift+Enter for new line)"}
            disabled={isStreaming}
            rows={1}
            className="flex-1 resize-none bg-transparent text-slate-100 placeholder-slate-500 
                       text-sm leading-relaxed outline-none max-h-[200px] overflow-y-auto 
                       disabled:opacity-60 scrollbar-none py-1"
            style={{ minHeight: "24px" }}
          />

          {/* Action buttons */}
          <div className="flex items-center gap-2 flex-shrink-0 pb-0.5">
            {/* Character count (shown when approaching limit) */}
            {charCount > maxChars * 0.8 && (
              <span className={`text-xs font-medium ${isOverLimit ? "text-red-400" : "text-slate-500"}`}>
                {charCount}/{maxChars}
              </span>
            )}

            {/* Stop or Send button */}
            {isStreaming ? (
              <button
                id="stop-btn"
                onClick={onCancel}
                title="Stop generating"
                className="w-9 h-9 rounded-xl bg-red-500/20 border border-red-500/30 text-red-400 
                           hover:bg-red-500/30 hover:text-red-300 flex items-center justify-center 
                           transition-all duration-150 active:scale-95"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <rect x="6" y="6" width="12" height="12" rx="1" />
                </svg>
              </button>
            ) : (
              <button
                id="send-btn"
                onClick={handleSend}
                disabled={!canSend}
                title="Send message (Enter)"
                className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-150 
                            active:scale-95 ${
                              canSend
                                ? "bg-gradient-to-br from-brand-600 to-accent-purple text-white hover:opacity-90 shadow-lg shadow-brand-900/50"
                                : "bg-surface-600 text-slate-600 cursor-not-allowed"
                            }`}
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="22" y1="2" x2="11" y2="13" />
                  <polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Helper text */}
      <div className="flex justify-between items-center mt-1.5 px-1">
        <p className="text-xs text-slate-600">
          <kbd className="text-slate-600 font-mono bg-white/5 px-1 rounded">Enter</kbd> to send ·{" "}
          <kbd className="text-slate-600 font-mono bg-white/5 px-1 rounded">Shift+Enter</kbd> for new line
        </p>
        {isOverLimit && (
          <p className="text-xs text-red-400">Message too long</p>
        )}
      </div>
    </div>
  );
};

export default MessageInput;
