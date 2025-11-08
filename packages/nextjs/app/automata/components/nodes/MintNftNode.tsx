import { Handle, Position, NodeProps } from "@xyflow/react";
import { PhotoIcon } from "@heroicons/react/24/outline";
import { clsx } from "clsx";
import { useEffect } from "react";

const MintNftNode = ({ data, isConnectable }: NodeProps) => {
  const status = data.status || 'idle';

  const nodeClasses = clsx(
    'card card-compact w-64 bg-base-100 shadow-xl border-2 border-success',
    {
      'border-success': status === 'idle',
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
          <PhotoIcon className="h-6 w-6 text-success" />
          <h2 className="card-title text-sm">Mint NFT</h2>
        </div>
        <div className="text-xs mt-2">
          <p className="truncate">Recipient: {data.recipient || 'Not configured'}</p>
        </div>
        {/* Main input handle */}
        <Handle
          type="target"
          position={Position.Left}
          id="exec"
          isConnectable={isConnectable}
          className="!bg-success"
        />
      </div>
    </div>
  );
};

export default MintNftNode;