import React, { useState } from "react";
import { FiSearch, FiClock, FiTrash2 } from "react-icons/fi";
import { AiOutlineMenu, AiOutlineClose } from "react-icons/ai";
import "./SidebarNav.scss";
import PdfUpload from "../PdfUpload/PdfUpload";
import Logo from "../Logo/Logo";
import ChatForm from "../ChatForm/ChatForm";

export default function SidebarNav() {
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [recentSearches, setRecentSearches] = useState([
    { id: 1, text: "What is AI?", tag: "Today" },
    { id: 2, text: "Benefits of machine learning", tag: "Previous 7 days" },
    { id: 3, text: "How does ChatGPT work?", tag: "Today" },
  ]);

  const toggleSidebar = () => setSidebarOpen(!isSidebarOpen);

  const clearSearch = (id) => {
    setRecentSearches(recentSearches.filter((search) => search.id !== id));
  };

  return (
    <div className="nav-sidebar">
      {/* Navbar */}
      <div className="navbar">
        <button className="menu-button" onClick={toggleSidebar}>
          {isSidebarOpen ? <AiOutlineClose /> : <AiOutlineMenu />}
        </button>
        {/* <h2 className="nav-h1">AI Assistant</h2> */}
        <Logo/>
      </div>

      {/* Sidebar */}
      <div  className="sidebar-main">
        <div className={`sidebar ${isSidebarOpen ? "open" : "closed"}`}>
          <div className="sidebar-header">
            <h2>AI Assistant is here</h2>
          </div>
          <ul className="sidebar-links">
            <li>New Chat</li>
            <li>Examples</li>
            <li>Settings</li>
          </ul>

          {/* Recent Searches */}
          <div className="recent-searches">
            <h3>Recent Searches</h3>
            {recentSearches.length > 0 ? (
              <ul>
                {recentSearches.map((search) => (
                  <li key={search.id} className="search-item">
                    <span className="search-text">{search.text}</span>
                    <span className="search-tag">{search.tag}</span>
                    <FiTrash2
                      className="delete-icon"
                      onClick={() => clearSearch(search.id)}
                    />
                  </li>
                ))}
              </ul>
            ) : (
              <p>No recent searches</p>
            )}
          </div>
        </div>

      {/* Main Content */}
      <div className="main-contet">
        <PdfUpload/>
        <ChatForm/>
        {/* <h2>Welcome to your AI assistant!</h2>
        <p>Ask me anything, and I will provide the best response I can!</p> */}
      </div>
      </div>
    </div>
  );
}
