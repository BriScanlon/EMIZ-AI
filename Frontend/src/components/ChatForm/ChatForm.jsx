import React, { useState, useRef } from "react";
import styles from "./ChatForm.module.scss";
import { useSearch } from "../../contexts/SearchContext";
import { AiOutlineSend } from "react-icons/ai"; // Using react-icons

const ChatForm = () => {
  const [input, setInput] = useState("");
  const { onAddSearchRequest } = useSearch();
  const textareaRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (input.trim() === "") return;

    onAddSearchRequest(input);
    setInput(""); // Clear input after sending
    adjustHeight(); // Reset height after clearing
  };

  const handleChange = (e) => {
    setInput(e.target.value);
    adjustHeight();
  };

  const adjustHeight = () => {
    const textarea = textareaRef.current;
    textarea.style.height = "40px"; // Reset height
    textarea.style.height = `${textarea.scrollHeight}px`; // Adjust to content
  };

  return (
    <form onSubmit={handleSubmit} className={styles.chatForm}>
      <textarea
        ref={textareaRef}
        placeholder="Input your search into the field..."
        value={input}
        onChange={handleChange}
        className={styles.chatInput}
        rows="1"
      />
      <div type="submit" className={styles.sendBtn}>
        <AiOutlineSend className={styles.sendIcon} />
        
      </div>
    </form>
  );
};

export default ChatForm;
