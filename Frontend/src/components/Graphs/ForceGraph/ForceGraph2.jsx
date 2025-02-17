<<<<<<< HEAD
import React, { useEffect, useRef, useState } from "react";
import * as echarts from "echarts";
import { useChatHistory } from "../../../hooks/useChatHistory";
import { useSearch } from "../../../contexts/SearchContext";
import { getNodeData, getChatHistory } from "../../../services/api";
import Spinner from "../../../ui/Spinner/Spinner";
import { useLocation, useSearchParams } from "react-router";

function ForceGraph2() {
  const [graphData, setGraphData] = useState(null); // State to hold the fetched data
  const chartRef = useRef(null);
  const [dimensions, setDimensions] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  // Extract 'data' parameter from URL
  const [searchParams] = useSearchParams();
  const dataIndex = searchParams.get("chat_id");

  const { selectedSearch: chatNameFromContext } = useSearch();
  const chatName =
    chatNameFromContext || JSON.parse(localStorage.getItem("selectedSearch"));
  const { results: chats, isLoading, isError } = useChatHistory(chatName);

  console.log("Chat Name:", chatName);

=======
// src/components/Graphs/ForceGraph/ForceGraph.jsx
import React, { useEffect, useRef, useState } from 'react';
import * as echarts from 'echarts';

function ForceGraph2() {
  const graphData = {
    nodes: [
      { id: '0', name: 'AAIB Investigations', category: 0 },
      { id: '1', name: 'AAIB investigation to Boeing 737-8K5, G-TAWD', category: 1 },
      { id: '2', name: 'AAIB investigation to Spitfire IXT, G-LFIX, 6 May 2024', category: 1 },
      { id: '3', name: 'AAIB Statement on LauncherOne launch failure', category: 1 },
      { id: '4', name: 'AAIB investigation to Beagle B121 Series 2 Pup, G-AZCZ', category: 1 },
      { id: '5', name: 'AAIB investigation to Boeing 767-332, N197DN', category: 1 },
    ],
    links: [
      { source: '0', target: '1' }, // Link from Component to Failure
      { source: '0', target: '2' }, // Link from Failure to Root Cause
      { source: '0', target: '3' },
      { source: '0', target: '4' } ,
      { source: '0', target: '5' } // Link from Root Cause to Mitigation
    ],
    categories: [
      { id: 0, name: 'Source' },
      { id: 1, name: 'Reports' }

    ]
  };

  const { nodes, links, categories } = graphData;
  const chartRef = useRef(null);
  const [dimensions, setDimensions] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  });

>>>>>>> 466bea6d8b5d6752cfbcc12ac9bff7e984035da5
  useEffect(() => {
    function handleResize() {
      setDimensions({
        width: window.innerWidth,
<<<<<<< HEAD
        height: window.innerHeight,
      });
    }

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  if (!chats) {
    console.warn("No chat history found.");
    // return null;
  }

  useEffect(() => {
    if (dataIndex !== null) {
      const index = parseInt(dataIndex, 10);
      if (!isNaN(index) && chats) {
        setGraphData(chats[index]?.graph);
        console.log(chats[index]?.graph || null);
      }
    }
  }, [dataIndex, chats]);

  useEffect(() => {
    if (!graphData) return;

    const myChart = chartRef.current
      ? echarts.init(chartRef.current, "light")
      : null;
=======
        height: window.innerHeight
      });
    }

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  useEffect(() => {
    if (!graphData) return;

    const myChart = chartRef.current ? echarts.init(chartRef.current, 'light') : null;
>>>>>>> 466bea6d8b5d6752cfbcc12ac9bff7e984035da5

    if (myChart) {
      myChart.showLoading();

      const option = {
        title: {
<<<<<<< HEAD
          text: "",
          top: "top",
          left: "left",
          textStyle: {
            fontSize: 30,
            color: "#5470C6",
          },
        },
        tooltip: {
          show: false,
          width: 150,
        },
        legend: [
          {
            data: graphData.categories.map((a) => a.name),
            textStyle: {
              fontSize: 30,
              fontWeight: 600,
              color: "#5470C6",
            },
            top: "bottom",
          },
        ],
        animationDuration: 1500,
        animationEasingUpdate: "quinticInOut",
        color: ["#5470C6", "orange", "red", "green"],
        series: [
          {
            name: "Engineering Report",
            type: "graph",
            layout: "force",
            data: graphData.nodes,
            edges: graphData.links,
            categories: graphData.categories,
            roam: true,
            draggable: true,
            force: {
              edgeLength: 250,
              repulsion: 1000,
              gravity: 0.1,
            },
            label: {
              show: true,
              position: "right",
              formatter: "{b}",
              fontSize: 20,
              fontWeight: 600,
              overflow: "break",
              width: 300,
            },
            labelLayout: {
              hideOverlap: false,
            },
            scaleLimit: {
              min: 0.4,
              max: 2,
            },
            lineStyle: {
              color: "source",
              curveness: 0.0,
            },
            emphasis: {
              focus: "adjacency",
              lineStyle: {
                width: 10,
              },
            },
          },
        ],
=======
          text: '',
          top: 'top',
          left: 'left',
          textStyle: {
            fontSize: 30,
            color: '#5470C6'
          }
        },
        tooltip: {
          show: false,
          width: 150
        },
        legend: [{
          data: graphData.categories.map(a => a.name),
          textStyle: {
            fontSize: 30,
            fontWeight: 600,
            color: '#5470C6'
          },
          top: 'bottom'
        }],
        animationDuration: 1500,
        animationEasingUpdate: 'quinticInOut',
        color: ['#5470C6', 'orange', 'red', 'green'],
        series: [{
          name: 'Engineering Report',
          type: 'graph',
          layout: 'force',
          data: graphData.nodes,
          edges: graphData.links,
          categories: graphData.categories,
          roam: true,
          draggable: true,
          force: {
            edgeLength: 250,
            repulsion: 1000,
            gravity: 0.1
          },
          label: {
            show: true,
            position: 'right',
            formatter: '{b}',
            fontSize: 20,
            fontWeight: 600,
            overflow: 'break',
            width: 300
          },
          labelLayout: {
            hideOverlap: false
          },
          scaleLimit: {
            min: 0.4,
            max: 2
          },
          lineStyle: {
            color: 'source',
            curveness: 0.0
          },
          emphasis: {
            focus: 'adjacency',
            lineStyle: {
              width: 10
            }
          }
        }]
>>>>>>> 466bea6d8b5d6752cfbcc12ac9bff7e984035da5
      };

      myChart.setOption(option);
      myChart.hideLoading();

<<<<<<< HEAD
      myChart.on("click", function (params) {
        if (params.componentType === "series" && params.dataType === "node") {
          myChart.dispatchAction({
            type: "focusNodeAdjacency",
            seriesIndex: 0,
            dataIndex: params.dataIndex,
=======
      myChart.on('click', function (params) {
        if (params.componentType === 'series' && params.dataType === 'node') {
          myChart.dispatchAction({
            type: 'focusNodeAdjacency',
            seriesIndex: 0,
            dataIndex: params.dataIndex
>>>>>>> 466bea6d8b5d6752cfbcc12ac9bff7e984035da5
          });
        }
      });

      return () => {
        myChart.dispose();
      };
    }
  }, [graphData, dimensions]);

<<<<<<< HEAD
  // if (!graphData) return <Spinner />;

  // if (isLoading) return <p>Loading chat history...</p>;
  // if (isError) return <p>Failed to load chat history.</p>;
  return (
    <div
      ref={chartRef}
      style={{ width: "100vw", height: "calc(100vh - 64px)" }}
    ></div>
  );
=======
  return <div ref={chartRef} style={{ width: '100vw', height: 'calc(100vh - 64px)' }}></div>;
>>>>>>> 466bea6d8b5d6752cfbcc12ac9bff7e984035da5
}

export default ForceGraph2;
