import { NavLink } from 'react-router-dom'
import { Home, FolderKanban, Bot, ClipboardCheck, Settings } from 'lucide-react'
import { usePendingReviewCount } from '../hooks'

const MobileBottomNav = () => {
  const { count: pendingReviewCount } = usePendingReviewCount()
  
  const navItems = [
    { to: '/', icon: Home, label: 'Dashboard' },
    { to: '/projects', icon: FolderKanban, label: 'Projects' },
    { to: '/agents', icon: Bot, label: 'Agents' },
    { 
      to: '/review', 
      icon: ClipboardCheck, 
      label: 'Review',
      badge: pendingReviewCount > 0 ? pendingReviewCount : undefined
    },
    { to: '/settings', icon: Settings, label: 'Settings' },
  ]

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-background-sidebar border-t border-slate-800 z-40">
      <div className="flex items-center justify-around px-2 py-3">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `mobile-nav-item relative ${isActive ? 'active' : ''}`
            }
          >
            <div className="relative">
              <item.icon className="w-5 h-5" />
              {item.badge !== undefined && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary text-white text-xs rounded-full flex items-center justify-center">
                  {item.badge > 9 ? '9+' : item.badge}
                </span>
              )}
            </div>
            <span className="text-xs mt-1">{item.label}</span>
          </NavLink>
        ))}
      </div>
      
      {/* Safe area spacer for iOS */}
      <div className="h-safe-bottom" />
    </nav>
  )
}

export default MobileBottomNav