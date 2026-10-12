const OpenAI = require("openai");
const dotenv = require("dotenv");

let cachedGroqModel = null;
let lastConfiguredModel = null;

/**
 * Filters out safety/audio/multimodal models to keep only conversational chat models.
 */
const isConversationalModel = (id) => {
  const lower = id.toLowerCase();
  return (
    !lower.includes("guard") &&
    !lower.includes("whisper") &&
    !lower.includes("vision") &&
    !lower.includes("embed") &&
    !lower.includes("tts")
  );
};

/**
 * Discovers and caches an active conversational model for Groq.
 */
const resolveGroqModel = async (client) => {
  const configured = (process.env.GROQ_MODEL || "").trim();

  // If the user changed GROQ_MODEL in .env, invalidate cache
  if (configured !== lastConfiguredModel) {
    cachedGroqModel = null;
    lastConfiguredModel = configured;
  }

  if (cachedGroqModel) return cachedGroqModel;

  try {
    const list = await client.models.list();
    const allIds = list.data.map((m) => m.id);
    const chatModels = allIds.filter(isConversationalModel);

    console.log("📋 [Groq] Active conversational chat models:", chatModels);

    // If configured model is in active chat models, use it directly
    if (configured && chatModels.includes(configured)) {
      cachedGroqModel = configured;
      console.log(`✅ [Groq] Using configured model: ${cachedGroqModel}`);
      return cachedGroqModel;
    }

    // Preference hierarchy for best free-tier chat models
    const preferred = [
      "llama-3.3-70b-versatile",
      "llama-3.1-70b-versatile",
      "llama3-70b-8192",
      "llama3-8b-8192",
      "gemma2-9b-it",
      "mixtral-8x7b-32768",
      "openai/gpt-oss-120b",
      "openai/gpt-oss-20b",
    ];

    for (const model of preferred) {
      if (chatModels.includes(model)) {
        cachedGroqModel = model;
        console.log(`✅ [Groq] Selected optimal chat model: ${cachedGroqModel}`);
        return cachedGroqModel;
      }
    }

    // Fallback to the first valid conversational model (never guard models)
    if (chatModels.length > 0) {
      cachedGroqModel = chatModels[0];
      console.log(`✅ [Groq] Selected available chat model: ${cachedGroqModel}`);
      return cachedGroqModel;
    }
  } catch (err) {
    console.warn("⚠️ [Groq] Could not query models list:", err.message);
  }

  // Safe default fallback
  cachedGroqModel = configured || "llama-3.3-70b-versatile";
  return cachedGroqModel;
};

/**
 * Returns an AI client and target model based on available environment variables.
 */
const getAIClient = async () => {
  dotenv.config();

  const groqKey = (process.env.GROQ_API_KEY || "").trim().replace(/^["']|["']$/g, "");
  if (groqKey && groqKey !== "your_groq_api_key_here") {
    const client = new OpenAI({
      apiKey: groqKey,
      baseURL: "https://api.groq.com/openai/v1",
    });
    const model = await resolveGroqModel(client);
    console.log(`⚡ [AI Service] Routing to Groq API with model: ${model}`);
    return { client, model, provider: "Groq" };
  }

  const openAIKey = (process.env.OPENAI_API_KEY || "").trim().replace(/^["']|["']$/g, "");
  if (openAIKey && openAIKey !== "mock" && !openAIKey.includes("your_openai")) {
    const model = process.env.OPENAI_MODEL || "gpt-4o-mini";
    console.log(`🤖 [AI Service] Routing to OpenAI API with model: ${model}`);
    return {
      client: new OpenAI({ apiKey: openAIKey }),
      model,
      provider: "OpenAI",
    };
  }

  return {
    client: null,
    model: "mock",
    provider: "Mock",
  };
};

/**
 * Maps tone name to system prompt instruction.
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
 * Generates simulated streaming tokens for testing without API keys.
 */
const streamMockResponse = async (messages, tone, res) => {
  const lastUserMsg = messages[messages.length - 1]?.content || "Hello";

  let body = "";
  if (tone === "Concise") {
    body = `Concise response to "${lastUserMsg}":\n\n• Point 1: Direct insight provided.\n• Point 2: Ready for production.`;
  } else if (tone === "Casual") {
    body = `Hey! Thanks for asking about "${lastUserMsg}"!\n\nHere's what's up:\n- Everything is running and streaming smoothly.\n- Feel free to toggle tones or ask anything else!`;
  } else {
    body = `Thank you for your inquiry regarding "${lastUserMsg}".\n\n### System Status\n1. **Pipeline**: Server-Sent Events (SSE) streaming is active.\n2. **Tone Preset**: Responding in **${tone}** tone.`;
  }

  const chunks = body.match(/(\S+\s*|\s+)/g) || [body];

  for (const chunk of chunks) {
    res.write(`data: ${JSON.stringify({ token: chunk })}\n\n`);
    await new Promise((resolve) => setTimeout(resolve, 30));
  }

  return body;
};

/**
 * Generates an AI response using Groq, OpenAI, or Mock fallback.
 * Streams tokens to the HTTP response as Server-Sent Events (SSE).
 */
const generateStreamingResponse = async (messages, tone, res) => {
  if (process.env.USE_MOCK_AI === "true") {
    return await streamMockResponse(messages, tone, res);
  }

  const { client, model, provider } = await getAIClient();

  if (!client || provider === "Mock") {
    return await streamMockResponse(messages, tone, res);
  }

  const systemPrompt = getToneSystemPrompt(tone);

  const apiMessages = [
    { role: "system", content: systemPrompt },
    ...messages.map((m) => ({ role: m.role, content: m.content })),
  ];

  let fullResponse = "";

  const stream = await client.chat.completions.create({
    model,
    messages: apiMessages,
    stream: true,
    max_tokens: 1024,
    temperature: 0.7,
  });

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
 */
const generateResponse = async (messages, tone) => {
  if (process.env.USE_MOCK_AI === "true") {
    const lastUserMsg = messages[messages.length - 1]?.content || "Hello";
    return `[Mock Response - ${tone}] Received: "${lastUserMsg}".`;
  }

  const { client, model, provider } = await getAIClient();
  if (!client || provider === "Mock") {
    const lastUserMsg = messages[messages.length - 1]?.content || "Hello";
    return `[Mock Response - ${tone}] Received: "${lastUserMsg}".`;
  }

  const systemPrompt = getToneSystemPrompt(tone);
  const apiMessages = [
    { role: "system", content: systemPrompt },
    ...messages.map((m) => ({ role: m.role, content: m.content })),
  ];

  const completion = await client.chat.completions.create({
    model,
    messages: apiMessages,
    max_tokens: 1024,
    temperature: 0.7,
  });

  return completion.choices[0]?.message?.content || "";
};

module.exports = {
  generateStreamingResponse,
  generateResponse,
  getToneSystemPrompt,
};
