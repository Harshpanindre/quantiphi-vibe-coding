const mongoose = require("mongoose");
const Conversation = require("../models/Conversation");
const {
  generateStreamingResponse,
} = require("../services/openaiService");

/**
 * POST /chat
 * Handles incoming user messages, streams AI response FIRST,
 * then persists conversation to MongoDB after streaming completes.
 *
 * KEY FIX: SSE headers are set BEFORE any DB calls so streaming
 * always works even when MongoDB is unavailable.
 */
const sendMessage = async (req, res) => {
  const { message, tone = "Professional", conversationId } = req.body;

  // --- Input Validation ---
  if (!message || typeof message !== "string" || message.trim() === "") {
    return res.status(400).json({ error: "Message is required and cannot be empty." });
  }

  if (!["Professional", "Casual", "Concise"].includes(tone)) {
    return res.status(400).json({ error: "Invalid tone. Must be Professional, Casual, or Concise." });
  }

  // --- Setup SSE BEFORE any DB calls ---
  // This ensures streaming always starts even if DB is slow or unavailable
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.flushHeaders();

  try {
    let conversation = null;
    let messagesForAI = [];

    // --- Load or Create Conversation (only if MongoDB is connected) ---
    try {
      const isDbConnected = mongoose.connection.readyState === 1;
      if (isDbConnected) {
        if (conversationId) {
          conversation = await Conversation.findById(conversationId);
          if (conversation) {
            messagesForAI = [...conversation.messages];
          } else {
            conversation = new Conversation({ tone, messages: [] });
          }
        } else {
          conversation = new Conversation({ tone, messages: [] });
        }
      }
    } catch (dbErr) {
      console.warn("MongoDB unavailable, running without persistence:", dbErr.message);
      conversation = null;
    }

    // Build the new user message
    const userMessage = {
      role: "user",
      content: message.trim(),
      timestamp: new Date(),
    };

    // Add user message to context for AI
    messagesForAI.push(userMessage);

    // Determine conversation ID to send to frontend
    const convIdStr = conversation && conversation._id
      ? conversation._id.toString()
      : `session-${Date.now()}`;

    // Send conversationId to frontend immediately
    res.write(`data: ${JSON.stringify({ conversationId: convIdStr })}\n\n`);

    // --- Stream AI Response (main operation) ---
    const aiResponse = await generateStreamingResponse(messagesForAI, tone, res);

    // --- Persist to MongoDB after streaming completes ---
    try {
      if (conversation && conversation.save) {
        conversation.messages.push(userMessage);
        if (typeof conversation.generateTitle === "function") {
          conversation.generateTitle();
        }
        conversation.tone = tone;
        conversation.messages.push({
          role: "assistant",
          content: aiResponse,
          timestamp: new Date(),
        });
        await conversation.save();
      }
    } catch (saveErr) {
      // Log but do not fail — user already received their AI response
      console.error("Failed to save conversation to MongoDB:", saveErr.message);
    }

    // Signal end of stream
    res.write(`data: ${JSON.stringify({ done: true, conversationId: convIdStr })}\n\n`);
    res.end();
  } catch (error) {
    console.error("Chat Error:", error);

    // Provide specific error messages for common provider errors
    let userMessage = "AI response generation failed. Please try again.";
    if (error.code === "invalid_api_key" || error.status === 401) {
      userMessage = "Invalid API key. Please check your GROQ_API_KEY (or OPENAI_API_KEY) in backend/.env";
    } else if (error.status === 429) {
      userMessage = "API rate limit exceeded. Please wait a moment and try again.";
    } else if (error.status === 503 || error.code === "ECONNREFUSED") {
      userMessage = "Cannot reach AI servers. Please check your internet connection.";
    } else if (error.message) {
      userMessage = error.message;
    }

    res.write(`data: ${JSON.stringify({ error: userMessage })}\n\n`);
    res.end();
  }
};

/**
 * POST /chat/regenerate
 * Removes the last AI message from a conversation and regenerates it.
 * SSE headers set before any DB operation.
 */
const regenerateResponse = async (req, res) => {
  const { conversationId, tone = "Professional" } = req.body;

  if (!conversationId) {
    return res.status(400).json({ error: "conversationId is required for regeneration." });
  }

  // Setup SSE immediately before any DB calls
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.flushHeaders();

  try {
    let conversation;
    let messagesForAI = [];

    try {
      if (mongoose.connection.readyState !== 1) {
        res.write(`data: ${JSON.stringify({ error: "Database not connected. Conversations are not persistent." })}\n\n`);
        res.end();
        return;
      }

      conversation = await Conversation.findById(conversationId);
      if (!conversation) {
        res.write(`data: ${JSON.stringify({ error: "Conversation not found." })}\n\n`);
        res.end();
        return;
      }

      // Remove the last assistant message before regenerating
      const lastMsg = conversation.messages[conversation.messages.length - 1];
      if (lastMsg && lastMsg.role === "assistant") {
        conversation.messages.pop();
        await conversation.save();
      }

      messagesForAI = conversation.messages;
    } catch (dbErr) {
      console.warn("MongoDB unavailable during regeneration:", dbErr.message);
      res.write(`data: ${JSON.stringify({ error: "Database unavailable. Cannot regenerate." })}\n\n`);
      res.end();
      return;
    }

    res.write(`data: ${JSON.stringify({ conversationId: conversation._id.toString() })}\n\n`);

    // Stream regenerated response
    const aiResponse = await generateStreamingResponse(
      messagesForAI,
      tone || conversation.tone,
      res
    );

    // Persist the regenerated response
    try {
      conversation.messages.push({
        role: "assistant",
        content: aiResponse,
        timestamp: new Date(),
      });
      await conversation.save();
    } catch (saveErr) {
      console.error("Failed to save regenerated response:", saveErr.message);
    }

    res.write(`data: ${JSON.stringify({ done: true, conversationId: conversation._id.toString() })}\n\n`);
    res.end();
  } catch (error) {
    console.error("Regenerate Error:", error);
    res.write(`data: ${JSON.stringify({ error: "Regeneration failed. Please try again." })}\n\n`);
    res.end();
  }
};

module.exports = { sendMessage, regenerateResponse };
