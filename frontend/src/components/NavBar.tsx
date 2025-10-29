import { useState } from 'react';
import { ModuleSelectionContent } from '@/components/ModuleSelectionContent';
import RecordButton from '@/components/RecordButton';

export default function Navbar() {
  const [activeTab, setActiveTab] = useState('Module Selection');
  const [isRecording, setRecording] = useState(false);
  const [isLoading, setLoading] = useState(false);
  const tabs = ['Module Selection', 'Timeline', 'Visualizer'];

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
          {activeTab === 'Module Selection' && <ModuleSelectionContent />}
          {activeTab === 'Timeline' && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Timeline</h2>
                    <div className="max-w-7xl mx-auto px-4 pt-4">
                    <RecordButton 
                    id="main-recorder"
                    isRecording={isRecording}
                    setRecording={setRecording}
                    isLoading={isLoading}
                    setLoading={setLoading}
                    />
                  </div>
            </div>
          )}
          {activeTab === 'Visualizer' && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Visualizer</h2>
              <p className="text-gray-600">Content for Visualizer goes here.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}