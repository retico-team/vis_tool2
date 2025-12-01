import { useCallback, useEffect, useMemo, memo } from 'react';
    import ReactFlow, {
    Controls,
    Background,
    MiniMap,
    useNodesState,
    useEdgesState,
    MarkerType,
    BackgroundVariant,
    Panel,
    Handle,
    Position,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { useNetworkData } from '@/hooks/useNetworkData';
import type { NetworkNode as CustomNetworkNode } from '@/types/allTypes';

// Custom node component
const CustomNode = memo(({ data }: { data: any }) => {
  return (
    <div
      className="px-4 py-2 rounded-lg border-2 shadow-md bg-white transition-all hover:shadow-lg"
      style={{ 
        borderColor: data.color,
        minWidth: '120px',
      }}
    >
      <Handle 
      type="target" 
      position={Position.Left}
      className="w-3 h-3 !bg-gray-400"
      />
      <div className="font-semibold text-sm text-gray-800">{data.id}</div>

      <Handle 
      type="source" 
      position={Position.Right}
      className="w-3 h-3 !bg-gray-400"
      />
    </div>
  );
});

const nodeTypes = {
    custom: CustomNode,
};

export default function Network() {
    const { nodes: networkNodes, edges: networkEdges, isConnected, clearNetwork } = useNetworkData();
    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);

    const flowNodes = useMemo(() => {
        return networkNodes.map((node: CustomNetworkNode, index: number) => {
          const angle = (index / networkNodes.length) * 2 * Math.PI;
          const radius = 300;
          
          const flowNode = {
            id: node.id,
            type: 'custom',
            position: {
              x: 400 + radius * Math.cos(angle),
              y: 300 + radius * Math.sin(angle),
            },
            data: {
              color: node.color || '#6366f1',
              id: node.id,
            },
          };
          return flowNode;
        });
    }, [networkNodes]);

    const flowEdges = useMemo(() => {
      return networkEdges.map((edge) => {

        const flowEdge = {
          id: edge.id,
          source: edge.source,
          target: edge.target,
          type: edge.type === 'grounded' ? 'step' : 'smoothstep',
          animated: edge.type === 'processed',
          style: {
              stroke: edge.color || '#6366f1',
              strokeWidth: 2,
          },
          markerEnd: {
              type: MarkerType.ArrowClosed,
              color: edge.color || '#6366f1',
          },
          label: edge.type === 'grounded' ? 'grounded' : undefined,
          labelStyle: { fontSize: 10, fill: '#666' },
          labelBgStyle: { fill: 'white' },
        };
        return flowEdge;
      });
    }, [networkEdges]);

    useEffect(() => {
        setNodes(flowNodes);
    }, [flowNodes, setNodes]);

    useEffect(() => {
        setEdges(flowEdges);
    }, [flowEdges, setEdges]);

    const handleClear = useCallback(() => {
        clearNetwork();
    }, [clearNetwork]);

  return (
    <div className="w-full h-screen bg-gray-50">
        <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            nodeTypes={nodeTypes}
            fitView
            attributionPosition="bottom-left"
        >
            <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
            <Controls />
            <MiniMap 
            nodeColor={(node) => node.data.color || '#6366f1'}
            className="bg-white"
            />
        
        <Panel position="top-right" className="bg-white rounded-lg shadow-md p-4 space-y-2">
            <div className="flex items-center gap-2">
                <div 
                className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}
                />
                <span className="text-sm font-medium text-gray-700">
                {isConnected ? 'Connected' : 'Disconnected'}
                </span>
            </div>
            
            <div className="text-xs text-gray-500">
              {networkNodes.length} nodes · {networkEdges.length} edges
            </div>
          
            <button
                onClick={handleClear}
                className="w-full px-3 py-1.5 text-sm font-medium text-white bg-red-500 hover:bg-red-600 rounded transition-colors"
            >
              Clear Network
            </button>
        </Panel>
      </ReactFlow>
    </div>
  );
};