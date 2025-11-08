import { Handle, Position, NodeProps } from "@xyflow/react";
import { BoltIcon } from "@heroicons/react/24/outline";
import { clsx } from "clsx";
import { useEffect } from "react";

// A simple DaisyUI card for the node
const OnChainEventNode = ({ data, isConnectable }: NodeProps) => {
  const status = data.status || 'idle';

  const nodeClasses = clsx(
    'card card-compact w-64 bg-base-100 shadow-xl border-2 border-primary',
    {
      'border-primary': status === 'idle',
      'animate-pulse-blue !border-info': status === 'pending',
      'animate-glow-green !border-success': status === 'success_temp',
      'animate-glow-red !border-error': status === 'fail_temp',
      '!border-success': status === 'success',
      '!border-error': status === 'fail',
    },
  );

  useEffect(() => {
    if (status === 'success_temp' || status === 'fail_temp') {
      const timer = setTimeout(() => {
        console.log('Clearing temp state for node ' + data.id);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [status, data.id]);

  return (
    <div className={nodeClasses}>
      <div className="card-body">
        <div className="flex items-center gap-3">
          <BoltIcon className="h-6 w-6 text-primary" />
          <h2 className="card-title text-sm">On-Chain Event</h2>
        </div>
        <p className="text-xs text-base-content/70">On Transfer at 0x...</p>
        {/* Output handle as per UI/UX blueprint */}
        <Handle
          type="source"
          position={Position.Right}
          id="data"
          isConnectable={isConnectable}
          className="!bg-primary"
        />
      </div>
    </div>
  );
};

export default OnChainEventNode;