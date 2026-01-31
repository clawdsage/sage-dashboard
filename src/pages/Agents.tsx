import { Bot, Play, Pause, Settings, Cpu, Zap, Clock, DollarSign, MoreVertical, Loader2, Folder } from 'lucide-react'
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { Link } from 'react-router-dom'
import { useRealtimeSubagentRuns } from '../hooks/useRealtimeSubagentRuns'

interface AgentRun {
  id: string
  name: string
  status: 'idle' | 'active' | 'completed' | 'error'
  task_description: string | null
  progress: number
  started_at: string
  completed_at: string | null
  tokens_used: number
  cost: number
  api_calls: number
  output: string | null
  project_id: string | null
}

interface Project {
  id: string
  name: string
  status: string
}

const Agents = () => {
  const { subagentRuns: agents, loading, error, refetch, stats } = useRealtimeSubagentRuns()
  const [projects, setProjects] = useState<Record<string, Project>>({})
  const [sortField, setSortField] = useState<string>('started_at')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  // Fetch projects for agent runs
  useEffect(() => {
    const fetchProjects = async () => {
      // Get unique project IDs from agent runs
      const projectIds = [...new Set(agents
        .filter(agent => agent.project_id)
        .map(agent => agent.project_id) as string[]
      )]
      
      // Fetch projects if there are any project IDs
      if (projectIds.length > 0) {
        const { data: projectsData, error: projectsError } = await supabase
          .from('projects')
          .select('id, name, status')
          .in('id', projectIds)

        if (projectsError) {
          console.error('Error fetching projects:', projectsError)
          // Don't throw - we can still show agents without project names
        } else {
          // Convert projects array to object for easy lookup
          const projectsMap: Record<string, Project> = {}
          projectsData?.forEach(project => {
            projectsMap[project.id] = project
          })
          setProjects(projectsMap)
        }
      } else {
        setProjects({})
      }
    }

    fetchProjects()
  }, [agents])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500/20 text-green-400 border-green-500/30'
      case 'idle': return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
      case 'completed': return 'bg-purple-500/20 text-purple-400 border-purple-500/30'
      case 'error': return 'bg-red-500/20 text-red-400 border-red-500/30'
      default: return 'bg-slate-500/20 text-slate-400 border-slate-500/30'
    }
  }

  const getTypeFromTask = (task: string | null) => {
    if (!task) return 'analysis'
    const taskLower = task.toLowerCase()
    if (taskLower.includes('generate') || taskLower.includes('write') || taskLower.includes('create')) {
      return 'generation'
    } else if (taskLower.includes('test') || taskLower.includes('qa') || taskLower.includes('verify')) {
      return 'testing'
    }
    return 'analysis'
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'analysis': return 'bg-purple-500/20 text-purple-400'
      case 'generation': return 'bg-blue-500/20 text-blue-400'
      case 'testing': return 'bg-amber-500/20 text-amber-400'
      default: return 'bg-slate-500/20 text-slate-400'
    }
  }

  // Calculate uptime from started_at and completed_at
  const calculateUptime = (startedAt: string, completedAt: string | null) => {
    const start = new Date(startedAt)
    const end = completedAt ? new Date(completedAt) : new Date()
    const diffMs = end.getTime() - start.getTime()
    
    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))
    
    if (days > 0) return `${days}d ${hours}h`
    if (hours > 0) return `${hours}h ${minutes}m`
    return `${minutes}m`
  }

  // Calculate memory usage based on tokens used
  const calculateMemory = (tokensUsed: number) => {
    // Rough estimate: 1 token ≈ 4 bytes, 1GB = 1e9 bytes
    const bytes = tokensUsed * 4
    const gb = bytes / 1e9
    return Math.max(0.1, Math.min(gb, 4.0)).toFixed(1) // Cap between 0.1 and 4.0 GB
  }

  // Calculate CPU usage based on progress and status
  const calculateCpu = (status: string, progress: number) => {
    if (status === 'active') {
      return Math.min(100, Math.max(10, progress)) // Active agents have at least 10% CPU
    } else if (status === 'idle') {
      return 5 // Idle agents use minimal CPU
    }
    return 0 // Completed/error agents use no CPU
  }

  // Calculate tasks completed (simplified - each run is one task)
  const calculateTasks = (status: string) => {
    return status === 'completed' ? 1 : 0
  }

  // Get sort indicator for a column
  const getSortIndicator = (field: string) => {
    if (sortField !== field) return null
    return sortDirection === 'asc' ? '↑' : '↓'
  }

  const toggleAgentStatus = (id: string) => {
    // In a real app, this would update the status in Supabase
    console.log('Toggle agent status for:', id)
    // For now, just refetch the data
    refetch()
  }

  // Handle sorting
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('desc')
    }
  }

  // Filter and sort agents
  const filteredAndSortedAgents = agents
    .filter(agent => {
      if (statusFilter === 'all') return true
      return agent.status === statusFilter
    })
    .sort((a, b) => {
      let aValue: any = a[sortField as keyof typeof a]
      let bValue: any = b[sortField as keyof typeof b]

      // Handle null values
      if (aValue === null || aValue === undefined) aValue = ''
      if (bValue === null || bValue === undefined) bValue = ''

      // Handle dates
      if (sortField.includes('_at')) {
        aValue = new Date(aValue).getTime()
        bValue = new Date(bValue).getTime()
      }

      // Handle numeric fields
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortDirection === 'asc' ? aValue - bValue : bValue - aValue
      }

      // Handle string fields
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortDirection === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue)
      }

      return 0
    })

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Loading agent data...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <div className="p-4 rounded-lg bg-red-500/20 text-red-400 mb-4">
            <p>{error.message || 'Failed to load agent data. Please try again.'}</p>
          </div>
          <button
            onClick={refetch}
            className="btn-primary"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  // Calculate stats from real data
  const activeAgents = stats.activeAgents
  const totalTasks = agents.filter(a => a.status === 'completed').length
  const totalCost = stats.totalCost
  const avgCpu = agents.length > 0 
    ? Math.round(agents.reduce((sum, agent) => sum + calculateCpu(agent.status, agent.progress), 0) / agents.length)
    : 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Sub-agents</h1>
          <p className="text-slate-400 mt-2">Manage and monitor your AI sub-agents</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="btn-primary flex items-center gap-2">
            <Bot className="w-4 h-4" />
            Deploy Agent
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">Active Agents</p>
              <p className="text-2xl font-bold text-white mt-2">
                {activeAgents}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-green-500/20">
              <Play className="w-6 h-6 text-green-500" />
            </div>
          </div>
          <p className="text-xs text-slate-400 mt-3">
            {activeAgents} of {agents.length} running
          </p>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">Total Tasks</p>
              <p className="text-2xl font-bold text-white mt-2">
                {totalTasks}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-blue-500/20">
              <Zap className="w-6 h-6 text-blue-500" />
            </div>
          </div>
          <p className="text-xs text-slate-400 mt-3">
            Completed successfully
          </p>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">Total Cost</p>
              <p className="text-2xl font-bold text-white mt-2">
                ${totalCost.toFixed(2)}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-amber-500/20">
              <DollarSign className="w-6 h-6 text-amber-500" />
            </div>
          </div>
          <p className="text-xs text-slate-400 mt-3">
            Lifetime usage
          </p>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">Avg. CPU</p>
              <p className="text-2xl font-bold text-white mt-2">
                {avgCpu}%
              </p>
            </div>
            <div className="p-3 rounded-lg bg-purple-500/20">
              <Cpu className="w-6 h-6 text-purple-500" />
            </div>
          </div>
          <p className="text-xs text-slate-400 mt-3">
            Across all agents
          </p>
        </div>
      </div>

      {/* Agents Table */}
      <div className="card">
        {/* Status Filter */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-white">Agent Runs</h3>
            <p className="text-sm text-slate-400">
              Showing {filteredAndSortedAgents.length} of {agents.length} agents
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-400">Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="all">All</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                <option value="failed">Failed</option>
                <option value="idle">Idle</option>
                <option value="error">Error</option>
              </select>
            </div>
          </div>
        </div>
        
        {filteredAndSortedAgents.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Bot className="w-16 h-16 text-slate-600 mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No agents running</h3>
            <p className="text-slate-400 max-w-md mb-6">
              Deploy your first AI sub-agent to start automating tasks and workflows.
            </p>
            <button className="btn-primary flex items-center gap-2">
              <Bot className="w-4 h-4" />
              Deploy Agent
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-800">
                  <th 
                    className="text-left py-3 px-4 text-sm font-semibold text-slate-400 cursor-pointer hover:text-white transition-colors"
                    onClick={() => handleSort('name')}
                  >
                    Agent {getSortIndicator('name')}
                  </th>
                  <th 
                    className="text-left py-3 px-4 text-sm font-semibold text-slate-400 cursor-pointer hover:text-white transition-colors"
                    onClick={() => handleSort('model')}
                  >
                    Model {getSortIndicator('model')}
                  </th>
                  <th 
                    className="text-left py-3 px-4 text-sm font-semibold text-slate-400 cursor-pointer hover:text-white transition-colors"
                    onClick={() => handleSort('project_id')}
                  >
                    Project {getSortIndicator('project_id')}
                  </th>
                  <th 
                    className="text-left py-3 px-4 text-sm font-semibold text-slate-400 cursor-pointer hover:text-white transition-colors"
                    onClick={() => handleSort('status')}
                  >
                    Status {getSortIndicator('status')}
                  </th>
                  <th 
                    className="text-left py-3 px-4 text-sm font-semibold text-slate-400 cursor-pointer hover:text-white transition-colors"
                    onClick={() => handleSort('tokens_used')}
                  >
                    Resources {getSortIndicator('tokens_used')}
                  </th>
                  <th 
                    className="text-left py-3 px-4 text-sm font-semibold text-slate-400 cursor-pointer hover:text-white transition-colors"
                    onClick={() => handleSort('started_at')}
                  >
                    Started {getSortIndicator('started_at')}
                  </th>
                  <th 
                    className="text-left py-3 px-4 text-sm font-semibold text-slate-400 cursor-pointer hover:text-white transition-colors"
                    onClick={() => handleSort('cost')}
                  >
                    Cost {getSortIndicator('cost')}
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-400">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAndSortedAgents.map((agent) => {
                  const agentType = getTypeFromTask(agent.task_description)
                  const cpuUsage = calculateCpu(agent.status, agent.progress)
                  const memoryUsage = calculateMemory(agent.tokens_used || 0)
                  const uptime = calculateUptime(agent.started_at, agent.completed_at)
                  const tasksCompleted = calculateTasks(agent.status)
                  
                  return (
                    <tr key={agent.id} className="border-b border-slate-800/50 last:border-0 hover:bg-slate-800/30">
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-primary/20">
                            <Bot className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <div className="font-medium text-white">{agent.name}</div>
                            <div className="text-xs text-slate-400 truncate max-w-[200px]" title={agent.task_description || 'No task description'}>
                              {agent.task_description || 'No task description'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="text-sm">
                          <div className="font-medium text-white truncate max-w-[180px]" title={agent.model || 'Unknown'}>
                            {agent.model || 'Unknown'}
                          </div>
                          <div className="text-xs text-slate-400">
                            {agent.tokens_used?.toLocaleString() || 0} tokens
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        {agent.project_id && projects[agent.project_id] ? (
                          <Link 
                            to={`/project/${agent.project_id}`}
                            className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors"
                          >
                            <Folder className="w-4 h-4" />
                            <span>{projects[agent.project_id].name}</span>
                          </Link>
                        ) : (
                          <span className="text-sm text-slate-500">—</span>
                        )}
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex flex-col gap-1">
                          <span className={`text-xs px-2 py-1 rounded-full border ${getStatusColor(agent.status)}`}>
                            {agent.status}
                          </span>
                          {agent.progress > 0 && agent.progress < 100 && (
                            <div className="text-xs text-slate-400">
                              {agent.progress}% complete
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-slate-400">CPU</span>
                            <span className="text-white">{cpuUsage}%</span>
                          </div>
                          <div className="w-full h-1 bg-slate-700 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-blue-500 rounded-full"
                              style={{ width: `${cpuUsage}%` }}
                            />
                          </div>
                          <div className="text-xs text-slate-400">{memoryUsage}GB RAM</div>
                          <div className="text-xs text-slate-400">
                            {agent.api_calls?.toLocaleString() || 0} API calls
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="text-sm">
                          <div className="font-medium text-white">
                            {new Date(agent.started_at).toLocaleString('en-US', { 
                              timeZone: 'America/New_York',
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </div>
                          <div className="text-xs text-slate-400 mt-1">
                            {uptime} uptime
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="text-sm font-medium text-white">
                          ${(agent.cost || 0).toFixed(2)}
                        </div>
                        <div className="text-xs text-slate-400">
                          ${((agent.cost || 0) / (agent.tokens_used || 1) * 1000).toFixed(4)}/1K tokens
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => toggleAgentStatus(agent.id)}
                            className={`p-2 rounded-lg transition-colors ${
                              agent.status === 'active'
                                ? 'bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30'
                                : 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                            }`}
                            title={agent.status === 'active' ? 'Pause' : 'Start'}
                            disabled={agent.status === 'completed' || agent.status === 'error'}
                          >
                            {agent.status === 'active' ? (
                              <Pause className="w-4 h-4" />
                            ) : (
                              <Play className="w-4 h-4" />
                            )}
                          </button>
                          <button 
                            className="p-2 rounded-lg bg-slate-700 text-slate-300 hover:bg-slate-600 transition-colors"
                            title="View details"
                          >
                            <Settings className="w-4 h-4" />
                          </button>
                          <button 
                            className="p-2 rounded-lg bg-slate-700 text-slate-300 hover:bg-slate-600 transition-colors"
                            title="More options"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  )
}

export default Agents