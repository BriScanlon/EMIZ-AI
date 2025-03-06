// import React, { useState, useEffect, useRef } from "react";
// import { useSearch } from "../../contexts/SearchContext";
// import { useChatHistory } from "../../hooks/useChatHistory";
// import Spinner from "../../ui/Spinner/Spinner";
// import GraphIcon from "../../ui/GraphIcon/UiIcon";
// import { Link } from "react-router-dom";
// import ScrollButtons from "../../ui/ScrollButtons/ScrollButtons";
// import styles from "./Chat.module.scss";

// const graphIcon = () => (
//   <svg
//     xmlns="http://www.w3.org/2000/svg"
//     height="20px"
//     viewBox="0 -960 960 960"
//     width="20px"
//     fill="#e8eaed"
//   >
//     <path d="M480-80q-50 0-85-35t-35-85q0-5 .5-11t1.5-11l-83-47q-16 14-36 21.5t-43 7.5q-50 0-85-35t-35-85q0-50 35-85t85-35q24 0 45 9t38 25l119-60q-3-23 2.5-45t19.5-41l-34-52q-7 2-14.5 3t-15.5 1q-50 0-85-35t-35-85q0-50 35-85t85-35q50 0 85 35t35 85q0 20-6.5 38.5T456-688l35 52q8-2 15-3t15-1q17 0 32 4t29 12l66-54q-4-10-6-20.5t-2-21.5q0-50 35-85t85-35q50 0 85 35t35 85q0 50-35 85t-85 35q-17 0-32-4.5T699-617l-66 55q4 10 6 20.5t2 21.5q0 50-35 85t-85 35q-24 0-45.5-9T437-434l-118 59q2 9 1.5 18t-2.5 18l84 48q16-14 35.5-21.5T480-320q50 0 85 35t35 85q0 50-35 85t-85 35ZM200-320q17 0 28.5-11.5T240-360q0-17-11.5-28.5T200-400q-17 0-28.5 11.5T160-360q0 17 11.5 28.5T200-320Zm160-400q17 0 28.5-11.5T400-760q0-17-11.5-28.5T360-800q-17 0-28.5 11.5T320-760q0 17 11.5 28.5T360-720Zm120 560q17 0 28.5-11.5T520-200q0-17-11.5-28.5T480-240q-17 0-28.5 11.5T440-200q0 17 11.5 28.5T480-160Zm40-320q17 0 28.5-11.5T560-520q0-17-11.5-28.5T520-560q-17 0-28.5 11.5T480-520q0 17 11.5 28.5T520-480Zm240-200q17 0 28.5-11.5T800-720q0-17-11.5-28.5T760-760q-17 0-28.5 11.5T720-720q0 17 11.5 28.5T760-680Z" />
//   </svg>
// );

// const tableIcon = () => (
//   <svg
//     xmlns="http://www.w3.org/2000/svg"
//     height="24px"
//     viewBox="0 -960 960 960"
//     width="24px"
//     fill="#e8eaed"
//   >
//     <path d="M320-80q-33 0-56.5-23.5T240-160v-480q0-33 23.5-56.5T320-720h480q33 0 56.5 23.5T880-640v480q0 33-23.5 56.5T800-80H320Zm0-80h200v-120H320v120Zm280 0h200v-120H600v120ZM80-240v-560q0-33 23.5-56.5T160-880h560v80H160v560H80Zm240-120h200v-120H320v120Zm280 0h200v-120H600v120ZM320-560h480v-80H320v80Z" />
//   </svg>
// );

// const ChatHistory = () => {
//   const { selectedSearch: chatName } = useSearch();
//   const { results: chatHistory, isLoading } = useChatHistory(chatName);
//   //   const [chatHistory, setChatHistory] = useState([]);
//   const chatRef = useRef(null);

//   //   useEffect(() => {
//   //     if (data?.results) {
//   //       setChatHistory(data.results);
//   //     }
//   //   }, [data]);

//   useEffect(() => {
//     chatRef.current?.scrollIntoView({ behavior: "smooth" });
//   }, [chatHistory]);

//   //   const handleNewQuery = (query) => {
//   //     setChatHistory((prev) => [...prev, { sender: "user", message: query }]);
//   //   };

//   //   const handleNewResponse = (response) => {
//   //     setChatHistory((prev) => [...prev, { sender: "bot", message: response }]);
//   //   };

//   if (isLoading) return <Spinner />;

//   return (
//     <div className={styles.chatContainer}>
//       <div className={styles.chatWindow}>
//         {chatHistory.map((chat, index) => (
//           <div
//             key={index}
//             className={`${styles.message} ${styles[chat.sender]}`}
//           >
//             <div className={styles.bubble}>{chat.message}</div>
//             <div>
//               <span>
//                 <Link
//                   to={`/graph?chat_id=${index}`}
//                   className={styles.iconContainer}
//                 >
//                   <GraphIcon icon={graphIcon} tooltipText="View in graph" />
//                 </Link>
//               </span>
//               <span>
//                 <Link
//                   to={`/table?chat_id=${index}`}
//                   className={styles.iconContainer}
//                 >
//                   <GraphIcon icon={tableIcon} tooltipText="View in table" />
//                 </Link>
//               </span>
//             </div>
//           </div>
//         ))}
//         <div ref={chatRef} />
//       </div>
//       <ScrollButtons />
//     </div>
//   );
// };

// export default ChatHistory;

import React, { useState, useEffect, useRef } from "react";
import { useSearch } from "../../contexts/SearchContext";
import { useChatHistory } from "../../hooks/useChatHistory";
import Spinner from "../../ui/Spinner/Spinner";
import ChatInterface from "./ChatInterface";

