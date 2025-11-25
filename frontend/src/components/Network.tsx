/** make network graph, we can use websocket data and listmodule and then use an set to store unique modules and only
 * change the set whenever it has more modules than before, they should be in order but just make sure
*/

import { useTimelineData } from "../hooks/useTimelineData";
import { useEffect, useState, useMemo, memo } from 'react';
import ReactFlow, {
    Controls,
    Background,
    useNodesState,
    useEdgesState,
    MarkerType,
    Position,
    Handle
} from 'reactflow';

// TODO: implement the network graph using reactflow

export default function Network() {
    const { nodes: networkNodes, edges: networkEdges, isConnected, uniqueModules } = useTimelineData();
    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);

    const flowNodes = useMemo(() => {
        return networkNodes.flatMap((node, index) => {
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
                },
                sourcePosition: Position.Right,
                targetPosition: Position.Left,
            }

            return [flowNode, moduleNode];
        });
    }, [networkNodes]);

    // Convert timeline edges to ReactFlow edges
    const flowEdges = useMemo(() => {
        return networkEdges.map((edge) => {
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
    }, [networkEdges]);

    // Update nodes when flowNodes changes
    useEffect(() => {
        setNodes(flowNodes);
    }, [flowNodes, setNodes]);

    // Update edges when flowEdges changes
    useEffect(() => {
        setEdges(flowEdges);
    }, [flowEdges, setEdges]);
}