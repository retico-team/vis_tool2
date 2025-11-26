import { useCallback, useEffect, useState } from "react";
import { useSocketContext } from "@/contexts/SocketContext";
import { getModuleColor } from "@/utils/TimelineUtils";
import type { NetworkData, IUData, NetworkNode } from "@/types/allTypes";

export const useNetworkData = () => {
    const { socket, isConnected } = useSocketContext();
    const [networkData, setNetworkData] = useState<NetworkData>({
        nodes: new Map(),
        edges: [],
    });

    const addNode = useCallback((data: IUData) => {
        const node: NetworkNode = {
            id: data.IUID,
            module: data.Module,
            groundedInModule: data.GroundedIn.Module,
            isGroundedNode: false,
            processedModules: data.ModuleList || [],
        };

        setNetworkData((prev) => {
            const newNodes = new Map(prev.nodes);
            const newEdges = [...prev.edges];

            newNodes.set(node.module, node);

            // Check if node already exists (update case)
            // TODO potentially filter with updatetype of COMMIT as well?
            if (prev.nodes.has(node.module)) {
                return {
                    nodes: newNodes,
                    edges: prev.edges,
                };
            }

            // Create edges in the order: grounded -> current -> processed nodes

            const edgesToCreate: Array<{ source: string; target: string; type: string }> = [];

            if (node.groundedInModule) {
                edgesToCreate.push({
                    source: node.groundedInModule,
                    target: node.module,
                    type: 'grounded',
                });
            }

            if (node.processedModules.length > 0) {
                edgesToCreate.push({
                    source: node.module,
                    target: node.processedModules[0],
                    type: 'processed',
                });
            }

            for (let i = 0; i < node.processedModules.length - 1; i++) {
                const currentModule = node.processedModules[i];
                const nextModule = node.processedModules[i + 1];
                
                edgesToCreate.push({
                    source: currentModule,
                    target: nextModule,
                    type: 'processed',
                });
            }

            edgesToCreate.forEach(({ source, target, type }) => {
                const edgeId = `${source}->${target}`;
                const existingEdge = newEdges.find((e) => e.id === edgeId);
                
                if (!existingEdge) {
                    newEdges.push({
                        id: edgeId,
                        source,
                        target,
                        type,
                        color: getModuleColor(node.module, type),
                    });
                }
            });

            return {
                nodes: newNodes,
                edges: newEdges,
            };
        });
    }, []);

    const clearNetwork = useCallback(() => {
        setNetworkData({
            nodes: new Map(),
            edges: [],
        });
    }, []);

    useEffect(() => {
        if (!socket) return;

        const handleData = (data: IUData) => {
            console.log('Network data received:', data);
            addNode(data);
        };

        socket.on('data', handleData);

        return () => {
            socket.off('data', handleData);
        };
    }, [socket, addNode]);

    return {
        nodes: Array.from(networkData.nodes.values()),
        nodesMap: networkData.nodes,
        edges: networkData.edges,
        isConnected,
        clearNetwork,
    };
};