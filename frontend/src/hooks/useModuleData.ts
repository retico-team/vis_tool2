import { useSocketContext } from '@/contexts/SocketContext';
import React, { useCallback, useEffect } from 'react'

const useModuleData = () => {
    const { socket, isConnected } = useSocketContext();

    useEffect(() => {
        if (!socket) return;

        const handleData = (data) => {
            console.log('Module data received:', data);
        };

        socket.on('module', handleData);

        return () => {
            socket.off('module', handleData);
        };
    }, [socket]);

    return {
    }
}

export default useModuleData