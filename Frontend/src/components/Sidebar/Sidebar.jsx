<<<<<<< HEAD
import { Link } from "react-router-dom";
import { FiPlus } from "react-icons/fi";

import { useSearch } from "../../contexts/SearchContext";
import styles from "./Sidebar.module.scss";
import Logo from "../Logo/Logo";

export default function Sidebar({ isSidebarOpen }) {
  const {
    onClickNewChat,
    recentSearches,
    handleRecentSearchClick,
    selectedSearch,
  } = useSearch();

  return (
    <div
      className={`${styles.sidebar} ${
        isSidebarOpen ? styles.open : styles.closed
      }`}
    >
      <div className={styles["sidebar-header"]}>
=======
// import React from "react";
// import { FiPlus, FiTrash2 } from "react-icons/fi"; // Add FiPlus for the "New Chat" icon
// import { useSearch } from "../../contexts/SearchContext";
// import styles from "./Sidebar.module.scss";
// import Logo from "../Logo/Logo";

// export default function Sidebar({ isSidebarOpen }) {
//   const { onClickNewChat, recentSearches } = useSearch(); // Get the onClickNewChat function from context

//   return (
//     <div className={`${styles.sidebar} ${isSidebarOpen ? styles.open : styles.closed}`}>
//       <div className={styles["sidebar-header"]}>
//         {/* <h2>AI Assistant is here</h2> */}
//         <Logo/>
//       </div>
//       <ul className={styles["sidebar-links"]}>
//         <li className={styles["new-chat"]} onClick={onClickNewChat}>
//           <FiPlus className={styles["new-chat-icon"]} />
//           <span>New Chat</span>
//         </li>
//       </ul>
//       <div className={styles["recent-searches"]}>
//         <h3>Recent Searches</h3>
//         {recentSearches.length > 0 ? (
//           <ul>
//             {recentSearches.map((id, label, value) => (
//               <li key={search.id} className={styles["search-item"]}>
//                 <span className={styles["search-text"]}>{label}</span>
//                 <span className={styles["search-tag"]}>{search.tag}</span>

//                 <label>
//               <input
//                 type="checkbox"
//                 value={option.value}
//                 onChange={handleUrlChange}
//               />
//               {option.label}
//             </label>
//                 {/* <FiTrash2
//                   className={styles["delete-icon"]}
//                   onClick={() => clearSearch(search.id)}
//                 /> */}
//               </li>
//             ))}
//           </ul>
//         ) : (
//           <p>No recent searches</p>
//         )}
//       </div>
//     </div>
//   );
// }


import React from "react";
import { FiPlus } from "react-icons/fi"; // Add FiPlus for the "New Chat" icon
import { useSearch } from "../../contexts/SearchContext";
import styles from "./Sidebar.module.scss";
import Logo from "../Logo/Logo";
import { Link } from "react-router-dom";

export default function Sidebar({ isSidebarOpen }) {
  const { onClickNewChat, recentSearches, handleRecentSearchClick } = useSearch();

  return (
<div className={`${styles.sidebar} ${isSidebarOpen ? styles.open : styles.closed}`}>
<div className={styles["sidebar-header"]}>
>>>>>>> 466bea6d8b5d6752cfbcc12ac9bff7e984035da5
        <Logo />
      </div>
      <ul className={styles["sidebar-links"]}>
        <li className={styles["new-chat"]} onClick={onClickNewChat}>
          <FiPlus className={styles["new-chat-icon"]} />
          <span>New Chat</span>
        </li>
      </ul>
      <div className={styles["recent-searches"]}>
<<<<<<< HEAD
        <h3>Recent Conversations</h3>
        {recentSearches && recentSearches.length > 0 ? (
          <ul>
            {recentSearches.map((search, index) => (
              <li
                key={index}
                className={styles["search-item"]}
                onClick={() => handleRecentSearchClick(search)}
              >
                <span className={styles["search-text"]}>{search}</span>
=======
        <h3>Recent Searches</h3>
        {recentSearches.length > 0 ? (
          <ul>
            {recentSearches.map((search) => (
              <li
                key={search.id}
                className={styles["search-item"]}
                onClick={() => handleRecentSearchClick(search)}
              >
                <span className={styles["search-text"]}>{search.label}</span>
>>>>>>> 466bea6d8b5d6752cfbcc12ac9bff7e984035da5
              </li>
            ))}
          </ul>
        ) : (
          <p>No recent searches</p>
        )}
      </div>
    </div>
  );
}
