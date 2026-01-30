import { LucideIcon } from 'lucide-react'

interface StatCardProps {
  title: string
  value: string
  change: string
  icon: LucideIcon
  color: string
  trend: 'up' | 'down'
}

const StatCard = ({ title, value, change, icon: Icon, color, trend }: StatCardProps) => {
  return (
    <div className="card">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-400">{title}</p>
          <p className="text-2xl font-bold text-white mt-2">{value}</p>
          <div className="flex items-center gap-1 mt-2">
            <span className={`text-sm font-medium ${
              trend === 'up' ? 'text-green-500' : 'text-red-500'
            }`}>
              {trend === 'up' ? '↗' : '↘'} {change}
            </span>
            <span className="text-sm text-slate-400">from yesterday</span>
          </div>
        </div>
        <div className={`${color} w-12 h-12 rounded-xl flex items-center justify-center`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  )
}

export default StatCard