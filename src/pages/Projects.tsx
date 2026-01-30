import { FolderKanban, Plus, Search, Filter, MoreVertical, Loader2, AlertCircle } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

interface Project {
  id: string
  name: string
  description: string | null
  status: 'planning' | 'in-progress' | 'review' | 'completed'
  priority: 'low' | 'medium' | 'high' | 'critical'
  created_at: string
  updated_at: string
  deadline: string | null
  agents: number
  progress: number
}

const Projects = () => {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')

  const fetchProjects = useCallback(async () => {
    try {
      setLoading(true)
      
      // Fetch projects from Supabase
      const { data: projectsData, error: projectsError } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false })

      if (projectsError) {
        throw projectsError
      }

      if (!projectsData || projectsData.length === 0) {
        setProjects([])
        setError(null)
        return
      }

      // Get project IDs for fetching agent runs
      const projectIds = projectsData.map(p => p.id)

      // Fetch subagent runs for these projects to count agents per project
      const { data: agentRunsData, error: agentRunsError } = await supabase
        .from('subagent_runs')
        .select('project_id, status, progress')
        .in('project_id', projectIds)

      if (agentRunsError) {
        console.error('Error fetching agent runs:', agentRunsError)
        // Continue without agent data
      }

      // Count agents per project and calculate average progress
      const agentCounts: Record<string, number> = {}
      const projectProgress: Record<string, { total: number, count: number }> = {}

      agentRunsData?.forEach(run => {
        if (run.project_id) {
          // Count agents per project
          agentCounts[run.project_id] = (agentCounts[run.project_id] || 0) + 1
          
          // Calculate progress from agent runs
          if (!projectProgress[run.project_id]) {
            projectProgress[run.project_id] = { total: 0, count: 0 }
          }
          projectProgress[run.project_id].total += run.progress || 0
          projectProgress[run.project_id].count += 1
        }
      })

      // Transform projects data to match the expected structure
      const transformedProjects: Project[] = projectsData.map(project => {
        const agentCount = agentCounts[project.id] || 0
        
        // Calculate progress: if we have agent runs, use their average progress
        // Otherwise, use a default based on status
        let progress = 0
        if (projectProgress[project.id] && projectProgress[project.id].count > 0) {
          progress = Math.round(projectProgress[project.id].total / projectProgress[project.id].count)
        } else {
          // Default progress based on status
          switch (project.status) {
            case 'planning': progress = 20; break
            case 'in-progress': progress = 60; break
            case 'review': progress = 90; break
            case 'completed': progress = 100; break
            default: progress = 0
          }
        }

        return {
          ...project,
          agents: agentCount,
          progress
        }
      })

      setProjects(transformedProjects)
      setError(null)
    } catch (err) {
      console.error('Error fetching projects:', err)
      setError('Failed to load projects. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [])

  // Set up auto-refresh every 30 seconds
  useEffect(() => {
    fetchProjects()
    
    const interval = setInterval(fetchProjects, 30000)
    return () => clearInterval(interval)
  }, [fetchProjects])

  // Filter projects based on search and status
  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (project.description?.toLowerCase() || '').includes(searchQuery.toLowerCase())
    
    const matchesStatus = filterStatus === 'all' || project.status === filterStatus
    
    return matchesSearch && matchesStatus
  })

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

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'No deadline'
    return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  if (loading && projects.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Loading projects...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center max-w-md">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">Error Loading Projects</h3>
          <p className="text-slate-400 mb-4">{error}</p>
          <button
            onClick={fetchProjects}
            className="btn-primary"
          >
            Try Again
          </button>
        </div>
      </div>
    )
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
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <select
            className="px-4 py-2.5 bg-slate-800 text-slate-300 rounded-lg hover:bg-slate-700 transition-colors flex items-center gap-2"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="planning">Planning</option>
            <option value="in-progress">In Progress</option>
            <option value="review">Review</option>
            <option value="completed">Completed</option>
          </select>
          <button className="px-4 py-2.5 bg-slate-800 text-slate-300 rounded-lg hover:bg-slate-700 transition-colors">
            Sort
          </button>
        </div>
      </div>

      {/* Projects Grid */}
      {filteredProjects.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
          <FolderKanban className="w-16 h-16 text-slate-600 mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">
            {projects.length === 0 ? 'No projects yet' : 'No matching projects'}
          </h3>
          <p className="text-slate-400 max-w-md mb-6">
            {projects.length === 0 
              ? 'Create your first project to start managing AI sub-agents and tasks.'
              : 'Try adjusting your search or filter criteria.'}
          </p>
          <button className="btn-primary flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Create Project
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
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
                  {project.deadline ? `Due ${formatDate(project.deadline)}` : 'No deadline'}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Loading indicator for auto-refresh */}
      {loading && projects.length > 0 && (
        <div className="fixed bottom-4 right-4 bg-slate-800 text-slate-300 px-3 py-2 rounded-lg text-sm flex items-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin" />
          Refreshing...
        </div>
      )}
    </div>
  )
}

export default Projects