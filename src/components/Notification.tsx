import { CheckCircle, XCircle, X, AlertCircle } from 'lucide-react'
import { useEffect, useState } from 'react'

export type NotificationType = 'success' | 'error' | 'info' | 'warning'

interface Notification {
  id: string
  type: NotificationType
  message: string
  duration?: number
}

interface NotificationProps {
  notification: Notification
  onDismiss: (id: string) => void
}

const NotificationItem = ({ notification, onDismiss }: NotificationProps) => {
  const [isExiting, setIsExiting] = useState(false)

  useEffect(() => {
    if (notification.duration) {
      const timer = setTimeout(() => {
        setIsExiting(true)
        setTimeout(() => onDismiss(notification.id), 300)
      }, notification.duration)

      return () => clearTimeout(timer)
    }
  }, [notification.id, notification.duration, onDismiss])

  const handleDismiss = () => {
    setIsExiting(true)
    setTimeout(() => onDismiss(notification.id), 300)
  }

  const getIcon = () => {
    switch (notification.type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />
      case 'info':
        return <AlertCircle className="w-5 h-5 text-blue-500" />
    }
  }

  const getBgColor = () => {
    switch (notification.type) {
      case 'success':
        return 'bg-green-500/10 border-green-500/20'
      case 'error':
        return 'bg-red-500/10 border-red-500/20'
      case 'warning':
        return 'bg-yellow-500/10 border-yellow-500/20'
      case 'info':
        return 'bg-blue-500/10 border-blue-500/20'
    }
  }

  return (
    <div
      className={`relative w-full max-w-sm transform transition-all duration-300 ${
        isExiting ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0'
      }`}
    >
      <div className={`rounded-lg border p-4 shadow-lg backdrop-blur-sm ${getBgColor()}`}>
        <div className="flex items-start gap-3">
          {getIcon()}
          <div className="flex-1">
            <p className="text-sm font-medium text-white">{notification.message}</p>
          </div>
          <button
            onClick={handleDismiss}
            className="p-1 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

// Notification Provider Component
const NotificationProvider = () => {
  const [notifications, setNotifications] = useState<Notification[]>([])

  useEffect(() => {
    const handleShowNotification = (event: CustomEvent) => {
      const { type, message, duration = 5000 } = event.detail
      const id = Math.random().toString(36).substring(2, 9)
      
      setNotifications(prev => [
        ...prev,
        { id, type, message, duration }
      ])
    }

    window.addEventListener('show-notification', handleShowNotification as EventListener)
    return () => {
      window.removeEventListener('show-notification', handleShowNotification as EventListener)
    }
  }, [])

  const handleDismiss = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }

  if (notifications.length === 0) return null

  return (
    <div className="fixed top-4 right-4 z-50 space-y-3">
      {notifications.map(notification => (
        <NotificationItem
          key={notification.id}
          notification={notification}
          onDismiss={handleDismiss}
        />
      ))}
    </div>
  )
}

export default NotificationProvider
export { NotificationItem }