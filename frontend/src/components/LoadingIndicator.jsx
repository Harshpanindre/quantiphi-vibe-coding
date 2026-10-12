import React from "react";

/**
 * Animated loading indicator showing three pulsing dots.
 * Displayed while waiting for the AI to start responding.
 */
const LoadingIndicator = ({ label = "NexusAI is thinking..." }) => {
  return (
    <div className="flex items-start gap-3 animate-fade-in">
      {/* AI Avatar */}
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-brand-600 to-accent-purple flex items-center justify-center shadow-lg">
        <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 2L2 7l10 5 10-5-10-5z" />
          <path d="M2 17l10 5 10-5" />
          <path d="M2 12l10 5 10-5" />
        </svg>
      </div>

      {/* Typing bubble */}
      <div className="glass rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-1.5">
        <span className="typing-dot" />
        <span className="typing-dot" />
        <span className="typing-dot" />
        <span className="text-xs text-slate-500 ml-2 font-medium">{label}</span>
      </div>
    </div>
  );
};

export default LoadingIndicator;
