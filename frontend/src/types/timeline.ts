import { DefaultButton } from '@/types/general';
import { IUData } from '@/types/allTypes';

interface RecordButtonProps extends Omit<DefaultButton, 'onClick'> {
    isRecording?: boolean;
    setRecording?: (value: boolean) => void;
    onClick?: (id: string, isRecording: boolean) => void;
}

interface TimelineNode {
    id: string;
    label: string;
    updateType: string;
    age: number;
    nodeCount?: number;
    timeCreated: Date;
    module: string;
    previousNodeId?: string;
    groundedInNodeId?: string;
    rawData: IUData;
    isGroundedNode?: boolean;
}

interface TimelineEdge {
    id: string;
    source: string;
    target: string;
    type: 'previous' | 'grounded';
    groundedExists?: boolean;
    module: string;
}

interface TimelineData {
    nodes: Map<string, TimelineNode>;
    edges: TimelineEdge[];
    latestUpdate: TimelineNode | null;
}