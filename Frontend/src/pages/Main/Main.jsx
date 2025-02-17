<<<<<<< HEAD
// import { useState } from "react";
// import Chat from "../../components/Chat/Chat";
// import QueryForm from "../../components/QueryForm/QueryForm";
// import SuggestedQuestions from "../../components/SuggestedQuestions/SuggestedQuestions";
// import { useSearch } from "../../contexts/SearchContext";

// const Main = () => {
//   const { recentSearches } = useSearch(); // Get recent searches from context

//   const [queries, setQueries] = useState([]);
//   const [queryResponses, setQueryResponses] = useState([]);

//   return (
//     <div>
//       {!recentSearches || recentSearches.length === 0 ? (
//         <SuggestedQuestions />
//       ) : (
//         <Chat queries={queries} queryResponses={queryResponses} />
//       )}
//       <QueryForm
//         setQueries={setQueries}
//         setQueryResponses={setQueryResponses}
//       />
//     </div>
//   );
// };

// export default Main;

import { useState } from "react";
import Chat from "../../components/Chat/Chat";
import QueryForm from "../../components/QueryForm/QueryForm";
import SuggestedQuestions from "../../components/SuggestedQuestions/SuggestedQuestions";
import { useSearch } from "../../contexts/SearchContext";

const Main = () => {
  const { recentSearches } = useSearch(); // Get recent searches from context

  const [queries, setQueries] = useState([]);
  const [queryResponses, setQueryResponses] = useState([]);

  const handleNewQuery = (query) => {
    setQueries((prev) => [...prev, query]);
  };

  const handleNewResponse = (response) => {
    setQueryResponses((prev) => [...prev, response]);
  };
  console.log(queryResponses);
  return (
    <div>
      {!recentSearches || recentSearches.length === 0 ? (
        <SuggestedQuestions />
      ) : (
        <Chat
          queries={queries}
          queryResponses={queryResponses}
          handleNewQuery={handleNewQuery}
          handleNewResponse={handleNewResponse}
        />
      )}
      <QueryForm
        handleNewQuery={handleNewQuery}
        handleNewResponse={handleNewResponse}
      />
    </div>
  );
};

export default Main;
=======
import { useState } from "react";
import styles from "./Main.module.scss";
import PdfUpload from "../../components/PdfUpload/PdfUpload";
import ChatForm from "../../components/ChatForm/ChatForm";
import Navbar from "../../components/Navbar/Navbar";
import Sidebar from "../../components/Sidebar/Sidebar";
import { SearchProvider } from "../../contexts/SearchContext";
import Footer from "../../components/Footer/Footer";
import Chat from "../../components/Chat/Chat";

export default function Main({ showPdfUpload }) {
  const [isSidebarOpen, setSidebarOpen] = useState(true);

  const toggleSidebar = () => setSidebarOpen(!isSidebarOpen);

  //   const clearSearch = (id) => {
//     setRecentSearches(recentSearches.filter((search) => search.id !== id));
//   }; 

  return (
    <SearchProvider>
      <div className={styles["main-content"]}>
        <Navbar toggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} />
        <div className={styles["sidebar-main"]}>
          <div className={`${styles.sidebar} ${!isSidebarOpen ? styles.collapsed : ""}`}>
            <Sidebar isSidebarOpen={isSidebarOpen} />
          </div>
          <div className={`${styles["main-section"]} ${!isSidebarOpen ? styles["full-width"] : ""}`}>
            {showPdfUpload ? <PdfUpload /> : <Chat />}
          </div>
        </div>
        <Footer/>
      </div>
    </SearchProvider>
  );
}
>>>>>>> 466bea6d8b5d6752cfbcc12ac9bff7e984035da5
