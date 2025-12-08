import { DefaultButton, EdgeType } from '@/types/allTypes';

interface RecordButtonProps {
    id: string;
    onToggle?: (id: string, isRecording: boolean) => void;
}

interface TimelineNode {
    id: string;
    label: string;
    updateType: string;
    age: number;
    timeCreated: Date;
    module: string;
    previousNodeId?: string;
    groundedInNodeId?: string;
    isGroundedNode?: boolean;
    isLatest?: boolean;
    isModule?: boolean;
}

interface TimelineEdge {
    id: string;
    source: string;
    target: string;
    type: EdgeType;
    groundedExists?: boolean;
    module: string;
    age: number;
}

interface TimelineFlowData {
    nodes: Map<string, TimelineNode>;
    edges: TimelineEdge[];
    latestUpdate: TimelineNode | null;
}

interface updateTypeColors {
    COMMIT: string;
    ADD: string;
    REVOKE: string;
    MODULE: string;
}