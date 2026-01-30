import { Search, Bell, HelpCircle, Plus } from 'lucide-react'

interface HeaderProps {
  onNewProjectClick: () => void
}

const Header = ({ onNewProjectClick }: HeaderProps) => {
  return (
    <header className="bg-background-sidebar border-b border-slate-800 px-4 lg:px-6 py-3 lg:py-4">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Search - hidden on mobile, shown on desktop */}
        <div className="hidden lg:block flex-1 max-w-2xl">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="search"
              placeholder="Search projects, agents, or tasks..."
              className="input-field w-full pl-10"
              inputMode="search"
              enterKeyHint="search"
            />
          </div>
        </div>

        {/* Mobile search button */}
        <div className="lg:hidden flex items-center justify-between w-full">
          <div className="text-lg font-bold text-white">Dashboard</div>
          <button className="p-2 text-slate-400 hover:text-white transition-colors active:bg-slate-800 rounded-lg">
            <Search className="w-5 h-5" />
          </button>
        </div>

        {/* Right side actions */}
        <div className="flex items-center justify-between lg:justify-end gap-3 lg:gap-4 w-full lg:w-auto">
          <button 
            onClick={onNewProjectClick}
            className="btn-primary flex items-center gap-2 hover:scale-105 active:scale-95 transition-transform min-h-[44px] px-4"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">New Project</span>
            <span className="sm:hidden">New</span>
          </button>
          
          <div className="flex items-center gap-2 lg:gap-4">
            <button className="relative p-2 text-slate-400 hover:text-white transition-colors active:bg-slate-800 rounded-lg min-w-[44px] min-h-[44px] flex items-center justify-center">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            
            <button className="p-2 text-slate-400 hover:text-white transition-colors active:bg-slate-800 rounded-lg min-w-[44px] min-h-[44px] flex items-center justify-center">
              <HelpCircle className="w-5 h-5" />
            </button>
            
            {/* Quick stats - hidden on mobile, shown on desktop */}
            <div className="hidden lg:flex items-center gap-6 ml-4 pl-6 border-l border-slate-800">
              <div className="text-center">
                <div className="text-2xl font-bold text-white">12</div>
                <div className="text-xs text-slate-400">Active</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-500">87%</div>
                <div className="text-xs text-slate-400">Success</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">$42.50</div>
                <div className="text-xs text-slate-400">Today</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header