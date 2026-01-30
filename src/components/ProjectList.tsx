import { MoreVertical, Clock, CheckCircle, AlertCircle, Play } from 'lucide-react'
import { Project } from '../types'

const mockProjects: Project[] = [
  {
    id: '1',
    name: 'Market Analysis Report',
    description: 'Comprehensive analysis of Q4 market trends',
    status: 'in-progress',
    priority: 'high',
    subAgents: [],
    createdAt: '2024-01-28T10:00:00Z',
    updatedAt: '2024-01-29T14:30:00Z',
    deadline: '2024-02-05T23:59:59Z'
  },
  {
    id: '2',
    name: 'Content Generation Pipeline',
    description: 'Automated blog post generation for tech topics',
    status: 'completed',
    priority: 'medium',
    subAgents: [],
    createdAt: '2024-01-25T09:00:00Z',
    updatedAt: '2024-01-28T16:45:00Z'
  },
  {
    id: '3',
    name: 'Code Review Automation',
    description: 'AI-powered code review and suggestions',
    status: 'review',
    priority: 'critical',
    subAgents: [],
    createdAt: '2024-01-29T08:00:00Z',
    updatedAt: '2024-01-29T15:20:00Z',
    deadline: '2024-01-30T18:00:00Z'
  },
  {
    id: '4',
    name: 'Customer Support Bot Training',
    description: 'Training dataset preparation and model fine-tuning',
    status: 'planning',
    priority: 'medium',
    subAgents: [],
    createdAt: '2024-01-29T11:00:00Z',
    updatedAt: '2024-01-29T11:00:00Z'
  }
]

const ProjectList = () => {
  const getStatusIcon = (status: Project['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'in-progress':
        return <Play className="w-4 h-4 text-blue-500" />
      case 'review':
        return <AlertCircle className="w-4 h-4 text-yellow-500" />
      case 'planning':
        return <Clock className="w-4 h-4 text-slate-400" />
    }
  }

  const getPriorityColor = (priority: Project['priority']) => {
    switch (priority) {
      case 'critical':
        return 'bg-red-500/20 text-red-400 border-red-500/30'
      case 'high':
        return 'bg-orange-500/20 text-orange-400 border-orange-500/30'
      case 'medium':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
      case 'low':
        return 'bg-slate-500/20 text-slate-400 border-slate-500/30'
    }
  }

  return (
    <div className="card">
      <div className="space-y-4">
        {mockProjects.map((project) => (
          <div
            key={project.id}
            className="flex items-center justify-between p-4 rounded-lg hover:bg-slate-800/50 transition-colors group"
          >
            <div className="flex items-center gap-4">
              <div className="p-2 rounded-lg bg-slate-800">
                {getStatusIcon(project.status)}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-medium text-white">{project.name}</h3>
                  <span className={`text-xs px-2 py-1 rounded-full border ${getPriorityColor(project.priority)}`}>
                    {project.priority}
                  </span>
                </div>
                <p className="text-sm text-slate-400 mt-1">{project.description}</p>
                <div className="flex items-center gap-4 mt-2">
                  <span className="text-xs text-slate-500">
                    Updated {new Date(project.updatedAt).toLocaleDateString()}
                  </span>
                  {project.deadline && (
                    <span className="text-xs text-amber-500">
                      Due {new Date(project.deadline).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                <span className="text-xs text-slate-400">3 agents</span>
              </div>
              <button className="p-1 text-slate-400 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity">
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