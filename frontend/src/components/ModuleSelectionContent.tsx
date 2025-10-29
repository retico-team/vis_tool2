import type { Module, ModuleCardProps, ModuleCategoryProps } from '@/types/allTypes';
import { useState } from 'react';

const sampleModules: Module[] = [
  {
    id: '1',
    name: 'Audio Input',
    description: 'Captures audio from microphone or line input',
    type: 'Producing Modules'
  },
  {
    id: '2',
    name: 'Oscillator',
    description: 'Generates sine, square, and sawtooth waveforms',
    type: 'Producing Modules'
  },
  {
    id: '3',
    name: 'Noise Generator',
    description: 'Produces white, pink, and brown noise',
    type: 'Producing Modules'
  },
  {
    id: '4',
    name: 'Speaker Output',
    description: 'Routes audio to speakers or headphones',
    type: 'Consuming Modules'
  },
  {
    id: '5',
    name: 'Spectrum Analyzer',
    description: 'Visualizes frequency spectrum of audio signal',
    type: 'Consuming Modules'
  },
  {
    id: '6',
    name: 'Audio Recorder',
    description: 'Records audio to file format',
    type: 'Consuming Modules'
  },
  {
    id: '7',
    name: 'MIDI Input',
    description: 'Receives MIDI messages from external devices',
    type: 'Trigger Modules'
  },
  {
    id: '8',
    name: 'Button Trigger',
    description: 'Manual trigger via button press',
    type: 'Trigger Modules'
  },
  {
    id: '9',
    name: 'Sequencer',
    description: 'Generates timed trigger events in sequence',
    type: 'Trigger Modules'
  }
];

// Module Card Component
function ModuleCard({ module, onToggle }: ModuleCardProps) {
  return (
    <div
      onClick={() => onToggle(module.id)}
      className={`
        border-2 rounded-lg p-4 transition-all cursor-pointer
        ${module.enabled 
          ? 'bg-blue-50 border-blue-500 shadow-lg ring-2 ring-blue-300' 
          : 'bg-white border-gray-200 hover:shadow-md hover:border-gray-300'
        }
      `}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h4 className={`font-semibold mb-2 ${module.enabled ? 'text-blue-800' : 'text-gray-800'}`}>
            {module.name}
          </h4>
          <p className="text-sm text-gray-600">{module.description}</p>
        </div>
      </div>
    </div>
  );
}

// Module Category Component
function ModuleCategory({ type, modules, onToggle }: ModuleCategoryProps) {
  const categoryModules = modules.filter(m => m.type === type);
  
  const categoryColors = {
    'Producing Modules': 'bg-green-100 border-green-300',
    'Consuming Modules': 'bg-blue-100 border-blue-300',
    'Trigger Modules': 'bg-purple-100 border-purple-300'
  };
  
  return (
    <div className="mb-8">
      <div className={`${categoryColors[type]} border-2 rounded-lg p-4 mb-4`}>
        <h3 className="text-xl font-bold text-gray-800">{type}</h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categoryModules.map(module => (
          <ModuleCard key={module.id} module={module} onToggle={onToggle} />
        ))}
      </div>
    </div>
  );
}

// Module Selection Content
export function ModuleSelectionContent() {
  const [modules, setModules] = useState<Module[]>(sampleModules);

  const handleToggleModule = (moduleId: string) => {
    setModules(modules.map(m => {
      // Find the module being clicked
      const clickedModule = modules.find(mod => mod.id === moduleId);
      
      if (!clickedModule) return m;
      
      // If clicking on the same module that's already enabled, do nothing (or you can disable it)
      if (m.id === moduleId) {
        return { ...m, enabled: !m.enabled }; // Toggle the clicked module
      }
      
      // Disable all other modules of the same type
      if (m.type === clickedModule.type) {
        return { ...m, enabled: false };
      }
      
      // Keep other modules unchanged
      return m;
    }));
  };

  return (
    <div>
      <ModuleCategory 
        type="Producing Modules" 
        modules={modules} 
        onToggle={handleToggleModule}
      />
      <ModuleCategory 
        type="Consuming Modules" 
        modules={modules} 
        onToggle={handleToggleModule}
      />
      <ModuleCategory 
        type="Trigger Modules" 
        modules={modules} 
        onToggle={handleToggleModule}
      />
    </div>
  );
}