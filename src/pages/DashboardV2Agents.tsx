import React, { useEffect, useRef, useState, useMemo } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useDashboardStore } from '../stores/dashboardStore';
import { supabase } from '../lib/supabase';
import type { Database } from '../types/supabase';
import { ChevronDown, ChevronRight, Filter, SortAsc, Calendar, Search } from 'lucide-react';

type SubagentRun = Database['public']['Tables']['subagent_runs']['Row'];

interface ExtendedAgent {
  id: string;
  name: string;
  model: string | null;
  progress: number;
  elapsedTime: string;
  tokens: number;
  status: 'running' | 'completed' | 'failed';
  started_at: string;
  completed_at?: string | null;
  cost: number;
  output?: string | null;
  review_status: string;
  task_description?: string | null;
}

const statusColors = {
  running: 'text-blue-400 bg-blue-500/20',
  completed: 'text-green-400 bg-green-500/20',
  failed: 'text-red-400 bg-red-500/20',
};

const statusOptions = [
  { value: 'all', label: 'All Status' },
  { value: 'running', label: 'Running' },
  { value: 'completed', label: 'Completed' },
  { value: 'failed', label: 'Failed' },
];

const sortOptions = [
  { value: 'started_at', label: 'Started Time' },
  { value: 'cost', label: 'Cost' },
  { value: 'duration', label: 'Duration' },
];

