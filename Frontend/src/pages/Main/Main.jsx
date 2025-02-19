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
  const { queries, recentSearches } = useSearch(); // Get recent searches from context

  // const [queries, setQueries] = useState([]);
  // const [queryResponses, setQueryResponses] = useState([]);

  // const handleNewQuery = (query) => {
  //   setQueries((prev) => [...prev, query]);
  // };

  // const handleNewResponse = (response) => {
  //   setQueryResponses((prev) => [...prev, response]);
  // };
  // console.log(queries);
  // console.log(queryResponses);
  return (
    <div>
      {!queries || !recentSearches || recentSearches.length === 0 ? (
        <SuggestedQuestions />
      ) : (
        <Chat
        // queries={queries}
        // queryResponses={queryResponses}
        // handleNewQuery={handleNewQuery}
        // handleNewResponse={handleNewResponse}
        />
      )}
      <QueryForm
      // handleNewQuery={handleNewQuery}
      // handleNewResponse={handleNewResponse}
      />
    </div>
  );
};

export default Main;

// import { useState, useEffect } from "react";
// import Chat from "../../components/Chat/Chat";
// import QueryForm from "../../components/QueryForm/QueryForm";
// import SuggestedQuestions from "../../components/SuggestedQuestions/SuggestedQuestions";
// import { useSearch } from "../../contexts/SearchContext";

// const Main = () => {
//   const { recentSearches } = useSearch(); // Get recent searches from context

//   const [queries, setQueries] = useState(() => {
//     const savedQueries = localStorage.getItem("queries");
//     return savedQueries ? JSON.parse(savedQueries) : [];
//   });

//   const [queryResponses, setQueryResponses] = useState(() => {
//     const savedResponses = localStorage.getItem("queryResponses");
//     return savedResponses ? JSON.parse(savedResponses) : [];
//   });

//   useEffect(() => {
//     localStorage.setItem("queries", JSON.stringify(queries));
//   }, [queries]);

//   useEffect(() => {
//     localStorage.setItem("queryResponses", JSON.stringify(queryResponses));
//   }, [queryResponses]);

//   const handleNewQuery = (query) => {
//     setQueries((prev) => [...prev, query]);
//   };

//   const handleNewResponse = (response) => {
//     setQueryResponses((prev) => [...prev, response]);
//   };

//   return (
//     <div>
//       {!recentSearches || recentSearches.length === 0 ? (
//         <SuggestedQuestions />
//       ) : (
//         <Chat
//           queries={queries}
//           queryResponses={queryResponses}
//           handleNewQuery={handleNewQuery}
//           handleNewResponse={handleNewResponse}
//         />
//       )}
//       <QueryForm
//         handleNewQuery={handleNewQuery}
//         handleNewResponse={handleNewResponse}
//       />
//     </div>
//   );
// };

// export default Main;
