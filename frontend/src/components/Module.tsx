import React, { useState, useCallback, useMemo } from 'react';
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Panel,
} from 'reactflow';
import 'reactflow/dist/style.css';
import useModuleData from '@/hooks/useModuleData';
import { useSocketContext } from '@/contexts/SocketContext';
import ModuleFlowNode from '@/components/ModuleFlowNode';

const nodeTypes = {
    custom: ModuleFlowNode,
};

const Module = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedModule, setSelectedModule] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [nodeIdCounter, setNodeIdCounter] = useState(1);
  
  const { modules, isLoading, isConnected } = useModuleData();
  const { socket } = useSocketContext();

  const groupedModules = useMemo(() => {
    const filteredModules = Object.keys(modules).filter((moduleName) => {
      const matchesSearch = moduleName.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesSearch;
    });

    // group by base_class
    const grouped = filteredModules.reduce((acc, moduleName) => {
      const baseClass = modules[moduleName]?.base_class || 'Other';
      if (!acc[baseClass]) {
        acc[baseClass] = [];
      }
      acc[baseClass].push(moduleName);
      return acc;
    }, {} as Record<string, string[]>);

    Object.keys(grouped).forEach(category => {
      grouped[category].sort();
    });

    return Object.entries(grouped).sort(([a], [b]) => a.localeCompare(b));
  }, [modules, searchTerm]);

  const onConnect = useCallback((params) => {
    setEdges((eds) => addEdge(params, eds));

    if (socket && isConnected) {
        socket.emit('add_edge', {
            source: params.source,
            target: params.target,
        });
    }
  }, [setEdges, socket, isConnected]);

  const addModuleNode = useCallback((moduleType) => {
    const moduleData = modules[moduleType];
    
    if (!moduleData) {
      console.error(`Module ${moduleType} not found`);
      return;
    }

    const nodeId = `${moduleType}-${nodeIdCounter}`;

    const newNode = {
      id: nodeId,
      type: 'custom',
      position: {
        x: Math.random() * 400 + 100,
        y: Math.random() * 300 + 100,
      },
      data: {
        nodeId: nodeId,
        label: moduleData.name,
        parent: moduleData.base_class,
        params: moduleData.params || {},
      },
    };

    setNodes((nds) => [...nds, newNode]);
    setNodeIdCounter((c) => c + 1);
    setSelectedModule('');
  }, [nodeIdCounter, setNodes, modules]);

  const onNodesDelete = useCallback((deleted) => {
    if (socket && isConnected) {
      deleted.forEach(node => {
        socket.emit('delete_node', { nodeId: node.id });
      });
    }
  }, [socket, isConnected]);

  return (
    <>
      {/* Sidebar */}
      <div className="w-70 bg-white border-r border-gray-200 overflow-y-auto">
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xl font-bold">Module Library</h2>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
              <span className="text-xs text-gray-600">
                {isConnected ? 'Connected' : 'Disconnected'}
              </span>
            </div>
          </div>
          <input
            type="text"
            placeholder="Search modules..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isLoading}
          />
        </div>

        <div className="p-4">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-3" />
              <p className="text-sm text-gray-600">Loading modules...</p>
            </div>
          ) : Object.keys(modules).length === 0 ? (
            <div className="text-center py-12">
              <p className="text-sm text-gray-600">No modules available</p>
              <p className="text-xs text-gray-400 mt-2">Waiting for backend connection</p>
            </div>
          ) : groupedModules.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-sm text-gray-600">No modules match your search</p>
            </div>
          ) : (
            groupedModules.map(([category, moduleList]) => (
              <div key={category} className="mb-4">
                <h3 className="font-semibold text-sm text-gray-600 mb-2 uppercase tracking-wide">
                  {category}
                </h3>
                <div className="space-y-1">
                  {moduleList.map((moduleName) => (
                    <button
                      key={moduleName}
                      onClick={() => addModuleNode(moduleName)}
                      className="w-full text-left px-3 py-2 text-sm rounded hover:bg-blue-50 hover:text-blue-700 transition-colors border border-transparent hover:border-blue-200"
                    >
                      <div className="font-medium">{moduleName}</div>
                      <div className="text-xs text-gray-500">
                        {modules[moduleName]?.base_class}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* React Flow Canvas */}
      <div className="flex-1">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodesDelete={onNodesDelete}
          nodeTypes={nodeTypes}
          fitView
        >
          <Controls />
          <MiniMap />
          <Background variant="dots" gap={12} size={1} />
          <Panel position="top-right" className="bg-white p-3 rounded-lg shadow-lg">
            <div className="text-sm">
              <div className="font-semibold mb-1">Canvas Stats</div>
              <div className="text-gray-600">Nodes: {nodes.length}</div>
              <div className="text-gray-600">Connections: {edges.length}</div>
              <div className="text-gray-600 mt-2 pt-2 border-t">
                Available: {Object.keys(modules).length}
              </div>
            </div>
          </Panel>
        </ReactFlow>
      </div>
    </>
  );
};

export default Module;