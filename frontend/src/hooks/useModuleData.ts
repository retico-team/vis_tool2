import { useSocketContext } from '@/contexts/SocketContext';
import React, { useCallback, useEffect, useState } from 'react'
import type { ModulesMap } from '@/types/allTypes';

const useModuleData = () => {
    const { socket, isConnected } = useSocketContext();
    const [modules, setModules] = useState<ModulesMap>({});
    const isLoading = !isConnected;

    useEffect(() => {
        if (!socket) return;

        const handleData = (data: ModulesMap) => {
            console.log('Module data received:', data);
            
            setModules(prevModules => ({
                ...prevModules,
                ...data
            }));
        };

        socket.on('module', handleData);

        return () => {
            socket.off('module', handleData);
        };
    }, [socket]);

    return {
        modules,
        isConnected,
        isLoading,
    }
}

export default useModuleData;