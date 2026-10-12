import React from "react";
import { ChatProvider } from "../context/ChatContext";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import ChatWindow from "../components/ChatWindow";

/**
 * Main chat page - the primary view of the application.
 * Provides the ChatContext and renders the three-panel layout:
 * [Sidebar] | [Header + ChatWindow]
 */
const ChatPage = () => {
  return (
    <ChatProvider>
      <div className="flex h-screen overflow-hidden bg-surface-900">
        {/* Sidebar */}
        <Sidebar />

        {/* Main area */}
        <div className="flex flex-col flex-1 min-w-0 h-full">
          <Header />
          <main className="flex-1 min-h-0 overflow-hidden">
            <div className="h-full max-w-4xl mx-auto w-full">
              <ChatWindow />
            </div>
          </main>
        </div>
      </div>
    </ChatProvider>
  );
};

export default ChatPage;
