import React, { useState } from "react";
import "./ChatManager.scss";
import Navbar from "../Navbar/Navbar";
import Sidebar from "../Sidebar/Sidebar";
import ChatResponse from "../ChatResponse/ChatSummaryResponse";
import ChatForm from "../ChatForm/ChatForm";

const ChatManager = () => {
  // State to manage chat messages
  const [messages, setMessages] = useState([]);

  // State to manage recent searches
  const [recentSearches, setRecentSearches] = useState([
    { id: 1, text: "What is AI?", tag: "Today" },
    { id: 2, text: "Benefits of machine learning", tag: "Previous 7 days" },
    { id: 3, text: "How does ChatGPT work?", tag: "Today" },
  ]);

  // Add a new chat message
  const handleSendMessage = (message) => {
    setMessages((prevMessages) => [...prevMessages, message]);
    addNewChat(message, "Today");
  };

  // Add a new recent search
  const addNewChat = (chatText, tag) => {
    const newChat = {
      id: Date.now(),
      text: chatText,
      tag: tag || "Today",
    };
    setRecentSearches((prevSearches) => [newChat, ...prevSearches]);
  };

  return (
    <div className="chat-manager">
      {/* Navigation bar */}
      <Navbar />

      <div className="content">
        {/* Sidebar for recent searches */}
        <Sidebar
          recentSearches={recentSearches}
          onNewChat={() => addNewChat("New Chat", "Today")}
        />

        <div className="main">
          {/* Chat response to display messages */}
          <ChatResponse messages={messages} />

          {/* Chat form to send new messages */}
          <ChatForm onSendMessage={handleSendMessage} />
        </div>
      </div>
    </div>
  );
};

export default ChatManager;
