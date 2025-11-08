"use client";

import { XMarkIcon, ArrowsRightLeftIcon } from "@heroicons/react/24/outline";
import { useShallow } from "zustand/react/shallow";
import { useAutomataStore } from "../store";

const ConfigPanel = () => {
  const { nodes, selectedNodeId, setSelectedNodeId, openDataMapModal, updateNodeData, deleteNode } = useAutomataStore(
    useShallow((state) => ({
      nodes: state.nodes,
      selectedNodeId: state.selectedNodeId,
      setSelectedNodeId: state.setSelectedNodeId,
      openDataMapModal: state.openDataMapModal,
      updateNodeData: state.updateNodeData,
      deleteNode: state.deleteNode,
    }))
  );

  // Find the selected node from the nodes array
  const selectedNode = nodes.find(node => node.id === selectedNodeId);

  // Don't render the panel if no node is selected
  if (!selectedNode) {
    return null;
  }

  // Render the configuration UI based on the node type
  const renderConfig = () => {
    switch (selectedNode.type) {
      case "onchain-event":
        return (
          <div>
            <h3 className="text-lg font-bold mb-2">On-Chain Event</h3>
            <p className="mb-4">Configure the contract and event to watch.</p>
            <div className="form-control">
              <label className="label">
                <span className="label-text">Contract Address</span>
              </label>
              <input 
                type="text" 
                placeholder="0x..." 
                className="input input-bordered"
                value={selectedNode.data.contractAddress || ''}
                onChange={(e) =>
                  updateNodeData(selectedNode.id, {
                    ...selectedNode.data,
                    contractAddress: e.target.value,
                  })
                }
              />
            </div>
            <div className="form-control mt-2">
              <label className="label">
                <span className="label-text">Event to Watch</span>
              </label>
              <select 
                className="select select-bordered"
                value={selectedNode.data.eventName || ''}
                onChange={(e) =>
                  updateNodeData(selectedNode.id, {
                    ...selectedNode.data,
                    eventName: e.target.value,
                  })
                }
              >
                <option value="" disabled>
                  Select event
                </option>
                <option>Transfer</option>
                <option>Approval</option>
              </select>
            </div>
            <div className="form-control mt-2">
              <label className="label">
                <span className="label-text">Exclude From Address (Optional)</span>
              </label>
              <input 
                type="text" 
                placeholder="0x... (prevents infinite loops)" 
                className="input input-bordered"
                value={selectedNode.data.excludeFromAddress || ''}
                onChange={(e) =>
                  updateNodeData(selectedNode.id, {
                    ...selectedNode.data,
                    excludeFromAddress: e.target.value,
                  })
                }
              />
              <label className="label">
                <span className="label-text-alt">Excludes events where &apos;from&apos; matches this address</span>
              </label>
            </div>
          </div>
        );
      case "ai-decision":
        return (
          <div>
            <h3 className="text-lg font-bold mb-2">AI Decision</h3>
            <p className="mb-4">Configure the AI prompt.</p>
            <div className="form-control">
              <label className="label">
                <span className="label-text">Prompt</span>
              </label>
              <textarea
                className="textarea textarea-bordered h-24 rounded-lg"
                placeholder="e.g., Is this address a new user?"
                value={selectedNode.data.prompt || ''}
                onChange={(e) =>
                  updateNodeData(selectedNode.id, {
                    ...selectedNode.data,
                    prompt: e.target.value,
                  })
                }
              ></textarea>
            </div>
          </div>
        );
      case "send-usdt":
        return (
          <div>
            <h3 className="text-lg font-bold mb-2">Send USDT</h3>
            <p className="mb-4">Configure the recipient and amount.</p>
            <div className="form-control">
              <label className="label">
                <span className="label-text">Recipient</span>
              </label>
              <div className="join w-full">
                <input
                  type="text"
                  placeholder="e.g., {{Trigger.data.to}}"
                  className="input input-bordered join-item w-full"
                  value={selectedNode.data.recipient || ''}
                  readOnly
                />
                <button
                  className="btn btn-square btn-ghost join-item"
                  onClick={() => openDataMapModal(selectedNode.id, 'recipient')}
                  title="Map data from previous step"
                >
                  <ArrowsRightLeftIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
            <div className="form-control mt-2">
              <label className="label">
                <span className="label-text">Amount</span>
              </label>
              <input 
                type="number" 
                placeholder="10" 
                className="input input-bordered"
                value={selectedNode.data.amount || ''}
                onChange={(e) =>
                  updateNodeData(selectedNode.id, {
                    ...selectedNode.data,
                    amount: e.target.value,
                  })
                }
              />
            </div>
          </div>
        );
      case "mint-nft":
        return (
          <div>
            <h3 className="text-lg font-bold mb-2">Mint NFT</h3>
            <p className="mb-4">Configure the NFT recipient.</p>
            <div className="form-control">
              <label className="label">
                <span className="label-text">Recipient</span>
              </label>
              <div className="join w-full">
                <input
                  type="text"
                  placeholder="e.g., {{Trigger.data.to}}"
                  className="input input-bordered join-item w-full"
                  value={selectedNode.data.recipient || ''}
                  readOnly
                />
                <button
                  className="btn btn-square btn-ghost join-item"
                  onClick={() => openDataMapModal(selectedNode.id, 'recipient')}
                  title="Map data from previous step"
                >
                  <ArrowsRightLeftIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        );
      default:
        return <p>Unknown node type</p>;
    }
  };

  return (
    <div className="w-96 h-full bg-base-200 p-4 shadow-lg z-10 overflow-y-auto">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Configuration</h2>
        <button className="btn btn-ghost btn-sm btn-circle" onClick={() => setSelectedNodeId(null)}>
          <XMarkIcon className="h-6 w-6" />
        </button>
      </div>
      {renderConfig()}
      
      <div className="divider my-4"></div>
      <button
        className="btn btn-error btn-outline w-full"
        onClick={() => deleteNode(selectedNode.id)}
      >
        Delete Node
      </button>
    </div>
  );
};

export default ConfigPanel;