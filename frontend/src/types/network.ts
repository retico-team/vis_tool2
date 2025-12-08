import type { EdgeType } from "@/types/allTypes";

interface NetworkNode {
    id: string;
    layerXPos: number;
    color: string;
}

interface NetworkEdge {
    id: string;
    source: string;
    target: string;
    type: EdgeType;
    color: string;
}

interface NetworkList {
    current_mod: string;
    next_mods: string[];
    previous_mods: string[];
}

interface NetworkFlowData {
    nodes: Map<string, NetworkNode>;
    edges: NetworkEdge[];
    uniqueModules: Set<string>;
}

interface NetworkData {
    networkList: Map<string, NetworkList>;
    modules: string[];
    connections: { From: string; To: string }[];
}