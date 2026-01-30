import { DollarSign, BarChart3, TrendingUp, Cpu } from 'lucide-react'
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const Analytics = () => {
  const [stats, setStats] = useState({
    totalCost: 0,
    totalTokens: 0,
    avgCost: 0,
    totalRuns: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAnalytics()
    const interval = setInterval(fetchAnalytics, 30000)
    return () => clearInterval(interval)
  }, [])

  const fetchAnalytics = async () => {
    try {
      const { data } = await supabase
        .from('subagent_runs')
        .select('cost, tokens_used')
      
      if (data) {
        const totalCost = data.reduce((sum, r) => sum + (r.cost || 0), 0)
        const totalTokens = data.reduce((sum, r) => sum + (r.tokens_used || 0), 0)
        const totalRuns = data.length
        
        setStats({
          totalCost,
          totalTokens,
          avgCost: totalRuns > 0 ? totalCost / totalRuns : 0,
          totalRuns
        })
      }
    } catch (err) {
      console.error('Analytics error:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Analytics</h1>
        <p className="text-slate-400 mt-2">Token usage and cost analytics</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">Total Cost</p>
              <p className="text-2xl font-bold text-white mt-2">
                ${stats.totalCost.toFixed(2)}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-red-500/20">
              <DollarSign className="w-6 h-6 text-red-500" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">Total Tokens</p>
              <p className="text-2xl font-bold text-white mt-2">
                {stats.totalTokens.toLocaleString()}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-blue-500/20">
              <BarChart3 className="w-6 h-6 text-blue-500" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">Avg Cost/Run</p>
              <p className="text-2xl font-bold text-white mt-2">
                ${stats.avgCost.toFixed(4)}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-green-500/20">
              <TrendingUp className="w-6 h-6 text-green-500" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">Total Runs</p>
              <p className="text-2xl font-bold text-white mt-2">
                {stats.totalRuns}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-purple-500/20">
              <Cpu className="w-6 h-6 text-purple-500" />
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <h2 className="text-xl font-bold text-white mb-4">Coming Soon</h2>
        <p className="text-slate-400">
          Detailed breakdowns, charts, and trends will be added here.
        </p>
      </div>
    </div>
  )
}

export default Analytics
