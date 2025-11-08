"use client";

import type { NextPage } from "next";
import { ReactFlowProvider } from "@xyflow/react";
import Sidebar from "./components/Sidebar";
import Canvas from "./components/Canvas";
import ConfigPanel from "./components/ConfigPanel";
import DataMapModal from "./components/DataMapModal";
import "@xyflow/react/dist/style.css";

const AutomataPage: NextPage = () => {
  return (
    // Wrap the entire UI in ReactFlowProvider to use hooks
    <ReactFlowProvider>
      <div className="flex w-full h-[calc(100vh-5rem)] overflow-hidden bg-base-300">
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
    </ReactFlowProvider>
  );
};

export default AutomataPage;