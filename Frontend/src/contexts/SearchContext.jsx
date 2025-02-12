// import { createContext, useContext, useState, useEffect } from "react";

// const SearchContext = createContext();



// function SearchProvider({ children }) {

//     const recentSearchesTestData = [
//         {
//           value: "https://www.gov.uk/aaib-reports/aaib-investigation-to-boeing-737-8k5-g-tawd",
//           label: "AAIB investigation to Boeing 737-8K5, G-TAWD",
//         },
//         {
//           value: "https://www.gov.uk/aaib-reports/aaib-investigation-to-spitfire-ixt-g-lfix-6-may-2024",
//           label: "AAIB investigation to Spitfire IXT, G-LFIX, 6 May 2024",
//         },
//         {
//           value: "https://www.gov.uk/aaib-reports/aaib-statement-on-launcherone-launch-failure",
//           label: "AAIB Statement on LauncherOne launch failure",
//         },
//         {
//           value: "https://www.gov.uk/aaib-reports/aaib-investigation-to-beagle-b121-series-2-pup-g-azcz",
//           label: "AAIB investigation to Beagle B121 Series 2 Pup, G-AZCZ",
//         },
//         {
//           value: "https://www.gov.uk/aaib-reports/aaib-investigation-to-boeing-767-332-er-n197dn",
//           label: "AAIB investigation to Boeing 767-332, N197DN",
//         },
//       ];

//   const [searchRequests, setSearchRequests] = useState([]);
//   const [recentSearches, setRecentSearches] = useState(recentSearchesTestData);

//   // Add a new search request
//   const addSearchRequest = (query) => {
//     const timestamp = Date.now();
//     const newRequest = { id: timestamp, text: query, timestamp };

//     // Update search requests
//     setSearchRequests((prevRequests) => [newRequest, ...prevRequests]);
//   };

//   // Handle "New Chat" functionality
//   const startNewChat = () => {
//     // Reset the search stack and start a fresh search
//     setSearchRequests([]);

//     // Optionally, you can add an empty or default request for "New Chat"
//     addSearchRequest("New Chat Started");
//   };

//   // Update recent searches based on timestamp logic
//   useEffect(() => {
//     const now = Date.now();
//     const updatedSearches = searchRequests.map((request) => ({
//       ...request,
//       tag:
//         now - request.timestamp < 24 * 60 * 60 * 1000
//           ? "Today"
//           : "Previous 7 days",
//     }));
//     setRecentSearches(updatedSearches);
//   }, [searchRequests]);

//   return (
//     <SearchContext.Provider
//       value={{
//         searchRequests,
//         recentSearches,
//         onClickNewChat: startNewChat, // Calls startNewChat instead
//         onAddSearchRequest: addSearchRequest,
//       }}
//     >
//       {children}
//     </SearchContext.Provider>
//   );
// }

// const useSearch = () => {
//   const context = useContext(SearchContext);
//   if (context === undefined) {
//     throw new Error(
//       "The SearchContext was used outside of the SearchProvider"
//     );
//   }
//   return context;
// };

// export { SearchProvider, useSearch };


import { createContext, useContext, useEffect, useState } from "react";
// import { handleScrape } from "../helpers/ScraperForm"; // Import the updated form
import { getRecentSearches } from "../services/api"; // Import the service function

const SearchContext = createContext();

function SearchProvider({ children }) {
  const [recentSearches, setRecentSearches] = useState([]);
  const [selectedSearch, setSelectedSearch] = useState(null);
  const [chatGPTResponse, setChatGPTResponse] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchRecentSearches = async () => {
      try {
        const fetchedData = await getRecentSearches();
        setRecentSearches(fetchedData);
      } catch (error) {
        console.error("Failed to fetch recent searches", error);
      }
    };

    fetchRecentSearches();
  }, [recentSearches]);

  const onClickNewChat = () => {
    console.log('Starting new chat...');
    setRecentSearches([]);
  };

  const handleRecentSearchClick = (search) => {
    console.log('Clicked on recent search:', search.value);
    setSelectedSearch(search);
    // Trigger the scraping and ChatGPT response logic
    setSelectedSearch(search); // Update the search state
    // Pass the URLs to handleScrape here
  };

  useEffect(() => {
    if (!selectedSearch) return; // Ensure selectedSearch is not null before calling handleScrape
  
    // handleScrape(selectedSearch.value);
  }, [selectedSearch]); // Re-run when selectedSearch changes
  

  return (
    <SearchContext.Provider value={{ onClickNewChat, recentSearches, handleRecentSearchClick }}>
      {children}
    </SearchContext.Provider>
  );
}

function useSearch() {
  const context = useContext(SearchContext);
  if (context === undefined)
    throw new Error(
      'The SearchContext was used outside of the SearchProvider',
    );
  return context;
}

export { SearchProvider, useSearch };
