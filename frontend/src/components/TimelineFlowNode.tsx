import { memo } from "react";
import { Position, Handle } from "reactflow";
import type { TimelineNode, updateTypeColors } from "@/types/allTypes";

export const TimelineFlowNode = memo(({ data }: { data: TimelineNode }) => {
    const updateTypeColors: updateTypeColors = {
        COMMIT: 'bg-green-500',
        ADD: 'bg-blue-500',
        REVOKE: 'bg-red-500',
        MODULE: 'bg-violet-500'
    };

    const isLatest = data.isLatest;
    const isModule = data.isModule;

    return (
        <div
            className={`px-4 py-3 rounded-lg border-2 shadow-lg transition-all duration-300 ${
                isLatest ? 'border-yellow-400 ring-4 ring-yellow-200 scale-110' : 'border-gray-300'
            } bg-white`}
        >

            <Handle 
                type="target" 
                position={Position.Left}
                className="w-3 h-3 !bg-gray-400"
            />
            
            <div className="flex items-center gap-2 mb-1">
                <div className={`w-3 h-3 rounded-full ${updateTypeColors[data.updateType] || 'bg-gray-500'}`} />
                <div className="font-semibold text-sm text-gray-800">{data.label}</div>
            </div>
            {isModule ? (
                <div className="text-xs text-gray-600">
                    <div>{data.timeCreated}</div>
                </div>
            ) : (
                <div className="text-xs text-gray-600">
                    <div>{data.updateType}</div>
                    <div>Age: {data.age}</div>
                </div>
            )}
            
            <Handle 
                type="source" 
                position={Position.Right}
                className="w-3 h-3 !bg-gray-400"
            />
        </div>
    );
});