import api from "./axiosInstance";

/**
 * Fetches all conversations (sidebar list).
 * @returns {Promise<Array>} Array of conversation summaries
 */
export const fetchConversations = async () => {
  const { data } = await api.get("/conversations");
  return data.conversations;
};

/**
 * Fetches a single conversation with all messages.
 * @param {string} id - Conversation MongoDB ID
 * @returns {Promise<Object>} Full conversation object
 */
export const fetchConversationById = async (id) => {
  const { data } = await api.get(`/conversations/${id}`);
  return data.conversation;
};

/**
 * Deletes a conversation by ID.
 * @param {string} id - Conversation MongoDB ID
 * @returns {Promise<Object>} Deletion confirmation
 */
export const deleteConversation = async (id) => {
  const { data } = await api.delete(`/conversations/${id}`);
  return data;
};
