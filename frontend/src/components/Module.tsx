import type { Module, ModuleCardProps, ModuleCategoryProps } from '@/types/allTypes';

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
  const categoryModules = modules.filter((m: Module) => m.type === type);
  
  const categoryColors: { [key: string]: string } = {
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
        {categoryModules.map((module: Module) => (
          <ModuleCard key={module.id} module={module} onToggle={onToggle} />
        ))}
      </div>
    </div>
  );
}

export default ModuleCategory