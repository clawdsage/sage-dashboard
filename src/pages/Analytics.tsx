import { DollarSign, BarChart3, TrendingUp, Cpu, Calendar, PieChart as PieChartIcon, LineChart as LineChartIcon, BarChart as BarChartIcon } from 'lucide-react'
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

// Dynamically import recharts to avoid build errors if not installed
let RechartsComponents: any = null
try {
  const recharts = require('recharts')
  RechartsComponents = {
    LineChart: recharts.LineChart,
    Line: recharts.Line,
    BarChart: recharts.BarChart,
    Bar: recharts.Bar,
    PieChart: recharts.PieChart,
    Pie: recharts.Pie,
    Cell: recharts.Cell,
    XAxis: recharts.XAxis,
    YAxis: recharts.YAxis,
    CartesianGrid: recharts.CartesianGrid,
    Tooltip: recharts.Tooltip,
    Legend: recharts.Legend,
    ResponsiveContainer: recharts.ResponsiveContainer
  }
} catch (err) {
  console.warn('Recharts not installed, charts will be disabled')
}

type TimeRange = '7d' | '30d' | 'all'

interface AnalyticsData {
  totalCost: number
  totalTokens: number
  avgCost: number
  totalRuns: number
  avgCostPerAgent: number
  mostExpensiveModel: string
  costTrend: Array<{ date: string; cost: number }>
  tokenUsage: Array<{ model: string; tokens: number }>
  modelBreakdown: Array<{ model: string; cost: number; color: string }>
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D']

const Analytics = () => {
  const [data, setData] = useState<AnalyticsData>({
    totalCost: 0,
    totalTokens: 0,
    avgCost: 0,
    totalRuns: 0,
    avgCostPerAgent: 0,
    mostExpensiveModel: 'N/A',
    costTrend: [],
    tokenUsage: [],
    modelBreakdown: []
  })
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState<TimeRange>('30d')

  useEffect(() => {
    fetchAnalytics()
    const interval = setInterval(fetchAnalytics, 30000)
    return () => clearInterval(interval)
  }, [timeRange])

  const fetchAnalytics = async () => {
    try {
      let query = supabase
        .from('subagent_runs')
        .select('cost, tokens_used, model, created_at')

      // Apply time filter
      if (timeRange !== 'all') {
        const days = timeRange === '7d' ? 7 : 30
        const cutoff = new Date()
        cutoff.setDate(cutoff.getDate() - days)
        query = query.gte('created_at', cutoff.toISOString())
      }

      const { data: runs } = await query

      if (runs) {
        // Calculate basic stats
        const totalCost = runs.reduce((sum, r) => sum + (r.cost || 0), 0)
        const totalTokens = runs.reduce((sum, r) => sum + (r.tokens_used || 0), 0)
        const totalRuns = runs.length
        const avgCost = totalRuns > 0 ? totalCost / totalRuns : 0

        // Group by model for advanced stats
        const modelStats = runs.reduce((acc, run) => {
          const model = run.model || 'unknown'
          if (!acc[model]) {
            acc[model] = { cost: 0, tokens: 0, count: 0 }
          }
          acc[model].cost += run.cost || 0
          acc[model].tokens += run.tokens_used || 0
          acc[model].count += 1
          return acc
        }, {} as Record<string, { cost: number; tokens: number; count: number }>)

        // Find most expensive model
        let mostExpensiveModel = 'N/A'
        let maxCost = 0
        Object.entries(modelStats).forEach(([model, stats]) => {
          if (stats.cost > maxCost) {
            maxCost = stats.cost
            mostExpensiveModel = model
          }
        })

        // Calculate average cost per agent (assuming each unique model is an "agent")
        const uniqueModels = Object.keys(modelStats).length
        const avgCostPerAgent = uniqueModels > 0 ? totalCost / uniqueModels : 0

        // Prepare cost trend data (group by day)
        const costByDay = runs.reduce((acc, run) => {
          const date = new Date(run.created_at).toISOString().split('T')[0]
          if (!acc[date]) {
            acc[date] = 0
          }
          acc[date] += run.cost || 0
          return acc
        }, {} as Record<string, number>)

        const costTrend = Object.entries(costByDay)
          .map(([date, cost]) => ({ date, cost }))
          .sort((a, b) => a.date.localeCompare(b.date))
          .slice(-30) // Last 30 days max

        // Prepare token usage by model
        const tokenUsage = Object.entries(modelStats)
          .map(([model, stats]) => ({
            model: model.length > 15 ? model.substring(0, 15) + '...' : model,
            tokens: stats.tokens
          }))
          .sort((a, b) => b.tokens - a.tokens)
          .slice(0, 10) // Top 10 models

        // Prepare model breakdown for pie chart
        const modelBreakdown = Object.entries(modelStats)
          .map(([model, stats], index) => ({
            model: model.length > 15 ? model.substring(0, 15) + '...' : model,
            cost: stats.cost,
            color: COLORS[index % COLORS.length]
          }))
          .sort((a, b) => b.cost - a.cost)
          .slice(0, 6) // Top 6 models for pie chart

        setData({
          totalCost,
          totalTokens,
          avgCost,
          totalRuns,
          avgCostPerAgent,
          mostExpensiveModel: mostExpensiveModel.length > 20 
            ? mostExpensiveModel.substring(0, 20) + '...' 
            : mostExpensiveModel,
          costTrend,
          tokenUsage,
          modelBreakdown
        })
      }
    } catch (err) {
      console.error('Analytics error:', err)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (value: number) => `$${value.toFixed(2)}`
  const formatNumber = (value: number) => value.toLocaleString()

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Analytics</h1>
          <p className="text-slate-400 mt-2">Token usage and cost analytics with visualizations</p>
        </div>
        
        <div className="flex space-x-2 mt-4 md:mt-0">
          <button
            onClick={() => setTimeRange('7d')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              timeRange === '7d'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            Last 7 days
          </button>
          <button
            onClick={() => setTimeRange('30d')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              timeRange === '30d'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            Last 30 days
          </button>
          <button
            onClick={() => setTimeRange('all')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              timeRange === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            All time
          </button>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">Total Cost</p>
              <p className="text-2xl font-bold text-white mt-2">
                {formatCurrency(data.totalCost)}
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
                {formatNumber(data.totalTokens)}
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
                {formatCurrency(data.avgCost)}
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
              <p className="text-sm text-slate-400">Avg Cost/Agent</p>
              <p className="text-2xl font-bold text-white mt-2">
                {formatCurrency(data.avgCostPerAgent)}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-purple-500/20">
              <Cpu className="w-6 h-6 text-purple-500" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">Most Expensive Model</p>
              <p className="text-xl font-bold text-white mt-2 truncate" title={data.mostExpensiveModel}>
                {data.mostExpensiveModel}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-yellow-500/20">
              <Calendar className="w-6 h-6 text-yellow-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cost Trend Chart */}
        <div className="card">
          <div className="flex items-center mb-4">
            <LineChartIcon className="w-5 h-5 text-blue-500 mr-2" />
            <h2 className="text-xl font-bold text-white">Cost Trend</h2>
          </div>
          <div className="h-80">
            {data.costTrend.length > 0 ? (
              RechartsComponents ? (
                <RechartsComponents.ResponsiveContainer width="100%" height="100%">
                  <RechartsComponents.LineChart data={data.costTrend}>
                    <RechartsComponents.CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <RechartsComponents.XAxis 
                      dataKey="date" 
                      stroke="#9CA3AF"
                      tickFormatter={(value: string) => {
                        const date = new Date(value)
                        return `${date.getMonth() + 1}/${date.getDate()}`
                      }}
                    />
                    <RechartsComponents.YAxis 
                      stroke="#9CA3AF"
                      tickFormatter={(value: number) => `$${value.toFixed(2)}`}
                    />
                    <RechartsComponents.Tooltip
                      contentStyle={{ backgroundColor: '#1F2937', borderColor: '#374151' }}
                      labelStyle={{ color: '#D1D5DB' }}
                      formatter={(value: number) => [`$${value.toFixed(4)}`, 'Cost']}
                      labelFormatter={(label: string) => `Date: ${label}`}
                    />
                    <RechartsComponents.Legend />
                    <RechartsComponents.Line
                      type="monotone"
                      dataKey="cost"
                      stroke="#3B82F6"
                      strokeWidth={2}
                      dot={{ r: 4 }}
                      activeDot={{ r: 6 }}
                      name="Daily Cost"
                    />
                  </RechartsComponents.LineChart>
                </RechartsComponents.ResponsiveContainer>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-slate-400">
                  <div className="text-lg mb-2">Charts require Recharts installation</div>
                  <div className="text-sm">Run: npm install recharts</div>
                  <div className="mt-4 p-4 bg-slate-800 rounded-lg">
                    <div className="text-sm font-mono">Sample Data (Last 7 days):</div>
                    {data.costTrend.slice(-7).map((item, idx) => (
                      <div key={idx} className="text-sm mt-1">
                        {item.date}: ${item.cost.toFixed(4)}
                      </div>
                    ))}
                  </div>
                </div>
              )
            ) : (
              <div className="h-full flex items-center justify-center text-slate-500">
                No cost data available for the selected time range
              </div>
            )}
          </div>
        </div>

        {/* Token Usage by Model */}
        <div className="card">
          <div className="flex items-center mb-4">
            <BarChartIcon className="w-5 h-5 text-green-500 mr-2" />
            <h2 className="text-xl font-bold text-white">Token Usage by Model</h2>
          </div>
          <div className="h-80">
            {data.tokenUsage.length > 0 ? (
              RechartsComponents ? (
                <RechartsComponents.ResponsiveContainer width="100%" height="100%">
                  <RechartsComponents.BarChart data={data.tokenUsage}>
                    <RechartsComponents.CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <RechartsComponents.XAxis 
                      dataKey="model" 
                      stroke="#9CA3AF"
                      angle={-45}
                      textAnchor="end"
                      height={60}
                    />
                    <RechartsComponents.YAxis 
                      stroke="#9CA3AF"
                      tickFormatter={(value: number) => formatNumber(value)}
                    />
                    <RechartsComponents.Tooltip
                      contentStyle={{ backgroundColor: '#1F2937', borderColor: '#374151' }}
                      labelStyle={{ color: '#D1D5DB' }}
                      formatter={(value: number) => [formatNumber(value), 'Tokens']}
                    />
                    <RechartsComponents.Legend />
                    <RechartsComponents.Bar
                      dataKey="tokens"
                      fill="#10B981"
                      name="Tokens Used"
                      radius={[4, 4, 0, 0]}
                    />
                  </RechartsComponents.BarChart>
                </RechartsComponents.ResponsiveContainer>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-slate-400">
                  <div className="text-lg mb-2">Charts require Recharts installation</div>
                  <div className="text-sm">Run: npm install recharts</div>
                  <div className="mt-4 p-4 bg-slate-800 rounded-lg max-h-64 overflow-y-auto">
                    <div className="text-sm font-mono">Top Models by Token Usage:</div>
                    {data.tokenUsage.slice(0, 10).map((item, idx) => (
                      <div key={idx} className="text-sm mt-1 flex justify-between">
                        <span className="truncate max-w-[150px]">{item.model}</span>
                        <span>{formatNumber(item.tokens)} tokens</span>
                      </div>
                    ))}
                  </div>
                </div>
              )
            ) : (
              <div className="h-full flex items-center justify-center text-slate-500">
                No token usage data available
              </div>
            )}
          </div>
        </div>

        {/* Model Cost Breakdown */}
        <div className="card lg:col-span-2">
          <div className="flex items-center mb-4">
            <PieChartIcon className="w-5 h-5 text-purple-500 mr-2" />
            <h2 className="text-xl font-bold text-white">Cost Breakdown by Model</h2>
          </div>
          <div className="h-80">
            {data.modelBreakdown.length > 0 ? (
              RechartsComponents ? (
                <RechartsComponents.ResponsiveContainer width="100%" height="100%">
                  <RechartsComponents.PieChart>
                    <RechartsComponents.Pie
                      data={data.modelBreakdown}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ model, percent }: { model: string; percent: number }) => `${model}: ${(percent * 100).toFixed(1)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="cost"
                      nameKey="model"
                    >
                      {data.modelBreakdown.map((entry, index) => (
                        <RechartsComponents.Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </RechartsComponents.Pie>
                    <RechartsComponents.Tooltip
                      contentStyle={{ backgroundColor: '#1F2937', borderColor: '#374151' }}
                      labelStyle={{ color: '#D1D5DB' }}
                      formatter={(value: number) => [`$${value.toFixed(4)}`, 'Cost']}
                    />
                    <RechartsComponents.Legend />
                  </RechartsComponents.PieChart>
                </RechartsComponents.ResponsiveContainer>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-slate-400">
                  <div className="text-lg mb-2">Charts require Recharts installation</div>
                  <div className="text-sm">Run: npm install recharts</div>
                  <div className="mt-4 p-4 bg-slate-800 rounded-lg max-h-64 overflow-y-auto">
                    <div className="text-sm font-mono">Cost Breakdown by Model:</div>
                    {data.modelBreakdown.map((item, idx) => (
                      <div key={idx} className="text-sm mt-1 flex items-center">
                        <div 
                          className="w-3 h-3 rounded-full mr-2" 
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="truncate flex-1">{item.model}</span>
                        <span>${item.cost.toFixed(4)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )
            ) : (
              <div className="h-full flex items-center justify-center text-slate-500">
                No model cost data available
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-slate-800 p-6 rounded-lg">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="text-white mt-4">Loading analytics data...</p>
          </div>
        </div>
      )}
    </div>
  )
}

export default Analytics