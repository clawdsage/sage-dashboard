import { NavLink } from 'react-router-dom'
import { Home, FolderKanban, Bot, ClipboardCheck, Clock, BarChart3, Settings, Users, DollarSign } from 'lucide-react'
import { usePendingReviewCount } from '../hooks'
import { useRef, useEffect, useState } from 'react'

const MobileBottomNav = () => {
  const { count: pendingReviewCount } = usePendingReviewCount()
  const navRef = useRef<HTMLDivElement>(null)
  const [showLeftArrow, setShowLeftArrow] = useState(false)
  const [showRightArrow, setShowRightArrow] = useState(true)
  
  const navItems = [
    { to: '/', icon: Home, label: 'Dashboard' },
    { to: '/dashboard-v2/agents', icon: Bot, label: 'Agent History' },
    { to: '/dashboard-v2/projects', icon: Users, label: 'Projects' },
    { to: '/dashboard-v2/costs', icon: DollarSign, label: 'Costs' },
    { to: '/projects', icon: FolderKanban, label: 'Projects' },
    { to: '/agents', icon: Bot, label: 'Agents' },
    {
      to: '/review',
      icon: ClipboardCheck,
      label: 'Review',
      badge: pendingReviewCount > 0 ? pendingReviewCount : undefined
    },
    { to: '/activity', icon: Clock, label: 'Activity' },
    { to: '/analytics', icon: BarChart3, label: 'Analytics' },
    { to: '/settings', icon: Settings, label: 'Settings' },
  ]

  const checkScrollPosition = () => {
    if (navRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = navRef.current
      setShowLeftArrow(scrollLeft > 0)
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 1)
    }
  }

  const scrollLeft = () => {
    if (navRef.current) {
      navRef.current.scrollBy({ left: -100, behavior: 'smooth' })
    }
  }

  const scrollRight = () => {
    if (navRef.current) {
      navRef.current.scrollBy({ left: 100, behavior: 'smooth' })
    }
  }

  useEffect(() => {
    const navElement = navRef.current
    if (navElement) {
      navElement.addEventListener('scroll', checkScrollPosition)
      // Initial check
      checkScrollPosition()
      
      // Check on resize
      const resizeObserver = new ResizeObserver(checkScrollPosition)
      resizeObserver.observe(navElement)
      
      return () => {
        navElement.removeEventListener('scroll', checkScrollPosition)
        resizeObserver.disconnect()
      }
    }
  }, [])

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-background-sidebar border-t border-slate-800 z-40">
      {/* Scroll arrows for larger screens */}
      {showLeftArrow && (
        <button
          onClick={scrollLeft}
          className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-slate-800/80 backdrop-blur-sm rounded-full flex items-center justify-center text-white z-10 touch-button"
          aria-label="Scroll left"
        >
          ←
        </button>
      )}
      
      {showRightArrow && (
        <button
          onClick={scrollRight}
          className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-slate-800/80 backdrop-blur-sm rounded-full flex items-center justify-center text-white z-10 touch-button"
          aria-label="Scroll right"
        >
          →
        </button>
      )}

      {/* Scrollable navigation container */}
      <div 
        ref={navRef}
        className="flex items-center px-2 py-3 overflow-x-auto scrollbar-hide"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        <style>{`
          .scrollbar-hide::-webkit-scrollbar {
            display: none;
          }
        `}</style>
        
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `mobile-nav-item relative flex-shrink-0 min-w-[70px] px-2 ${isActive ? 'active' : ''}`
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
            <span className="text-xs mt-1 truncate">{item.label}</span>
          </NavLink>
        ))}
      </div>
      
      {/* Safe area spacer for iOS */}
      <div className="h-safe-bottom" />
    </nav>
  )
}

export default MobileBottomNav