import { CheckCircle, AlertCircle, Play, Plus, Bot } from 'lucide-react'
import { Activity } from '../types'

const mockActivities: Activity[] = [
  {
    id: '1',
    type: 'agent_started',
    message: 'Research Agent started analyzing Q4 data',
    timestamp: '2024-01-29T15:45:00Z',
    projectId: '1',
    agentId: '1'
  },
  {
    id: '2',
    type: 'agent_completed',
    message: 'Content Writer completed blog post generation',
    timestamp: '2024-01-29T14:20:00Z',
    projectId: '2',
    agentId: '2'
  },
  {
    id: '3',
    type: 'project_created',
    message: 'New project "Customer Support Bot" created',
    timestamp: '2024-01-29T13:10:00Z',
    projectId: '4'
  },
  {
    id: '4',
    type: 'error',
    message: 'Data Analyzer encountered processing error',
    timestamp: '2024-01-29T12:30:00Z',
    projectId: '3',
    agentId: '4'
  },
  {
    id: '5',
    type: 'agent_started',
    message: 'Code Reviewer began analysis',
    timestamp: '2024-01-29T11:45:00Z',
    projectId: '3',
    agentId: '3'
  }
]

const RecentActivity = () => {
  const getActivityIcon = (type: Activity['type']) => {
    switch (type) {
      case 'agent_started':
        return <Play className="w-4 h-4 text-blue-500" />
      case 'agent_completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'project_created':
        return <Plus className="w-4 h-4 text-purple-500" />
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />
    }
  }

  const getActivityColor = (type: Activity['type']) => {
    switch (type) {
      case 'agent_started':
        return 'bg-blue-500/20'
      case 'agent_completed':
        return 'bg-green-500/20'
      case 'project_created':
        return 'bg-purple-500/20'
      case 'error':
        return 'bg-red-500/20'
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

  return (
    <div className="card">
      <div className="space-y-4">
        {mockActivities.map((activity) => (
          <div
            key={activity.id}
            className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-800/50 transition-colors"
          >
            <div className={`p-2 rounded-lg ${getActivityColor(activity.type)}`}>
              {getActivityIcon(activity.type)}
            </div>
            <div className="flex-1">
              <p className="text-sm text-white">{activity.message}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-slate-400">
                  {formatTime(activity.timestamp)}
                </span>
                {activity.projectId && (
                  <span className="text-xs px-2 py-0.5 bg-slate-800 rounded">
                    Project {activity.projectId}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
      <button className="w-full mt-4 py-2 text-center text-sm text-primary hover:text-primary-light font-medium">
        View all activity →
      </button>
    </div>
  )
}

export default RecentActivity