export interface SubAgent {
  id: string
  name: string
  status: 'active' | 'idle' | 'error' | 'completed'
  task: string
  progress: number
  startedAt: string
  estimatedCompletion?: string
  metrics?: {
    tokensUsed: number
    apiCalls: number
    cost: number
  }
}

export interface Project {
  id: string
  name: string
  description: string
  status: 'planning' | 'in-progress' | 'review' | 'completed'
  priority: 'low' | 'medium' | 'high' | 'critical'
  subAgents: SubAgent[]
  createdAt: string
  updatedAt: string
  deadline?: string
}

export interface DashboardStats {
  totalProjects: number
  activeSubAgents: number
  totalCost: number
  completionRate: number
  recentActivity: Activity[]
}

export interface Activity {
  id: string
  type: 'agent_started' | 'agent_completed' | 'project_created' | 'error'
  message: string
  timestamp: string
  projectId?: string
  agentId?: string
}

export interface User {
  id: string
  name: string
  email: string
  avatar?: string
  role: 'admin' | 'user' | 'viewer'
}