import type { NetworkNode } from '@/types/allTypes';
import { memo } from 'react';
import { Handle, Position } from 'reactflow';

const NetworkFlowNode = memo(({ data, id }: { data: NetworkNode, id: string }) => {
  return (
    <div
      className="px-4 py-2 rounded-lg border-2 shadow-md bg-white transition-all hover:shadow-lg"
      style={{ 
        borderColor: data.color,
        minWidth: '120px',
      }}
    >
      <Handle 
      type="target" 
      position={Position.Left}
      className="w-3 h-3 !bg-gray-400"
      />
      <div className="font-semibold text-sm text-gray-800">{id}</div>

      <Handle 
      type="source" 
      position={Position.Right}
      className="w-3 h-3 !bg-gray-400"
      />
    </div>
  );
});

export default NetworkFlowNode;