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

        let node: NetworkNode = {
            id: data.IUID,
            label: data.IU,
            module: data.Module,
            groundedInModule: data.GroundedIn.Module,
            isGroundedNode: false,
            processedModules: data.ModuleList || [],
        };

        setNetworkData((prev) => {
            const newNodes = new Map(prev.nodes);
            const newEdges = [...prev.edges];
            const existingModules = prev.nodes.get(node.module)?.processedModules;
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

                node = {
                    ...node,
                    processedModules: mergedModules,
                };

                newNodes.set(node.module, node);

                nonExistingModules.forEach(mod => {
                    node = {
                        module: mod,
                        color: getModuleColor(mod, 'processed'),
                    };

                    newNodes.set(mod, node);
                });

                const startIdx = existingModules.length;
                
                for (let i = startIdx; i < mergedModules.length; i++) {
                    const source = i === 0 ? node.module : mergedModules[i - 1];
                    const target = mergedModules[i];
                    const edgeId = `${source}~>${target}`;
                    
                    if (!edgeIdsRef.current.has(edgeId)) {
                        edgeIdsRef.current.add(edgeId);
                        newEdges.push({
                            id: edgeId,
                            source,
                            target,
                            type: 'processed',
                            color: getModuleColor(node.module, 'processed'),
                        });
                    }
                }
                
                return {
                    nodes: newNodes,
                    edges: newEdges,
                };
            }

            console.log('Adding node to network: OUT ', node);
            const edgesToCreate: Array<{ source: string; target: string; type: string }> = [];
            
            if (node.groundedInModule) {
                edgesToCreate.push({
                    source: node.groundedInModule,
                    target: node.module,
                    type: 'grounded',
                });
            }
            
            if (newProcessedModules.length > 0) {
                edgesToCreate.push({
                    source: node.module,
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