import { Clock, CheckCircle, AlertCircle, Play, FileText, Bot, User, Filter, Calendar } from 'lucide-react'
import { useState } from 'react'

const Activity = () => {
  const [filter, setFilter] = useState('all')
  
  // Mock activity data
  const activities = [
    { id: '1', type: 'agent_started', message: 'Research Agent started task "Market Analysis"', user: 'System', time: '2 minutes ago', project: 'Market Analysis', icon: Play, color: 'text-blue-500', bgColor: 'bg-blue-500/20' },
    { id: '2', type: 'project_created', message: 'New project "Content Generation" created', user: 'Sage Admin', time: '15 minutes ago', project: 'Content Generation', icon: FileText, color: 'text-green-500', bgColor: 'bg-green-500/20' },
    { id: '3', type: 'agent_completed', message: 'Data Analyzer completed task "Process Q4 Data"', user: 'System', time: '1 hour ago', project: 'Market Analysis', icon: CheckCircle, color: 'text-green-500', bgColor: 'bg-green-500/20' },
    { id: '4', type: 'review_approved', message: 'Output approved for "Report Generation"', user: 'Sage Admin', time: '2 hours ago', project: 'Content Generation', icon: CheckCircle, color: 'text-green-500', bgColor: 'bg-green-500/20' },
    { id: '5', type: 'error', message: 'Code Reviewer encountered an error in task', user: 'System', time: '3 hours ago', project: 'Code Review', icon: AlertCircle, color: 'text-red-500', bgColor: 'bg-red-500/20' },
    { id: '6', type: 'task_completed', message: 'Task "API Integration" marked as completed', user: 'Sage Admin', time: '5 hours ago', project: 'API Integration', icon: CheckCircle, color: 'text-green-500', bgColor: 'bg-green-500/20' },
    { id: '7', type: 'agent_started', message: 'Report Writer started generating final report', user: 'System', time: '6 hours ago', project: 'Market Analysis', icon: Play, color: 'text-blue-500', bgColor: 'bg-blue-500/20' },
    { id: '8', type: 'review_changes_requested', message: 'Changes requested for "Data Migration" output', user: 'Sage Admin', time: '1 day ago', project: 'Data Migration', icon: AlertCircle, color: 'text-yellow-500', bgColor: 'bg-yellow-500/20' },
  ]

  const filters = [
    { id: 'all', label: 'All Activity' },
    { id: 'agents', label: 'Agents' },
    { id: 'projects', label: 'Projects' },
    { id: 'reviews', label: 'Reviews' },
    { id: 'errors', label: 'Errors' },
  ]

  const filteredActivities = activities.filter(activity => {
    if (filter === 'all') return true
    if (filter === 'agents') return activity.type.includes('agent')
    if (filter === 'projects') return activity.type.includes('project')
    if (filter === 'reviews') return activity.type.includes('review')
    if (filter === 'errors') return activity.type === 'error'
    return true
  })

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'agent_started': return 'Agent Started'
      case 'agent_completed': return 'Agent Completed'
      case 'project_created': return 'Project Created'
      case 'task_completed': return 'Task Completed'
      case 'review_approved': return 'Review Approved'
      case 'review_rejected': return 'Review Rejected'
      case 'review_changes_requested': return 'Changes Requested'
      case 'error': return 'Error'
      default: return type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Activity Log</h1>
          <p className="text-slate-400 mt-2">Track all system and user activities</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-4 py-2.5 bg-slate-800 text-slate-300 rounded-lg hover:bg-slate-700 transition-colors flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Date Range
          </button>
          <button className="px-4 py-2.5 bg-slate-800 text-slate-300 rounded-lg hover:bg-slate-700 transition-colors flex items-center gap-2">
            <Filter className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">Total Activities</p>
              <p className="text-2xl font-bold text-white mt-2">{activities.length}</p>
            </div>
            <div className="p-3 rounded-lg bg-primary/20">
              <Clock className="w-6 h-6 text-primary" />
            </div>
          </div>
          <p className="text-xs text-slate-400 mt-3">Last 24 hours</p>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">Agent Activities</p>
              <p className="text-2xl font-bold text-white mt-2">
                {activities.filter(a => a.type.includes('agent')).length}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-blue-500/20">
              <Bot className="w-6 h-6 text-blue-500" />
            </div>
          </div>
          <p className="text-xs text-slate-400 mt-3">Starts and completions</p>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">Reviews</p>
              <p className="text-2xl font-bold text-white mt-2">
                {activities.filter(a => a.type.includes('review')).length}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-green-500/20">
              <CheckCircle className="w-6 h-6 text-green-500" />
            </div>
          </div>
          <p className="text-xs text-slate-400 mt-3">Approvals and changes</p>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">Errors</p>
              <p className="text-2xl font-bold text-white mt-2">
                {activities.filter(a => a.type === 'error').length}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-red-500/20">
              <AlertCircle className="w-6 h-6 text-red-500" />
            </div>
          </div>
          <p className="text-xs text-slate-400 mt-3">Requires attention</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {filters.map((filterItem) => (
          <button
            key={filterItem.id}
            onClick={() => setFilter(filterItem.id)}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filter === filterItem.id
                ? 'bg-primary text-white'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            {filterItem.label}
          </button>
        ))}
      </div>

      {/* Activity Timeline */}
      <div className="card">
        <div className="space-y-6">
          {filteredActivities.map((activity) => {
            const Icon = activity.icon
            return (
              <div key={activity.id} className="flex gap-4 pb-6 last:pb-0 border-b border-slate-800 last:border-0">
                {/* Icon */}
                <div className={`p-3 rounded-lg ${activity.bgColor} flex-shrink-0`}>
                  <Icon className={`w-5 h-5 ${activity.color}`} />
                </div>

                {/* Content */}
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-medium text-white">{activity.message}</h3>
                      <div className="flex items-center gap-4 mt-2">
                        <div className="flex items-center gap-2 text-sm">
                          <div className="flex items-center gap-1">
                            <User className="w-4 h-4 text-slate-400" />
                            <span className="text-slate-400">{activity.user}</span>
                          </div>
                          <span className="text-slate-600">•</span>
                          <div className="flex items-center gap-1">
                            <FileText className="w-4 h-4 text-slate-400" />
                            <span className="text-slate-400">{activity.project}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-slate-400">{activity.time}</span>
                      <span className={`text-xs px-2 py-1 rounded-full ${activity.bgColor} ${activity.color}`}>
                        {getTypeLabel(activity.type)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Empty State (commented out for now) */}
      {/* <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
        <Clock className="w-16 h-16 text-slate-600 mb-4" />
        <h3 className="text-xl font-semibold text-white mb-2">No activity yet</h3>
        <p className="text-slate-400 max-w-md">
          Activity will appear here as you use the dashboard and deploy agents.
        </p>
      </div> */}
    </div>
  )
}

export default Activity