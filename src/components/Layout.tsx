import { Outlet } from 'react-router-dom'
import { useState, useEffect } from 'react'
import Sidebar from './Sidebar'
import Header from './Header'
import MobileBottomNav from './MobileBottomNav'
import CreateProjectModal from './CreateProjectModal'
import NotificationProvider from './Notification'
import { Menu, X } from 'lucide-react'

const Layout = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  const handleNewProjectClick = () => {
    setIsCreateModalOpen(true)
  }

  const handleModalClose = () => {
    setIsCreateModalOpen(false)
  }

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen)
  }

  // Listen for close-sidebar event from sidebar links
  useEffect(() => {
    const handleCloseSidebar = () => {
      setIsSidebarOpen(false)
    }

    window.addEventListener('close-sidebar', handleCloseSidebar)
    return () => {
      window.removeEventListener('close-sidebar', handleCloseSidebar)
    }
  }, [])

  return (
    <div className="flex h-screen bg-background">
      {/* Mobile sidebar overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar with responsive behavior */}
      <div className={`
        fixed lg:static inset-y-0 left-0 z-50
        transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 transition-transform duration-300 ease-in-out
      `}>
        <Sidebar />
      </div>

      {/* Main content area */}
      <div className="flex-1 flex flex-col overflow-hidden w-full">
        {/* Mobile sidebar toggle button */}
        <button
          onClick={toggleSidebar}
          className="lg:hidden fixed top-4 left-4 z-40 p-2 rounded-lg bg-background-card border border-slate-700 text-white touch-button"
          aria-label="Toggle sidebar"
        >
          {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>

        <Header onNewProjectClick={handleNewProjectClick} />
        <main className="flex-1 overflow-y-auto p-4 lg:p-6 pb-20 lg:pb-6">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
        
        {/* Mobile Bottom Navigation */}
        <MobileBottomNav />
      </div>

      {/* Create Project Modal */}
      <CreateProjectModal
        isOpen={isCreateModalOpen}
        onClose={handleModalClose}
        onSuccess={handleModalClose}
      />

      {/* Notification Provider */}
      <NotificationProvider />
    </div>
  )
}

export default Layout