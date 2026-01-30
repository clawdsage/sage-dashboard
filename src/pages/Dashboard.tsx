import { Activity, TrendingUp, Users, DollarSign } from 'lucide-react'
import StatCard from '../components/StatCard'
import ProjectList from '../components/ProjectList'
import AgentActivity from '../components/AgentActivity'
import RecentActivity from '../components/RecentActivity'

const Dashboard = () => {
  const stats = [
    {
      title: 'Active Projects',
      value: '8',
      change: '+2',
      icon: Activity,
      color: 'bg-blue-500',
      trend: 'up'
    },
    {
      title: 'Sub-agents Running',
      value: '12',
      change: '+3',
      icon: Users,
      color: 'bg-green-500',
      trend: 'up'
    },
    {
      title: 'Completion Rate',
      value: '87%',
      change: '+5%',
      icon: TrendingUp,
      color: 'bg-purple-500',
      trend: 'up'
    },
    {
      title: 'Today\'s Cost',
      value: '$42.50',
      change: '-$8.20',
      icon: DollarSign,
      color: 'bg-amber-500',
      trend: 'down'
    }
  ]

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
            <button className="text-primary hover:text-primary-light text-sm font-medium">
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
          <button className="text-primary hover:text-primary-light text-sm font-medium">
            Manage agents →
          </button>
        </div>
        <AgentActivity />
      </div>
    </div>
  )
}

export default Dashboard