const DashboardV2Agents: React.FC = () => {
  const [agents, setAgents] = useState<ExtendedAgent[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [modelFilter, setModelFilter] = useState('');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [sortBy, setSortBy] = useState('started_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedAgents, setExpandedAgents] = useState<Set<string>>(new Set());

  const parentRef = useRef<HTMLDivElement>(null);

  const mapRunToAgent = (run: SubagentRun): ExtendedAgent => {
    const statusMap = {
      idle: 'running' as const,
      active: 'running' as const,
      completed: 'completed' as const,
      error: 'failed' as const,
      failed: 'failed' as const,
    };

    let elapsedTime = '';
    if (run.completed_at) {
      const duration = new Date(run.completed_at).getTime() - new Date(run.started_at).getTime();
      const min = Math.floor(duration / (1000 * 60));
      const sec = Math.floor((duration % (1000 * 60)) / 1000);
      elapsedTime = min > 0 ? `${min}m ${sec}s` : `${sec}s`;
    } else {
      const now = Date.now();
      const duration = now - new Date(run.started_at).getTime();
      const min = Math.floor(duration / (1000 * 60));
      const sec = Math.floor((duration % (1000 * 60)) / 1000);
      elapsedTime = min > 0 ? `${min}m ${sec}s` : `${sec}s`;
    }

    return {
      id: run.id,
      name: run.name,
      model: run.model,
      progress: run.progress,
      elapsedTime,
      tokens: run.tokens_used,
      status: statusMap[run.status],
      started_at: run.started_at,
      completed_at: run.completed_at,
      cost: run.cost,
      output: run.output,
      review_status: run.review_status,
      task_description: run.task_description,
    };
  };

  const loadAllAgents = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('subagent_runs')
        .select('*')
        .order('started_at', { ascending: false });

      // Apply date range filter
      if (dateRange.start) {
        query = query.gte('started_at', dateRange.start);
      }
      if (dateRange.end) {
        const endDate = new Date(dateRange.end);
        endDate.setHours(23, 59, 59, 999);
        query = query.lte('started_at', endDate.toISOString());
      }

      const { data, error } = await query;

      if (error) throw error;

      const mappedAgents: ExtendedAgent[] = (data || []).map(mapRunToAgent);
      setAgents(mappedAgents);
    } catch (error) {
      console.error('Error loading agents:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter and sort agents
  const filteredAndSortedAgents = useMemo(() => {
    let filtered = agents.filter(agent => {
      // Status filter
      if (statusFilter !== 'all' && agent.status !== statusFilter) return false;

      // Model filter
      if (modelFilter && !agent.model?.toLowerCase().includes(modelFilter.toLowerCase())) return false;

      // Search query
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        if (!agent.name.toLowerCase().includes(query) &&
            !agent.model?.toLowerCase().includes(query) &&
            !agent.task_description?.toLowerCase().includes(query)) {
          return false;
        }
      }

      return true;
    });

    // Sort
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;

      switch (sortBy) {
        case 'started_at':
          aValue = new Date(a.started_at).getTime();
          bValue = new Date(b.started_at).getTime();
          break;
        case 'cost':
          aValue = a.cost;
          bValue = b.cost;
          break;
        case 'duration':
          if (a.completed_at && b.completed_at) {
            aValue = new Date(a.completed_at).getTime() - new Date(a.started_at).getTime();
            bValue = new Date(b.completed_at).getTime() - new Date(b.started_at).getTime();
          } else {
            aValue = Date.now() - new Date(a.started_at).getTime();
            bValue = Date.now() - new Date(b.started_at).getTime();
          }
          break;
        default:
          return 0;
      }

      if (sortOrder === 'asc') {
        return aValue - bValue;
      } else {
        return bValue - aValue;
      }
    });

    return filtered;
  }, [agents, statusFilter, modelFilter, dateRange, sortBy, sortOrder, searchQuery]);

  const virtualizer = useVirtualizer({
    count: filteredAndSortedAgents.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 120,
    overscan: 5,
  });

  useEffect(() => {
    loadAllAgents();

    // Subscribe to real-time updates (incremental updates to prevent flashing)
    const channel = supabase
      .channel('all-agents-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'subagent_runs'
        },
        (payload) => {
          // Add new agent without full reload
          setAgents(prev => {
            const newAgent = mapRunToAgent(payload.new as SubagentRun);
            // Remove any existing agent with same ID and add the new one at the top
            return [newAgent, ...prev.filter(a => a.id !== newAgent.id)];
          });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'subagent_runs'
        },
        (payload) => {
          // Update existing agent without full reload
          setAgents(prev => prev.map(agent =>
            agent.id === payload.new.id
              ? mapRunToAgent(payload.new as SubagentRun)
              : agent
          ));
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'subagent_runs'
        },
        (payload) => {
          // Remove deleted agent without full reload
          setAgents(prev => prev.filter(agent => agent.id !== payload.old.id));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [dateRange]); // Reload when date range changes

  const toggleExpanded = (id: string) => {
    setExpandedAgents(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="min-h-screen bg-slate-950 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="mb-8">
          <h1 className="text-3xl font-semibold text-slate-100">Agent History</h1>
          <p className="text-slate-400 mt-2">Complete history of all agent runs with detailed information</p>
        </header>

        {/* Filters */}
        <div className="bg-slate-900 rounded-xl p-6 border border-slate-800 mb-6">
          <div className="flex flex-wrap gap-4 items-center">
            {/* Search */}
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search agents..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-2" title="Filter agents by status">
              <Filter className="text-slate-400 w-4 h-4" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {statusOptions.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>

            {/* Model Filter */}
            <input
              type="text"
              placeholder="Filter by model..."
              value={modelFilter}
              onChange={(e) => setModelFilter(e.target.value)}
              className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent min-w-[150px]"
            />

            {/* Date Range */}
            <div className="flex items-center gap-2">
              <Calendar className="text-slate-400 w-4 h-4" />
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <span className="text-slate-400">to</span>
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Sort */}
            <div className="flex items-center gap-2" title={`Sort by ${sortOptions.find(opt => opt.value === sortBy)?.label || 'Unknown'}`}>
              <SortAsc className="text-slate-400 w-4 h-4" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {sortOptions.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
              <button
                onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                className="p-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 hover:bg-slate-700"
                title={`Sort ${sortOrder === 'asc' ? 'ascending' : 'descending'}`}
              >
                {sortOrder === 'asc' ? '↑' : '↓'}
              </button>
            </div>
          </div>
        </div>

        {/* Agents List */}
        <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
          <div className="p-4 border-b border-slate-800">
            <h2 className="text-xl font-semibold text-slate-100">
              Agents ({filteredAndSortedAgents.length})
            </h2>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-slate-400">Loading agents...</div>
            </div>
          ) : filteredAndSortedAgents.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-slate-400">No agents found</div>
            </div>
          ) : (
            <div ref={parentRef} className="max-h-[800px] overflow-auto">
              <div style={{ height: `${virtualizer.getTotalSize()}px`, position: 'relative' }}>
                {virtualizer.getVirtualItems().map((virtualItem) => {
                  const agent = filteredAndSortedAgents[virtualItem.index];
                  return (
                    <div
                      key={agent.id}
                      className="bg-slate-800/50 border-b border-slate-700/50"
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        transform: `translateY(${virtualItem.start}px)`,
                      }}
                    >
                      {/* Agent Row */}
                      <div
                        className="p-4 cursor-pointer hover:bg-slate-800/70 transition-colors"
                        onClick={() => toggleExpanded(agent.id)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            {expandedAgents.has(agent.id) ? (
                              <ChevronDown className="w-4 h-4 text-slate-400" />
                            ) : (
                              <ChevronRight className="w-4 h-4 text-slate-400" />
                            )}
                            <div>
                              <h3 className="font-medium text-slate-100">{agent.name}</h3>
                              <p className="text-sm text-slate-400">{agent.model || 'Unknown model'}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusColors[agent.status]}`}>
                                {agent.status}
                              </div>
                              <div className="text-xs text-slate-500 mt-1">
                                {formatDate(agent.started_at)}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-lg font-semibold text-slate-100">${agent.cost.toFixed(2)}</div>
                              <div className="text-xs text-slate-500">{agent.elapsedTime}</div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Expanded Details */}
                      {expandedAgents.has(agent.id) && (
                        <div className="px-4 pb-4 border-t border-slate-700/50 bg-slate-900/50">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                            <div>
                              <h4 className="font-medium text-slate-100 mb-2">Details</h4>
                              <div className="space-y-2 text-sm">
                                <div><span className="text-slate-400">Started:</span> <span className="text-slate-100">{formatDate(agent.started_at)}</span></div>
                                {agent.completed_at && (
                                  <div><span className="text-slate-400">Completed:</span> <span className="text-slate-100">{formatDate(agent.completed_at)}</span></div>
                                )}
                                <div><span className="text-slate-400">Tokens:</span> <span className="text-slate-100">{agent.tokens.toLocaleString()}</span></div>
                                <div><span className="text-slate-400">Progress:</span> <span className="text-slate-100">{agent.progress}%</span></div>
                                <div><span className="text-slate-400">Review Status:</span> <span className="text-slate-100">{agent.review_status}</span></div>
                              </div>
                            </div>

                            <div>
                              <h4 className="font-medium text-slate-100 mb-2">Task Description</h4>
                              <p className="text-sm text-slate-300 bg-slate-800/50 p-3 rounded-lg">
                                {agent.task_description || 'No description available'}
                              </p>
                            </div>
                          </div>

                          {agent.output && (
                            <div className="mt-4">
                              <h4 className="font-medium text-slate-100 mb-2">Output</h4>
                              <div className="bg-slate-800/50 p-3 rounded-lg max-h-64 overflow-auto">
                                <pre className="text-sm text-slate-300 whitespace-pre-wrap">{agent.output}</pre>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardV2Agents;