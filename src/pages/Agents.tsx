import { Bot, Play, Pause, Settings, Cpu, Zap, Clock, DollarSign, MoreVertical } from 'lucide-react'
import { useState } from 'react'

const Agents = () => {
  const [agents, setAgents] = useState([
    { id: '1', name: 'Research Agent', status: 'active', type: 'analysis', cpu: 45, memory: 2.1, uptime: '2d 5h', cost: 42.50, tasks: 12 },
    { id: '2', name: 'Content Generator', status: 'active', type: 'generation', cpu: 68, memory: 3.4, uptime: '1d 8h', cost: 28.75, tasks: 8 },
    { id: '3', name: 'Code Reviewer', status: 'idle', type: 'analysis', cpu: 12, memory: 1.2, uptime: '5h', cost: 15.20, tasks: 3 },
    { id: '4', name: 'Data Analyzer', status: 'paused', type: 'analysis', cpu: 0, memory: 0.8, uptime: '3d', cost: 56.80, tasks: 18 },
    { id: '5', name: 'Report Writer', status: 'active', type: 'generation', cpu: 52, memory: 2.8, uptime: '1d 12h', cost: 32.10, tasks: 7 },
    { id: '6', name: 'QA Tester', status: 'error', type: 'testing', cpu: 0, memory: 0.5, uptime: '30m', cost: 8.90, tasks: 1 },
  ])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500/20 text-green-400 border-green-500/30'
      case 'idle': return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
      case 'paused': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
      case 'error': return 'bg-red-500/20 text-red-400 border-red-500/30'
      default: return 'bg-slate-500/20 text-slate-400 border-slate-500/30'
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'analysis': return 'bg-purple-500/20 text-purple-400'
      case 'generation': return 'bg-blue-500/20 text-blue-400'
      case 'testing': return 'bg-amber-500/20 text-amber-400'
      default: return 'bg-slate-500/20 text-slate-400'
    }
  }

  const toggleAgentStatus = (id: string) => {
    setAgents(agents.map(agent => {
      if (agent.id === id) {
        const newStatus = agent.status === 'active' ? 'paused' : 'active'
        return { ...agent, status: newStatus }
      }
      return agent
    }))
  }

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
                {agents.filter(a => a.status === 'active').length}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-green-500/20">
              <Play className="w-6 h-6 text-green-500" />
            </div>
          </div>
          <p className="text-xs text-slate-400 mt-3">
            {agents.filter(a => a.status === 'active').length} of {agents.length} running
          </p>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">Total Tasks</p>
              <p className="text-2xl font-bold text-white mt-2">
                {agents.reduce((sum, agent) => sum + agent.tasks, 0)}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-blue-500/20">
              <Zap className="w-6 h-6 text-blue-500" />
            </div>
          </div>
          <p className="text-xs text-slate-400 mt-3">
            Across all agents
          </p>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">Total Cost</p>
              <p className="text-2xl font-bold text-white mt-2">
                ${agents.reduce((sum, agent) => sum + agent.cost, 0).toFixed(2)}
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
                {Math.round(agents.reduce((sum, agent) => sum + agent.cpu, 0) / agents.length)}%
              </p>
            </div>
            <div className="p-3 rounded-lg bg-purple-500/20">
              <Cpu className="w-6 h-6 text-purple-500" />
            </div>
          </div>
          <p className="text-xs text-slate-400 mt-3">
            Across active agents
          </p>
        </div>
      </div>

      {/* Agents Table */}
      <div className="card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-800">
                <th className="text-left py-3 px-4 text-sm font-semibold text-slate-400">Agent</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-slate-400">Status</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-slate-400">Type</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-slate-400">Resources</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-slate-400">Uptime</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-slate-400">Cost</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-slate-400">Tasks</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-slate-400">Actions</th>
              </tr>
            </thead>
            <tbody>
              {agents.map((agent) => (
                <tr key={agent.id} className="border-b border-slate-800/50 last:border-0 hover:bg-slate-800/30">
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/20">
                        <Bot className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <div className="font-medium text-white">{agent.name}</div>
                        <div className="text-xs text-slate-400">ID: {agent.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span className={`text-xs px-2 py-1 rounded-full border ${getStatusColor(agent.status)}`}>
                      {agent.status}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <span className={`text-xs px-2 py-1 rounded-full ${getTypeColor(agent.type)}`}>
                      {agent.type}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-400">CPU</span>
                        <span className="text-white">{agent.cpu}%</span>
                      </div>
                      <div className="w-full h-1 bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-500 rounded-full"
                          style={{ width: `${agent.cpu}%` }}
                        />
                      </div>
                      <div className="text-xs text-slate-400">{agent.memory}GB RAM</div>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="w-4 h-4 text-slate-400" />
                      <span className="text-white">{agent.uptime}</span>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="text-sm font-medium text-white">
                      ${agent.cost.toFixed(2)}
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="text-sm font-medium text-white">
                      {agent.tasks}
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
                      >
                        {agent.status === 'active' ? (
                          <Pause className="w-4 h-4" />
                        ) : (
                          <Play className="w-4 h-4" />
                        )}
                      </button>
                      <button className="p-2 rounded-lg bg-slate-700 text-slate-300 hover:bg-slate-600 transition-colors">
                        <Settings className="w-4 h-4" />
                      </button>
                      <button className="p-2 rounded-lg bg-slate-700 text-slate-300 hover:bg-slate-600 transition-colors">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Empty State (commented out for now) */}
      {/* <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
        <Bot className="w-16 h-16 text-slate-600 mb-4" />
        <h3 className="text-xl font-semibold text-white mb-2">No agents deployed</h3>
        <p className="text-slate-400 max-w-md mb-6">
          Deploy your first AI sub-agent to start automating tasks and workflows.
        </p>
        <button className="btn-primary flex items-center gap-2">
          <Bot className="w-4 h-4" />
          Deploy Agent
        </button>
      </div> */}
    </div>
  )
}

export default Agents