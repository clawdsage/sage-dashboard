import { Outlet } from 'react-router-dom'
import { useState } from 'react'
import Sidebar from './Sidebar'
import Header from './Header'
import CreateProjectModal from './CreateProjectModal'
import NotificationProvider from './Notification'

const Layout = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)

  const handleNewProjectClick = () => {
    setIsCreateModalOpen(true)
  }

  const handleModalClose = () => {
    setIsCreateModalOpen(false)
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header onNewProjectClick={handleNewProjectClick} />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
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