import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import ChatPage from "./pages/ChatPage";

/**
 * Root application component.
 * Defines top-level routing — all routes go to ChatPage.
 */
const App = () => {
  return (
    <Routes>
      <Route path="/" element={<ChatPage />} />
      {/* Redirect any unknown paths to home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;
