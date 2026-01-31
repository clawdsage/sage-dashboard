import { FolderKanban, Plus, Search, Filter, MoreVertical, Loader2, AlertCircle, Users, CheckCircle, Clock, BarChart3, Calendar, Edit, Trash2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import CreateProjectModal from '../components/CreateProjectModal'
import EditProjectModal from '../components/EditProjectModal'
import type { Database } from '../types/supabase'

type ProjectRow = Database['public']['Tables']['projects']['Row']

interface Project extends ProjectRow {
  agents: number
  progress: number
  completion_rate: number
  total_tasks: number
  completed_tasks: number
  total_cost: number
  avg_completion_time: number | null
}

const Projects = () => {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [filterPriority, setFilterPriority] = useState<string>('all')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingProject, setEditingProject] = useState<ProjectRow | null>(null)

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

      // Get project IDs for fetching related data
      const projectIds = projectsData.map(p => p.id)

      // Fetch subagent runs for these projects
      const { data: agentRunsData, error: agentRunsError } = await supabase
        .from('subagent_runs')
        .select('project_id, status, progress, cost, started_at, completed_at')
        .in('project_id', projectIds)

      if (agentRunsError) {
        console.error('Error fetching agent runs:', agentRunsError)
      }

      // Fetch tasks for these projects
      const { data: tasksData, error: tasksError } = await supabase
        .from('tasks')
        .select('project_id, status, completed_at')
        .in('project_id', projectIds)

      if (tasksError) {
        console.error('Error fetching tasks:', tasksError)
      }

      // Process data for each project
      const projectStats: Record<string, {
        agents: number
        progress: number
        total_tasks: number
        completed_tasks: number
        total_cost: number
        completion_times: number[]
      }> = {}

      // Initialize stats for each project
      projectsData.forEach(project => {
        projectStats[project.id] = {
          agents: 0,
          progress: 0,
          total_tasks: 0,
          completed_tasks: 0,
          total_cost: 0,
          completion_times: []
        }
      })

      // Process agent runs
      agentRunsData?.forEach(run => {
        if (run.project_id) {
          const stats = projectStats[run.project_id]
          stats.agents++
          stats.total_cost += run.cost || 0
          
          // Calculate completion time if available
          if (run.started_at && run.completed_at) {
            const start = new Date(run.started_at).getTime()
            const end = new Date(run.completed_at).getTime()
            const duration = end - start // in milliseconds
            stats.completion_times.push(duration)
          }
        }
      })

      // Process tasks
      tasksData?.forEach(task => {
        if (task.project_id) {
          const stats = projectStats[task.project_id]
          stats.total_tasks++
          if (task.status === 'completed') {
            stats.completed_tasks++
          }
        }
      })

      // Transform projects data with comprehensive stats
      const transformedProjects: Project[] = projectsData.map(project => {
        const stats = projectStats[project.id]
        
        // Calculate completion rate
        const completion_rate = stats.total_tasks > 0 
          ? Math.round((stats.completed_tasks / stats.total_tasks) * 100)
          : 0
        
        // Calculate average completion time in hours
        let avg_completion_time = null
        if (stats.completion_times.length > 0) {
          const avgMs = stats.completion_times.reduce((a, b) => a + b, 0) / stats.completion_times.length
          avg_completion_time = Math.round(avgMs / (1000 * 60 * 60) * 10) / 10 // Convert to hours with 1 decimal
        }

        // Calculate progress: use agent progress if available, otherwise based on status
        let progress = 0
        if (agentRunsData) {
          const projectRuns = agentRunsData.filter(run => run.project_id === project.id)
          if (projectRuns.length > 0) {
            const avgProgress = projectRuns.reduce((sum, run) => sum + (run.progress || 0), 0) / projectRuns.length
            progress = Math.round(avgProgress)
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
        }

        return {
          ...project,
          agents: stats.agents,
          progress,
          completion_rate,
          total_tasks: stats.total_tasks,
          completed_tasks: stats.completed_tasks,
          total_cost: stats.total_cost,
          avg_completion_time
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

  // Filter projects based on search, status, and priority
  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (project.description?.toLowerCase() || '').includes(searchQuery.toLowerCase())
    
    const matchesStatus = filterStatus === 'all' || project.status === filterStatus
    const matchesPriority = filterPriority === 'all' || project.priority === filterPriority
    
    return matchesSearch && matchesStatus && matchesPriority
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
          <button 
            onClick={() => setShowCreateModal(true)}
            className="btn-primary flex items-center gap-2"
          >
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
        <div className="flex flex-wrap gap-2">
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
          <select
            className="px-4 py-2.5 bg-slate-800 text-slate-300 rounded-lg hover:bg-slate-700 transition-colors flex items-center gap-2"
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
          >
            <option value="all">All Priority</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>
          <div className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 text-slate-300 rounded-lg">
            <Filter className="w-4 h-4" />
            <span>{filteredProjects.length} projects</span>
          </div>
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
          <button 
            onClick={() => setShowCreateModal(true)}
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Create Project
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <div
              key={project.id}
              className="card hover:border-primary/50 hover:scale-[1.02] transition-all duration-300 group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/20">
                    <FolderKanban className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <Link to={`/project/${project.id}`} className="block">
                      <h3 className="font-semibold text-white group-hover:text-primary transition-colors">
                        {project.name}
                      </h3>
                    </Link>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-xs px-2 py-1 rounded-full border ${getStatusColor(project.status)}`}>
                        {project.status.replace('-', ' ')}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded-full ${getPriorityColor(project.priority)}`}>
                        {project.priority}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button 
                    onClick={() => setEditingProject(project)}
                    className="p-1.5 text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                    title="Edit project"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => setEditingProject(project)}
                    className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                    title="Delete project"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Description */}
              {project.description && (
                <p className="text-sm text-slate-400 mb-4 overflow-hidden text-ellipsis" style={{ 
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical'
                }}>
                  {project.description}
                </p>
              )}

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

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="flex items-center gap-2 p-2 bg-slate-800/50 rounded-lg">
                  <Users className="w-4 h-4 text-blue-400" />
                  <div>
                    <div className="text-xs text-slate-400">Agents</div>
                    <div className="text-sm font-medium text-white">{project.agents}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-2 bg-slate-800/50 rounded-lg">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <div>
                    <div className="text-xs text-slate-400">Completion</div>
                    <div className="text-sm font-medium text-white">{project.completion_rate}%</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-2 bg-slate-800/50 rounded-lg">
                  <BarChart3 className="w-4 h-4 text-purple-400" />
                  <div>
                    <div className="text-xs text-slate-400">Tasks</div>
                    <div className="text-sm font-medium text-white">
                      {project.completed_tasks}/{project.total_tasks}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-2 bg-slate-800/50 rounded-lg">
                  <Clock className="w-4 h-4 text-yellow-400" />
                  <div>
                    <div className="text-xs text-slate-400">Avg Time</div>
                    <div className="text-sm font-medium text-white">
                      {project.avg_completion_time ? `${project.avg_completion_time}h` : 'N/A'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-800">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  <span className="text-slate-400">
                    {project.deadline ? `Due ${formatDate(project.deadline)}` : 'No deadline'}
                  </span>
                </div>
                <div className="text-sm font-medium">
                  <span className="text-slate-400">Cost: </span>
                  <span className="text-white">${project.total_cost.toFixed(2)}</span>
                </div>
              </div>
            </div>
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

      {/* Modals */}
      <CreateProjectModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={fetchProjects}
      />
      <EditProjectModal
        isOpen={!!editingProject}
        onClose={() => setEditingProject(null)}
        project={editingProject}
        onSuccess={fetchProjects}
        onDelete={fetchProjects}
      />
    </div>
  )
}

export default Projects