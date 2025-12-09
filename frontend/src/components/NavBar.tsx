import type { NavbarProps } from '@/types/allTypes';

function Navbar({ activeTab, setActiveTab }: NavbarProps) {
  const tabs = ['Module Selection', 'Timeline', 'Network'];

  return (
    <nav className="bg-slate-800 shadow-lg">
      <div className="mx-auto">
        <div className="flex items-center h-16">
          <div className="flex items-center gap-3 px-4">
            <a href="https://github.com/retico-team" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
              <img src="/src/assets/retico-img.png" alt="Retico Logo" className="w-8 h-8" />
              <span className="text-white text-xl font-bold">Retico</span>
            </a>
          </div>

          <div className="flex flex-1 h-16">
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
      </div>
    </nav>
  );
}

export default Navbar;