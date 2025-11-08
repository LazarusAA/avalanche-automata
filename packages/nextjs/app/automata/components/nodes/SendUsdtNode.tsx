import { Handle, Position, NodeProps } from "@xyflow/react";
import { BanknotesIcon } from "@heroicons/react/24/outline";
import { clsx } from "clsx";
import { useEffect } from "react";

const SendUsdtNode = ({ data, isConnectable }: NodeProps) => {
  const status = data.status || 'idle';

  const nodeClasses = clsx(
    'card card-compact w-64 bg-base-100 shadow-xl border-2 border-accent',
    {
      'border-accent': status === 'idle',
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
          <BanknotesIcon className="h-6 w-6 text-accent" />
          <h2 className="card-title text-sm">Send USDT</h2>
        </div>
        {/* Inputs on the node card, as per UI/UX blueprint */}
        <div className="text-xs mt-2">
          <p className="truncate">Recipient: {data.recipient || 'Not configured'}</p>
          <p>Amount: {data.amount || 'Not set'} USDT</p>
        </div>
        {/* Main input handle */}
        <Handle
          type="target"
          position={Position.Left}
          id="exec"
          isConnectable={isConnectable}
          className="!bg-accent"
        />
        {/* Output handle */}
        <Handle
          type="source"
          position={Position.Right}
          id="on-success"
          isConnectable={isConnectable}
          className="!bg-accent"
        />
      </div>
    </div>
  );
};

export default SendUsdtNode;