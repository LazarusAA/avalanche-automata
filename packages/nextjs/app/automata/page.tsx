"use client";

import { useState, useCallback, useRef, DragEvent } from "react";
import type { NextPage } from "next";
import {
  ReactFlow,
  ReactFlowProvider,
  addEdge,
  useNodesState,
  useEdgesState,
  Controls,
  MiniMap,
  Background,
  Connection,
  Edge,
  Node,
  BackgroundVariant,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { BoltIcon, CpuChipIcon, BanknotesIcon, PhotoIcon } from "@heroicons/react/24/outline";

// Node types available in the sidebar
const nodeTypes = [
  {
    id: "onchain-event",
    label: "On-Chain Event",
    icon: BoltIcon,
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
  {
    id: "ai-decision",
    label: "AI Decision",
    icon: CpuChipIcon,
    color: "text-secondary",
    bgColor: "bg-secondary/10",
  },
  {
    id: "send-usdt",
    label: "Send USDT",
    icon: BanknotesIcon,
    color: "text-accent",
    bgColor: "bg-accent/10",
  },
  {
    id: "mint-nft",
    label: "Mint NFT",
    icon: PhotoIcon,
    color: "text-success",
    bgColor: "bg-success/10",
  },
];

// Sidebar component with draggable nodes
const Sidebar = () => {
  const onDragStart = (event: DragEvent, nodeType: string, nodeLabel: string) => {
    event.dataTransfer.setData("application/reactflow", nodeType);
    event.dataTransfer.setData("application/reactflow-label", nodeLabel);
    event.dataTransfer.effectAllowed = "move";
  };

  return (
    <div className="w-64 h-full bg-base-200 p-4 overflow-y-auto">
      <h2 className="text-xl font-bold mb-4">Nodes</h2>
      <div className="space-y-3">
        {nodeTypes.map((nodeType) => {
          const IconComponent = nodeType.icon;
          return (
            <div
              key={nodeType.id}
              draggable
              onDragStart={(event) => onDragStart(event, nodeType.id, nodeType.label)}
              className={`card ${nodeType.bgColor} shadow-md cursor-move hover:shadow-lg transition-all active:scale-95`}
            >
              <div className="card-body p-4">
                <div className="flex items-center gap-3">
                  <IconComponent className={`h-6 w-6 ${nodeType.color}`} />
                  <span className="font-medium text-sm">{nodeType.label}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Canvas component with React Flow
const Canvas = () => {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState([] as Node[]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([] as Edge[]);
  const [reactFlowInstance, setReactFlowInstance] = useState<any>(null);

  const onConnect = useCallback(
    (params: Connection | Edge) => setEdges((eds) => addEdge(params, eds)),
    [setEdges],
  );

  const onDragOver = useCallback((event: DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const onDrop = useCallback(
    (event: DragEvent) => {
      event.preventDefault();

      const type = event.dataTransfer.getData("application/reactflow");
      const label = event.dataTransfer.getData("application/reactflow-label");

      // Check if the dropped element is valid
      if (typeof type === "undefined" || !type) {
        return;
      }

      // Get the position where the node was dropped
      const position = reactFlowInstance?.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const newNode: Node = {
        id: `${type}-${Date.now()}`,
        type: "default",
        position,
        data: { label: label || type },
        style: {
          background: "#ffffff",
          border: "2px solid #ddd",
          borderRadius: "8px",
          padding: "10px",
        },
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [reactFlowInstance, setNodes],
  );

  return (
    <div className="flex-1 h-full" ref={reactFlowWrapper}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onInit={setReactFlowInstance}
        onDrop={onDrop}
        onDragOver={onDragOver}
        fitView
      >
        <Controls />
        <MiniMap />
        <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
      </ReactFlow>
    </div>
  );
};

// Main Automata page
const AutomataPage: NextPage = () => {
  return (
    <div className="flex w-full h-[calc(100vh-5rem)] overflow-hidden">
      <ReactFlowProvider>
        <Sidebar />
        <Canvas />
      </ReactFlowProvider>
    </div>
  );
};

export default AutomataPage;

