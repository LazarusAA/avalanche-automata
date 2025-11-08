"use client";
import { useAutomataStore } from "../store";

// Placeholder schema for node outputs
const NODE_OUTPUT_SCHEMA = {
  "onchain-event": {
    label: "[Trigger] On-Chain Event",
    outputs: [
      { key: "from", label: "from (address)" },
      { key: "to", label: "to (address)" },
      { key: "value", label: "value (number)" },
    ],
  },
};

export default function DataMapModal() {
  const {
    isDataMapModalOpen,
    dataMapModalTarget,
    closeDataMapModal,
    updateNodeData,
    nodes,
    edges,
  } = useAutomataStore();

  if (!isDataMapModalOpen || !dataMapModalTarget) return null;

  // TODO: Implement graph traversal logic here
  // For now, we'll just show a placeholder for the "onchain-event"
  const availableData = [NODE_OUTPUT_SCHEMA['onchain-event']]; // Placeholder

  const handlePillClick = (path: string) => {
    const { nodeId, field } = dataMapModalTarget;
    // The path would be constructed, e.g., '{{trigger-id.data.to}}'
    // For this demo, we just set the example path
    const examplePath = `{{Trigger.data.${path}}}`;
    updateNodeData(nodeId, field, examplePath);
    closeDataMapModal();
  };

  return (
    <dialog id="data_map_modal" className="modal modal-open">
      <div className="modal-box">
        <h3 className="font-bold text-lg">Connect Data from a Previous Step</h3>
        <p className="py-4">Select an output from a previous node to use as the value for the '{dataMapModalTarget.field}' field.</p>
        
        <div className="space-y-4">
          {availableData.map(nodeData => (
            <div key={nodeData.label}>
              <h4 className="font-semibold">{nodeData.label}</h4>
              <div className="flex flex-wrap gap-2 mt-2">
                {nodeData.outputs.map(output => (
                  <button
                    key={output.key}
                    className="btn btn-sm btn-outline btn-primary"
                    onClick={() => handlePillClick(output.key)}
                  >
                    {output.label}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="modal-action">
          <button className="btn" onClick={closeDataMapModal}>Close</button>
        </div>
      </div>
    </dialog>
  );
}

