import React from "react";
import { useSearch } from "../../contexts/SearchContext";
import styles from "./Sidebar.module.scss";
import ChatMenuOptions from "../ChatMenuOptions";

export default function Sidebar({ isSidebarOpen }) {
  const {
    recentSearches,
    handleRecentSearchClick,
    handleDeleteSearch,
    handleRenameSearch,
  } = useSearch();

  return (
    <div
      className={`${styles.sidebar} ${
        isSidebarOpen ? styles.open : styles.closed
      }`}
    >
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
                <ChatMenuOptions
                  chatName={search}
                  onDelete={() => handleDeleteSearch(index)}
                  onRename={(newName) => handleRenameSearch(index, newName)}
                />
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
