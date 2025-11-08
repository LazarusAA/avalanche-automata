import { Handle, Position, NodeProps } from "@xyflow/react";
import { CpuChipIcon } from "@heroicons/react/24/outline";
import { clsx } from "clsx";
import { useEffect } from "react";

const AiDecisionNode = ({ data, isConnectable }: NodeProps) => {
  const status = data.status || 'idle';

  const nodeClasses = clsx(
    'card card-compact w-64 bg-base-100 shadow-xl border-2 border-secondary',
    {
      'border-secondary': status === 'idle',
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
      <div className="card-body relative pr-16">
        <div className="flex items-center gap-3 mb-1">
          <CpuChipIcon className="h-6 w-6 text-secondary" />
          <h2 className="card-title text-sm">AI Decision</h2>
        </div>
        {data.prompt && (
          <p className="text-xs text-base-content/70 line-clamp-1 pr-2" title={data.prompt}>
            {data.prompt}
          </p>
        )}
        {!data.prompt && (
          <p className="text-xs text-base-content/50 italic">No prompt configured</p>
        )}
        {/* Input handle */}
        <Handle
          type="target"
          position={Position.Left}
          id="data"
          isConnectable={isConnectable}
          className="!bg-secondary"
        />
        {/* Two output handles with labels */}
        <div className="absolute right-0 top-[33%] flex items-center gap-2 translate-x-2 -translate-y-1/2">
          <span className="text-xs font-semibold text-success">True</span>
          <Handle
            type="source"
            position={Position.Right}
            id="true"
            isConnectable={isConnectable}
            className="!bg-green-500 !static"
          />
        </div>
        <div className="absolute right-0 top-[66%] flex items-center gap-2 translate-x-2 -translate-y-1/2">
          <span className="text-xs font-semibold text-error">False</span>
          <Handle
            type="source"
            position={Position.Right}
            id="false"
            isConnectable={isConnectable}
            className="!bg-red-500 !static"
          />
        </div>
      </div>
    </div>
  );
};

export default AiDecisionNode;