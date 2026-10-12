const mongoose = require("mongoose");
const Conversation = require("../models/Conversation");

/**
 * GET /conversations
 * Returns all conversations sorted by most recently updated.
 * If MongoDB is not connected, returns empty array gracefully instead of 500.
 */
const getAllConversations = async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.json({ conversations: [] });
    }

    const conversations = await Conversation.find(
      {},
      { title: 1, tone: 1, createdAt: 1, updatedAt: 1, "messages": { $slice: -1 } }
    ).sort({ updatedAt: -1 });

    res.json({ conversations });
  } catch (error) {
    console.error("❌ Get Conversations Error:", error);
    // Return empty list gracefully instead of 500 crashing UI
    res.json({ conversations: [] });
  }
};

/**
 * GET /conversations/:id
 * Returns a single conversation with all its messages.
 */
const getConversationById = async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(404).json({ error: "Database not connected. Conversations are not persistent." });
    }

    const conversation = await Conversation.findById(req.params.id);
    if (!conversation) {
      return res.status(404).json({ error: "Conversation not found." });
    }
    res.json({ conversation });
  } catch (error) {
    console.error("❌ Get Conversation Error:", error);
    if (error.name === "CastError") {
      return res.status(400).json({ error: "Invalid conversation ID format." });
    }
    res.status(500).json({ error: "Failed to retrieve conversation." });
  }
};

/**
 * DELETE /conversations/:id
 * Permanently deletes a conversation by ID.
 */
const deleteConversation = async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.json({ message: "Deleted locally.", id: req.params.id });
    }

    const conversation = await Conversation.findByIdAndDelete(req.params.id);
    if (!conversation) {
      return res.status(404).json({ error: "Conversation not found." });
    }
    res.json({ message: "Conversation deleted successfully.", id: req.params.id });
  } catch (error) {
    console.error("❌ Delete Conversation Error:", error);
    if (error.name === "CastError") {
      return res.status(400).json({ error: "Invalid conversation ID format." });
    }
    res.status(500).json({ error: "Failed to delete conversation." });
  }
};

module.exports = { getAllConversations, getConversationById, deleteConversation };
