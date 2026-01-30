import { Bot, Cpu, Zap, Brain, Loader2 } from 'lucide-react'
import { useRealtimeSubagentRuns } from '../hooks'
import { useEffect, useState } from 'react'

const AgentActivity = () => {
  const { subagentRuns, loading, error, stats } = useRealtimeSubagentRuns()
  const [animateUpdate, setAnimateUpdate] = useState(false)

  // Listen for data updates to trigger animations
  useEffect(() => {
    const handleDataUpdate = (event: CustomEvent) => {
      if (event.detail.table === 'subagent_runs') {
        setAnimateUpdate(true)
        setTimeout(() => setAnimateUpdate(false), 600)
      }
    }

    window.addEventListener('data-update', handleDataUpdate as EventListener)
    return () => {
      window.removeEventListener('data-update', handleDataUpdate as EventListener)
    }
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500/20 text-green-400'
      case 'idle':
        return 'bg-slate-500/20 text-slate-400'
      case 'error':
        return 'bg-red-500/20 text-red-400'
      case 'completed':
        return 'bg-blue-500/20 text-blue-400'
      default:
        return 'bg-slate-500/20 text-slate-400'
    }
  }

  const getAgentIcon = (name: string) => {
    if (name.toLowerCase().includes('research') || name.toLowerCase().includes('analy')) 
      return <Brain className="w-5 h-5" />
    if (name.toLowerCase().includes('content') || name.toLowerCase().includes('write')) 
      return <Zap className="w-5 h-5" />
    if (name.toLowerCase().includes('code') || name.toLowerCase().includes('dev')) 
      return <Cpu className="w-5 h-5" />
    return <Bot className="w-5 h-5" />
  }

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffHours = Math.floor(diffMs / 3600000)
    
    if (diffHours < 24) {
      return `${diffHours}h ago`
    } else {
      return date.toLocaleDateString()
    }
  }

  if (loading) {
    return (
      <div className="card flex items-center justify-center p-8">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
        <span className="ml-3 text-slate-400">Loading agent activity...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="card p-6">
        <div className="text-red-400 mb-2">Error loading agent activity</div>
        <div className="text-sm text-slate-400">{error.message}</div>
      </div>
    )
  }

  if (subagentRuns.length === 0) {
    return (
      <div className="card p-8 text-center">
        <div className="text-slate-400 mb-2">No agents running</div>
        <div className="text-sm text-slate-500">Start a task to see agent activity here</div>
      </div>
    )
  }

  // Get active agents first, then others
  const sortedAgents = [...subagentRuns].sort((a, b) => {
    if (a.status === 'active' && b.status !== 'active') return -1
    if (a.status !== 'active' && b.status === 'active') return 1
    return new Date(b.started_at).getTime() - new Date(a.started_at).getTime()
  })

  // Take only the first 4 agents for display
  const displayAgents = sortedAgents.slice(0, 4)

  return (
    <div className={`transition-all duration-300 ${animateUpdate ? 'scale-[1.01]' : ''}`}>
      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {displayAgents.map((agent) => (
            <div
              key={agent.id}
              className="p-4 rounded-lg bg-slate-800/50 border border-slate-700 hover:border-slate-600 transition-all duration-300"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/20">
                    {getAgentIcon(agent.name)}
                  </div>
                  <div>
                    <h3 className="font-medium text-white">{agent.name}</h3>
                    <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(agent.status)}`}>
                      {agent.status}
                    </span>
                  </div>
                </div>
              </div>

              <p className="text-sm text-slate-300 mb-4">
                {agent.task_description || 'No task description'}
              </p>

              {/* Progress bar */}
              <div className="mb-4">
                <div className="flex justify-between text-xs text-slate-400 mb-1">
                  <span>Progress</span>
                  <span>{agent.progress}%</span>
                </div>
                <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      agent.status === 'error' ? 'bg-red-500' :
                      agent.status === 'active' ? 'bg-primary' :
                      agent.status === 'completed' ? 'bg-green-500' :
                      'bg-slate-500'
                    }`}
                    style={{ width: `${agent.progress}%` }}
                  />
                </div>
              </div>

              {/* Metrics */}
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="text-center p-2 bg-slate-900/50 rounded">
                  <div className="font-medium text-slate-300">{agent.tokens_used.toLocaleString()}</div>
                  <div className="text-slate-500">Tokens</div>
                </div>
                <div className="text-center p-2 bg-slate-900/50 rounded">
                  <div className="font-medium text-slate-300">{agent.api_calls}</div>
                  <div className="text-slate-500">API Calls</div>
                </div>
                <div className="text-center p-2 bg-slate-900/50 rounded">
                  <div className="font-medium text-slate-300">${agent.cost.toFixed(2)}</div>
                  <div className="text-slate-500">Cost</div>
                </div>
              </div>

              {/* Started time */}
              <div className="mt-3 text-xs text-slate-500">
                Started {formatTime(agent.started_at)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Stats summary */}
      <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-3 rounded-lg bg-slate-800/30 border border-slate-700/50">
          <div className="text-sm text-slate-400">Active Agents</div>
          <div className="text-xl font-semibold text-white mt-1">{stats.activeAgents}</div>
        </div>
        <div className="p-3 rounded-lg bg-slate-800/30 border border-slate-700/50">
          <div className="text-sm text-slate-400">Total Cost</div>
          <div className="text-xl font-semibold text-white mt-1">${stats.totalCost.toFixed(2)}</div>
        </div>
        <div className="p-3 rounded-lg bg-slate-800/30 border border-slate-700/50">
          <div className="text-sm text-slate-400">Avg Progress</div>
          <div className="text-xl font-semibold text-white mt-1">{stats.averageProgress.toFixed(0)}%</div>
        </div>
        <div className="p-3 rounded-lg bg-slate-800/30 border border-slate-700/50">
          <div className="text-sm text-slate-400">Total Runs</div>
          <div className="text-xl font-semibold text-white mt-1">{stats.totalRuns}</div>
        </div>
      </div>
    </div>
  )
}

export default AgentActivity