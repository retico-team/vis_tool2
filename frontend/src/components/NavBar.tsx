import { useState } from 'react';
import { ModuleSelectionContent } from '@/components/ModuleSelectionContent';
import RecordButton from '@/components/RecordButton';
import Timeline from '@/components/Timeline';
import Network from '@/components/Network';

export default function Navbar() {
  const [activeTab, setActiveTab] = useState('Module Selection');
  const [isRecording, setRecording] = useState(false);
  const [isLoading, setLoading] = useState(false);
  const tabs = ['Module Selection', 'Timeline', 'Network'];

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-slate-800 shadow-lg">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-around items-center h-16">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 h-full text-center transition-colors duration-200 ${
                  activeTab === tab
                    ? 'bg-slate-700 text-white border-b-4 border-blue-500'
                    : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                }`}
              >
                <span className="text-lg font-medium">{tab}</span>
              </button>
            ))}
          </div>
        </div>
      </nav>
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-gray-50 rounded-lg p-6">
          <div className={activeTab === 'Module Selection' ? 'block' : 'hidden'}>
            <ModuleSelectionContent />
          </div>
          
          <div className={activeTab === 'Timeline' ? 'block' : 'hidden'}>
            <div className="flex flex-col h-[calc(100vh-12rem)]">
              <div className="bg-white rounded-t-lg shadow px-6 py-4 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-800">Timeline</h2>
                <RecordButton 
                  id="main-recorder"
                  isRecording={isRecording}
                  setRecording={setRecording}
                  isLoading={isLoading}
                  setLoading={setLoading}
                />
              </div>
              
              <div className="flex-1 bg-white rounded-b-lg shadow overflow-hidden">
                <Timeline />
              </div>
            </div>
          </div>
          
          <div className={activeTab === 'Network' ? 'block' : 'hidden'}>
            <div className="flex flex-col h-[calc(100vh-12rem)]">
              <div className="bg-white rounded-t-lg shadow px-6 py-4 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-800">Network</h2>
              </div>

              <div className="flex-1 bg-white rounded-b-lg shadow overflow-hidden">
                <Network />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}