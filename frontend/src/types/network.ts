interface NetworkNode {
    id: string;
    label: string;
    module: string;
    groundedInModule?: string;
    isGroundedNode?: boolean;
    processedModules: string[];
}

interface NetworkEdge {
    id: string;
    source: string;
    target: string;
    groundedExists?: boolean;
    module: string;
}

interface NetworkData {
    nodes: Map<string, NetworkNode>;
    edges: NetworkEdge[];
}