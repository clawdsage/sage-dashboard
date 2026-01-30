import { Search, Bell, HelpCircle, Plus } from 'lucide-react'

const Header = () => {
  return (
    <header className="bg-background-sidebar border-b border-slate-800 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Search */}
        <div className="flex-1 max-w-2xl">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="search"
              placeholder="Search projects, agents, or tasks..."
              className="input-field w-full pl-10"
            />
          </div>
        </div>

        {/* Right side actions */}
        <div className="flex items-center gap-4">
          <button className="btn-primary flex items-center gap-2">
            <Plus className="w-4 h-4" />
            New Project
          </button>
          
          <button className="relative p-2 text-slate-400 hover:text-white transition-colors">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>
          
          <button className="p-2 text-slate-400 hover:text-white transition-colors">
            <HelpCircle className="w-5 h-5" />
          </button>
          
          {/* Quick stats */}
          <div className="flex items-center gap-6 ml-4 pl-6 border-l border-slate-800">
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
    </header>
  )
}

export default Header