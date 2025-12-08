import { useCallback, useEffect, useState, useRef } from "react";
import { useSocketContext } from "@/contexts/SocketContext";
import { getModuleColor } from "@/utils/TimelineUtils";
import type { NetworkData, NetworkFlowData, NetworkList } from "@/types/allTypes";

export const useNetworkData = () => {
    const { socket, isConnected } = useSocketContext();
    const [networkData, setNetworkData] = useState<NetworkFlowData>({
        nodes: new Map(),
        edges: [],
        uniqueModules: new Set<string>(),
    });

    const addNode = useCallback((data: NetworkData) => {
        const networkData: NetworkData = {
            networkList: data.NetworkList,
            modules: data.Modules,
            connections: data.Connections || [],
        }

        setNetworkData((prev: NetworkFlowData) => {
            const newNodes = new Map(prev.nodes);
            const newEdges = [...prev.edges];
            const newModules = new Set(prev.uniqueModules);

            const idToNodeMap = new Map<string, NetworkList>();
            const inDegree = new Map<string, number>();
            const childrenMap = new Map<string, Set<string>>();
    
            Object.entries(networkData.networkList).forEach(([module, info]: [string, NetworkList]) => {
                inDegree.set(module, 0);
                idToNodeMap.set(module, info);
                newModules.add(module);
            });

            Object.entries(networkData.networkList).forEach(([module, info]: [string, NetworkList]) => {
                for (const parent of info.previous_mods) {
                    if (!childrenMap.has(parent)) {
                        childrenMap.set(parent, new Set<string>);
                    }
                    inDegree.set(module, (inDegree.get(module) || 0) + 1);
                    childrenMap.get(parent)!.add(module);
                };
            });

            // Kahn's Algorithm for layering (topological sort)

            const layers: NetworkList[][] = [];
            let currentLayer: string[] = [];

            // Start with nodes that have no parents (inDegree = 0), these are root nodes
            for (const [module, degree] of inDegree.entries()) {
                if (degree === 0) currentLayer.push(module);
            }

            //process the current node
            while (currentLayer.length > 0) {
                const layerNodes: NetworkList[] = [];
                const nextLayer: string[] = [];

                for (const module of currentLayer) {
                    const node: NetworkList | undefined = idToNodeMap.get(module);
                    if (node) layerNodes.push(node);

                    const children = childrenMap.get(module) || [];
                    for (const childId of children) {
                        inDegree.set(childId, (inDegree.get(childId) || 0) - 1);
                        if (inDegree.get(childId) === 0) {
                            nextLayer.push(childId);
                        }
                    }
                }

                layers.push(layerNodes);
                currentLayer = nextLayer;
            }

            const allLayeredNodes: Set<string> = new Set(layers.flat().map((mod: NetworkList) => mod.current_mod));
            const missingNodes: string[] = networkData.modules.filter((mod: string) => !allLayeredNodes.has(mod));

            if (missingNodes.length > 0) {
                console.warn('Adding unlayered nodes to a new layer due to cycle or missing dependencies:', missingNodes.map((mod: string) => mod));
                layers.push(missingNodes);
            }

            layers.forEach((layer: NetworkList[], layerIndex: number) => {
                layer.forEach((module: NetworkList, index: number) => {
                    if (!newNodes.has(module.current_mod)) {
                        newNodes.set(module.current_mod, {
                            id: module.current_mod,
                            layerXPos: layerIndex,
                            color: getModuleColor(module.current_mod, 'previous'),
                        });
                    }
                });
            });

            networkData.connections.forEach((conn: { From: string; To: string }) => {
                const edgeId = `${conn.From}->${conn.To}`;
                if (!newEdges.find((e) => e.id === edgeId)) {
                    newEdges.push(
                        { 
                            id: edgeId, 
                            source: conn.From,
                            target: conn.To,
                            type: 'processed',
                            color: getModuleColor(conn.From, 'previous'),
                        }
                    );
                }
            });

            return {
                nodes: newNodes,
                edges: newEdges,
                uniqueModules: newModules,
            };
        });
    }, []);

    const clearNetwork = useCallback(() => {
        setNetworkData({
            nodes: new Map(),
            edges: [],
            uniqueModules: new Set<string>(),
        });
    }, []);

    useEffect(() => {
        if (!socket) return;

        const handleData = (data: NetworkData) => {
            addNode(data);
        };

        socket.on('network', handleData);

        return () => {
            socket.off('network', handleData);
        };
    }, [socket, addNode]);

    return {
        nodes: Array.from(networkData.nodes.values()),
        nodesMap: networkData.nodes,
        edges: networkData.edges,
        isConnected,
        clearNetwork,
        uniqueModules: networkData.uniqueModules,
    };
};