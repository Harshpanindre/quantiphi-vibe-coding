import React, { useEffect, useRef } from "react";
import { useChat } from "../context/ChatContext";
import MessageBubble from "./MessageBubble";
import MessageInput from "./MessageInput";
import ToneToggle from "./ToneToggle";
import LoadingIndicator from "./LoadingIndicator";
import useMessageSender from "../hooks/useMessageSender";

/**
 * Main chat window containing the message list, input bar, and tone toggle.
 * Handles auto-scrolling and the welcome screen for new conversations.
 */
const ChatWindow = () => {
  const {
    messages,
    isStreaming,
    isLoadingConversation,
    error,
    setError,
    activeConversation,
  } = useChat();

  const { sendMessage, regenerateResponse, cancelStream } = useMessageSender();
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isStreaming]);

  // Determine if the last message is from AI (for showing regen button)
  const lastAIMessageIndex = (() => {
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].role === "assistant") return i;
    }
    return -1;
  })();

  const canRegenerate = !!activeConversation && !isStreaming && lastAIMessageIndex !== -1;

  // Is the AI still streaming (last message is empty assistant)
  const isWaitingForFirstToken =
    isStreaming &&
    messages.length > 0 &&
    messages[messages.length - 1].role === "assistant" &&
    messages[messages.length - 1].content === "";

  return (
    <div className="flex flex-col h-full">
      {/* Messages area */}
      <div
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto px-4 py-6 space-y-6"
      >
        {/* Welcome screen */}
        {messages.length === 0 && !isLoadingConversation && (
          <WelcomeScreen />
        )}

        {/* Conversation loading skeleton */}
        {isLoadingConversation && (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className={`flex gap-3 ${i % 2 === 0 ? "flex-row-reverse" : ""}`}>
                <div className="w-8 h-8 rounded-full bg-surface-600 shimmer flex-shrink-0" />
                <div className={`h-12 rounded-2xl bg-surface-700 shimmer ${i % 2 === 0 ? "w-64 ml-auto" : "w-80"}`} />
              </div>
            ))}
          </div>
        )}

        {/* Message list */}
        {!isLoadingConversation && messages.map((msg, idx) => (
          <MessageBubble
            key={msg._id || idx}
            message={msg}
            isLastAI={idx === lastAIMessageIndex}
            canRegenerate={canRegenerate}
            onRegenerate={regenerateResponse}
          />
        ))}

        {/* Loading dots while waiting for first token */}
        {isWaitingForFirstToken && <LoadingIndicator />}

        {/* Error banner */}
        {error && (
          <div className="flex items-start gap-3 animate-fade-in">
            <div className="flex-1 bg-red-500/10 border border-red-500/30 rounded-2xl px-4 py-3">
              <div className="flex items-center gap-2 mb-1">
                <svg className="w-4 h-4 text-red-400 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                <span className="text-sm font-semibold text-red-300">Error</span>
              </div>
              <p className="text-sm text-red-300/80">{error}</p>
              <button
                onClick={() => setError(null)}
                className="mt-2 text-xs text-red-400 hover:text-red-300 underline transition-colors"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

        {/* Scroll anchor */}
        <div ref={messagesEndRef} />
      </div>

      {/* Bottom bar: Tone Toggle + Input */}
      <div className="flex-shrink-0 px-4 pb-4 pt-2 border-t border-white/5 bg-gradient-to-t from-surface-900 to-transparent">
        <div className="max-w-3xl mx-auto space-y-3">
          {/* Tone selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-600 font-medium">Tone:</span>
            <ToneToggle />
          </div>
          {/* Message input */}
          <MessageInput onSend={sendMessage} onCancel={cancelStream} />
        </div>
      </div>
    </div>
  );
};

// ─── Welcome Screen ───────────────────────────────────────────────────────────

const SUGGESTIONS = [
  { icon: "💡", text: "Explain quantum computing in simple terms" },
  { icon: "📝", text: "Help me write a professional email" },
  { icon: "🧮", text: "Walk me through solving a calculus problem" },
  { icon: "🎨", text: "Give me ideas for a mobile app design" },
];

const WelcomeScreen = () => {
  const { sendMessage } = useMessageSender();

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4 animate-fade-in">
      {/* Logo */}
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-600 to-accent-purple flex items-center justify-center mb-6 shadow-2xl glow-brand">
        <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 2L2 7l10 5 10-5-10-5z" />
          <path d="M2 17l10 5 10-5" />
          <path d="M2 12l10 5 10-5" />
        </svg>
      </div>

      <h1 className="text-3xl font-bold gradient-text mb-2">
        Welcome to NexusAI
      </h1>
      <p className="text-slate-400 text-base mb-8 max-w-md">
        Your intelligent assistant powered by GPT-4. Ask anything — from complex technical questions to creative writing.
      </p>

      {/* Suggestion chips */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-xl">
        {SUGGESTIONS.map((s, i) => (
          <button
            key={i}
            onClick={() => sendMessage(s.text)}
            className="group glass glass-hover rounded-xl px-4 py-3 text-left transition-all duration-200 
                       hover:border-brand-500/30 hover:scale-[1.02] active:scale-[0.98]"
          >
            <span className="text-lg mr-2">{s.icon}</span>
            <span className="text-sm text-slate-300 group-hover:text-slate-100 transition-colors">
              {s.text}
            </span>
          </button>
        ))}
      </div>

      <p className="text-xs text-slate-600 mt-8">
        Select a tone above, then type your message or click a suggestion to begin.
      </p>
    </div>
  );
};

export default ChatWindow;
