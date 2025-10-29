import React from 'react';
import Navbar from '@/components/NavBar';
import { SocketProvider } from './contexts/SocketContext';


const App = () => {
  return (
    <SocketProvider>
      <Navbar />
    </SocketProvider>
  )
}

export default App