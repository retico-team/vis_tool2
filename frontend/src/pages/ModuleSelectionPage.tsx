import Module from '@/components/Module';

function ModuleSelectionPage() {
  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <h1 className="text-2xl font-bold text-gray-800">Module Selection</h1>
      </div>
      <div className="flex flex-1 overflow-hidden">
          <Module />
      </div>
    </div>
  )
}

export default ModuleSelectionPage