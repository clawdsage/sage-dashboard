import { FolderKanban, Plus, Search, Filter, MoreVertical } from 'lucide-react'
import { Link } from 'react-router-dom'

const Projects = () => {
  // Mock projects data
  const projects = [
    { id: '1', name: 'Market Analysis', status: 'in-progress', priority: 'high', progress: 75, deadline: '2024-02-05', agents: 3 },
    { id: '2', name: 'Content Generation', status: 'completed', priority: 'medium', progress: 100, deadline: '2024-01-28', agents: 2 },
    { id: '3', name: 'Code Review', status: 'review', priority: 'critical', progress: 90, deadline: '2024-01-30', agents: 4 },
    { id: '4', name: 'Data Migration', status: 'planning', priority: 'low', progress: 20, deadline: '2024-02-15', agents: 1 },
    { id: '5', name: 'API Integration', status: 'in-progress', priority: 'high', progress: 60, deadline: '2024-02-10', agents: 2 },
    { id: '6', name: 'Documentation', status: 'in-progress', priority: 'medium', progress: 45, deadline: '2024-02-08', agents: 1 },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500/20 text-green-400 border-green-500/30'
      case 'in-progress': return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
      case 'review': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
      case 'planning': return 'bg-slate-500/20 text-slate-400 border-slate-500/30'
      default: return 'bg-slate-500/20 text-slate-400 border-slate-500/30'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-500/20 text-red-400'
      case 'high': return 'bg-orange-500/20 text-orange-400'
      case 'medium': return 'bg-blue-500/20 text-blue-400'
      case 'low': return 'bg-slate-500/20 text-slate-400'
      default: return 'bg-slate-500/20 text-slate-400'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Projects</h1>
          <p className="text-slate-400 mt-2">Manage all your AI projects and sub-agents</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="btn-primary flex items-center gap-2">
            <Plus className="w-4 h-4" />
            New Project
          </button>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="search"
            placeholder="Search projects..."
            className="input-field w-full pl-10"
          />
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2.5 bg-slate-800 text-slate-300 rounded-lg hover:bg-slate-700 transition-colors flex items-center gap-2">
            <Filter className="w-4 h-4" />
            Filter
          </button>
          <button className="px-4 py-2.5 bg-slate-800 text-slate-300 rounded-lg hover:bg-slate-700 transition-colors">
            Sort
          </button>
        </div>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => (
          <Link
            key={project.id}
            to={`/project/${project.id}`}
            className="card hover:border-primary/50 hover:scale-[1.02] transition-all duration-300 group"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/20">
                  <FolderKanban className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-white group-hover:text-primary transition-colors">
                    {project.name}
                  </h3>
                  <span className={`text-xs px-2 py-1 rounded-full border ${getStatusColor(project.status)}`}>
                    {project.status.replace('-', ' ')}
                  </span>
                </div>
              </div>
              <button className="p-1 text-slate-400 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity">
                <MoreVertical className="w-4 h-4" />
              </button>
            </div>

            {/* Progress */}
            <div className="mb-4">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-slate-400">Progress</span>
                <span className="text-white font-medium">{project.progress}%</span>
              </div>
              <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all duration-500"
                  style={{ width: `${project.progress}%` }}
                />
              </div>
            </div>

            {/* Metadata */}
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <span className="text-slate-400">{project.agents} agents</span>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${getPriorityColor(project.priority)}`}>
                  {project.priority}
                </span>
              </div>
              <div className="text-slate-400">
                Due {new Date(project.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Empty State (commented out for now) */}
      {/* <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
        <FolderKanban className="w-16 h-16 text-slate-600 mb-4" />
        <h3 className="text-xl font-semibold text-white mb-2">No projects yet</h3>
        <p className="text-slate-400 max-w-md mb-6">
          Create your first project to start managing AI sub-agents and tasks.
        </p>
        <button className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Create Project
        </button>
      </div> */}
    </div>
  )
}

export default Projects