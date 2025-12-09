import { useState } from 'react';
import { SocketProvider } from './contexts/SocketContext';
import Navbar from '@/components/NavBar';
import ModuleSelectionPage from '@/pages/ModuleSelectionPage';
import TimelinePage from '@/pages/TimelinePage';
import NetworkPage from '@/pages/NetworkPage';

const App = () => {
  const [activeTab, setActiveTab] = useState('Module Selection');

  return (
    <SocketProvider>
      <div className="min-h-screen bg-gray-50">
        <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
        
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="bg-gray-50 rounded-lg p-6">

            {/* Module Selection */}
            <div className={activeTab === 'Module Selection' ? 'block' : 'hidden'}>
              <ModuleSelectionPage />
            </div>

            {/* Timeline */}
            <div className={activeTab === 'Timeline' ? 'block' : 'hidden'}>
              <TimelinePage />
            </div>

            {/* Network */}
            <div className={activeTab === 'Network' ? 'block' : 'hidden'}>
              <NetworkPage />
            </div>

          </div>
        </div>
      </div>
    </SocketProvider>
  );
}

export default App;