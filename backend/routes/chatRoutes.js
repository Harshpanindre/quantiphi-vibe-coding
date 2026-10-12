const express = require("express");
const router = express.Router();
const { sendMessage, regenerateResponse } = require("../controllers/chatController");

// POST /chat - Send a new message and get an AI response
router.post("/", sendMessage);

// POST /chat/regenerate - Regenerate the last AI response
router.post("/regenerate", regenerateResponse);

module.exports = router;
