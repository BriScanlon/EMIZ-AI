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
        <Logo />
      </div>
      <ul className={styles["sidebar-links"]}>
        <li className={styles["new-chat"]} onClick={onClickNewChat}>
          <FiPlus className={styles["new-chat-icon"]} />
          <span>New Chat</span>
        </li>
      </ul>
      <div className={styles["recent-searches"]}>
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
