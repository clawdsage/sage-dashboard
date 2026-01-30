import { Bot, Cpu, Zap, Brain } from 'lucide-react'
import { SubAgent } from '../types'

const mockAgents: SubAgent[] = [
  {
    id: '1',
    name: 'Research Agent',
    status: 'active',
    task: 'Analyzing market trends',
    progress: 75,
    startedAt: '2024-01-29T14:00:00Z',
    estimatedCompletion: '2024-01-29T16:30:00Z',
    metrics: {
      tokensUsed: 12500,
      apiCalls: 42,
      cost: 8.75
    }
  },
  {
    id: '2',
    name: 'Content Writer',
    status: 'active',
    task: 'Generating blog post',
    progress: 40,
    startedAt: '2024-01-29T15:30:00Z',
    estimatedCompletion: '2024-01-29T18:00:00Z',
    metrics: {
      tokensUsed: 8500,
      apiCalls: 28,
      cost: 5.25
    }
  },
  {
    id: '3',
    name: 'Code Reviewer',
    status: 'idle',
    task: 'Waiting for code submission',
    progress: 0,
    startedAt: '2024-01-29T13:00:00Z'
  },
  {
    id: '4',
    name: 'Data Analyzer',
    status: 'error',
    task: 'Failed to process dataset',
    progress: 90,
    startedAt: '2024-01-29T12:00:00Z',
    metrics: {
      tokensUsed: 21000,
      apiCalls: 67,
      cost: 14.50
    }
  }
]

const AgentActivity = () => {
  const getStatusColor = (status: SubAgent['status']) => {
    switch (status) {
      case 'active':
        return 'bg-green-500/20 text-green-400'
      case 'idle':
        return 'bg-slate-500/20 text-slate-400'
      case 'error':
        return 'bg-red-500/20 text-red-400'
      case 'completed':
        return 'bg-blue-500/20 text-blue-400'
    }
  }

  const getAgentIcon = (name: string) => {
    if (name.includes('Research')) return <Brain className="w-5 h-5" />
    if (name.includes('Content')) return <Zap className="w-5 h-5" />
    if (name.includes('Code')) return <Cpu className="w-5 h-5" />
    return <Bot className="w-5 h-5" />
  }

  return (
    <div className="card">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {mockAgents.map((agent) => (
          <div
            key={agent.id}
            className="p-4 rounded-lg bg-slate-800/50 border border-slate-700"
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

            <p className="text-sm text-slate-300 mb-4">{agent.task}</p>

            {/* Progress bar */}
            <div className="mb-4">
              <div className="flex justify-between text-xs text-slate-400 mb-1">
                <span>Progress</span>
                <span>{agent.progress}%</span>
              </div>
              <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${
                    agent.status === 'error' ? 'bg-red-500' :
                    agent.status === 'active' ? 'bg-primary' :
                    'bg-slate-500'
                  }`}
                  style={{ width: `${agent.progress}%` }}
                />
              </div>
            </div>

            {/* Metrics */}
            {agent.metrics && (
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="text-center p-2 bg-slate-900/50 rounded">
                  <div className="font-medium text-slate-300">{agent.metrics.tokensUsed.toLocaleString()}</div>
                  <div className="text-slate-500">Tokens</div>
                </div>
                <div className="text-center p-2 bg-slate-900/50 rounded">
                  <div className="font-medium text-slate-300">{agent.metrics.apiCalls}</div>
                  <div className="text-slate-500">API Calls</div>
                </div>
                <div className="text-center p-2 bg-slate-900/50 rounded">
                  <div className="font-medium text-slate-300">${agent.metrics.cost.toFixed(2)}</div>
                  <div className="text-slate-500">Cost</div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default AgentActivity