import React from "react";
import { useChat } from "../context/ChatContext";

const TONES = [
  {
    id: "Professional",
    icon: "💼",
    label: "Professional",
    description: "Formal and thorough",
    activeClass: "bg-brand-600/20 border-brand-500/50 text-brand-300",
    hoverClass: "hover:border-brand-500/30 hover:text-brand-400",
  },
  {
    id: "Casual",
    icon: "😊",
    label: "Casual",
    description: "Friendly and relaxed",
    activeClass: "bg-accent-teal/10 border-accent-teal/50 text-teal-300",
    hoverClass: "hover:border-teal-500/30 hover:text-teal-400",
  },
  {
    id: "Concise",
    icon: "⚡",
    label: "Concise",
    description: "Short and direct",
    activeClass: "bg-accent-purple/10 border-accent-purple/50 text-purple-300",
    hoverClass: "hover:border-purple-500/30 hover:text-purple-400",
  },
];

/**
 * Tone toggle component allowing users to select the AI's response style.
 * Renders as a compact pill row.
 */
const ToneToggle = () => {
  const { tone, setTone, isStreaming } = useChat();

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {TONES.map((t) => {
        const isActive = tone === t.id;
        return (
          <button
            key={t.id}
            id={`tone-${t.id.toLowerCase()}`}
            onClick={() => !isStreaming && setTone(t.id)}
            disabled={isStreaming}
            title={t.description}
            className={`
              tone-badge flex items-center gap-1.5 text-slate-400 border-white/10
              ${isActive ? t.activeClass : t.hoverClass}
              ${isStreaming ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
              transition-all duration-200
            `}
          >
            <span className="text-sm">{t.icon}</span>
            <span>{t.label}</span>
          </button>
        );
      })}
    </div>
  );
};

export default ToneToggle;
