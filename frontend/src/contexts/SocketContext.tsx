import React, { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import { API_CONFIG } from '@/config';
import type { SocketContextType } from '@/types/allTypes';

const SocketContext = createContext<SocketContextType> ({
    socket: null,
    isConnected: false
});

export const useSocketContext = () => useContext(SocketContext);

export const SocketProvider = ({ children }: { children: ReactNode}) => {
    const [socket, setSocket] = useState<Socket | null>(null);
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        const sio = io(API_CONFIG.BASE_URL);
        setSocket(sio);

        sio.on('connect', () => {
            console.log('Connected to server');
            setIsConnected(true);
        });

        sio.on('disconnect', (reason) => {
            console.log('Disconnected from server: ' + reason);
            setIsConnected(false);
        });

        return () => {
            sio.disconnect();
        };
    }, []);

    return (
        <SocketContext.Provider value={{ socket, isConnected }}>
            {children}
        </SocketContext.Provider>
    );
};