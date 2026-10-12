import React from "react";
import { useChat } from "../context/ChatContext";

/**
 * Top header bar with hamburger menu (mobile), branding, and conversation title.
 */
const Header = () => {
  const {
    activeConversation,
    conversations,
    isStreaming,
    sidebarOpen,
    setSidebarOpen,
    startNewConversation,
    tone,
  } = useChat();

  // Find the active conversation title
  const activeConvTitle = activeConversation
    ? conversations.find((c) => c._id === activeConversation)?.title || "Conversation"
    : null;

  return (
    <header className="flex-shrink-0 flex items-center justify-between h-14 px-4 border-b border-white/5 glass">
      {/* Left: hamburger (mobile) + title */}
      <div className="flex items-center gap-3">
        {/* Mobile menu toggle */}
        <button
          id="sidebar-toggle-btn"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="lg:hidden btn-ghost p-2 -ml-1"
          aria-label="Toggle sidebar"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>

        {/* Logo (visible only on mobile when sidebar is hidden) */}
        <div className="flex items-center gap-2 lg:hidden">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-brand-600 to-accent-purple flex items-center justify-center">
            <svg className="w-3.5 h-3.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5" />
              <path d="M2 12l10 5 10-5" />
            </svg>
          </div>
        </div>

        {/* Current conversation title */}
        <div className="hidden lg:flex items-center gap-2">
          {activeConvTitle ? (
            <>
              <svg className="w-4 h-4 text-slate-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
              </svg>
              <span className="text-sm font-medium text-slate-300 max-w-[300px] truncate">
                {activeConvTitle}
              </span>
            </>
          ) : (
            <span className="text-sm text-slate-500">New Conversation</span>
          )}
        </div>
      </div>

      {/* Right: status indicators */}
      <div className="flex items-center gap-3">
        {/* Streaming indicator */}
        {isStreaming && (
          <div className="flex items-center gap-1.5 text-xs text-brand-400 animate-fade-in">
            <div className="w-1.5 h-1.5 rounded-full bg-brand-400 animate-pulse" />
            <span className="hidden sm:block font-medium">Generating...</span>
          </div>
        )}

        {/* Tone badge */}
        <div className={`hidden sm:flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border ${
          tone === "Casual"
            ? "bg-teal-500/10 border-teal-500/30 text-teal-400"
            : tone === "Concise"
            ? "bg-purple-500/10 border-purple-500/30 text-purple-400"
            : "bg-brand-500/10 border-brand-500/30 text-brand-400"
        }`}>
          {tone === "Professional" && "💼"}
          {tone === "Casual" && "😊"}
          {tone === "Concise" && "⚡"}
          <span>{tone}</span>
        </div>

        {/* New chat (desktop quick action) */}
        <button
          id="header-new-chat-btn"
          onClick={startNewConversation}
          disabled={isStreaming}
          title="New conversation"
          className="btn-ghost p-2 hidden lg:flex items-center gap-1.5 text-xs text-slate-500"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          <span>New</span>
        </button>
      </div>
    </header>
  );
};

export default Header;
