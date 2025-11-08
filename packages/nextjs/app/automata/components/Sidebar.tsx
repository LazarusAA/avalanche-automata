"use client";

import React, { DragEvent } from "react";
import { BoltIcon, CpuChipIcon, BanknotesIcon, PhotoIcon } from "@heroicons/react/24/outline";

// New hierarchical data structure
const nodePalette = {
  triggers: {
    title: "Triggers",
    nodes: [
      {
        type: "onchain-event",
        label: "On-Chain Event",
        icon: BoltIcon,
        color: "text-error",
        description: "Starts workflow on a blockchain event",
      },
    ],
  },
  logic: {
    title: "Logic",
    nodes: [
      {
        type: "ai-decision",
        label: "AI Decision",
        icon: CpuChipIcon,
        color: "text-error",
        description: "Uses AI to route the workflow (True/False)",
      },
    ],
  },
  actions: {
    title: "Actions",
    nodes: [
      {
        type: "send-usdt",
        label: "Send USDT",
        icon: BanknotesIcon,
        color: "text-error",
        description: "Sends USDT tokens",
      },
      {
        type: "mint-nft",
        label: "Mint NFT",
        icon: PhotoIcon,
        color: "text-error",
        description: "Mints a new NFT to a wallet",
      },
    ],
  },
};

// Sidebar component with draggable nodes
const Sidebar = () => {
  const onDragStart = (event: DragEvent, nodeType: string) => {
    // Set the data to be transferred
    event.dataTransfer.setData("application/reactflow", nodeType);
    event.dataTransfer.effectAllowed = "move";
  };

  return (
    <div className="w-96 h-full bg-base-200 overflow-y-auto overflow-x-hidden shadow-lg z-10">
      <div className="p-6 border-b border-base-300">
        <h2 className="text-2xl font-bold">Nodes</h2>
      </div>
      
      <div className="p-4">
        {Object.values(nodePalette).map((group, index) => (
          <div key={group.title} className={index > 0 ? "mt-6" : ""}>
            {/* Category Header */}
            <div className="px-2 mb-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-base-content/60">
                {group.title}
              </h3>
            </div>
            
            {/* Nodes */}
            <div className="space-y-1">
              {group.nodes.map(node => {
                const IconComponent = node.icon;
                return (
                  <div
                    key={node.type}
                    draggable
                    onDragStart={event => onDragStart(event, node.type)}
                    className="flex items-center gap-3 px-3 py-3 rounded-md cursor-move transition-all hover:bg-base-300 active:scale-[0.98] select-none"
                  >
                    <IconComponent className={`h-6 w-6 flex-shrink-0 ${node.color}`} />
                    <span className="text-base font-medium">{node.label}</span>
                  </div>
                );
              })}
            </div>
            
            {/* Divider between groups (except last) */}
            {index < Object.values(nodePalette).length - 1 && (
              <div className="mt-6 border-t border-base-300" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Sidebar;