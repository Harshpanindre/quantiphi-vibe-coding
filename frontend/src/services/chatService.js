/**
 * Sends a chat message and streams the response via EventSource-like fetch.
 * Uses fetch() with a ReadableStream for SSE.
 *
 * @param {Object} params
 * @param {string} params.message - User's message text
 * @param {string} params.tone - Response tone
 * @param {string|null} params.conversationId - Optional existing conversation ID
 * @param {Function} params.onToken - Called with each streamed token string
 * @param {Function} params.onConversationId - Called with the conversationId once received
 * @param {Function} params.onDone - Called when streaming is complete
 * @param {Function} params.onError - Called with error message on failure
 * @param {AbortSignal} params.signal - Optional AbortController signal
 */
export const streamChatMessage = async ({
  message,
  tone,
  conversationId,
  onToken,
  onConversationId,
  onDone,
  onError,
  signal,
}) => {
  try {
    const response = await fetch("/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message, tone, conversationId }),
      signal,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP ${response.status}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop(); // Keep incomplete line in buffer

      for (const line of lines) {
        if (line.startsWith("data: ")) {
          try {
            const data = JSON.parse(line.slice(6));
            if (data.error) {
              onError?.(data.error);
              return;
            }
            if (data.conversationId) {
              onConversationId?.(data.conversationId);
            }
            if (data.token) {
              onToken?.(data.token);
            }
            if (data.done) {
              onDone?.(data.conversationId);
            }
          } catch {
            // Skip malformed SSE lines
          }
        }
      }
    }
  } catch (error) {
    if (error.name === "AbortError") return;
    onError?.(error.message || "Failed to connect to the server.");
  }
};

/**
 * Regenerates the last AI response in a conversation.
 *
 * @param {Object} params
 * @param {string} params.conversationId - Conversation to regenerate in
 * @param {string} params.tone - Response tone
 * @param {Function} params.onToken - Called with each token
 * @param {Function} params.onDone - Called when done
 * @param {Function} params.onError - Called on error
 * @param {AbortSignal} params.signal - Optional abort signal
 */
export const streamRegenerateResponse = async ({
  conversationId,
  tone,
  onToken,
  onDone,
  onError,
  signal,
}) => {
  try {
    const response = await fetch("/chat/regenerate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ conversationId, tone }),
      signal,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP ${response.status}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop();

      for (const line of lines) {
        if (line.startsWith("data: ")) {
          try {
            const data = JSON.parse(line.slice(6));
            if (data.error) {
              onError?.(data.error);
              return;
            }
            if (data.token) onToken?.(data.token);
            if (data.done) onDone?.();
          } catch {
            // Skip malformed lines
          }
        }
      }
    }
  } catch (error) {
    if (error.name === "AbortError") return;
    onError?.(error.message || "Failed to regenerate response.");
  }
};
