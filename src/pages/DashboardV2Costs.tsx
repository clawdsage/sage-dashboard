import React, { useEffect, useState, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import type { Database } from '../types/supabase';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar
} from 'recharts';
import { Calendar, DollarSign, TrendingUp, BarChart3 } from 'lucide-react';

type SubagentRun = Database['public']['Tables']['subagent_runs']['Row'];

interface CostData {
  date: string;
  cost: number;
  count: number;
}

interface ModelCost {
  model: string;
  cost: number;
  count: number;
}

interface ProjectCost {
  projectName: string;
  cost: number;
  count: number;
}

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#84CC16', '#F97316'];

const DashboardV2Costs: React.FC = () => {
  const [runs, setRuns] = useState<SubagentRun[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days ago
    end: new Date().toISOString().split('T')[0], // today
  });
  const [projects, setProjects] = useState<{ [key: string]: string }>({});

  const loadData = async () => {
    try {
      setLoading(true);

      // Load projects for name mapping
      const { data: projectsData, error: projectsError } = await supabase
        .from('projects')
        .select('id, name');

      if (projectsError) throw projectsError;

      const projectMap: { [key: string]: string } = {};
      projectsData?.forEach(project => {
        projectMap[project.id] = project.name;
      });
      setProjects(projectMap);

      // Load runs within date range
      const { data: runsData, error: runsError } = await supabase
        .from('subagent_runs')
        .select('*')
        .gte('started_at', dateRange.start)
        .lte('started_at', dateRange.end + 'T23:59:59.999Z')
        .order('started_at', { ascending: true });

      if (runsError) throw runsError;

      setRuns(runsData || []);
    } catch (error) {
      console.error('Error loading cost data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [dateRange]);

  // Calculate cost over time data
  const costOverTimeData = useMemo(() => {
    const dailyCosts: { [key: string]: CostData } = {};

    runs.forEach(run => {
      const date = new Date(run.started_at).toISOString().split('T')[0];
      if (!dailyCosts[date]) {
        dailyCosts[date] = { date, cost: 0, count: 0 };
      }
      dailyCosts[date].cost += run.cost || 0;
      dailyCosts[date].count += 1;
    });

    return Object.values(dailyCosts).sort((a, b) => a.date.localeCompare(b.date));
  }, [runs]);

  // Calculate cost by model
  const costByModelData = useMemo(() => {
    const modelCosts: { [key: string]: ModelCost } = {};

    runs.forEach(run => {
      const model = run.model || 'Unknown';
      if (!modelCosts[model]) {
        modelCosts[model] = { model, cost: 0, count: 0 };
      }
      modelCosts[model].cost += run.cost || 0;
      modelCosts[model].count += 1;
    });

    return Object.values(modelCosts).sort((a, b) => b.cost - a.cost);
  }, [runs]);

  // Calculate cost by project
  const costByProjectData = useMemo(() => {
    const projectCosts: { [key: string]: ProjectCost } = {};

    runs.forEach(run => {
      const projectName = run.project_id ? projects[run.project_id] || 'Unknown Project' : 'No Project';
      if (!projectCosts[projectName]) {
        projectCosts[projectName] = { projectName, cost: 0, count: 0 };
      }
      projectCosts[projectName].cost += run.cost || 0;
      projectCosts[projectName].count += 1;
    });

    return Object.values(projectCosts).sort((a, b) => b.cost - a.cost);
  }, [runs, projects]);

  // Calculate summary stats
  const summaryStats = useMemo(() => {
    const totalCost = runs.reduce((sum, run) => sum + (run.cost || 0), 0);
    const totalRuns = runs.length;
    const averageCost = totalRuns > 0 ? totalCost / totalRuns : 0;
    const highestCostRun = runs.reduce((max, run) => (run.cost || 0) > (max.cost || 0) ? run : max, runs[0] || { cost: 0 });

    return {
      totalCost,
      totalRuns,
      averageCost,
      highestCostRun: highestCostRun?.cost || 0,
    };
  }, [runs]);

  const formatCurrency = (value: number) => `$${value.toFixed(2)}`;
  const formatTooltipCurrency = (value: number) => [`$${value.toFixed(2)}`, 'Cost'];

  return (
    <div className="min-h-screen bg-slate-950 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="mb-8">
          <h1 className="text-3xl font-semibold text-slate-100">Cost Analytics</h1>
          <p className="text-slate-400 mt-2">Track and analyze your AI spending patterns</p>
        </header>

        {/* Date Range Selector */}
        <div className="bg-slate-900 rounded-xl p-6 border border-slate-800 mb-6">
          <div className="flex items-center gap-4">
            <Calendar className="text-slate-400 w-5 h-5" />
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <span className="text-slate-400">to</span>
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="text-sm text-slate-400">
              {runs.length} runs • {formatCurrency(summaryStats.totalCost)} total
            </div>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-slate-900 rounded-xl p-6 border border-slate-800">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-500/20 rounded-lg">
                <DollarSign className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <div className="text-2xl font-semibold text-slate-100">{formatCurrency(summaryStats.totalCost)}</div>
                <div className="text-sm text-slate-400">Total Cost</div>
              </div>
            </div>
          </div>

          <div className="bg-slate-900 rounded-xl p-6 border border-slate-800">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-500/20 rounded-lg">
                <BarChart3 className="w-6 h-6 text-green-400" />
              </div>
              <div>
                <div className="text-2xl font-semibold text-slate-100">{summaryStats.totalRuns}</div>
                <div className="text-sm text-slate-400">Total Runs</div>
              </div>
            </div>
          </div>

          <div className="bg-slate-900 rounded-xl p-6 border border-slate-800">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-500/20 rounded-lg">
                <TrendingUp className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <div className="text-2xl font-semibold text-slate-100">{formatCurrency(summaryStats.averageCost)}</div>
                <div className="text-sm text-slate-400">Average Cost</div>
              </div>
            </div>
          </div>

          <div className="bg-slate-900 rounded-xl p-6 border border-slate-800">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-red-500/20 rounded-lg">
                <DollarSign className="w-6 h-6 text-red-400" />
              </div>
              <div>
                <div className="text-2xl font-semibold text-slate-100">{formatCurrency(summaryStats.highestCostRun)}</div>
                <div className="text-sm text-slate-400">Highest Run</div>
              </div>
            </div>
          </div>
        </div>

        {/* Charts */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-slate-400">Loading cost data...</div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Cost Over Time */}
            <div className="bg-slate-900 rounded-xl p-6 border border-slate-800">
              <h2 className="text-xl font-semibold text-slate-100 mb-4">Cost Over Time</h2>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={costOverTimeData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis
                      dataKey="date"
                      stroke="#9CA3AF"
                      fontSize={12}
                      tickFormatter={(value) => new Date(value).toLocaleDateString()}
                    />
                    <YAxis
                      stroke="#9CA3AF"
                      fontSize={12}
                      tickFormatter={formatCurrency}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1F2937',
                        border: '1px solid #374151',
                        borderRadius: '8px',
                      }}
                      labelStyle={{ color: '#F3F4F6' }}
                      formatter={formatTooltipCurrency}
                      labelFormatter={(value) => `Date: ${new Date(value).toLocaleDateString()}`}
                    />
                    <Line
                      type="monotone"
                      dataKey="cost"
                      stroke="#3B82F6"
                      strokeWidth={2}
                      dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Cost by Model - Pie Chart */}
            <div className="bg-slate-900 rounded-xl p-6 border border-slate-800">
              <h2 className="text-xl font-semibold text-slate-100 mb-4">Cost by Model</h2>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={costByModelData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ model, cost, percent }) =>
                        percent > 0.05 ? `${model}: ${formatCurrency(cost)}` : ''
                      }
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="cost"
                    >
                      {costByModelData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1F2937',
                        border: '1px solid #374151',
                        borderRadius: '8px',
                      }}
                      formatter={(value: number) => [formatCurrency(value), 'Cost']}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Cost by Project - Bar Chart */}
            <div className="bg-slate-900 rounded-xl p-6 border border-slate-800 lg:col-span-2">
              <h2 className="text-xl font-semibold text-slate-100 mb-4">Cost by Project</h2>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={costByProjectData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis
                      dataKey="projectName"
                      stroke="#9CA3AF"
                      fontSize={12}
                      angle={-45}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis
                      stroke="#9CA3AF"
                      fontSize={12}
                      tickFormatter={formatCurrency}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1F2937',
                        border: '1px solid #374151',
                        borderRadius: '8px',
                      }}
                      formatter={(value: number) => [formatCurrency(value), 'Cost']}
                    />
                    <Bar dataKey="cost" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {/* Model Cost Breakdown - Responsive Table/Cards */}
        {!loading && costByModelData.length > 0 && (
          <div className="mt-8 bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
            <div className="p-6 border-b border-slate-800">
              <h2 className="text-xl font-semibold text-slate-100">Model Cost Breakdown</h2>
            </div>

            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-800/50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Model</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Runs</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Total Cost</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Average Cost</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {costByModelData.map((model, index) => (
                    <tr key={model.model} className={index % 2 === 0 ? 'bg-slate-900/50' : 'bg-slate-800/50'}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-100">{model.model}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">{model.count}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-100 font-medium">{formatCurrency(model.cost)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">{formatCurrency(model.cost / model.count)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden space-y-3 p-4">
              {costByModelData.map((model) => (
                <div key={model.model} className="bg-slate-800/50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-slate-100">{model.model}</h3>
                    <span className="text-sm font-medium text-slate-100">{formatCurrency(model.cost)}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-slate-400">Runs:</span>
                      <span className="ml-2 text-slate-300">{model.count}</span>
                    </div>
                    <div>
                      <span className="text-slate-400">Avg:</span>
                      <span className="ml-2 text-slate-300">{formatCurrency(model.cost / model.count)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardV2Costs;