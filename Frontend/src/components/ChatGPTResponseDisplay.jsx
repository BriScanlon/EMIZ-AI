// src/components/ChatGPTResponseDisplay.jsx
import React from 'react';

const ChatGPTResponseDisplay = ({ response }) => {
  return (
    <div className="response-container">
      <pre>{JSON.stringify(response, null, 2)}</pre>
    </div>
  );
};

export default ChatGPTResponseDisplay;
