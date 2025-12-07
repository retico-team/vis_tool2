interface NetworkNode {
    id: string;
    groundedInModule?: string;
    isGroundedNode: boolean;
    processedModules?: string[];
    color?: string;
    position: number;
}

interface NetworkEdge {
    id: string;
    source: string;
    target: string;
}

interface NetworkFlowData {
    nodes: Map<string, NetworkNode>;
    edges: NetworkEdge[];
}

interface NetworkData {
    // to be filled out
}