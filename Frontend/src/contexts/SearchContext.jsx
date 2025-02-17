import { createContext, useContext, useEffect, useState } from "react";
import { getRecentSearches, getChats } from "../services/api";
import { useChats } from "../hooks/useChats";

const SearchContext = createContext();

function SearchProvider({ children }) {
  const [recentSearches, setRecentSearches] = useState([]);
  const [selectedSearch, setSelectedSearch] = useState(null);
  // const [selectedSearch, setSelectedSearch] = useState(null);

  const { chats, isLoading } = useChats();

  useEffect(() => {
    setRecentSearches(chats);
  }, [chats]);

  console.log(selectedSearch);

  // Save selectedSearch to localStorage whenever it changes
  useEffect(() => {
    if (selectedSearch) {
      localStorage.setItem("selectedSearch", JSON.stringify(selectedSearch));
    }
  }, [selectedSearch]);

  // useEffect(() => {
  //   if (!selectedSearch && recentSearches && recentSearches.length > 0) {
  //     setSelectedSearch(recentSearches[recentSearches.length - 1]);
  //   }
  // }, [selectedSearch, recentSearches]);

  console.log(selectedSearch);

  const onClickNewChat = () => {
    console.log("Starting new chat...");
    setRecentSearches([]);
    setSelectedSearch(null);
    localStorage.removeItem("selectedSearch"); // Clear local storage when starting new chat
  };

  const handleRecentSearchClick = (search) => {
    console.log("Clicked on recent search:", search);
    setSelectedSearch(search);
  };

  return (
    <SearchContext.Provider
      value={{
        selectedSearch,
        onClickNewChat,
        recentSearches,
        handleRecentSearchClick,
      }}
    >
      {children}
    </SearchContext.Provider>
  );
}

function useSearch() {
  const context = useContext(SearchContext);
  if (context === undefined)
    throw new Error("The SearchContext was used outside of the SearchProvider");
  return context;
}

export { SearchProvider, useSearch };
