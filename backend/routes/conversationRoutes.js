const express = require("express");
const router = express.Router();
const {
  getAllConversations,
  getConversationById,
  deleteConversation,
} = require("../controllers/conversationController");

// GET /conversations - Fetch all conversations (sidebar list)
router.get("/", getAllConversations);

// GET /conversations/:id - Fetch a single full conversation
router.get("/:id", getConversationById);

// DELETE /conversations/:id - Delete a conversation
router.delete("/:id", deleteConversation);

module.exports = router;
