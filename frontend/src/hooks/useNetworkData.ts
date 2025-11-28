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
            const existingModules = prev.nodes.get(node.module)?.processedModules;
            const newProcessedModules = node.processedModules || [];
            
            if (existingModules) {
                const hasNewModules = newProcessedModules.some(
                    mod => !existingModules.includes(mod)
                );
                
                if (!hasNewModules) {
                    return prev;
                }
                
                const mergedModules = [
                    ...existingModules,
                    ...newProcessedModules.filter(mod => !existingModules.includes(mod))
                ];
                
                node = {
                    ...node,
                    processedModules: mergedModules,
                };

                const newNodes = new Map(prev.nodes);
                newNodes.set(node.module, node);
                
                const newEdges = [...prev.edges];
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
            
            const newNodes = new Map(prev.nodes);
            newNodes.set(node.module, node);
            
            const newEdges = [...prev.edges];
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