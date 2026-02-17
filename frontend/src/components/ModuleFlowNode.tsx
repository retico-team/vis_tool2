import { useSocketContext } from "@/contexts/SocketContext";
import { useState } from "react";
import { Handle, Position } from "reactflow";
import { getModuleColor } from "@/utils/TimelineUtils";

const ModuleFlowNode = ({ data }) => {
  const [showParams, setShowParams] = useState(false);
  const { socket, isConnected } = useSocketContext();
  const [paramValues, setParamValues] = useState(() => {
    console.log('Initializing param values with:', data.params);
    return data.params || {};
  });
  
  const [modifiedParams, setModifiedParams] = useState(new Set());

  const handleParamChange = (paramName, value) => {
    setParamValues(prev => ({
      ...prev,
      [paramName]: value
    }));
    setModifiedParams(prev => new Set([...prev, paramName]));
  };

  const handleSaveParams = () => {
    if (socket && isConnected) {
      const paramsToSend = Object.fromEntries(
        Object.entries(paramValues).filter(([key]) => modifiedParams.has(key))
      );
      
      socket.emit('update_params', {
        nodeId: data.nodeId,
        params: paramsToSend
      });
      console.log('Saved params:', paramsToSend);
    }
  };

  const nodeColor = getModuleColor(data.parent, 'default');

  return (
    <div 
      className="px-4 py-2 rounded-lg border-2 shadow-md min-w-[180px]"
      style={{
        backgroundColor: nodeColor,
        borderColor: nodeColor,
      }}
    >
      <div className="font-bold text-sm mb-1">{data.label}</div>
      <div className="text-xs text-shadow-black">extends: {data.parent}</div>

      {data.params && Object.keys(data.params).length > 0 && (
        <div className="mt-2 border-t pt-2">
          <button
            onClick={() => setShowParams(!showParams)}
            className="flex items-center justify-between w-full text-xs font-semibold text-gray-700 hover:text-gray-900"
          >
            <span className="text-black">Params</span>
            <span className="text-xs">{showParams ? '▼' : '▶'}</span>
          </button>
          
          {showParams && (
            <div className="mt-1 text-xs space-y-2 bg-white bg-opacity-50 rounded p-2">
              {Object.entries(paramValues).map(([key, value]) => (
                <div key={key} className="flex flex-col gap-1">
                  <label className="font-medium text-black-950">{key}:</label>
                  <input
                    type="text"
                    value={value}
                    onChange={(e) => handleParamChange(key, e.target.value)}
                    className="px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder={`Enter ${key}`}
                  />
                </div>
              ))}
              
              <button
                onClick={handleSaveParams}
                disabled={!isConnected}
                className="w-full mt-2 px-2 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {isConnected ? 'Save Parameters' : 'Disconnected'}
              </button>
            </div>
          )}
        </div>
      )}

      <Handle
        type="target" 
        position={Position.Left}
        className="w-3 h-3 !bg-gray-400"
      />

      <Handle 
        type="source" 
        position={Position.Right}
        className="w-3 h-3 !bg-gray-400"
      />
    </div>
  );
};

export default ModuleFlowNode;