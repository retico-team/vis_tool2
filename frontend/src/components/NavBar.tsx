import type { NavbarProps } from '@/types/allTypes';

function Navbar({ activeTab, setActiveTab }: NavbarProps) {
  const tabs = ['Module Selection', 'Timeline', 'Network'];

  return (
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
  );
}

export default Navbar;