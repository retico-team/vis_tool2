import { useCallback, useEffect, useState } from "react";
import { useSocketContext } from "@/contexts/SocketContext";
import { getModuleColor } from "@/utils/TimelineUtils";
import type { TimelineData, IUData, TimelineNode } from "@/types/allTypes";

export const useTimelineData = () => {
    const { socket, isConnected } = useSocketContext();
    const [uniqueModules, setUniqueModules] = useState<Set<string>>(new Set());
    const [timelineData, setTimelineData] = useState<TimelineData>({
        nodes: new Map(),
        edges: [],
        latestUpdate: null,
    });

    const addNode = useCallback((data: IUData) => {
        const node: TimelineNode = {
            id: data.IUID,
            label: data.IU,
            updateType: data.UpdateType,
            age: data.Age,
            module: data.Module,
            nodeCount: Number(data.IUID.split(":").pop()),
            timeCreated: new Date(parseFloat(data.TimeCreated) * 1000),
            previousNodeId: data.PreviousIUID,
            groundedInNodeId: data.GroundedIn.IUID,
            rawData: data,
            isGroundedNode: false,
        };

        const groundedInData = data.GroundedIn;

        const groundedInNode: TimelineNode = {
            id: groundedInData.IUID,
            label: groundedInData.Module.split(" ")[0] + " Stream",
            module: groundedInData.Module,
            updateType: groundedInData.UpdateType,
            age: groundedInData.Age,
            timeCreated: new Date(parseFloat(groundedInData.TimeCreated) * 1000),
            rawData: groundedInData,
            isGroundedNode: true
        }

        setTimelineData((prev) => {
            const newNodes = new Map(prev.nodes);
            const existingNode = prev.nodes.get(node.id);
            const existingGroundedInNode = prev.nodes.get(groundedInNode.id)
            const newEdges = [...prev.edges];

            if (!existingGroundedInNode) {
                newNodes.set(groundedInNode.id, groundedInNode);
            }

            newNodes.set(node.id, node);

            if (existingNode) {
                // Node exists, update its data (important for ADD -> COMMIT transitions)
                
                return {
                    nodes: newNodes,
                    edges: prev.edges, // Edges stay the same for updates
                    latestUpdate: node,
                };
            }

            // Add edge from previous node if it exists
            if (node.previousNodeId && newNodes.has(node.previousNodeId)) {
                const edgeId = `${node.previousNodeId}->${node.id}`;
                const existingEdge = newEdges.find((e) => e.id === edgeId);
                if (!existingEdge) {
                    newEdges.push({
                        id: edgeId,
                        source: node.previousNodeId,
                        target: node.id,
                        type: 'previous',
                        color: getModuleColor(node.module, 'previous'),
                        age: node.age
                    });
                }
            }

            // Add edge from grounded node if it exists and is different from previous
            if (
                groundedInNode && 
                groundedInNode.id !== node.previousNodeId
            ) {
                const edgeId = `${groundedInNode.id}~>${node.id}`;
                const existingEdge = newEdges.find((e) =>
                    e.id === edgeId || (e.source === groundedInNode.id && e.groundedExists === true && e.module === node.module));
                if (!existingEdge) {
                    newEdges.push({
                        id: edgeId,
                        source: groundedInNode.id,
                        target: node.id,
                        type: 'grounded',
                        groundedExists: true,
                        module: node.module,
                        age: groundedInNode.age
                    });
                }
            }

            setUniqueModules((prev) => new Set(prev).add(node.module));

            return {
                nodes: newNodes,
                edges: newEdges,
                latestUpdate: node,
            };
        });
    }, []);

    const clearTimeline = useCallback(() => {
        setTimelineData({
            nodes: new Map(),
            edges: [],
            latestUpdate: null,
        });
    }, []);

    useEffect(() => {
        if (!socket) return;

        const handleData = (data: IUData) => {
            console.log('Timeline data received:', data);
            addNode(data);
        };

        socket.on('data', handleData);

        return () => {
            socket.off('data', handleData);
        };
    }, [socket, addNode]);

    return {
        nodes: Array.from(timelineData.nodes.values()),
        nodesMap: timelineData.nodes,
        edges: timelineData.edges,
        latestUpdate: timelineData.latestUpdate,
        isConnected,
        clearTimeline,
        uniqueModules,
    };
};