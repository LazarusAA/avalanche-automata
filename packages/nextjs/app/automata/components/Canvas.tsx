"use client";

import { useState, useCallback, useRef, DragEvent } from "react";
import {
  ReactFlow,
  addEdge,
  Controls,
  MiniMap,
  Background,
  BackgroundVariant,
  useReactFlow,
  Node,
} from "@xyflow/react";
import { useShallow } from "zustand/react/shallow";

// Import the custom node components
import OnChainEventNode from "./nodes/OnChainEventNode";
import AiDecisionNode from "./nodes/AiDecisionNode";
import SendUsdtNode from "./nodes/SendUsdtNode";
import MintNftNode from "./nodes/MintNftNode";

// Import the custom edge components
import DataEdge from "./edges/DataEdge";
import ExecutionEdge from "./edges/ExecutionEdge";

// Import the TestRunButton component
import TestRunButton from "./TestRunButton";

// Import the Zustand store
import { useAutomataStore } from "../store";

// Register the custom node types
// This tells React Flow to use our components for these types
const nodeTypes = {
  "onchain-event": OnChainEventNode,
  "ai-decision": AiDecisionNode,
  "send-usdt": SendUsdtNode,
  "mint-nft": MintNftNode,
};

// Register the custom edge types
const edgeTypes = {
  dataEdge: DataEdge,
  executionEdge: ExecutionEdge,
};

const Canvas = () => {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const { nodes, edges, onNodesChange, onEdgesChange, onConnect, onNodesDelete, addNode, setSelectedNodeId } =
    useAutomataStore(
      useShallow((state) => ({
        nodes: state.nodes,
        edges: state.edges,
        onNodesChange: state.onNodesChange,
        onEdgesChange: state.onEdgesChange,
        onConnect: state.onConnect,
        onNodesDelete: state.onNodesDelete,
        addNode: state.addNode,
        setSelectedNodeId: state.setSelectedNodeId,
      }))
    );
  const { screenToFlowPosition } = useReactFlow();

  const onDragOver = useCallback((event: DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const onDrop = useCallback(
    (event: DragEvent) => {
      event.preventDefault();

      const type = event.dataTransfer.getData("application/reactflow");

      // Check if the dropped element is valid
      if (typeof type === "undefined" || !type) {
        return;
      }

      // Get the position where the node was dropped
      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      // This is the new, correct node
      const newNode: Node = {
        id: `${type}-${crypto.randomUUID()}`, // Use crypto.randomUUID for better IDs
        type, // This is the custom type (e.g., "onchain-event")
        position,
        data: {}, // Data will be configured in the ConfigPanel
      };

      addNode(newNode); // Add the new node to the store
    },
    [screenToFlowPosition, addNode],
  );

  return (
    <div className="flex-1 h-full relative" ref={reactFlowWrapper}>
      {/* Workflow Status Indicator */}
      {nodes.some(n => n.type === 'onchain-event' && n.data.contractAddress && n.data.eventName) && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 badge badge-success gap-2">
          <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
          Workflow Active - Listening for events
        </div>
      )}
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodesDelete={onNodesDelete}
        onDrop={onDrop}
        onDragOver={onDragOver}
        nodeTypes={nodeTypes} // Pass the custom node types
        edgeTypes={edgeTypes} // Pass the custom edge types
        onNodeClick={(_, node) => setSelectedNodeId(node.id)} // Set selected node on click
        onPaneClick={() => setSelectedNodeId(null)} // Clear selection on pane click
        fitView
      >
        <Controls className="react-flow-controls-daisy" />
        <MiniMap className="!bg-base-200 rounded-box shadow-md" />
        <Background variant={BackgroundVariant.Dots} gap={12} size={1} className="!bg-base-100" />
      </ReactFlow>
      {/* Test Run Button */}
      <TestRunButton />
    </div>
  );
};

export default Canvas;