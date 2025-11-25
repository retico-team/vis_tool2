interface NetworkNode {
    id: string;
    label: string;
    module: string;
    isGroundedNode?: boolean;
}

interface NetworkEdge {
    id: string;
    source: string;
    target: string;
    type: 'previous' | 'grounded';
    groundedExists?: boolean;
    module: string;
}

interface NetworkData {
    nodes: Map<string, NetworkNode>;
    edges: NetworkEdge[];
}