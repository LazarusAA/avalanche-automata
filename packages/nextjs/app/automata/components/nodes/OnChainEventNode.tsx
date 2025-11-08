import { Handle, Position, NodeProps } from "@xyflow/react";
import { BoltIcon } from "@heroicons/react/24/outline";
import { clsx } from "clsx";
import { useEffect, useState, useRef } from "react";
import { ethers } from "ethers";
import { useWdkProvider } from "~~/hooks/scaffold-eth";
import { useAutomataStore } from "../../store";
import { useShallow } from "zustand/react/shallow";

// Minimal ABI for Transfer and Approval events
const transferAbi = [
  "event Transfer(address indexed from, address indexed to, uint256 value)",
  "event Approval(address indexed owner, address indexed spender, uint256 value)"
];

// A simple DaisyUI card for the node
const OnChainEventNode = ({ id, data, isConnectable }: NodeProps) => {
  const status = data.status || 'idle';
  const [processedLogs, setProcessedLogs] = useState(new Set<string>());
  const lastPolledBlock = useRef<number | null>(null);
  const [isWatching, setIsWatching] = useState(false);
  
  const { executeWorkflow } = useAutomataStore(
    useShallow((state) => ({
      executeWorkflow: state.executeWorkflow,
    }))
  );

  // Get the provider for polling
  const provider = useWdkProvider();

  // Get contract configuration from node data (trim to avoid ENS errors)
  const contractAddress = (data.contractAddress as string | undefined)?.trim();
  const eventName = (data.eventName as string | undefined) || "Transfer";
  const isConfigured = contractAddress && eventName && ethers.isAddress(contractAddress);

  // Polling-based event listener (MVP requirement: 5-second polling)
  useEffect(() => {
    if (!provider || !contractAddress || !eventName || !isConfigured) {
      setIsWatching(false);
      return;
    }

    console.log(`🔍 Starting to watch ${eventName} events on ${contractAddress}`);

    // Create ethers interface for parsing events
    const iface = new ethers.Interface(transferAbi);
    
    // Get the event fragment and topic hash
    const eventFragment = iface.getEvent(eventName);
    if (!eventFragment) {
      console.error(`Event ${eventName} not found in ABI`);
      return;
    }
    
    // Create event filter
    const filter = {
      address: contractAddress,
      topics: [eventFragment.topicHash],
    };

    setIsWatching(true);

    // Poll immediately on start, then every 5 seconds
    const pollForEvents = async () => {
      try {
        const latestBlock = await provider.getBlockNumber();

        // Initialize lastPolledBlock on first run
        if (lastPolledBlock.current === null) {
          lastPolledBlock.current = latestBlock - 1;
          console.log(`📍 Starting from block ${lastPolledBlock.current}`);
        }

        const fromBlock = lastPolledBlock.current + 1;

        // No new blocks to check
        if (fromBlock > latestBlock) {
          return;
        }

        console.log(`🔎 Checking blocks ${fromBlock} to ${latestBlock}`);

        // Fetch logs from new blocks
        const logs = await provider.getLogs({
          ...filter,
          fromBlock,
          toBlock: latestBlock,
        });

        // Process new logs
        if (logs.length > 0) {
          console.log(`✅ Found ${logs.length} event(s)!`);
          logs.forEach((log: ethers.Log) => {
            const logId = `${log.blockNumber}_${log.index}`;

            if (!processedLogs.has(logId)) {
              // Mark log as processed
              setProcessedLogs((prev) => new Set(prev).add(logId));

              // Parse event data
              const parsedEvent = iface.parseLog({
                topics: [...log.topics],
                data: log.data,
              });

              // Trigger the workflow with parsed event args
              console.log('🔥 New event detected, triggering workflow:', parsedEvent?.args);
              if (parsedEvent) {
                // Convert ethers.js Result (Proxy) to plain object
                // We need to manually extract the named properties
                const argsObject: Record<string, any> = {};
                
                // Get the event fragment to know which parameters exist
                const fragment = parsedEvent.fragment;
                
                // Extract each named parameter from the args
                fragment.inputs.forEach((input, index) => {
                  const value = parsedEvent.args[index];
                  // Convert BigInt to string for JSON serialization
                  argsObject[input.name] = typeof value === 'bigint' ? value.toString() : value;
                });
                
                console.log('📦 Converted event args to plain object:', argsObject);
                
                // Apply excludeFromAddress filter to prevent infinite loops
                const excludeFromAddress = (data.excludeFromAddress as string | undefined)?.toLowerCase();
                if (excludeFromAddress && argsObject.from?.toLowerCase() === excludeFromAddress) {
                  console.log('⏭️ Skipping event: from address matches exclude filter');
                  return;
                }
                
                executeWorkflow(id, argsObject);
              }
            }
          });
        }

        // Update the last polled block
        lastPolledBlock.current = latestBlock;
      } catch (error) {
        console.error('Error polling for events:', error);
      }
    };

    // Run immediately
    pollForEvents();

    // Set up 5-second polling interval
    const intervalId = setInterval(pollForEvents, 5000);

    // Cleanup on unmount or dependency change
    return () => {
      clearInterval(intervalId);
      setIsWatching(false);
    };
  }, [provider, contractAddress, eventName, executeWorkflow, id, isConfigured]);

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
        <p className="text-xs text-base-content/70">
          {data.eventName && data.contractAddress
            ? `On ${data.eventName} at ${(data.contractAddress as string).slice(0, 6)}...${(data.contractAddress as string).slice(-4)}`
            : "Configure event in panel →"}
        </p>
        {isConfigured && isWatching && (
          <p className="text-xs text-info">Watching for events...</p>
        )}
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