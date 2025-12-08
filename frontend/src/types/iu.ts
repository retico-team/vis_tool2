import type { EdgeProps } from "reactflow";

interface IUData {
    IU: string;
    UpdateType: string;
    IUID: string;
    PreviousIUID?: string;
    GroundedIn?: IUData;
    Age: number;
    TimeCreated: string;
}

type IUEdgeCSS = {
    labelBgStyle: React.CSSProperties;
    labelStyle: React.CSSProperties;
    labelBgPadding: [number, number];
}

type IUEdgeProps = EdgeProps<IUData> & IUEdgeCSS;