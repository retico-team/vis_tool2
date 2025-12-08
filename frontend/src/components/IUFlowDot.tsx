import { BaseEdge, getSmoothStepPath } from '@xyflow/react';
import type { IUEdgeProps } from '@/types/allTypes';
import { memo } from 'react';

export const IUFlowDot = memo(({
    id,
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    style,
    markerEnd,
    label,
    labelStyle,
    labelBgStyle,
    data,
}: IUEdgeProps) => {
    const [edgePath, labelX, labelY] = getSmoothStepPath({
        sourceX,
        sourceY,
        sourcePosition,
        targetX,
        targetY,
        targetPosition,
    });

    const edgeColor = style?.stroke || '#b1b1b7';
    const duration = data?.age || 3;

    return (
        <>
            <BaseEdge 
                id={id} 
                path={edgePath} 
                style={style}
                markerEnd={markerEnd}
            />
            <circle r="10" fill={edgeColor}>
                <animateMotion 
                    dur={`${duration}s`} 
                    repeatCount="indefinite" 
                    path={edgePath} 
                />
            </circle>
            {label && (
                <g>
                    <rect
                        x={labelX - 30}
                        y={labelY - 10}
                        width={60}
                        height={20}
                        rx={3}
                        fill={labelBgStyle?.fill || 'white'}
                        fillOpacity={labelBgStyle?.fillOpacity || 0.8}
                    />
                    <text
                        x={labelX}
                        y={labelY}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        style={{
                            fontSize: labelStyle?.fontSize || 12,
                            fill: labelStyle?.fill || '#000',
                            fontWeight: labelStyle?.fontWeight || 'normal',
                        }}
                    >
                        {label}
                    </text>
                </g>
            )}
        </>
    );
});