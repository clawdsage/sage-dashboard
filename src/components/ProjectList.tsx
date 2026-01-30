import { MoreVertical, Clock, CheckCircle, AlertCircle, Play, Loader2 } from 'lucide-react'
import { useRealtimeProjects } from '../hooks'
import { useEffect, useState } from 'react'

const ProjectList = () => {
  const { projects, loading, error } = useRealtimeProjects()
  const [animateUpdate, setAnimateUpdate] = useState(false)

  // Listen for data updates to trigger animations
  useEffect(() => {
    const handleDataUpdate = (event: CustomEvent) => {
      if (event.detail.table === 'projects') {
        setAnimateUpdate(true)
        setTimeout(() => setAnimateUpdate(false), 1000)
      }
    }

    window.addEventListener('data-update', handleDataUpdate as EventListener)
    return () => {
      window.removeEventListener('data-update', handleDataUpdate as EventListener)
    }
  }, [])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'in-progress':
        return <Play className="w-4 h-4 text-blue-500" />
      case 'review':
        return <AlertCircle className="w-4 h-4 text-yellow-500" />
      case 'planning':
        return <Clock className="w-4 h-4 text-slate-400" />
      default:
        return <Clock className="w-4 h-4 text-slate-400" />
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'bg-red-500/20 text-red-400 border-red-500/30'
      case 'high':
        return 'bg-orange-500/20 text-orange-400 border-orange-500/30'
      case 'medium':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
      case 'low':
        return 'bg-slate-500/20 text-slate-400 border-slate-500/30'
      default:
        return 'bg-slate-500/20 text-slate-400 border-slate-500/30'
    }
  }

  if (loading) {
    return (
      <div className="card flex items-center justify-center p-8">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
        <span className="ml-3 text-slate-400">Loading projects...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="card p-6">
        <div className="text-red-400 mb-2">Error loading projects</div>
        <div className="text-sm text-slate-400">{error.message}</div>
        <button 
          onClick={() => window.location.reload()}
          className="mt-4 text-primary hover:text-primary-light text-sm"
        >
          Retry
        </button>
      </div>
    )
  }

  if (projects.length === 0) {
    return (
      <div className="card p-8 text-center">
        <div className="text-slate-400 mb-2">No projects found</div>
        <div className="text-sm text-slate-500">Create your first project to get started</div>
      </div>
    )
  }

  return (
    <div className={`card transition-all duration-300 ${animateUpdate ? 'ring-2 ring-primary/30' : ''}`}>
      <div className="space-y-4">
        {projects.map((project) => (
          <div
            key={project.id}
            className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-lg hover:bg-slate-800/50 transition-all duration-300 group"
          >
            <div className="flex items-start sm:items-center gap-4 mb-3 sm:mb-0">
              <div className="p-2 rounded-lg bg-slate-800 flex-shrink-0">
                {getStatusIcon(project.status)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                  <h3 className="font-medium text-white truncate">{project.name}</h3>
                  <span className={`text-xs px-2 py-1 rounded-full border ${getPriorityColor(project.priority)} self-start sm:self-center`}>
                    {project.priority}
                  </span>
                </div>
                <p className="text-sm text-slate-400 mb-3 sm:mb-2 line-clamp-2">{project.description}</p>
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                  <span className="text-xs text-slate-500">
                    Updated {new Date(project.updated_at).toLocaleDateString()}
                  </span>
                  {project.deadline && (
                    <span className="text-xs text-amber-500">
                      Due {new Date(project.deadline).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between sm:justify-end gap-2 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-700">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                <span className="text-xs text-slate-400">Active</span>
              </div>
              <button className="p-2 text-slate-400 hover:text-white active:bg-slate-700 rounded-lg transition-colors sm:opacity-0 sm:group-hover:opacity-100">
                <MoreVertical className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default ProjectList