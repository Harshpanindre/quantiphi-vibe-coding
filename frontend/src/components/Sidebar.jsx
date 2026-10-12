import React, { useEffect } from "react";
import { useChat } from "../context/ChatContext";

/**
 * Sidebar component showing conversation history.
 * Displays sorted list, active highlight, delete option, and new chat button.
 */
const Sidebar = () => {
  const {
    conversations,
    conversationsLoading,
    activeConversation,
    isStreaming,
    sidebarOpen,
    setSidebarOpen,
    openConversation,
    startNewConversation,
    removeConversation,
    loadConversations,
  } = useChat();

  // Load conversations when sidebar mounts
  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  const handleDelete = (e, id) => {
    e.stopPropagation();
    if (isStreaming) return;
    if (window.confirm("Delete this conversation?")) {
      removeConversation(id);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString([], { month: "short", day: "numeric" });
  };

  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar panel */}
      <aside
        className={`
          fixed lg:relative inset-y-0 left-0 z-40 lg:z-auto
          w-72 flex flex-col h-full
          bg-surface-800/95 border-r border-white/5
          transition-transform duration-300 ease-in-out
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        {/* Header */}
        <div className="flex-shrink-0 p-4 border-b border-white/5">
          {/* Brand */}
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-brand-600 to-accent-purple flex items-center justify-center shadow-lg">
              <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5" />
                <path d="M2 12l10 5 10-5" />
              </svg>
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-100">NexusAI</h2>
              <p className="text-xs text-slate-500">Powered by GPT-4</p>
            </div>
            {/* Mobile close */}
            <button
              onClick={() => setSidebarOpen(false)}
              className="ml-auto lg:hidden btn-ghost p-1.5"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          {/* New Chat button */}
          <button
            id="new-chat-btn"
            onClick={startNewConversation}
            disabled={isStreaming}
            className="w-full btn-primary flex items-center justify-center gap-2 py-2.5 text-sm"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            New Chat
          </button>
        </div>

        {/* Conversation list */}
        <div className="flex-1 overflow-y-auto py-2 px-2">
          {/* Section label */}
          <div className="px-2 py-1.5 mb-1">
            <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
              Recent Conversations
            </span>
          </div>

          {/* Loading skeletons */}
          {conversationsLoading && conversations.length === 0 && (
            <div className="space-y-1 px-1">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-12 rounded-xl bg-surface-700 shimmer" />
              ))}
            </div>
          )}

          {/* Empty state */}
          {!conversationsLoading && conversations.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-center px-4">
              <div className="w-10 h-10 rounded-full bg-surface-700 flex items-center justify-center mb-3">
                <svg className="w-5 h-5 text-slate-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
                </svg>
              </div>
              <p className="text-sm text-slate-500">No conversations yet</p>
              <p className="text-xs text-slate-600 mt-1">Start a new chat to get going</p>
            </div>
          )}

          {/* Conversation items */}
          <div className="space-y-0.5">
            {conversations.map((conv) => {
              const isActive = activeConversation === conv._id;
              return (
                <div
                  key={conv._id}
                  id={`conv-${conv._id}`}
                  onClick={() => openConversation(conv._id)}
                  className={`group sidebar-item ${isActive ? "sidebar-item-active" : ""}`}
                >
                  {/* Chat icon */}
                  <div className={`flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center ${
                    isActive ? "bg-brand-600/30" : "bg-surface-600"
                  }`}>
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
                    </svg>
                  </div>

                  {/* Title + time */}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate text-slate-300 group-hover:text-slate-100 transition-colors">
                      {conv.title || "New Conversation"}
                    </p>
                    <p className="text-xs text-slate-600 mt-0.5 flex items-center gap-1.5">
                      <span className={`inline-block w-1.5 h-1.5 rounded-full ${
                        conv.tone === "Casual" ? "bg-teal-400" :
                        conv.tone === "Concise" ? "bg-purple-400" : "bg-brand-400"
                      }`} />
                      {conv.tone} · {formatDate(conv.updatedAt)}
                    </p>
                  </div>

                  {/* Delete button */}
                  <button
                    id={`delete-conv-${conv._id}`}
                    onClick={(e) => handleDelete(e, conv._id)}
                    title="Delete conversation"
                    className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity
                               text-slate-600 hover:text-red-400 p-1 rounded-lg hover:bg-red-500/10"
                  >
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6l-1 14H6L5 6" />
                      <path d="M10 11v6M14 11v6" />
                      <path d="M9 6V4h6v2" />
                    </svg>
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 p-4 border-t border-white/5">
          <button
            onClick={loadConversations}
            disabled={conversationsLoading}
            className="w-full flex items-center justify-center gap-2 text-xs text-slate-600 
                       hover:text-slate-400 transition-colors py-1"
          >
            <svg className={`w-3 h-3 ${conversationsLoading ? "animate-spin" : ""}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="1 4 1 10 7 10" />
              <path d="M3.51 15a9 9 0 102.13-9.36L1 10" />
            </svg>
            {conversationsLoading ? "Refreshing..." : "Refresh"}
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
