import React, { useEffect, useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useDashboardStore } from '../stores/dashboardStore';

const generateProgressBar = (progress: number): string => {
  const filled = Math.round((progress / 100) * 10);
  const empty = 10 - filled;
  return '█'.repeat(filled) + '░'.repeat(empty);
};

const DashboardV2: React.FC = () => {
  const { agents, activities, stats, loadAgentsFromSupabase, subscribeToAgents } = useDashboardStore();
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: agents.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 120, // estimated height per item
    overscan: 5,
  });

  useEffect(() => {
    loadAgentsFromSupabase();
    const unsubscribe = subscribeToAgents();
    return unsubscribe;
  }, [loadAgentsFromSupabase, subscribeToAgents]);

  return (
    <div className="min-h-screen bg-slate-950 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="mb-8">
          <h1 className="text-3xl font-semibold text-slate-100">Dashboard V2</h1>
          <p className="text-slate-400 mt-2">Real-time view of AI productivity</p>
        </header>

        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Live Agents - Hero Widget (50% width top) */}
          <div className="lg:col-span-2 bg-slate-900 rounded-xl p-6 border border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-slate-100">Live Agents</h2>
              <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-sm font-medium">
                {agents.length} active
              </span>
            </div>
            {agents.length > 0 ? (
              agents.length <= 10 ? (
                <div className="space-y-4">
                  {agents.map((agent) => (
                    <div key={agent.id} className={`bg-slate-800/50 rounded-lg p-4 ${agent.status === 'running' ? 'animate-pulse' : ''}`}>
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium text-slate-100">{agent.name}</h3>
                          <p className="text-sm text-slate-400">{agent.model || 'Unknown'}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-semibold text-slate-100">{agent.progress}%</div>
                          <div className="text-xs text-slate-500">{agent.elapsedTime}</div>
                        </div>
                      </div>
                      <div className="mt-3">
                        <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-blue-500 rounded-full"
                            style={{ width: `${agent.progress}%` }}
                          />
                        </div>
                        <div className="mt-1 text-xs text-slate-400 font-mono">
                          {generateProgressBar(agent.progress)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div ref={parentRef} className="max-h-96 overflow-auto">
                  <div style={{ height: `${virtualizer.getTotalSize()}px`, position: 'relative' }}>
                    {virtualizer.getVirtualItems().map((virtualItem) => {
                      const agent = agents[virtualItem.index];
                      return (
                        <div
                          key={agent.id}
                          className={`bg-slate-800/50 rounded-lg p-4 mb-4 ${agent.status === 'running' ? 'animate-pulse' : ''}`}
                          style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            transform: `translateY(${virtualItem.start}px)`,
                          }}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="font-medium text-slate-100">{agent.name}</h3>
                              <p className="text-sm text-slate-400">{agent.model || 'Unknown'}</p>
                            </div>
                            <div className="text-right">
                              <div className="text-lg font-semibold text-slate-100">{agent.progress}%</div>
                              <div className="text-xs text-slate-500">{agent.elapsedTime}</div>
                            </div>
                          </div>
                          <div className="mt-3">
                            <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-blue-500 rounded-full"
                                style={{ width: `${agent.progress}%` }}
                              />
                            </div>
                            <div className="mt-1 text-xs text-slate-400 font-mono">
                              {generateProgressBar(agent.progress)}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )
            ) : (
                <div className="text-center py-8">
                  <div className="text-slate-400">No active agents</div>
                  <div className="text-sm text-slate-500 mt-1">Agents will appear here when running</div>
                </div>
              )}
            </div>
          </div>

          {/* Activity Timeline (bottom-left, 25%) */}
          <div className="bg-slate-900 rounded-xl p-6 border border-slate-800">
            <h2 className="text-xl font-semibold text-slate-100 mb-4">Recent Activity</h2>
            <div className="space-y-4">
              {activities.length > 0 ? (
                activities.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-3">
                    <div className={`w-2 h-2 mt-2 rounded-full ${
                      activity.type === 'completed' ? 'bg-green-500' :
                      activity.type === 'failed' ? 'bg-red-500' :
                      'bg-blue-500'
                    }`} />
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <span className="font-medium text-slate-100">{activity.title}</span>
                        <span className="text-sm text-slate-500">{activity.time}</span>
                      </div>
                      <p className="text-sm text-slate-400 mt-1">{activity.description}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <div className="text-slate-400">No recent activity</div>
                  <div className="text-sm text-slate-500 mt-1">Activity will appear here</div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column Container */}
          <div className="space-y-6">
            {/* Today's Stats (top-right within remaining 50%) */}
            <div className="bg-slate-900 rounded-xl p-6 border border-slate-800">
              <h2 className="text-xl font-semibold text-slate-100 mb-4">Today's Stats</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-800/50 rounded-lg p-4">
                  <div className="text-2xl font-bold text-slate-100">{stats.agentsRun}</div>
                  <div className="text-sm text-slate-400 mt-1">Agents Run</div>
                </div>
                <div className="bg-slate-800/50 rounded-lg p-4">
                  <div className="text-2xl font-bold text-slate-100">${stats.totalCost}</div>
                  <div className="text-sm text-slate-400 mt-1">Total Cost</div>
                </div>
                <div className="bg-slate-800/50 rounded-lg p-4">
                  <div className="text-2xl font-bold text-slate-100">{stats.tokensUsed.toLocaleString()}</div>
                  <div className="text-sm text-slate-400 mt-1">Tokens Used</div>
                </div>
                <div className="bg-slate-800/50 rounded-lg p-4">
                  <div className="text-2xl font-bold text-slate-100">{stats.avgTime}m</div>
                  <div className="text-sm text-slate-400 mt-1">Avg Time</div>
                </div>
              </div>
            </div>

            {/* Action Queue (bottom-right, 25%) */}
            <div className="bg-slate-900 rounded-xl p-6 border border-slate-800">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-slate-100">Action Queue</h2>
                <span className="px-3 py-1 bg-orange-500/20 text-orange-400 rounded-full text-sm font-medium">
                  {stats.actionsPending} pending
                </span>
              </div>
              <div className="space-y-3">
                <div className="bg-slate-800/50 rounded-lg p-4 border-l-4 border-red-500">
                  <div className="font-medium text-slate-100">Failed agent needs review</div>
                  <div className="text-sm text-slate-400 mt-1">Agent "Build Dashboard" failed with error</div>
                </div>
                <div className="bg-slate-800/50 rounded-lg p-4 border-l-4 border-orange-500">
                  <div className="font-medium text-slate-100">High-cost agent detected</div>
                  <div className="text-sm text-slate-400 mt-1">Agent cost $12.45 exceeds threshold</div>
                </div>
                <div className="bg-slate-800/50 rounded-lg p-4 border-l-4 border-green-500">
                  <div className="font-medium text-slate-100">Work completed</div>
                  <div className="text-sm text-slate-400 mt-1">Review and approve completed task</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <div className="mt-8 text-center text-sm text-slate-500">
          Dashboard V2 • Real-time updates • Phase 1 Foundation
        </div>
      </div>
    </div>
  );
};

export default DashboardV2;