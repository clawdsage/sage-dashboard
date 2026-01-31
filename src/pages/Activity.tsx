import { 
  Clock, CheckCircle, AlertCircle, Play, FileText, Bot, User, Filter, 
  Calendar, Loader2, DollarSign, Hash, Download, Search, X, 
  ChevronDown, ChevronRight, Zap, TrendingUp, Activity as ActivityIcon,
  Clock3, BarChart3
} from 'lucide-react'
import { useState, useMemo, useEffect, memo, useCallback } from 'react'
import { useActivityData, type DateRange } from '../hooks/useActivityData'
import { formatDate } from '../utils/formatTime'
import { Link } from 'react-router-dom'

interface Activity {
  id: string
  type: 'spawn' | 'complete' | 'error'
  timestamp: number
  relativeTime: string
  agentName: string
  description: string
  projectName?: string
  projectId?: string
  status?: string
  progress?: number
  cost: number
  tokensUsed: number
  duration?: number
  model?: string
  errorMessage?: string
}

// Memoized Activity Item Component
interface ActivityItemProps {
  activity: Activity
  isExpanded: boolean
  onToggleExpanded: (id: string) => void
  getEventIcon: (type: 'spawn' | 'complete' | 'error') => any
  getEventColor: (type: 'spawn' | 'complete' | 'error') => { text: string; bg: string; border: string }
  getEventLabel: (type: 'spawn' | 'complete' | 'error') => string
  formatCost: (cost: number) => string
  formatTokens: (tokens: number) => string
  formatDuration: (seconds: number) => string
}

