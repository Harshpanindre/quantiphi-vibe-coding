import { useCallback, useRef } from "react";
import { streamChatMessage, streamRegenerateResponse } from "../services/chatService";
import { useChat } from "../context/ChatContext";
import { fetchConversationById } from "../services/conversationService";

/**
 * Custom hook that encapsulates chat message sending and regeneration logic.
 * Manages streaming state, optimistic UI updates, and error handling.
 */
const useMessageSender = () => {
  const {
    activeConversation,
    tone,
    setActiveConversation,
    setIsStreaming,
    setError,
    appendMessage,
    updateLastMessage,
    removeLastAssistantMessage,
    upsertConversation,
    loadConversations,
  } = useChat();

  // AbortController for cancelling in-flight streams
  const abortControllerRef = useRef(null);

  /**
   * Sends a user message and streams the AI response.
   * @param {string} messageText - The user's input
   */
  const sendMessage = useCallback(
    async (messageText) => {
      if (!messageText.trim()) return;

      // Cancel any previous stream
      abortControllerRef.current?.abort();
      abortControllerRef.current = new AbortController();

      setError(null);
      setIsStreaming(true);

      // Optimistic user message
      appendMessage({
        role: "user",
        content: messageText.trim(),
        timestamp: new Date().toISOString(),
        _id: `temp-${Date.now()}`,
      });

      // Placeholder for AI response (streams into this)
      const aiMessageId = `ai-${Date.now()}`;
      appendMessage({
        role: "assistant",
        content: "",
        timestamp: new Date().toISOString(),
        _id: aiMessageId,
        isStreaming: true,
      });

      let streamedContent = "";
      let resolvedConversationId = activeConversation;

      await streamChatMessage({
        message: messageText.trim(),
        tone,
        conversationId: activeConversation,
        signal: abortControllerRef.current.signal,
        onConversationId: (id) => {
          resolvedConversationId = id;
          setActiveConversation(id);
        },
        onToken: (token) => {
          streamedContent += token;
          updateLastMessage(streamedContent);
        },
        onDone: async () => {
          setIsStreaming(false);
          // Refresh sidebar after successful message
          loadConversations();
        },
        onError: (errMsg) => {
          setIsStreaming(false);
          setError(errMsg);
          // Remove the empty AI placeholder on error
          removeLastAssistantMessage();
        },
      });

      setIsStreaming(false);
    },
    [
      activeConversation,
      tone,
      setActiveConversation,
      setIsStreaming,
      setError,
      appendMessage,
      updateLastMessage,
      removeLastAssistantMessage,
      upsertConversation,
      loadConversations,
    ]
  );

  /**
   * Regenerates the last AI response in the active conversation.
   */
  const regenerateResponse = useCallback(async () => {
    if (!activeConversation) return;

    // Cancel any previous stream
    abortControllerRef.current?.abort();
    abortControllerRef.current = new AbortController();

    setError(null);
    setIsStreaming(true);

    // Remove the last assistant message from local state
    removeLastAssistantMessage();

    // Add new empty placeholder
    appendMessage({
      role: "assistant",
      content: "",
      timestamp: new Date().toISOString(),
      _id: `regen-${Date.now()}`,
      isStreaming: true,
    });

    let streamedContent = "";

    await streamRegenerateResponse({
      conversationId: activeConversation,
      tone,
      signal: abortControllerRef.current.signal,
      onToken: (token) => {
        streamedContent += token;
        updateLastMessage(streamedContent);
      },
      onDone: () => {
        setIsStreaming(false);
        loadConversations();
      },
      onError: (errMsg) => {
        setIsStreaming(false);
        setError(errMsg);
        removeLastAssistantMessage();
      },
    });

    setIsStreaming(false);
  }, [
    activeConversation,
    tone,
    setIsStreaming,
    setError,
    appendMessage,
    updateLastMessage,
    removeLastAssistantMessage,
    loadConversations,
  ]);

  /** Cancel the current stream */
  const cancelStream = useCallback(() => {
    abortControllerRef.current?.abort();
    setIsStreaming(false);
  }, [setIsStreaming]);

  return { sendMessage, regenerateResponse, cancelStream };
};

export default useMessageSender;
