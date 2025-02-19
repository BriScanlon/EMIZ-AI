import { createContext, useContext, useEffect, useState } from "react";
import { getRecentSearches, getChats } from "../services/api";
import { useChats } from "../hooks/useChats";

const SearchContext = createContext();

function SearchProvider({ children }) {
  const [recentSearches, setRecentSearches] = useState([]);
  const [selectedSearch, setSelectedSearch] = useState(null);

  // const [selectedSearch, setSelectedSearch] = useState(null);

  const [queries, setQueries] = useState([]);
  const [queryResponses, setQueryResponses] = useState([]);

  const { chats, isLoading } = useChats();

  const handleNewQuery = (query) => {
    setQueries((prev) => [...prev, query]);
  };

  const handleNewResponse = (response) => {
    setQueryResponses((prev) => [...prev, response]);
  };

  useEffect(() => {
    setRecentSearches(chats);
  }, [chats]);

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
  console.log("queries", queries);

  const onClickNewChat = () => {
    console.log("Starting new chat...");
    setRecentSearches([]);
    setQueries([]);
    setSelectedSearch(null);
    localStorage.removeItem("selectedSearch"); // Clear local storage when starting new chat
    localStorage.removeItem("queries"); // Clear local storage when starting new chat
    localStorage.removeItem("queryResponses"); // Clear local storage when starting new chat
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

        queries,
        queryResponses,
        handleNewQuery,
        handleNewResponse,
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
