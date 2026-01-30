import { useParams } from 'react-router-dom'
import { ArrowLeft, Calendar, Users, Target, BarChart, FileText, MessageSquare, Settings } from 'lucide-react'
import { Link } from 'react-router-dom'

const ProjectDetail = () => {
  const { id } = useParams()

  // Mock project data
  const project = {
    id: id || '1',
    name: 'Market Analysis Report',
    description: 'Comprehensive analysis of Q4 market trends with AI-powered insights and predictive modeling.',
    status: 'in-progress',
    priority: 'high',
    createdAt: '2024-01-28T10:00:00Z',
    updatedAt: '2024-01-29T14:30:00Z',
    deadline: '2024-02-05T23:59:59Z',
    progress: 65,
    budget: 2500,
    spent: 1420,
    agents: [
      { id: '1', name: 'Research Agent', status: 'active', progress: 75 },
      { id: '2', name: 'Data Analyzer', status: 'active', progress: 60 },
      { id: '3', name: 'Report Generator', status: 'idle', progress: 0 },
    ]
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart },
    { id: 'agents', label: 'Sub-agents', icon: Users },
    { id: 'documents', label: 'Documents', icon: FileText },
    { id: 'discussion', label: 'Discussion', icon: MessageSquare },
    { id: 'settings', label: 'Settings', icon: Settings },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            to="/"
            className="p-2 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-slate-400" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-white">{project.name}</h1>
            <p className="text-slate-400 mt-1">{project.description}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button className="btn-secondary">Manage Agents</button>
          <button className="btn-primary">Generate Report</button>
        </div>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">Progress</p>
              <p className="text-2xl font-bold text-white mt-2">{project.progress}%</p>
            </div>
            <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent rotate-45"></div>
          </div>
          <div className="mt-4 h-2 bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full"
              style={{ width: `${project.progress}%` }}
            />
          </div>
        </div>

        <div className="card">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500/20">
              <Calendar className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <p className="text-sm text-slate-400">Deadline</p>
              <p className="text-lg font-semibold text-white">
                {new Date(project.deadline).toLocaleDateString()}
              </p>
            </div>
          </div>
          <p className="text-xs text-slate-400 mt-3">
            {Math.ceil((new Date(project.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24))} days remaining
          </p>
        </div>

        <div className="card">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-500/20">
              <Users className="w-5 h-5 text-green-500" />
            </div>
            <div>
              <p className="text-sm text-slate-400">Active Agents</p>
              <p className="text-lg font-semibold text-white">
                {project.agents.filter(a => a.status === 'active').length}/{project.agents.length}
              </p>
            </div>
          </div>
          <p className="text-xs text-slate-400 mt-3">
            {project.agents.filter(a => a.status === 'active').length} running
          </p>
        </div>

        <div className="card">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500/20">
              <Target className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <p className="text-sm text-slate-400">Budget</p>
              <p className="text-lg font-semibold text-white">
                ${project.spent.toLocaleString()}/${project.budget.toLocaleString()}
              </p>
            </div>
          </div>
          <p className="text-xs text-slate-400 mt-3">
            ${(project.budget - project.spent).toLocaleString()} remaining
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-800">
        <div className="flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className="flex items-center gap-2 py-3 px-1 border-b-2 border-transparent text-slate-400 hover:text-white transition-colors"
            >
              <tab.icon className="w-4 h-4" />
              <span className="font-medium">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column - Agents */}
        <div className="lg:col-span-2">
          <div className="card">
            <h2 className="text-xl font-semibold text-white mb-4">Sub-agents</h2>
            <div className="space-y-4">
              {project.agents.map((agent) => (
                <div
                  key={agent.id}
                  className="p-4 rounded-lg bg-slate-800/50 border border-slate-700"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${
                        agent.status === 'active' ? 'bg-green-500' :
                        agent.status === 'idle' ? 'bg-slate-500' :
                        'bg-red-500'
                      }`} />
                      <h3 className="font-medium text-white">{agent.name}</h3>
                      <span className="text-xs px-2 py-1 rounded-full bg-slate-700 text-slate-300">
                        {agent.status}
                      </span>
                    </div>
                    <span className="text-sm font-medium text-slate-300">
                      {agent.progress}%
                    </span>
                  </div>
                  <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        agent.status === 'active' ? 'bg-primary' : 'bg-slate-500'
                      }`}
                      style={{ width: `${agent.progress}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between mt-3 text-sm text-slate-400">
                    <span>Task: Analyzing market data...</span>
                    <span>ETA: 2h 30m</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right column - Details */}
        <div className="space-y-6">
          <div className="card">
            <h2 className="text-xl font-semibold text-white mb-4">Project Details</h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-slate-400">Status</p>
                <div className="flex items-center gap-2 mt-1">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <span className="text-white font-medium capitalize">
                    {project.status.replace('-', ' ')}
                  </span>
                </div>
              </div>
              <div>
                <p className="text-sm text-slate-400">Priority</p>
                <span className={`inline-block mt-1 px-3 py-1 rounded-full text-sm font-medium ${
                  project.priority === 'high' ? 'bg-red-500/20 text-red-400' :
                  project.priority === 'medium' ? 'bg-blue-500/20 text-blue-400' :
                  'bg-slate-500/20 text-slate-400'
                }`}>
                  {project.priority}
                </span>
              </div>
              <div>
                <p className="text-sm text-slate-400">Created</p>
                <p className="text-white mt-1">
                  {new Date(project.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-400">Last Updated</p>
                <p className="text-white mt-1">
                  {new Date(project.updatedAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>

          <div className="card">
            <h2 className="text-xl font-semibold text-white mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <button className="w-full text-left p-3 rounded-lg bg-slate-800/50 hover:bg-slate-800 transition-colors text-white">
                Add new sub-agent
              </button>
              <button className="w-full text-left p-3 rounded-lg bg-slate-800/50 hover:bg-slate-800 transition-colors text-white">
                Schedule report generation
              </button>
              <button className="w-full text-left p-3 rounded-lg bg-slate-800/50 hover:bg-slate-800 transition-colors text-white">
                Export project data
              </button>
              <button className="w-full text-left p-3 rounded-lg bg-red-500/10 hover:bg-red-500/20 transition-colors text-red-400">
                Pause all agents
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProjectDetail