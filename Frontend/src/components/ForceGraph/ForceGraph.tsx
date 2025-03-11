import { useEffect, useRef, useState } from 'react';
import * as echarts from 'echarts';
import { GraphResponse } from '../../contexts/chatContext';

export default function ForceGraph({
  graphData = { nodes: [], links: [], categories: [] },
}: {
  graphData: GraphResponse;
}) {
  const chartRef = useRef(null);
  const [dimensions, setDimensions] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    function handleResize() {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
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

    if (myChart) {
      myChart.showLoading();

      const option: echarts.EChartsCoreOption = {
        title: {
          text: '',
          top: 'top',
          left: 'left',
          textStyle: {
            fontSize: 30,
            color: '#5470C6',
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
              color: '#5470C6',
            },

            top: 'bottom',
          },
        ],
        animationDuration: 1500,
        animationEasingUpdate: 'quinticInOut',
        color: ['#5470C6', 'orange', 'red', 'green'],
        series: [
          {
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
              gravity: 0.1,
            },
            label: {
              show: true,
              position: 'right',
              formatter: '{b}',
              fontSize: 20,
              fontWeight: 600,
              overflow: 'break',
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
              color: 'source',
              curveness: 0.0,
            },
            emphasis: {
              focus: 'adjacency',
              lineStyle: {
                width: 10,
              },
            },
          },
        ],
      };

      myChart.setOption(option);
      myChart.hideLoading();

      myChart.on('click', function (params) {
        if (params.componentType === 'series' && params.dataType === 'node') {
          myChart.dispatchAction({
            type: 'focusNodeAdjacency',
            seriesIndex: 0,
            dataIndex: params.dataIndex,
          });
        }
      });

      return () => {
        myChart.dispose();
      };
    }
  }, [graphData, dimensions]);

  return <div ref={chartRef} style={{ width: '100%', height: 'calc(100vh - 64px)' }}></div>;
}