const ChatHistory = () => {
  const { selectedSearch: chatNameFromContext } = useSearch();
  const chatName =
    chatNameFromContext || JSON.parse(localStorage.getItem("selectedSearch"));

  const { data, isLoading } = useChatHistory(chatName);
  const chatRef = useRef(null);

  if (isLoading) return <Spinner />;

  return (
    <ChatInterface
      chatConversation={data?.chat_history || []}
      chatRef={chatRef}
    />
  );
};

export default ChatHistory;

// import React, { useState, useEffect, useRef } from "react";
// import { useSearch } from "../../contexts/SearchContext";
// import { useChatHistory } from "../../hooks/useChatHistory";
// import Spinner from "../../ui/Spinner/Spinner";
// import GraphIcon from "../../ui/GraphIcon/UiIcon";
// import { Link } from "react-router-dom";
// import ScrollButtons from "../../ui/ScrollButtons/ScrollButtons";
// import styles from "./Chat.module.scss";

// const graphIcon = () => (
//   <svg
//     xmlns="http://www.w3.org/2000/svg"
//     height="20px"
//     viewBox="0 -960 960 960"
//     width="20px"
//     fill="#e8eaed"
//   >
//     <path d="M480-80q-50 0-85-35t-35-85q0-5 .5-11t1.5-11l-83-47q-16 14-36 21.5t-43 7.5q-50 0-85-35t-35-85q0-50 35-85t85-35q24 0 45 9t38 25l119-60q-3-23 2.5-45t19.5-41l-34-52q-7 2-14.5 3t-15.5 1q-50 0-85-35t-35-85q0-50 35-85t85-35q50 0 85 35t35 85q0 20-6.5 38.5T456-688l35 52q8-2 15-3t15-1q17 0 32 4t29 12l66-54q-4-10-6-20.5t-2-21.5q0-50 35-85t85-35q50 0 85 35t35 85q0 50-35 85t-85 35q-17 0-32-4.5T699-617l-66 55q4 10 6 20.5t2 21.5q0 50-35 85t-85 35q-24 0-45.5-9T437-434l-118 59q2 9 1.5 18t-2.5 18l84 48q16-14 35.5-21.5T480-320q50 0 85 35t35 85q0 50-35 85t-85 35ZM200-320q17 0 28.5-11.5T240-360q0-17-11.5-28.5T200-400q-17 0-28.5 11.5T160-360q0 17 11.5 28.5T200-320Zm160-400q17 0 28.5-11.5T400-760q0-17-11.5-28.5T360-800q-17 0-28.5 11.5T320-760q0 17 11.5 28.5T360-720Zm120 560q17 0 28.5-11.5T520-200q0-17-11.5-28.5T480-240q-17 0-28.5 11.5T440-200q0 17 11.5 28.5T480-160Zm40-320q17 0 28.5-11.5T560-520q0-17-11.5-28.5T520-560q-17 0-28.5 11.5T480-520q0 17 11.5 28.5T520-480Zm240-200q17 0 28.5-11.5T800-720q0-17-11.5-28.5T760-760q-17 0-28.5 11.5T720-720q0 17 11.5 28.5T760-680Z" />
//   </svg>
// );

// const tableIcon = () => (
//   <svg
//     xmlns="http://www.w3.org/2000/svg"
//     height="24px"
//     viewBox="0 -960 960 960"
//     width="24px"
//     fill="#e8eaed"
//   >
//     <path d="M320-80q-33 0-56.5-23.5T240-160v-480q0-33 23.5-56.5T320-720h480q33 0 56.5 23.5T880-640v480q0 33-23.5 56.5T800-80H320Zm0-80h200v-120H320v120Zm280 0h200v-120H600v120ZM80-240v-560q0-33 23.5-56.5T160-880h560v80H160v560H80Zm240-120h200v-120H320v120Zm280 0h200v-120H600v120ZM320-560h480v-80H320v80Z" />
//   </svg>
// );

// const ChatHistory = () => {
//   const { selectedSearch: chatName } = useSearch();
//   const { data, isLoading } = useChatHistory(chatName);
//   const [chatHistory, setChatHistory] = useState([]);
//   const chatRef = useRef(null);

//   useEffect(() => {
//     if (data?.results) {
//       setChatHistory(data.results);
//     }
//   }, [data]);

//   console.log(chatHistory);

//   useEffect(() => {
//     chatRef.current?.scrollIntoView({ behavior: "smooth" });
//   }, [chatHistory]);

//   const handleNewQuery = (query) => {
//     setChatHistory((prev) => [...prev, { sender: "user", message: query }]);
//   };

//   const handleNewResponse = (response) => {
//     setChatHistory((prev) => [...prev, { sender: "bot", message: response }]);
//   };

//   if (isLoading) return <Spinner />;

//   return (
//     <div className={styles.chatContainer}>
//       <div className={styles.chatWindow}>
//         {chatHistory.map((chat, index) => (
//           <div key={index} className={`${styles.message} ${styles["bot"]}`}>
//             <div className={styles.bubble}>{chat.message}</div>
//             <div>
//               {chat.graph && (
//                 <>
//                   <span>
//                     <Link
//                       to={`/graph?chat_id=${index}`}
//                       className={styles.iconContainer}
//                     >
//                       <GraphIcon icon={graphIcon} tooltipText="View in graph" />
//                     </Link>
//                   </span>
//                   <span>
//                     <Link
//                       to={`/table?chat_id=${index}`}
//                       className={styles.iconContainer}
//                     >
//                       <GraphIcon icon={tableIcon} tooltipText="View in table" />
//                     </Link>
//                   </span>
//                 </>
//               )}
//             </div>
//           </div>
//         ))}
//         <div ref={chatRef} />
//       </div>
//       <ScrollButtons />
//     </div>
//   );
// };

// export default ChatHistory;
