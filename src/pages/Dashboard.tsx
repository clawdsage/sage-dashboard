import { Activity, TrendingUp, Users, DollarSign, Loader2 } from 'lucide-react'
import StatCard from '../components/StatCard'
import ProjectList from '../components/ProjectList'
import AgentActivity from '../components/AgentActivity'
import RecentActivity from '../components/RecentActivity'
import { useRealtimeProjects, useRealtimeSubagentRuns } from '../hooks'
import { useEffect, useState } from 'react'

const Dashboard = () => {
  const { projects, loading: projectsLoading } = useRealtimeProjects()
  const { subagentRuns, loading: agentsLoading, stats: agentStats } = useRealtimeSubagentRuns()
  const [dashboardStats, setDashboardStats] = useState({
    activeProjects: 0,
    subagentsRunning: 0,
    completionRate: 0,
    todaysCost: 0
  })
  const [loading, setLoading] = useState(true)

  // Calculate dashboard stats
  useEffect(() => {
    if (!projectsLoading && !agentsLoading) {
      // Calculate active projects (in-progress status)
      const activeProjects = projects.filter(p => p.status === 'in-progress').length
      
      // Calculate completion rate (completed projects / total projects)
      const completedProjects = projects.filter(p => p.status === 'completed').length
      const completionRate = projects.length > 0 
        ? Math.round((completedProjects / projects.length) * 100)
        : 0

      // Calculate today's cost (sum of costs from today's runs)
      const today = new Date().toISOString().split('T')[0]
      const todaysRuns = subagentRuns.filter(run => 
        run.started_at.startsWith(today)
      )
      const todaysCost = todaysRuns.reduce((sum, run) => sum + run.cost, 0)

      setDashboardStats({
        activeProjects,
        subagentsRunning: agentStats.activeAgents,
        completionRate,
        todaysCost
      })
      setLoading(false)
    }
  }, [projects, subagentRuns, projectsLoading, agentsLoading, agentStats.activeAgents])

  const stats = [
    {
      title: 'Active Projects',
      value: loading ? '...' : dashboardStats.activeProjects.toString(),
      change: loading ? '...' : '+2',
      icon: Activity,
      color: 'bg-blue-500',
      trend: 'up' as const
    },
    {
      title: 'Sub-agents Running',
      value: loading ? '...' : dashboardStats.subagentsRunning.toString(),
      change: loading ? '...' : '+3',
      icon: Users,
      color: 'bg-green-500',
      trend: 'up' as const
    },
    {
      title: 'Completion Rate',
      value: loading ? '...' : `${dashboardStats.completionRate}%`,
      change: loading ? '...' : '+5%',
      icon: TrendingUp,
      color: 'bg-purple-500',
      trend: 'up' as const
    },
    {
      title: 'Today\'s Cost',
      value: loading ? '...' : `$${dashboardStats.todaysCost.toFixed(2)}`,
      change: loading ? '...' : '-$8.20',
      icon: DollarSign,
      color: 'bg-amber-500',
      trend: 'down' as const
    }
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto" />
          <div className="mt-4 text-slate-400">Loading dashboard data...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Dashboard</h1>
        <p className="text-slate-400 mt-2">Monitor and manage your AI sub-agent workforce</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Projects */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-white">Recent Projects</h2>
            <button className="text-primary hover:text-primary-light text-sm font-medium transition-colors">
              View all →
            </button>
          </div>
          <ProjectList />
        </div>

        {/* Recent Activity */}
        <div>
          <h2 className="text-xl font-semibold text-white mb-4">Recent Activity</h2>
          <RecentActivity />
        </div>
      </div>

      {/* Agent Activity */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-white">Agent Activity</h2>
          <button className="text-primary hover:text-primary-light text-sm font-medium transition-colors">
            Manage agents →
          </button>
        </div>
        <AgentActivity />
      </div>
    </div>
  )
}

export default Dashboard