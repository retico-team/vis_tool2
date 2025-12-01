import { useCallback, useEffect, useState, useRef } from "react";
import { useSocketContext } from "@/contexts/SocketContext";
import { getModuleColor } from "@/utils/TimelineUtils";
import type { NetworkData, IUData, NetworkNode } from "@/types/allTypes";

export const useNetworkData = () => {
    const { socket, isConnected } = useSocketContext();
    const [networkData, setNetworkData] = useState<NetworkData>({
        nodes: new Map(),
        edges: [],
    });
    
    const edgeIdsRef = useRef<Set<string>>(new Set());

    const addNode = useCallback((data: IUData) => {

        const node: NetworkNode = {
            id: data.Module,
            groundedInModule: data.GroundedIn.Module,
            isGroundedNode: false,
            processedModules: data.ModuleList || [],
        };

        const groundedInData = data.GroundedIn;

        const groundedInNode: NetworkNode = {
            id: groundedInData.Module,
            isGroundedNode: true,
        }

        setNetworkData((prev) => {
            const newNodes = new Map(prev.nodes);
            const newEdges = [...prev.edges];
            const existingModules = prev.nodes.get(node.id)?.processedModules;
            const newProcessedModules = node.processedModules || [];
            
            if (existingModules) {
                console.log('Updating node in network: IN ', node);
                const hasNewModules = newProcessedModules.some(
                    mod => !existingModules.includes(mod)
                );
                
                if (!hasNewModules) {
                    return prev;
                }

                const nonExistingModules = [...newProcessedModules.filter(mod => !existingModules.includes(mod))]
                const mergedModules = [
                    ...existingModules,
                    ...nonExistingModules
                ];

                const updatedNode = {
                    ...node,
                    processedModules: mergedModules,
                };

                newNodes.set(groundedInNode.id, groundedInNode);
                newNodes.set(node.id, updatedNode);

                nonExistingModules.forEach(mod => {
                    const newNode = {
                        id: mod,
                        isGroundedNode: false,
                        color: getModuleColor(mod, 'processed'),
                    };

                    newNodes.set(mod, newNode);
                });

                const startIdx = existingModules.length;
                
                for (let i = startIdx; i < mergedModules.length; i++) {
                    const source = i === 0 ? node.id : mergedModules[i - 1];
                    const target = mergedModules[i];
                    const edgeId = `${source}~>${target}`;
                    
                    if (!edgeIdsRef.current.has(edgeId)) {
                        edgeIdsRef.current.add(edgeId);
                        newEdges.push({
                            id: edgeId,
                            source,
                            target,
                            type: 'processed',
                            color: getModuleColor(node.id, 'processed'),
                        });
                    }
                }
                
                return {
                    nodes: newNodes,
                    edges: newEdges,
                };
            }

            console.log('Adding node to network: OUT ', node);
            newNodes.set(groundedInNode.id, groundedInNode);
            newNodes.set(node.id, node);

            newProcessedModules.forEach(mod => {
                const newNode = {
                    id: mod,
                    isGroundedNode: false,
                    color: getModuleColor(mod, 'processed'),
                };
                newNodes.set(mod, newNode);
            });
            const edgesToCreate: Array<{ source: string; target: string; type: string }> = [];
            
            if (node.groundedInModule) {
                edgesToCreate.push({
                    source: node.groundedInModule,
                    target: node.id,
                    type: 'grounded',
                });
            }
            
            if (newProcessedModules.length > 0) {
                edgesToCreate.push({
                    source: node.id,
                    target: newProcessedModules[0],
                    type: 'processed',
                });
                
                for (let i = 0; i < newProcessedModules.length - 1; i++) {
                    edgesToCreate.push({
                        source: newProcessedModules[i],
                        target: newProcessedModules[i + 1],
                        type: 'processed',
                    });
                }
            }
            
            edgesToCreate.forEach(({ source, target, type }) => {
                const edgeId = `${source}~>${target}`;
                if (!edgeIdsRef.current.has(edgeId)) {
                    edgeIdsRef.current.add(edgeId);
                    newEdges.push({
                        id: edgeId,
                        source,
                        target,
                        type,
                        color: getModuleColor(node.id, type),
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
        edgeIdsRef.current.clear();
        setNetworkData({
            nodes: new Map(),
            edges: [],
        });
    }, []);

    useEffect(() => {
        if (!socket) return;

        const handleData = (data: IUData) => {
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