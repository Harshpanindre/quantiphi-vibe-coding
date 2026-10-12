import React, { createContext, useContext, useState, useCallback } from "react";
import { fetchConversations, fetchConversationById, deleteConversation } from "../services/conversationService";

const ChatContext = createContext(null);

/**
 * ChatProvider manages all global chat state including:
 * - Active conversation and messages
 * - Conversation list (sidebar)
 * - Tone selection
 * - Loading/streaming/error states
 */
export const ChatProvider = ({ children }) => {
  // Currently active conversation
  const [activeConversation, setActiveConversation] = useState(null);
  // Messages in the active conversation
  const [messages, setMessages] = useState([]);
  // List of all conversation summaries for the sidebar
  const [conversations, setConversations] = useState([]);
  // Whether the sidebar list is loading
  const [conversationsLoading, setConversationsLoading] = useState(false);
  // Whether an AI response is currently streaming
  const [isStreaming, setIsStreaming] = useState(false);
  // Whether a full conversation is being loaded
  const [isLoadingConversation, setIsLoadingConversation] = useState(false);
  // Current tone selection
  const [tone, setTone] = useState("Professional");
  // Global error message
  const [error, setError] = useState(null);
  // Whether the sidebar is open on mobile
  const [sidebarOpen, setSidebarOpen] = useState(false);

  /** Load all conversations for the sidebar */
  const loadConversations = useCallback(async () => {
    setConversationsLoading(true);
    try {
      const data = await fetchConversations();
      setConversations(data);
    } catch (err) {
      console.error("Failed to load conversations:", err);
    } finally {
      setConversationsLoading(false);
    }
  }, []);

  /** Open and display an existing conversation */
  const openConversation = useCallback(async (id) => {
    if (activeConversation === id) return;
    setIsLoadingConversation(true);
    setError(null);
    try {
      const conv = await fetchConversationById(id);
      setActiveConversation(conv._id);
      setMessages(conv.messages);
      setTone(conv.tone || "Professional");
      setSidebarOpen(false);
    } catch (err) {
      setError("Failed to load conversation. Please try again.");
    } finally {
      setIsLoadingConversation(false);
    }
  }, [activeConversation]);

  /** Start a fresh new conversation */
  const startNewConversation = useCallback(() => {
    setActiveConversation(null);
    setMessages([]);
    setError(null);
    setSidebarOpen(false);
  }, []);

  /** Append a new message to local state */
  const appendMessage = useCallback((message) => {
    setMessages((prev) => [...prev, message]);
  }, []);

  /** Update the last message (used for streaming tokens) */
  const updateLastMessage = useCallback((content) => {
    setMessages((prev) => {
      const updated = [...prev];
      if (updated.length > 0) {
        updated[updated.length - 1] = {
          ...updated[updated.length - 1],
          content,
        };
      }
      return updated;
    });
  }, []);

  /** Replace the last assistant message with new content (for regeneration) */
  const replaceLastAssistantMessage = useCallback((content) => {
    setMessages((prev) => {
      const updated = [...prev];
      // Find last assistant message index
      for (let i = updated.length - 1; i >= 0; i--) {
        if (updated[i].role === "assistant") {
          updated[i] = { ...updated[i], content };
          break;
        }
      }
      return updated;
    });
  }, []);

  /** Remove last assistant message (before regeneration) */
  const removeLastAssistantMessage = useCallback(() => {
    setMessages((prev) => {
      const updated = [...prev];
      for (let i = updated.length - 1; i >= 0; i--) {
        if (updated[i].role === "assistant") {
          updated.splice(i, 1);
          break;
        }
      }
      return updated;
    });
  }, []);

  /** Delete a conversation and refresh sidebar */
  const removeConversation = useCallback(async (id) => {
    try {
      await deleteConversation(id);
      setConversations((prev) => prev.filter((c) => c._id !== id));
      if (activeConversation === id) {
        startNewConversation();
      }
    } catch (err) {
      setError("Failed to delete conversation.");
    }
  }, [activeConversation, startNewConversation]);

  /** Prepend or update a conversation in the sidebar list */
  const upsertConversation = useCallback((conversationData) => {
    setConversations((prev) => {
      const exists = prev.find((c) => c._id === conversationData._id);
      if (exists) {
        return prev.map((c) => c._id === conversationData._id ? { ...c, ...conversationData } : c);
      }
      return [conversationData, ...prev];
    });
  }, []);

  return (
    <ChatContext.Provider
      value={{
        // State
        activeConversation,
        messages,
        conversations,
        conversationsLoading,
        isStreaming,
        isLoadingConversation,
        tone,
        error,
        sidebarOpen,
        // Actions
        setActiveConversation,
        setMessages,
        setConversations,
        setIsStreaming,
        setError,
        setSidebarOpen,
        setTone,
        // Helpers
        loadConversations,
        openConversation,
        startNewConversation,
        appendMessage,
        updateLastMessage,
        replaceLastAssistantMessage,
        removeLastAssistantMessage,
        removeConversation,
        upsertConversation,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

/** Hook to access chat context */
export const useChat = () => {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error("useChat must be used within a ChatProvider");
  return ctx;
};
