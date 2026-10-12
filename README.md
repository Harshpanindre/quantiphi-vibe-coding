# NexusAI — Full-Stack AI Chat Assistant

A production-ready AI chat assistant built with **React + Vite**, **Node.js + Express**, **MongoDB**, and **OpenAI GPT-4**. Features real-time streaming responses, conversation persistence, tone selection, and a modern glassmorphism UI.

---

## Features

| Feature | Description |
|---|---|
| AI Responses | GPT-4o-mini via OpenAI API |
| Streaming | Real-time token streaming via SSE |
| Persistence | MongoDB conversation storage |
| History | Sidebar with past conversations |
| Tone Toggle | Professional / Casual / Concise modes |
| Regenerate | Re-generate the last AI response |
| Copy | Copy any AI message to clipboard |
| Responsive | Full mobile + desktop support |
| Dark Mode | Glassmorphism dark theme |

---

## Project Structure

```
quantiphi-vibe-coding/
├── backend/
│   ├── config/db.js
│   ├── controllers/
│   │   ├── chatController.js
│   │   └── conversationController.js
│   ├── middleware/
│   │   ├── errorHandler.js
│   │   └── requestLogger.js
│   ├── models/Conversation.js
│   ├── routes/
│   │   ├── chatRoutes.js
│   │   └── conversationRoutes.js
│   ├── services/openaiService.js
│   ├── .env
│   ├── package.json
│   └── server.js
│
└── frontend/
    ├── public/favicon.svg
    ├── src/
    │   ├── components/
    │   │   ├── ChatWindow.jsx
    │   │   ├── Header.jsx
    │   │   ├── LoadingIndicator.jsx
    │   │   ├── MessageBubble.jsx
    │   │   ├── MessageInput.jsx
    │   │   ├── Sidebar.jsx
    │   │   └── ToneToggle.jsx
    │   ├── context/ChatContext.jsx
    │   ├── hooks/
    │   │   ├── useClipboard.js
    │   │   └── useMessageSender.js
    │   ├── pages/ChatPage.jsx
    │   ├── services/
    │   │   ├── axiosInstance.js
    │   │   ├── chatService.js
    │   │   └── conversationService.js
    │   ├── utils/helpers.js
    │   ├── App.jsx
    │   ├── index.css
    │   └── main.jsx
    ├── index.html
    ├── tailwind.config.js
    └── package.json
```

---

## Quick Start

### Prerequisites

- Node.js v18+
- MongoDB running locally (or a MongoDB Atlas URI)
- OpenAI API Key — https://platform.openai.com/api-keys

---

### 1. Backend Setup

```bash
cd backend
npm install
```

Edit `backend/.env` and add your OpenAI key:

```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/ai-chat-assistant
OPENAI_API_KEY=sk-your-openai-key-here
NODE_ENV=development
```

Start the backend:

```bash
npm run dev    # nodemon auto-reload
# or
npm start      # production
```

Server runs at: http://localhost:5000

---

### 2. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

App opens at: http://localhost:5173

---

## API Reference

### POST /chat
Send a message and stream an AI response (SSE).

Request:
```json
{
  "message": "Explain machine learning",
  "tone": "Professional",
  "conversationId": "optional-id"
}
```

Response: Server-Sent Events stream
```
data: {"conversationId": "..."}
data: {"token": "Machine"}
data: {"done": true, "conversationId": "..."}
```

---

### POST /chat/regenerate
Regenerate the last AI response.

Request:
```json
{ "conversationId": "abc123", "tone": "Casual" }
```

---

### GET /conversations
Returns all conversation summaries sorted by most recent.

### GET /conversations/:id
Returns full conversation with all messages.

### DELETE /conversations/:id
Permanently deletes a conversation.

---

## Environment Variables

| Variable | Description | Default |
|---|---|---|
| PORT | Server port | 5000 |
| MONGODB_URI | MongoDB connection string | mongodb://localhost:27017/ai-chat-assistant |
| OPENAI_API_KEY | Your OpenAI API key | required |
| NODE_ENV | Environment | development |
| CORS_ORIGIN | Allowed frontend origin | http://localhost:5173 |

---

## Tech Stack

Frontend: React 18, Vite, Tailwind CSS, React Router v6, Axios, react-markdown

Backend: Node.js, Express, Mongoose, OpenAI Node SDK v4

Database: MongoDB

---

## Notes

- The app uses Server-Sent Events (SSE) via fetch for streaming responses.
- AI responses are rendered as Markdown with code block support.
- Conversations get auto-generated titles from the first user message.
- Vite proxies /chat and /conversations to localhost:5000 in dev, so no CORS config needed.
