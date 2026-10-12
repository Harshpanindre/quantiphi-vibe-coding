const mongoose = require("mongoose");

/**
 * Message sub-schema embedded within Conversation documents.
 */
const MessageSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      enum: ["user", "assistant", "system"],
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: true }
);

/**
 * Conversation schema - stores all messages and metadata for a chat session.
 */
const ConversationSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      default: "New Conversation",
      maxlength: 100,
    },
    messages: [MessageSchema],
    tone: {
      type: String,
      enum: ["Professional", "Casual", "Concise"],
      default: "Professional",
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt automatically
  }
);

/**
 * Auto-generate a title from the first user message
 * if the conversation still has the default title.
 */
ConversationSchema.methods.generateTitle = function () {
  if (this.messages.length > 0 && this.title === "New Conversation") {
    const firstUserMsg = this.messages.find((m) => m.role === "user");
    if (firstUserMsg) {
      this.title =
        firstUserMsg.content.substring(0, 60) +
        (firstUserMsg.content.length > 60 ? "..." : "");
    }
  }
};

module.exports = mongoose.model("Conversation", ConversationSchema);
