import React, { useState, useEffect } from "react";
import "./ChatSummaryResponse.scss";
import { useSearch } from "../../contexts/SearchContext"; // Import the useSearch hook
<<<<<<< HEAD
// import { fetchChatSummaryResponse } from "../../services/api"; // Import the API request handler
=======
import { fetchChatSummaryResponse } from "../../services/api"; // Import the API request handler
>>>>>>> 466bea6d8b5d6752cfbcc12ac9bff7e984035da5

const ChatSummaryResponse = () => {
  const { searchRequests } = useSearch(); // Get the searchRequests from context
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Grab the most recent search request
  const searchRequest = searchRequests[0]?.text || ""; // Default to empty string if no searchRequest

  useEffect(() => {
    if (!searchRequest) return; // Don't fetch if there's no search request

    const getChatSummaryResponse = async () => {
      setLoading(true);
      setError(null);

      try {
        const data = await fetchChatSummaryResponse(searchRequest);
        setMessages(data.messages); // Assuming response has messages array
      } catch (err) {
        setError("Failed to fetch chat response");
      } finally {
        setLoading(false);
      }
    };

    getChatSummaryResponse();
  }, [searchRequest]); // Run when the searchRequest changes

  return (
    <div className="chat-response-container">
      {loading ? (
        <p className="loading">Loading...</p>
      ) : error ? (
        <p className="error">{error}</p>
      ) : messages.length > 0 ? (
        messages.map((message, index) => (
          <div key={index} className="message">
            {message}
          </div>
        ))
      ) : (
        <p className="placeholder">Start a conversation...</p>
      )}
    </div>
  );
};

export default ChatSummaryResponse;
