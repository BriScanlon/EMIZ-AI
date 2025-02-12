import React, { useRef, useEffect } from "react";
import ForceGraph3D from "react-force-graph-3d";
import { CSS2DObject } from "three/examples/jsm/renderers/CSS2DRenderer.js";
import * as THREE from "three";

const graphData = {
  nodes: [
    { id: "1", name: "Engineering", category: 0 },
    { id: "2", name: "Aerospace", category: 1 },
    { id: "3", name: "AI Research", category: 1 },
    { id: "4", name: "Software", category: 2 },
    { id: "5", name: "Physics", category: 2 },
    { id: "6", name: "Quantum Computing", category: 2 },
    { id: "7", name: "Data Science", category: 3 },
    { id: "8", name: "Machine Learning", category: 3 },
  ],
  links: [
    { source: "1", target: "2" },
    { source: "1", target: "3" },
    { source: "3", target: "4" },
    { source: "3", target: "5" },
    { source: "5", target: "6" },
    { source: "4", target: "7" },
    { source: "7", target: "8" },
    { source: "8", target: "6" },
  ],
};

const ForceGraph3DComponent = () => {
  const fgRef = useRef();

  useEffect(() => {
    if (fgRef.current) {
      fgRef.current.d3Force("charge").strength(-300);
    }
  }, []);

  return (
    <ForceGraph3D
      ref={fgRef}
      graphData={graphData}
      nodeAutoColorBy="category"
      linkDirectionalParticles={5}
      linkDirectionalParticleSpeed={() => 0.005}
      nodeThreeObject={(node) => {
        // Create a div element
        const nodeLabel = document.createElement("div");
        nodeLabel.textContent = node.name;
        nodeLabel.style.color = "#fff";
        nodeLabel.style.backgroundColor = "rgba(255, 244, 244, 0.19)";
        nodeLabel.style.padding = "4px";
        nodeLabel.style.borderRadius = "3px";
        nodeLabel.style.fontSize = "12px";

        // Convert div to a CSS2DObject
        const label = new CSS2DObject(nodeLabel);
        label.position.set(0, 10, 0); // Adjust label position
        return label;
      }}
    />
  );
};

export default ForceGraph3DComponent;
