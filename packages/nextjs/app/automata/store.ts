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
  updateNodeData: (nodeId: string, field: string, value: any) => void;
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

  updateNodeData: (nodeId: string, field: string, value: any) => {
    set({
      nodes: get().nodes.map(node =>
        node.id === nodeId
          ? { ...node, data: { ...node.data, [field]: value } }
          : node
      ),
    });
  },
}));