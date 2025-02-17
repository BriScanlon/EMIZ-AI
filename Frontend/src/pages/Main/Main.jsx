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
