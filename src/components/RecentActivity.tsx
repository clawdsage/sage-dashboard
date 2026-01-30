import { CheckCircle, AlertCircle, Play, Plus, Bot, Loader2 } from 'lucide-react'
import { useRealtimeActivityLog } from '../hooks'
import { useEffect, useState } from 'react'

const RecentActivity = () => {
  const { activities, loading, error } = useRealtimeActivityLog(5)
  const [animateUpdate, setAnimateUpdate] = useState(false)

  // Listen for data updates to trigger animations
  useEffect(() => {
    const handleDataUpdate = (event: CustomEvent) => {
      if (event.detail.table === 'activity_log') {
        setAnimateUpdate(true)
        setTimeout(() => setAnimateUpdate(false), 800)
      }
    }

    window.addEventListener('data-update', handleDataUpdate as EventListener)
    return () => {
      window.removeEventListener('data-update', handleDataUpdate as EventListener)
    }
  }, [])

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'agent_started':
        return <Play className="w-4 h-4 text-blue-500" />
      case 'agent_completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'project_created':
        return <Plus className="w-4 h-4 text-purple-500" />
      case 'task_created':
        return <Plus className="w-4 h-4 text-indigo-500" />
      case 'task_completed':
        return <CheckCircle className="w-4 h-4 text-emerald-500" />
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />
      default:
        return <Bot className="w-4 h-4 text-slate-400" />
    }
  }

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'agent_started':
        return 'bg-blue-500/20'
      case 'agent_completed':
        return 'bg-green-500/20'
      case 'project_created':
        return 'bg-purple-500/20'
      case 'task_created':
        return 'bg-indigo-500/20'
      case 'task_completed':
        return 'bg-emerald-500/20'
      case 'error':
        return 'bg-red-500/20'
      default:
        return 'bg-slate-500/20'
    }
  }

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)

    if (diffMins < 60) {
      return `${diffMins}m ago`
    } else if (diffHours < 24) {
      return `${diffHours}h ago`
    } else {
      return date.toLocaleDateString()
    }
  }

  if (loading) {
    return (
      <div className="card flex items-center justify-center p-8">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
        <span className="ml-3 text-slate-400">Loading activity...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="card p-6">
        <div className="text-red-400 mb-2">Error loading activity</div>
        <div className="text-sm text-slate-400">{error.message}</div>
      </div>
    )
  }

  if (activities.length === 0) {
    return (
      <div className="card p-8 text-center">
        <div className="text-slate-400 mb-2">No activity yet</div>
        <div className="text-sm text-slate-500">Activity will appear here as you use the dashboard</div>
      </div>
    )
  }

  return (
    <div className={`card transition-all duration-300 ${animateUpdate ? 'ring-2 ring-primary/30' : ''}`}>
      <div className="space-y-4">
        {activities.map((activity) => (
          <div
            key={activity.id}
            className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-800/50 transition-all duration-300"
          >
            <div className={`p-2 rounded-lg ${getActivityColor(activity.type)}`}>
              {getActivityIcon(activity.type)}
            </div>
            <div className="flex-1">
              <p className="text-sm text-white">{activity.message}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-slate-400">
                  {formatTime(activity.created_at)}
                </span>
                {activity.type === 'error' && (
                  <span className="text-xs px-2 py-0.5 bg-red-500/20 text-red-400 rounded">
                    Error
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
      <button className="w-full mt-4 py-2 text-center text-sm text-primary hover:text-primary-light font-medium transition-colors">
        View all activity →
      </button>
    </div>
  )
}

export default RecentActivity