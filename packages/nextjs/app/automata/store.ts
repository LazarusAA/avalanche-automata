import { create } from 'zustand';
import {
  Connection,
  Edge,
  EdgeChange,
  Node,
  NodeChange,
  addEdge,
  OnNodesChange,
  OnEdgesChange,
  OnConnect,
  applyNodeChanges,
  applyEdgeChanges,
} from '@xyflow/react';

// Define the shape of our store's state
export type RFState = {
  nodes: Node[];
  edges: Edge[];
  selectedNodeId: string | null; // For the config panel
  isDataMapModalOpen: boolean;
  dataMapModalTarget: { nodeId: string; field: string } | null;
  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  onConnect: OnConnect;
  setNodes: (nodes: Node[]) => void;
  setEdges: (edges: Edge[]) => void;
  addNode: (node: Node) => void;
  setSelectedNodeId: (id: string | null) => void;
  openDataMapModal: (nodeId: string, field: string) => void;
  closeDataMapModal: () => void;
  updateNodeData: (nodeId: string, newData: any) => void;
  updateNodeStatus: (nodeId: string, status: 'idle' | 'pending' | 'success' | 'fail' | 'success_temp' | 'fail_temp') => void;
  executeWorkflow: (startNodeId: string, data: any) => Promise<void>;
  runNode: (nodeId: string, inputData: any) => Promise<void>;
};

