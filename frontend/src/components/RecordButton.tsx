import { useState } from 'react'
import type { RecordButtonProps } from '@/types/allTypes';
import { api } from '@/services/api';
import { API_CONFIG } from '@/config';

function RecordButton({ id, onToggle }: RecordButtonProps) {
  const [isRecording, setRecording] = useState(false);
  const [isLoading, setLoading] = useState(false);
  
  const ENABLE_RUNNER_ENDPOINT = API_CONFIG.ENDPOINTS.ENABLE_RUNNER;
  const DISABLE_RUNNER_ENDPOINT = API_CONFIG.ENDPOINTS.DISABLE_RUNNER;

  const handleToggle = async () => {
    const newRecordingState = !isRecording;
    
    setRecording(newRecordingState);
    setLoading(true);
    
    if (onToggle) {
      onToggle(id, newRecordingState);
    }
    
    try {
      const endpoint = newRecordingState ? ENABLE_RUNNER_ENDPOINT : DISABLE_RUNNER_ENDPOINT;
      const response = await api.post(endpoint);
    }
    catch (error) {
      // Revert state on error
      setRecording(!newRecordingState);
      if (onToggle) {
        onToggle(id, !newRecordingState);
      }
      console.error(error);
    }
    finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleToggle}
      disabled={isLoading}
      className={`
        flex items-center gap-2 px-4 py-2 rounded-lg font-medium 
        transition-all duration-200 shadow-md
        ${
          isRecording
            ? 'bg-red-500 hover:bg-red-600 text-white'
            : 'bg-blue-600 hover:bg-blue-700 text-white'
        }
        ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
      `}
    >
      <span
        className={`
          w-3 h-3 rounded-full transition-all
          ${isRecording ? 'bg-white' : 'bg-red-500'}
          ${isRecording ? 'animate-pulse' : ''}
        `}
      />

      <span>
        {isLoading ? 'Processing...' : isRecording ? 'Stop' : 'Record'}
      </span>
    </button>
  );
}

export default RecordButton;