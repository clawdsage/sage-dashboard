import { Clock, CheckCircle, AlertCircle, Play, FileText, Bot, User, Filter, Calendar, Loader2, DollarSign, Hash } from 'lucide-react'
import { useState } from 'react'
import { useActivityData, type DateRange } from '../hooks/useActivityData'
import { formatDate } from '../utils/formatTime'
import { Link } from 'react-router-dom'

const Activity = () => {
  const [filter, setFilter] = useState<'all' | 'spawns' | 'completions' | 'errors'>('all')
  const [dateRange, setDateRange] = useState<DateRange>('all')
  
  const { activities, loading, error, stats, refetch } = useActivityData(filter, dateRange, 50)

  const filters = [
    { id: 'all', label: 'All Activity', icon: Clock },
    { id: 'spawns', label: 'Spawns', icon: Play },
    { id: 'completions', label: 'Completions', icon: CheckCircle },
    { id: 'errors', label: 'Errors', icon: AlertCircle },
  ]

  const dateRanges = [
    { id: 'today', label: 'Today' },
    { id: 'week', label: 'This Week' },
    { id: 'month', label: 'This Month' },
    { id: 'all', label: 'All Time' },
  ]

  const getEventIcon = (type: 'spawn' | 'complete' | 'error') => {
    switch (type) {
      case 'spawn': return Play
      case 'complete': return CheckCircle
      case 'error': return AlertCircle
      default: return Clock
    }
  }

  const getEventColor = (type: 'spawn' | 'complete' | 'error') => {
    switch (type) {
      case 'spawn': return { text: 'text-blue-500', bg: 'bg-blue-500/20' }
      case 'complete': return { text: 'text-green-500', bg: 'bg-green-500/20' }
      case 'error': return { text: 'text-red-500', bg: 'bg-red-500/20' }
      default: return { text: 'text-slate-500', bg: 'bg-slate-500/20' }
    }
  }

  const getEventLabel = (type: 'spawn' | 'complete' | 'error') => {
    switch (type) {
      case 'spawn': return 'Agent Spawned'
      case 'complete': return 'Agent Completed'
      case 'error': return 'Agent Error'
      default: return 'Activity'
    }
  }

  const formatCost = (cost: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(cost)
  }

  const formatTokens = (tokens: number) => {
    if (tokens >= 1000000) {
      return `${(tokens / 1000000).toFixed(1)}M`
    } else if (tokens >= 1000) {
      return `${(tokens / 1000).toFixed(1)}K`
    }
    return tokens.toString()
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Activity Timeline</h1>
          <p className="text-slate-400 mt-2">Real-time tracking of Sage's agent activities</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value as DateRange)}
              className="px-4 py-2.5 bg-slate-800 text-slate-300 rounded-lg hover:bg-slate-700 transition-colors flex items-center gap-2 appearance-none pr-10"
            >
              {dateRanges.map((range) => (
                <option key={range.id} value={range.id}>
                  {range.label}
                </option>
              ))}
            </select>
            <Calendar className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none" />
          </div>
          <button
            onClick={() => refetch()}
            className="px-4 py-2.5 bg-slate-800 text-slate-300 rounded-lg hover:bg-slate-700 transition-colors flex items-center gap-2"
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Filter className="w-4 h-4" />
            )}
            Refresh
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">Total Activities</p>
              <p className="text-2xl font-bold text-white mt-2">{stats.total}</p>
            </div>
            <div className="p-3 rounded-lg bg-primary/20">
              <Clock className="w-6 h-6 text-primary" />
            </div>
          </div>
          <p className="text-xs text-slate-400 mt-3">Auto-refreshes every 20s</p>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">Agent Spawns</p>
              <p className="text-2xl font-bold text-white mt-2">{stats.spawns}</p>
            </div>
            <div className="p-3 rounded-lg bg-blue-500/20">
              <Play className="w-6 h-6 text-blue-500" />
            </div>
          </div>
          <p className="text-xs text-slate-400 mt-3">Active agent starts</p>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">Total Cost</p>
              <p className="text-2xl font-bold text-white mt-2">{formatCost(stats.totalCost)}</p>
            </div>
            <div className="p-3 rounded-lg bg-green-500/20">
              <DollarSign className="w-6 h-6 text-green-500" />
            </div>
          </div>
          <p className="text-xs text-slate-400 mt-3">Cumulative agent costs</p>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">Total Tokens</p>
              <p className="text-2xl font-bold text-white mt-2">{formatTokens(stats.totalTokens)}</p>
            </div>
            <div className="p-3 rounded-lg bg-purple-500/20">
              <Hash className="w-6 h-6 text-purple-500" />
            </div>
          </div>
          <p className="text-xs text-slate-400 mt-3">Tokens consumed</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {filters.map((filterItem) => {
          const Icon = filterItem.icon
          return (
            <button
              key={filterItem.id}
              onClick={() => setFilter(filterItem.id as typeof filter)}
              className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                filter === filterItem.id
                  ? 'bg-primary text-white'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <Icon className="w-4 h-4" />
              {filterItem.label}
            </button>
          )
        })}
      </div>

      {/* Activity Timeline */}
      <div className="card">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
            <p className="text-slate-400">Loading activity data...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-12">
            <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Error Loading Data</h3>
            <p className="text-slate-400 text-center max-w-md mb-4">{error}</p>
            <button
              onClick={() => refetch()}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/80 transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : activities.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Clock className="w-16 h-16 text-slate-600 mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No activity yet</h3>
            <p className="text-slate-400 max-w-md text-center">
              Activity will appear here as Sage spawns and completes agents. Check back soon!
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {activities.map((activity) => {
              const Icon = getEventIcon(activity.type)
              const colors = getEventColor(activity.type)
              const eventLabel = getEventLabel(activity.type)
              
              return (
                <div key={activity.id} className="flex gap-4 pb-6 last:pb-0 border-b border-slate-800 last:border-0">
                  {/* Icon */}
                  <div className={`p-3 rounded-lg ${colors.bg} flex-shrink-0`}>
                    <Icon className={`w-5 h-5 ${colors.text}`} />
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-medium text-white">{activity.description}</h3>
                        <div className="flex items-center gap-4 mt-2">
                          <div className="flex items-center gap-2 text-sm">
                            <div className="flex items-center gap-1">
                              <Bot className="w-4 h-4 text-slate-400" />
                              <span className="text-slate-400">{activity.agentName}</span>
                            </div>
                            {activity.projectName && (
                              <>
                                <span className="text-slate-600">•</span>
                                <div className="flex items-center gap-1">
                                  <FileText className="w-4 h-4 text-slate-400" />
                                  {activity.projectId ? (
                                    <Link
                                      to={`/project/${activity.projectId}`}
                                      className="text-slate-400 hover:text-primary transition-colors"
                                    >
                                      {activity.projectName}
                                    </Link>
                                  ) : (
                                    <span className="text-slate-400">{activity.projectName}</span>
                                  )}
                                </div>
                              </>
                            )}
                            {activity.type === 'complete' && activity.cost > 0 && (
                              <>
                                <span className="text-slate-600">•</span>
                                <div className="flex items-center gap-1">
                                  <DollarSign className="w-4 h-4 text-slate-400" />
                                  <span className="text-slate-400">{formatCost(activity.cost)}</span>
                                </div>
                              </>
                            )}
                            {activity.type === 'complete' && activity.tokensUsed > 0 && (
                              <>
                                <span className="text-slate-600">•</span>
                                <div className="flex items-center gap-1">
                                  <Hash className="w-4 h-4 text-slate-400" />
                                  <span className="text-slate-400">{formatTokens(activity.tokensUsed)} tokens</span>
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <span className="text-sm text-slate-400 block">{activity.relativeTime}</span>
                          <span className="text-xs text-slate-500 block">{formatDate(activity.timestamp)}</span>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded-full ${colors.bg} ${colors.text}`}>
                          {eventLabel}
                        </span>
                      </div>
                    </div>
                    
                    {/* Progress bar for active agents */}
                    {activity.type === 'spawn' && activity.status === 'active' && (
                      <div className="mt-3">
                        <div className="flex justify-between text-xs text-slate-400 mb-1">
                          <span>Progress</span>
                          <span>{activity.progress}%</span>
                        </div>
                        <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-blue-500 rounded-full transition-all duration-300"
                            style={{ width: `${activity.progress}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
            
            {/* Load more indicator */}
            {activities.length >= 50 && (
              <div className="text-center pt-4">
                <p className="text-slate-400 text-sm">
                  Showing latest 50 activities. More available in database.
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Info Panel */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-medium text-white mb-1">About This Timeline</h4>
            <p className="text-sm text-slate-400">
              This timeline shows real activity data from Sage's agent runs. Data is fetched from the Supabase 
              database and updates automatically every 20 seconds. Each event represents an agent spawn, 
              completion, or error. Click on project names to navigate to project details.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Activity