// Create the store
export const useAutomataStore = create<RFState>((set, get) => ({
  nodes: [],
  edges: [],
  selectedNodeId: null,
  isDataMapModalOpen: false,
  dataMapModalTarget: null,

  onNodesChange: (changes: NodeChange[]) => {
    set({
      nodes: applyNodeChanges(changes, get().nodes),
    });
  },

  onEdgesChange: (changes: EdgeChange[]) => {
    set({
      edges: applyEdgeChanges(changes, get().edges),
    });
  },

  onConnect: (connection: Connection) => {
    // Check if the connection is for execution flow
    const isExecution = ['true', 'false', 'on-success'].includes(connection.sourceHandle || '');
    
    const newEdge: Edge = {
      ...connection,
      type: isExecution ? 'executionEdge' : 'dataEdge',
      animated: false, // Default to not animated
    };
    
    set({
      edges: addEdge(newEdge, get().edges),
    });
  },

  setNodes: (nodes: Node[]) => {
    set({ nodes });
  },

  setEdges: (edges: Edge[]) => {
    set({ edges });
  },

  addNode: (node: Node) => {
    set({
      nodes: [...get().nodes, node],
    });
  },

  setSelectedNodeId: (id: string | null) => {
    set({ selectedNodeId: id });
  },

  openDataMapModal: (nodeId: string, field: string) => {
    set({ isDataMapModalOpen: true, dataMapModalTarget: { nodeId, field } });
  },

  closeDataMapModal: () => {
    set({ isDataMapModalOpen: false, dataMapModalTarget: null });
  },

  updateNodeData: (nodeId: string, newData: any) => {
    set({
      nodes: get().nodes.map(node =>
        node.id === nodeId
          ? { ...node, data: newData }
          : node
      ),
    });
  },

  updateNodeStatus: (nodeId: string, status: 'idle' | 'pending' | 'success' | 'fail' | 'success_temp' | 'fail_temp') => {
    const node = get().nodes.find(n => n.id === nodeId);
    if (node) {
      get().updateNodeData(nodeId, { ...node.data, status });
    }
  },

  executeWorkflow: async (startNodeId: string, data: any) => {
    const { nodes, edges } = get();
    const startNode = nodes.find(n => n.id === startNodeId);
    
    if (!startNode) {
      console.warn('⚠️ executeWorkflow: Start node not found:', startNodeId);
      return;
    }

    console.log('🔄 executeWorkflow called for:', startNode.type, 'with data:', data);

    // Find all outgoing edges from this node
    const outgoingEdges = edges.filter(edge => edge.source === startNodeId);
    console.log('📤 Found', outgoingEdges.length, 'outgoing edges:', outgoingEdges);

    // Handle conditional logic for AI decision nodes
    if (startNode.type === 'ai-decision') {
      const result = data.result?.toLowerCase();
      console.log('🤖 AI Decision result:', result);
      
      const matchingEdges = outgoingEdges.filter(edge => edge.sourceHandle === result);
      console.log('🔍 Looking for edges with sourceHandle:', result);
      console.log('✅ Found', matchingEdges.length, 'matching edge(s)');
      
      if (matchingEdges.length > 0) {
        console.log('▶️ Running', matchingEdges.length, 'next node(s) with data:', data.originalData || data);
        // Execute all matching edges sequentially to avoid nonce conflicts
        for (const edge of matchingEdges) {
          await get().runNode(edge.target, data.originalData || data);
        }
      } else {
        console.warn('⚠️ No matching edges found for result:', result);
        console.log('Available edges:', outgoingEdges.map(e => ({ source: e.source, target: e.target, sourceHandle: e.sourceHandle })));
      }
    } else {
      // For other nodes, execute all outgoing edges
      console.log('▶️ Executing', outgoingEdges.length, 'outgoing edges');
      for (const edge of outgoingEdges) {
        await get().runNode(edge.target, data);
      }
    }
  },

  runNode: async (nodeId: string, inputData: any) => {
    const { nodes, updateNodeStatus, executeWorkflow } = get();
    const node = nodes.find(n => n.id === nodeId);
    
    if (!node) return;

    // Set node to pending state
    updateNodeStatus(nodeId, 'pending');

    try {
      switch (node.type) {
        case 'ai-decision': {
          const prompt = node.data.prompt;
          
          if (!prompt) {
            throw new Error('AI Decision node missing prompt configuration');
          }

          console.log('🤖 AI Decision - Prompt:', prompt);
          console.log('🤖 AI Decision - Input data:', inputData);

          const response = await fetch('/api/ai-decision', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt, data: inputData }),
          });

          const result = await response.json();
          console.log('🤖 AI Decision - API Response:', result);
          
          if (!result.success) {
            console.error('❌ AI Decision failed:', result.error);
            throw new Error(result.error || 'AI Decision failed');
          }

          console.log('✅ AI Decision - Result:', result.result, '(will be lowercased to:', result.result.toLowerCase() + ')');

          // Show success animation
          updateNodeStatus(nodeId, 'success_temp');
          
          // Wait a bit for animation, then continue workflow
          setTimeout(async () => {
            updateNodeStatus(nodeId, 'success');
            await executeWorkflow(nodeId, { 
              result: result.result.toLowerCase(), 
              originalData: inputData 
            });
          }, 1500);
          
          break;
        }

        case 'send-usdt': {
          console.log('💰 Send USDT node executing');
          console.log('💰 Input data:', inputData);
          console.log('💰 Node data:', node.data);
          
          let recipient = node.data.recipient || '';
          const amount = node.data.amount;

          if (!amount) {
            console.error('❌ Send USDT: Missing amount');
            throw new Error('Send USDT node missing amount configuration');
          }

          // Handle data mapping for recipient
          if (recipient.includes('{{Trigger.data.to}}')) {
            recipient = inputData.to || recipient;
            console.log('💰 Mapped recipient from data:', recipient);
          }

          console.log('💰 Final recipient:', recipient, 'amount:', amount);

          const response = await fetch('/api/relay', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              action: 'sendUsdt', 
              params: { to: recipient, amount } 
            }),
          });

          const result = await response.json();
          console.log('💰 Relay API response:', result);
          
          if (!result.success) {
            console.error('❌ Send USDT failed:', result.error);
            throw new Error(result.error || 'Send USDT failed');
          }

          // Show success animation
          updateNodeStatus(nodeId, 'success_temp');
          
          // Wait a bit for animation, then continue workflow
          setTimeout(async () => {
            updateNodeStatus(nodeId, 'success');
            await executeWorkflow(nodeId, inputData);
          }, 1500);
          
          break;
        }

        case 'mint-nft': {
          console.log('🎨 Mint NFT node executing');
          console.log('🎨 Input data:', inputData);
          console.log('🎨 Node data:', node.data);
          
          let recipient = node.data.recipient || '';

          // Handle data mapping for recipient
          if (recipient.includes('{{Trigger.data.to}}')) {
            recipient = inputData.to || recipient;
            console.log('🎨 Mapped recipient from data:', recipient);
          }

          if (!recipient) {
            console.error('❌ Mint NFT: Missing recipient');
            throw new Error('Mint NFT node missing recipient');
          }

          console.log('🎨 Final recipient:', recipient);

          const response = await fetch('/api/relay', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              action: 'mintBadge', 
              params: { to: recipient } 
            }),
          });

          const result = await response.json();
          console.log('🎨 Relay API response:', result);
          
          if (!result.success) {
            console.error('❌ Mint NFT failed:', result.error);
            throw new Error(result.error || 'Mint NFT failed');
          }

          // Show success animation
          updateNodeStatus(nodeId, 'success_temp');
          
          // Wait a bit for animation, then continue workflow
          setTimeout(async () => {
            updateNodeStatus(nodeId, 'success');
            await executeWorkflow(nodeId, inputData);
          }, 1500);
          
          break;
        }

        default:
          console.warn(`Unknown node type: ${node.type}`);
          updateNodeStatus(nodeId, 'idle');
      }
    } catch (error) {
      console.error(`Error executing node ${nodeId}:`, error);
      updateNodeStatus(nodeId, 'fail_temp');
      
      // Clear fail animation after delay
      setTimeout(() => {
        updateNodeStatus(nodeId, 'fail');
      }, 1500);
    }
  },
}));