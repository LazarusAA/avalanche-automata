"use client";

import { useState } from "react";
import type { NextPage } from "next";
import { ReactFlowProvider } from "@xyflow/react";
import Sidebar from "./components/Sidebar";
import Canvas from "./components/Canvas";
import ConfigPanel from "./components/ConfigPanel";
import DataMapModal from "./components/DataMapModal";
import { DemoModeModal } from "~~/components/DemoModeModal";
import "@xyflow/react/dist/style.css";

const AutomataPage: NextPage = () => {
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);

  return (
    // Wrap the entire UI in ReactFlowProvider to use hooks
    <ReactFlowProvider>
      <div className="flex w-full h-[calc(100vh-5rem)] overflow-hidden bg-base-300">
        {/* Demo Mode Badge - Top Right */}
        <div className="absolute top-6 right-6 z-30">
          <button
            className="badge badge-success badge-lg gap-2 cursor-pointer hover:scale-105 transition-transform shadow-lg"
            onClick={() => setIsDemoModalOpen(true)}
          >
            <span className="text-lg">🚀</span>
            <span className="font-semibold">Demo Mode</span>
          </button>
        </div>

        {/* 1. Left Sidebar: Draggable nodes */}
        <Sidebar />

        {/* 2. Center Canvas: The main workflow editor */}
        <div className="flex-1 h-full">
          <Canvas />
        </div>

        {/* 3. Right Config Panel: "Progressive Disclosure" */}
        <ConfigPanel />
      </div>
      <DataMapModal />
      <DemoModeModal isOpen={isDemoModalOpen} onClose={() => setIsDemoModalOpen(false)} />
    </ReactFlowProvider>
  );
};

export default AutomataPage;