const ActivityItem = memo(function ActivityItem({
  activity,
  isExpanded,
  onToggleExpanded,
  getEventIcon,
  getEventColor,
  getEventLabel,
  formatCost,
  formatTokens,
  formatDuration
}: ActivityItemProps) {
  const Icon = getEventIcon(activity.type)
  const colors = getEventColor(activity.type)
  const eventLabel = getEventLabel(activity.type)
  
  return (
    <div 
      className={`border rounded-lg transition-all duration-200 ease-in-out ${colors.border} ${
        isExpanded ? 'bg-slate-800/50' : 'bg-slate-900/30'
      } animate-fade-in`}
      style={{ 
        willChange: 'transform, opacity',
        transition: 'all 0.2s ease-in-out'
      }}
    >
      {/* Main Activity Row */}
      <div className="flex gap-4 p-4">
        {/* Icon */}
        <div className={`p-3 rounded-lg ${colors.bg} flex-shrink-0 h-fit`}>
          <Icon className={`w-5 h-5 ${colors.text}`} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-white break-words">{activity.description}</h3>
              <div className="flex flex-wrap items-center gap-3 mt-2">
                <div className="flex items-center gap-1 text-sm">
                  <Bot className="w-4 h-4 text-slate-400 flex-shrink-0" />
                  <span className="text-slate-400">{activity.agentName}</span>
                </div>
                {activity.projectName && (
                  <>
                    <span className="text-slate-600">•</span>
                    <div className="flex items-center gap-1 text-sm">
                      <FileText className="w-4 h-4 text-slate-400 flex-shrink-0" />
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
                    <div className="flex items-center gap-1 text-sm">
                      <DollarSign className="w-4 h-4 text-slate-400 flex-shrink-0" />
                      <span className="text-slate-400">{formatCost(activity.cost)}</span>
                    </div>
                  </>
                )}
                {activity.type === 'complete' && activity.tokensUsed > 0 && (
                  <>
                    <span className="text-slate-600">•</span>
                    <div className="flex items-center gap-1 text-sm">
                      <Hash className="w-4 h-4 text-slate-400 flex-shrink-0" />
                      <span className="text-slate-400">{formatTokens(activity.tokensUsed)} tokens</span>
                    </div>
                  </>
                )}
                {activity.duration && (
                  <>
                    <span className="text-slate-600">•</span>
                    <div className="flex items-center gap-1 text-sm">
                      <Clock3 className="w-4 h-4 text-slate-400 flex-shrink-0" />
                      <span className="text-slate-400">{formatDuration(activity.duration)}</span>
                    </div>
                  </>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3 flex-shrink-0">
              <div className="text-right">
                <span className="text-sm text-slate-400 block whitespace-nowrap">{activity.relativeTime}</span>
                <span className="text-xs text-slate-500 block whitespace-nowrap">{formatDate(activity.timestamp)}</span>
              </div>
              <span className={`text-xs px-2 py-1 rounded-full ${colors.bg} ${colors.text} whitespace-nowrap`}>
                {eventLabel}
              </span>
              <button
                onClick={() => onToggleExpanded(activity.id)}
                className="p-2 hover:bg-slate-700 rounded transition-colors"
                title="Toggle details"
              >
                {isExpanded ? (
                  <ChevronDown className="w-5 h-5 text-slate-400" />
                ) : (
                  <ChevronRight className="w-5 h-5 text-slate-400" />
                )}
              </button>
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

      {/* Expanded Detail View */}
      {isExpanded && (
        <div className="border-t border-slate-700 bg-slate-900/50 p-4">
          <h4 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Activity Details
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <p className="text-xs text-slate-500 mb-1">Activity ID</p>
              <p className="text-sm text-slate-300 font-mono">{activity.id}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-1">Type</p>
              <p className="text-sm text-slate-300 capitalize">{activity.type}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-1">Status</p>
              <p className="text-sm text-slate-300 capitalize">{activity.status || 'N/A'}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-1">Agent Name</p>
              <p className="text-sm text-slate-300">{activity.agentName}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-1">Model</p>
              <p className="text-sm text-slate-300 font-mono">{activity.model || 'N/A'}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-1">Timestamp</p>
              <p className="text-sm text-slate-300">{new Date(activity.timestamp).toLocaleString()}</p>
            </div>
            {activity.cost > 0 && (
              <div>
                <p className="text-xs text-slate-500 mb-1">Cost</p>
                <p className="text-sm text-slate-300">{formatCost(activity.cost)}</p>
              </div>
            )}
            {activity.tokensUsed > 0 && (
              <div>
                <p className="text-xs text-slate-500 mb-1">Tokens Used</p>
                <p className="text-sm text-slate-300">{activity.tokensUsed.toLocaleString()}</p>
              </div>
            )}
            {activity.duration && (
              <div>
                <p className="text-xs text-slate-500 mb-1">Duration</p>
                <p className="text-sm text-slate-300">{formatDuration(activity.duration)}</p>
              </div>
            )}
            {activity.progress !== undefined && (
              <div>
                <p className="text-xs text-slate-500 mb-1">Progress</p>
                <p className="text-sm text-slate-300">{activity.progress}%</p>
              </div>
            )}
            {activity.projectId && (
              <div>
                <p className="text-xs text-slate-500 mb-1">Project ID</p>
                <p className="text-sm text-slate-300 font-mono">{activity.projectId}</p>
              </div>
            )}
          </div>
          
          {activity.errorMessage && (
            <div className="mt-4 p-3 bg-red-900/20 border border-red-800/30 rounded-lg">
              <p className="text-xs text-slate-500 mb-1">Error Message</p>
              <p className="text-sm text-red-400 font-mono">{activity.errorMessage}</p>
            </div>
          )}

          {activity.description && (
            <div className="mt-4">
              <p className="text-xs text-slate-500 mb-1">Full Description</p>
              <p className="text-sm text-slate-300">{activity.description}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
})

const Activity = () => {
  const [filter, setFilter] = useState<'all' | 'spawns' | 'completions' | 'errors'>('all')
  const [dateRange, setDateRange] = useState<DateRange>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedActivities, setExpandedActivities] = useState<Set<string>>(new Set())
  const [selectedProjects, setSelectedProjects] = useState<Set<string>>(new Set())
  const [selectedAgents, setSelectedAgents] = useState<Set<string>>(new Set())
  const [showFilterPanel, setShowFilterPanel] = useState(false)
  
  const { activities, loading, error, stats, refetch } = useActivityData(filter, dateRange, 50)

  // Extract unique projects and agents for filtering
  const uniqueProjects = useMemo(() => {
    const projects = new Set<string>()
    activities.forEach(activity => {
      if (activity.projectName) {
        projects.add(activity.projectName)
      }
    })
    return Array.from(projects).sort()
  }, [activities])

  const uniqueAgents = useMemo(() => {
    const agents = new Set<string>()
    activities.forEach(activity => {
      if (activity.agentName) {
        agents.add(activity.agentName)
      }
    })
    return Array.from(agents).sort()
  }, [activities])

  // Advanced filtering
  const filteredActivities = useMemo(() => {
    return activities.filter(activity => {
      // Search query filter (searches in agent name, description, and project name)
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        const matchesSearch = 
          activity.agentName.toLowerCase().includes(query) ||
          activity.description.toLowerCase().includes(query) ||
          (activity.projectName?.toLowerCase().includes(query) ?? false)
        
        if (!matchesSearch) return false
      }

      // Project filter
      if (selectedProjects.size > 0) {
        if (!activity.projectName || !selectedProjects.has(activity.projectName)) {
          return false
        }
      }

      // Agent filter
      if (selectedAgents.size > 0) {
        if (!selectedAgents.has(activity.agentName)) {
          return false
        }
      }

      return true
    })
  }, [activities, searchQuery, selectedProjects, selectedAgents])

  // CSV Export functionality
  const exportToCSV = () => {
    const headers = [
      'Timestamp',
      'Type',
      'Agent Name',
      'Description',
      'Project',
      'Status',
      'Progress',
      'Cost',
      'Tokens Used',
      'Duration (s)',
      'Model',
      'Error Message'
    ]

    const rows = filteredActivities.map(activity => [
      new Date(activity.timestamp).toISOString(),
      activity.type,
      activity.agentName,
      activity.description,
      activity.projectName || '',
      activity.status || '',
      activity.progress?.toString() || '',
      activity.cost.toFixed(4),
      activity.tokensUsed.toString(),
      activity.duration?.toString() || '',
      activity.model || '',
      activity.errorMessage || ''
    ])

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell.toString().replace(/"/g, '""')}"`).join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `sage-activity-${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const toggleExpanded = (activityId: string) => {
    setExpandedActivities(prev => {
      const newSet = new Set(prev)
      if (newSet.has(activityId)) {
        newSet.delete(activityId)
      } else {
        newSet.add(activityId)
      }
      return newSet
    })
  }

  const toggleProject = (project: string) => {
    setSelectedProjects(prev => {
      const newSet = new Set(prev)
      if (newSet.has(project)) {
        newSet.delete(project)
      } else {
        newSet.add(project)
      }
      return newSet
    })
  }

  const toggleAgent = (agent: string) => {
    setSelectedAgents(prev => {
      const newSet = new Set(prev)
      if (newSet.has(agent)) {
        newSet.delete(agent)
      } else {
        newSet.add(agent)
      }
      return newSet
    })
  }

  const clearAllFilters = () => {
    setSearchQuery('')
    setSelectedProjects(new Set())
    setSelectedAgents(new Set())
    setFilter('all')
  }

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

  const getEventIcon = useCallback((type: 'spawn' | 'complete' | 'error') => {
    switch (type) {
      case 'spawn': return Play
      case 'complete': return CheckCircle
      case 'error': return AlertCircle
      default: return Clock
    }
  }, [])

  const getEventColor = useCallback((type: 'spawn' | 'complete' | 'error') => {
    switch (type) {
      case 'spawn': return { text: 'text-blue-500', bg: 'bg-blue-500/20', border: 'border-blue-500/30' }
      case 'complete': return { text: 'text-green-500', bg: 'bg-green-500/20', border: 'border-green-500/30' }
      case 'error': return { text: 'text-red-500', bg: 'bg-red-500/20', border: 'border-red-500/30' }
      default: return { text: 'text-slate-500', bg: 'bg-slate-500/20', border: 'border-slate-500/30' }
    }
  }, [])

  const getEventLabel = useCallback((type: 'spawn' | 'complete' | 'error') => {
    switch (type) {
      case 'spawn': return 'Agent Spawned'
      case 'complete': return 'Agent Completed'
      case 'error': return 'Agent Error'
      default: return 'Activity'
    }
  }, [])

  const formatCost = useCallback((cost: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 4
    }).format(cost)
  }, [])

  const formatTokens = useCallback((tokens: number) => {
    if (tokens >= 1000000) {
      return `${(tokens / 1000000).toFixed(1)}M`
    } else if (tokens >= 1000) {
      return `${(tokens / 1000).toFixed(1)}K`
    }
    return tokens.toString()
  }, [])

  const formatDuration = useCallback((seconds: number) => {
    if (seconds < 60) {
      return `${seconds}s`
    } else if (seconds < 3600) {
      const minutes = Math.floor(seconds / 60)
      const secs = seconds % 60
      return `${minutes}m ${secs}s`
    } else {
      const hours = Math.floor(seconds / 3600)
      const minutes = Math.floor((seconds % 3600) / 60)
      return `${hours}h ${minutes}m`
    }
  }, [])

  // Calculate additional stats
  const averageCost = stats.total > 0 ? stats.totalCost / stats.total : 0
  const averageTokens = stats.total > 0 ? stats.totalTokens / stats.total : 0
  const activeFiltersCount = 
    (searchQuery ? 1 : 0) + 
    selectedProjects.size + 
    selectedAgents.size + 
    (filter !== 'all' ? 1 : 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <ActivityIcon className="w-8 h-8 text-primary" />
            Activity Timeline
          </h1>
          <p className="text-slate-400 mt-2">Real-time tracking of Sage's agent activities with advanced analytics</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value as DateRange)}
              className="px-4 py-2.5 bg-slate-800 text-slate-300 rounded-lg hover:bg-slate-700 transition-colors flex items-center gap-2 appearance-none pr-10 border border-slate-700"
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
            onClick={exportToCSV}
            className="px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 font-medium"
            disabled={filteredActivities.length === 0}
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
          <button
            onClick={() => refetch()}
            className="px-4 py-2.5 bg-slate-800 text-slate-300 rounded-lg hover:bg-slate-700 transition-colors flex items-center gap-2 border border-slate-700"
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

      {/* Enhanced Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
        <div className="card bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400 font-medium">Total Activities</p>
              <p className="text-2xl font-bold text-white mt-2">{stats.total}</p>
            </div>
            <div className="p-3 rounded-xl bg-primary/20 border border-primary/30">
              <Clock className="w-6 h-6 text-primary" />
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-3 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            Auto-refreshes every 20s
          </p>
        </div>

        <div className="card bg-gradient-to-br from-blue-900/20 to-slate-900 border-blue-800/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400 font-medium">Agent Spawns</p>
              <p className="text-2xl font-bold text-white mt-2">{stats.spawns}</p>
            </div>
            <div className="p-3 rounded-xl bg-blue-500/20 border border-blue-500/30">
              <Play className="w-6 h-6 text-blue-500" />
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-3">Active agent starts</p>
        </div>

        <div className="card bg-gradient-to-br from-green-900/20 to-slate-900 border-green-800/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400 font-medium">Total Cost</p>
              <p className="text-2xl font-bold text-white mt-2">{formatCost(stats.totalCost)}</p>
            </div>
            <div className="p-3 rounded-xl bg-green-500/20 border border-green-500/30">
              <DollarSign className="w-6 h-6 text-green-500" />
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-3">Cumulative agent costs</p>
        </div>

        <div className="card bg-gradient-to-br from-purple-900/20 to-slate-900 border-purple-800/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400 font-medium">Total Tokens</p>
              <p className="text-2xl font-bold text-white mt-2">{formatTokens(stats.totalTokens)}</p>
            </div>
            <div className="p-3 rounded-xl bg-purple-500/20 border border-purple-500/30">
              <Hash className="w-6 h-6 text-purple-500" />
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-3">Tokens consumed</p>
        </div>

        <div className="card bg-gradient-to-br from-orange-900/20 to-slate-900 border-orange-800/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400 font-medium">Avg Cost</p>
              <p className="text-2xl font-bold text-white mt-2">{formatCost(averageCost)}</p>
            </div>
            <div className="p-3 rounded-xl bg-orange-500/20 border border-orange-500/30">
              <BarChart3 className="w-6 h-6 text-orange-500" />
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-3">Per activity</p>
        </div>

        <div className="card bg-gradient-to-br from-cyan-900/20 to-slate-900 border-cyan-800/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400 font-medium">Avg Tokens</p>
              <p className="text-2xl font-bold text-white mt-2">{formatTokens(Math.round(averageTokens))}</p>
            </div>
            <div className="p-3 rounded-xl bg-cyan-500/20 border border-cyan-500/30">
              <Zap className="w-6 h-6 text-cyan-500" />
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-3">Per activity</p>
        </div>
      </div>

      {/* Search and Advanced Filters */}
      <div className="card space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by agent name, description, or project..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-10 py-3 bg-slate-800 text-white rounded-lg border border-slate-700 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Filter Type Buttons */}
        <div className="flex flex-wrap gap-2">
          {filters.map((filterItem) => {
            const Icon = filterItem.icon
            return (
              <button
                key={filterItem.id}
                onClick={() => setFilter(filterItem.id as typeof filter)}
                className={`px-4 py-2 rounded-lg transition-all flex items-center gap-2 border ${
                  filter === filterItem.id
                    ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border-slate-700'
                }`}
              >
                <Icon className="w-4 h-4" />
                {filterItem.label}
              </button>
            )
          })}
          
          <button
            onClick={() => setShowFilterPanel(!showFilterPanel)}
            className={`px-4 py-2 rounded-lg transition-all flex items-center gap-2 border ${
              showFilterPanel || selectedProjects.size > 0 || selectedAgents.size > 0
                ? 'bg-primary text-white border-primary'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border-slate-700'
            }`}
          >
            <Filter className="w-4 h-4" />
            Advanced
            {activeFiltersCount > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-white/20 text-xs font-bold">
                {activeFiltersCount}
              </span>
            )}
          </button>

          {activeFiltersCount > 0 && (
            <button
              onClick={clearAllFilters}
              className="px-4 py-2 rounded-lg transition-colors flex items-center gap-2 bg-red-600 text-white hover:bg-red-700 border border-red-500"
            >
              <X className="w-4 h-4" />
              Clear All
            </button>
          )}
        </div>

        {/* Advanced Filter Panel */}
        {showFilterPanel && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-700">
            {/* Project Filter */}
            <div>
              <h4 className="text-sm font-medium text-slate-300 mb-2 flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Filter by Project
              </h4>
              <div className="space-y-2 max-h-48 overflow-y-auto bg-slate-800/50 rounded-lg p-3 border border-slate-700">
                {uniqueProjects.length === 0 ? (
                  <p className="text-sm text-slate-500">No projects available</p>
                ) : (
                  uniqueProjects.map(project => (
                    <label key={project} className="flex items-center gap-2 cursor-pointer hover:bg-slate-700/50 p-2 rounded transition-colors">
                      <input
                        type="checkbox"
                        checked={selectedProjects.has(project)}
                        onChange={() => toggleProject(project)}
                        className="w-4 h-4 text-primary bg-slate-700 border-slate-600 rounded focus:ring-primary focus:ring-2"
                      />
                      <span className="text-sm text-slate-300">{project}</span>
                    </label>
                  ))
                )}
              </div>
            </div>

            {/* Agent Filter */}
            <div>
              <h4 className="text-sm font-medium text-slate-300 mb-2 flex items-center gap-2">
                <Bot className="w-4 h-4" />
                Filter by Agent
              </h4>
              <div className="space-y-2 max-h-48 overflow-y-auto bg-slate-800/50 rounded-lg p-3 border border-slate-700">
                {uniqueAgents.length === 0 ? (
                  <p className="text-sm text-slate-500">No agents available</p>
                ) : (
                  uniqueAgents.map(agent => (
                    <label key={agent} className="flex items-center gap-2 cursor-pointer hover:bg-slate-700/50 p-2 rounded transition-colors">
                      <input
                        type="checkbox"
                        checked={selectedAgents.has(agent)}
                        onChange={() => toggleAgent(agent)}
                        className="w-4 h-4 text-primary bg-slate-700 border-slate-600 rounded focus:ring-primary focus:ring-2"
                      />
                      <span className="text-sm text-slate-300">{agent}</span>
                    </label>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* Results Count */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-700">
          <p className="text-sm text-slate-400">
            Showing <span className="font-bold text-white">{filteredActivities.length}</span> of{' '}
            <span className="font-bold text-white">{activities.length}</span> activities
          </p>
          {filteredActivities.length !== activities.length && (
            <p className="text-xs text-slate-500">
              {activities.length - filteredActivities.length} hidden by filters
            </p>
          )}
        </div>
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
        ) : filteredActivities.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Clock className="w-16 h-16 text-slate-600 mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">
              {activities.length === 0 ? 'No activity yet' : 'No matching activities'}
            </h3>
            <p className="text-slate-400 max-w-md text-center">
              {activities.length === 0 
                ? 'Activity will appear here as Sage spawns and completes agents. Check back soon!'
                : 'Try adjusting your search or filter criteria to see more results.'}
            </p>
            {activities.length > 0 && (
              <button
                onClick={clearAllFilters}
                className="mt-4 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/80 transition-colors"
              >
                Clear All Filters
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredActivities.map((activity) => (
              <ActivityItem
                key={activity.id}
                activity={activity}
                isExpanded={expandedActivities.has(activity.id)}
                onToggleExpanded={toggleExpanded}
                getEventIcon={getEventIcon}
                getEventColor={getEventColor}
                getEventLabel={getEventLabel}
                formatCost={formatCost}
                formatTokens={formatTokens}
                formatDuration={formatDuration}
              />
            ))}
            
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

      {/* Enhanced Info Panel */}
      <div className="bg-gradient-to-br from-slate-900/80 to-slate-800/80 border border-slate-700 rounded-lg p-6">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-lg bg-blue-500/20 border border-blue-500/30 flex-shrink-0">
            <AlertCircle className="w-6 h-6 text-blue-500" />
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-white mb-2 text-lg">About This Timeline</h4>
            <p className="text-sm text-slate-400 leading-relaxed">
              This timeline shows real activity data from Sage's agent runs. Data is fetched from the Supabase 
              database and updates automatically every 20 seconds. Each event represents an agent spawn, 
              completion, or error.
            </p>
            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="flex items-start gap-2">
                <Search className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs font-medium text-slate-300">Advanced Search</p>
                  <p className="text-xs text-slate-500">Filter by name, description, or project</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Download className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs font-medium text-slate-300">CSV Export</p>
                  <p className="text-xs text-slate-500">Download filtered data for analysis</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <ChevronRight className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs font-medium text-slate-300">Expandable Details</p>
                  <p className="text-xs text-slate-500">Click to see full activity information</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Activity
