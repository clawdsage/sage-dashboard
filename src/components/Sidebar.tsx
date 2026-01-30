import { NavLink } from 'react-router-dom'
import { 
  Home, 
  FolderKanban, 
  Users, 
  BarChart3, 
  Settings,
  Bot,
  Clock,
  CheckCircle,
  ClipboardCheck
} from 'lucide-react'
import { usePendingReviewCount } from '../hooks'

const Sidebar = () => {
  const { count: pendingReviewCount } = usePendingReviewCount()
  
  const navItems = [
    { to: '/', icon: Home, label: 'Dashboard' },
    { to: '/projects', icon: FolderKanban, label: 'Projects' },
    { to: '/agents', icon: Bot, label: 'Sub-agents' },
    { 
      to: '/review', 
      icon: ClipboardCheck, 
      label: 'Review Queue',
      badge: pendingReviewCount > 0 ? pendingReviewCount : undefined
    },
    { to: '/activity', icon: Clock, label: 'Activity' },
    { to: '/analytics', icon: BarChart3, label: 'Analytics' },
    { to: '/team', icon: Users, label: 'Team' },
    { to: '/settings', icon: Settings, label: 'Settings' },
  ]

  const recentProjects = [
    { id: '1', name: 'Market Analysis', status: 'in-progress' },
    { id: '2', name: 'Content Generation', status: 'completed' },
    { id: '3', name: 'Code Review', status: 'review' },
  ]

  return (
    <aside className="w-64 bg-background-sidebar border-r border-slate-800 flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Sage Dashboard</h1>
            <p className="text-sm text-slate-400">AI Sub-agent Management</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <div className="space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `sidebar-link ${isActive ? 'active' : ''}`
              }
            >
              <item.icon className="w-5 h-5" />
              <span className="flex-1">{item.label}</span>
              {item.badge !== undefined && (
                <span className="px-2 py-1 text-xs font-semibold bg-primary text-white rounded-full min-w-6 flex items-center justify-center">
                  {item.badge > 99 ? '99+' : item.badge}
                </span>
              )}
            </NavLink>
          ))}
        </div>

        {/* Recent Projects */}
        <div className="mt-8">
          <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3 px-4">
            Recent Projects
          </h3>
          <div className="space-y-2">
            {recentProjects.map((project) => (
              <NavLink
                key={project.id}
                to={`/project/${project.id}`}
                className="sidebar-link"
              >
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{project.name}</span>
                    {project.status === 'completed' && (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <div className={`w-2 h-2 rounded-full ${
                      project.status === 'completed' ? 'bg-green-500' :
                      project.status === 'in-progress' ? 'bg-blue-500' :
                      'bg-yellow-500'
                    }`} />
                    <span className="text-xs text-slate-400 capitalize">
                      {project.status.replace('-', ' ')}
                    </span>
                  </div>
                </div>
              </NavLink>
            ))}
          </div>
        </div>
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-slate-800">
        <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-800/50">
          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
            <span className="text-lg font-semibold text-primary">S</span>
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-white">Sage Admin</p>
            <p className="text-xs text-slate-400">Administrator</p>
          </div>
        </div>
      </div>
    </aside>
  )
}

export default Sidebar