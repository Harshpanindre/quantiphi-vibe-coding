const OpenAI = require("openai");

// Initialize OpenAI client (lazy init so tests don't fail without key)
let openaiClient = null;

const getOpenAIClient = () => {
  if (!openaiClient) {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY is not set in environment variables");
    }
    openaiClient = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return openaiClient;
};

/**
 * Maps tone name to system prompt instruction.
 * @param {string} tone - "Professional" | "Casual" | "Concise"
 * @returns {string} System prompt string
 */
const getToneSystemPrompt = (tone) => {
  const tones = {
    Professional:
      "You are a professional AI assistant. Provide thorough, well-structured, and articulate responses. Use clear language and maintain a formal tone throughout.",
    Casual:
      "You are a friendly, casual AI assistant. Respond conversationally, like you're chatting with a friend. Feel free to use relaxed language and a warm tone.",
    Concise:
      "You are a concise AI assistant. Keep all responses short and to the point. Avoid unnecessary details — answer directly and briefly.",
  };
  return tones[tone] || tones["Professional"];
};

/**
 * Generates an AI response using OpenAI's streaming API.
 * Streams tokens to the HTTP response as Server-Sent Events (SSE).
 *
 * @param {Array} messages - Array of { role, content } message objects
 * @param {string} tone - Desired response tone
 * @param {Object} res - Express response object (for streaming)
 * @returns {string} Full accumulated response text
 */
const generateStreamingResponse = async (messages, tone, res) => {
  const client = getOpenAIClient();
  const systemPrompt = getToneSystemPrompt(tone);

  // Build message array with system prompt prepended
  const apiMessages = [
    { role: "system", content: systemPrompt },
    ...messages.map((m) => ({ role: m.role, content: m.content })),
  ];

  let fullResponse = "";

  const stream = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: apiMessages,
    stream: true,
    max_tokens: 2048,
    temperature: 0.7,
  });

  // Stream each token chunk to the client
  for await (const chunk of stream) {
    const delta = chunk.choices[0]?.delta?.content || "";
    if (delta) {
      fullResponse += delta;
      res.write(`data: ${JSON.stringify({ token: delta })}\n\n`);
    }
  }

  return fullResponse;
};

/**
 * Generates a non-streaming AI response (fallback).
 *
 * @param {Array} messages - Array of { role, content } message objects
 * @param {string} tone - Desired response tone
 * @returns {string} Complete response text
 */
const generateResponse = async (messages, tone) => {
  const client = getOpenAIClient();
  const systemPrompt = getToneSystemPrompt(tone);

  const apiMessages = [
    { role: "system", content: systemPrompt },
    ...messages.map((m) => ({ role: m.role, content: m.content })),
  ];

  const completion = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: apiMessages,
    max_tokens: 2048,
    temperature: 0.7,
  });

  return completion.choices[0]?.message?.content || "";
};

module.exports = {
  generateStreamingResponse,
  generateResponse,
  getToneSystemPrompt,
};
