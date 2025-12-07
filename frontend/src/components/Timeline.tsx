import { useEffect, useState, useMemo, memo, useCallback } from 'react';
import ReactFlow, {
    Controls,
    Background,
    useNodesState,
    useEdgesState,
    MarkerType,
    Position,
    Handle,
    Panel
} from 'reactflow';
import 'reactflow/dist/style.css';
import { useTimelineData } from '@/hooks/useTimelineData';
import { getModuleColor, scaleIU } from '@/utils/TimelineUtils';
import { IUEdge } from '@/components/IUEdge';
import type { updateTypeColors } from '@/types/allTypes';

const CustomNode = memo(({ data }) => {
    const updateTypeColors: updateTypeColors = {
        COMMIT: 'bg-green-500',
        ADD: 'bg-blue-500',
        REVOKE: 'bg-red-500',
        MODULE: 'bg-violet-500'
    };

    const isLatest = data.isLatest;
    const isModule = data.isModule;

    return (
        <div
            className={`px-4 py-3 rounded-lg border-2 shadow-lg transition-all duration-300 ${
                isLatest ? 'border-yellow-400 ring-4 ring-yellow-200 scale-110' : 'border-gray-300'
            } bg-white`}
        >
            {/* Add target handle on the left */}
            <Handle 
                type="target" 
                position={Position.Left}
                className="w-3 h-3 !bg-gray-400"
            />
            
            <div className="flex items-center gap-2 mb-1">
                <div className={`w-3 h-3 rounded-full ${updateTypeColors[data.updateType] || 'bg-gray-500'}`} />
                <div className="font-semibold text-sm text-gray-800">{data.label}</div>
            </div>
            {isModule ? (
                <div className="text-xs text-gray-600">
                    <div>{data.timeCreated}</div>
                </div>
            ) : (
                <div className="text-xs text-gray-600">
                    <div>{data.updateType}</div>
                    <div>Age: {data.age}</div>
                </div> )}
            
            {/* Add source handle on the right */}
            <Handle 
                type="source" 
                position={Position.Right}
                className="w-3 h-3 !bg-gray-400"
            />
        </div>
    );
});

CustomNode.displayName = 'CustomNode';

const nodeTypes = {
    custom: CustomNode,
};

const edgeTypes = {
    animatedEdge: IUEdge,
};

export default function Timeline() {
    const { nodes: timelineNodes, edges: timelineEdges, latestUpdate, isConnected, clearTimeline, uniqueModules } = useTimelineData();
    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);

    // Memoize flow nodes conversion
    const flowNodes = useMemo(() => {
        return timelineNodes.flatMap((node, index) => {
            let y;
            
            if (node.isGroundedNode) {
                y = 0;
            }
            else {
                y = (index % 5) * -250 - 150
            }

            const flowNode = {
                id: node.id,
                type: 'custom',
                position: {
                    x: (index * 250) + 50,
                    y: y,
                },
                data: {
                    label: node.label,
                    updateType: node.updateType,
                    age: node.age,
                    isLatest: latestUpdate?.id === node.id,
                    isModule: false
                },
                sourcePosition: Position.Right,
                targetPosition: Position.Left,
            };

            const moduleNode = {
                id: `${node.id}-module`,
                type: 'custom',
                position: {
                    x: (index * 250) + 50,
                    y: 100
                },
                data: {
                    label: node.module,
                    updateType: 'MODULE',
                    isModule: true,
                    timeCreated: node.timeCreated.toLocaleString() + node.timeCreated.getMilliseconds().toString().padStart(3, '0'),
                }
            }

            return [flowNode, moduleNode];
        });
    }, [timelineNodes]);

    // Convert timeline edges to ReactFlow edges
    const flowEdges = useMemo(() => {
        return timelineEdges.map((edge) => {
            const isPrevious = edge.type === 'previous';
            
            return {
                id: edge.id,
                source: edge.source,
                target: edge.target,
                type: 'animatedEdge',
                data: {
                    age: scaleIU(isPrevious, edge),
                },
                style: {
                    stroke: isPrevious ? edge.color : '#10b981',
                    strokeDasharray: isPrevious ? '0' : '5,5',
                },
                markerEnd: {
                    type: MarkerType.ArrowClosed,
                    color: isPrevious ? edge.color : '#10b981',
                    width: 20,
                    height: 20,
                },
                label: isPrevious ? 'previous' : 'grounded',
                labelStyle: { 
                    fontSize: 10, 
                    fill: '#6b7280',
                    fontWeight: 500,
                },
                labelBgStyle: { 
                    fill: 'white', 
                    fillOpacity: 0.8,
                },
            };
        });
    }, [timelineEdges]);

    // Update nodes when flowNodes changes
    useEffect(() => {
        setNodes(flowNodes);
    }, [flowNodes, setNodes]);

    // Update edges when flowEdges changes
    useEffect(() => {
        setEdges(flowEdges);
    }, [flowEdges, setEdges]);

    const handleClear = useCallback(() => {
        clearTimeline();
    }, [clearTimeline]);

    return (
        <div className="w-full h-full bg-gray-50">
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                edgeTypes={edgeTypes}
                nodeTypes={nodeTypes}
                fitView
                className="bg-gray-50"
            >
                <Background color="#ddd" gap={16} />
                <Controls className="bg-white rounded-lg shadow-lg" />
            <Panel position="top-left" className="bg-white rounded-lg shadow-md p-4 space-y-2">
                <div className="flex items-center gap-2">
                    <div 
                    className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}
                    />
                    <span className="text-sm font-medium text-gray-700">
                    {isConnected ? 'Connected' : 'Disconnected'}
                    </span>
                </div>
                
                <div className="text-xs text-gray-600 space-y-1">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-green-500" />
                        <span>COMMITTED</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-blue-500" />
                        <span>ADD</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-500" />
                        <span>REVOKE</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-violet-500" />
                        <span>MODULE</span>
                    </div>
                </div>

                <div className="mt-3 pt-3 border-t border-gray-200">
                    <div className="text-xs text-gray-600">
                        <div>Nodes: {timelineNodes.length}</div>
                        <div>Edges: {timelineEdges.length}</div>
                    </div>
                </div>

                <div className="mt-3 pt-3 border-t border-gray-200">
                    <div className="text-xs text-gray-600 space-y-1">
                        {Array.from(uniqueModules).map(module => (
                            <div key={module} className="flex items-center gap-2">
                                <div 
                                    className="w-8 h-0.5" 
                                    style={{
                                        backgroundColor: getModuleColor(module, 'previous')
                                    }}
                                />
                                <span>{module}</span>
                            </div>
                        ))}
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-0.5 bg-green-500 border-dashed" style={{borderTop: '2px dashed'}} />
                            <span>Grounded</span>
                        </div>
                    </div>
                </div>

                <button
                onClick={handleClear}
                className="w-full px-3 py-1.5 text-sm font-medium text-white bg-red-500 hover:bg-red-600 rounded transition-colors"
                >
                    Clear Timeline
                </button>
            </Panel>
            </ReactFlow>
        </div>
    );
}