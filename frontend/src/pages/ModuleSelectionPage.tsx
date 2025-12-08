import type { Module } from '@/types/allTypes';
import ModuleCategory from '@/components/Module';
import { useState } from 'react';

// test data
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
  },
];

function ModuleSelectionPage() {
  const [modules, setModules] = useState<Module[]>(sampleModules);

  const handleToggleModule = (moduleId: string) => {
    setModules(modules.map(m => {
      // Find the module being clicked
      const clickedModule = modules.find(mod => mod.id === moduleId);
      
      if (!clickedModule) return m;
      
      // If clicking on the same module that's already enabled, do nothing
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

export default ModuleSelectionPage;