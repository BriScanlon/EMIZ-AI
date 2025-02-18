// import { useState } from "react";
// import { FaPaperPlane } from "react-icons/fa";
// import { usePostQuery } from "../../hooks/usePostQuery";
// import styles from "./QueryForm.module.scss";
// import { useSearch } from "../../contexts/SearchContext";

// const QueryForm = ({ setQueries, setQueryResponses }) => {
//   const [input, setInput] = useState("");
//   const [isTyping, setIsTyping] = useState(false);

//   const { postQuery, isLoading } = usePostQuery();

//   const { selectedSearch: chatNameFromContext } = useSearch();
//   const chatName =
//     chatNameFromContext || JSON.parse(localStorage.getItem("selectedSearch"));

//   const handleSendMessage = () => {
//     if (!input.trim()) return;

//     const userMessage = chatName
//       ? { query: input, chat_name: chatName, debug_test: false }
//       : { query: input };

//     setInput("");
//     setIsTyping(true);

//     postQuery(userMessage, {
//       onSuccess: (data) => {
//         if (Array.isArray(data?.results)) {
//           setQueries((prev) => [...prev, input]); // Append to previous queries
//           setQueryResponses((prev) => [...prev, ...data.results]); // Append new responses
//         } else {
//           console.error("Unexpected response format:", data);
//         }
//       },
//       onError: (error) => {
//         console.error("Error sending query:", error);
//         setInput(input); // Restore input if error occurs
//       },
//       onSettled: () => {
//         setIsTyping(false);
//       },
//     });
//   };

//   //   console.log(messages);

//   return (
//     <div className={styles.queryForm}>
//       <textarea
//         placeholder="Ask your question here..."
//         value={input}
//         onChange={(e) => {
//           setInput(e.target.value);
//           e.target.style.height = "auto";
//           e.target.style.height = `${e.target.scrollHeight}px`;
//         }}
//         onKeyDown={(e) => {
//           if (e.key === "Enter" && !e.shiftKey) {
//             e.preventDefault();
//             handleSendMessage();
//           }
//         }}
//       />
//       {input !== "" && !isLoading && (
//         <button onClick={handleSendMessage}>
//           <FaPaperPlane />
//         </button>
//       )}
//       {isTyping && <div className={styles.typing}>Bot is typing...</div>}
//     </div>
//   );
// };

// export default QueryForm;

import { useState } from "react";
import { FaPaperPlane } from "react-icons/fa";
import { usePostQuery } from "../../hooks/usePostQuery";
import styles from "./QueryForm.module.scss";
import { useSearch } from "../../contexts/SearchContext";

const QueryForm = () => {
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const { postQuery, isLoading } = usePostQuery();

  const {
    selectedSearch: chatNameFromContext,
    handleNewQuery,
    handleNewResponse,
  } = useSearch();

  const chatName =
    chatNameFromContext || JSON.parse(localStorage.getItem("selectedSearch"));

  const handleSendMessage = (e) => {
    if (!input.trim()) return;

    const userMessage = chatName
      ? { query: input, chat_name: chatName }
      : { query: input };

    handleNewQuery(input); // Call handleNewQuery when a new query is submitted
    setInput("");
    setIsTyping(true);

    postQuery(userMessage, {
      onSuccess: (data) => {
        if (Array.isArray(data?.results)) {
          data.results.forEach((result) => handleNewResponse(result)); // Call handleNewResponse for each response
        } else {
          console.error("Unexpected response format:", data);
        }
      },
      onError: (error) => {
        console.error("Error sending query:", error);
        setInput(input); // Restore input if error occurs
      },
      onSettled: () => {
        setIsTyping(false);
        // window.location.reload(); // Trigger page reload
      },
    });
  };

  return (
    <div className={styles.queryForm}>
      <textarea
        placeholder="Ask your question here..."
        value={input}
        onChange={(e) => {
          setInput(e.target.value);
          e.target.style.height = "auto";
          e.target.style.height = `${e.target.scrollHeight}px`;
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
          }
        }}
      />
      {input !== "" && !isLoading && (
        <button onClick={handleSendMessage}>
          <FaPaperPlane />
        </button>
      )}
      {isTyping && <div className={styles.typing}>Bot is typing...</div>}
    </div>
  );
};

export default QueryForm;
