import React, { useState } from "react";
import { FaTable, FaChartBar, FaList, FaArrowLeft } from "react-icons/fa";
import ForceGraph2 from "../../components/Graphs/ForceGraph/ForceGraph2";
import Table from "../../components/Table/Table";
import ChatSummaryResponse from "../../components/ChatResponse/ChatSummaryResponse";
import Navbar from "../../components/Navbar/Navbar";

const ResponseLayout = ({ onBack }) => {
  const [view, setView] = useState("graph");

  return (
    <div className="p-4 min-h-screen bg-gray-900 text-white">
      {/* <Navbar/> */}

      {/* Back Button */}
      <button onClick={onBack} className="flex items-center mb-4 text-white">
        <FaArrowLeft className="mr-2" /> Back to Home
      </button>

      {/* Toggle Buttons */}
      <div className="flex gap-4 mb-4">
        {view !== "graph" && (
          <button
            onClick={() => setView("graph")}
            className="flex items-center gap-2 p-2 bg-blue-600 rounded-md"
          >
            <FaChartBar /> Switch to Graph
          </button>
        )}
        {view !== "table" && (
          <button
            onClick={() => setView("table")}
            className="flex items-center gap-2 p-2 bg-green-600 rounded-md"
          >
            <FaTable /> Switch to Table
          </button>
        )}
        {view !== "summary" && (
          <button
            onClick={() => setView("summary")}
            className="flex items-center gap-2 p-2 bg-yellow-600 rounded-md"
          >
            <FaList /> Switch to Summary
          </button>
        )}
      </div>

      {/* View Rendering */}
      <div className="border border-gray-700 p-4 rounded-lg">
        {view === "graph" && <ForceGraph2 />}
        {view === "table" && <Table />}
        {view === "summary" && <ChatSummaryResponse  />}
      </div>
    </div>
  );
};

export default ResponseLayout;
