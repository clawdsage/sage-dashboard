import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import type { Database } from '../types/supabase';

type SubagentRun = Database['public']['Tables']['subagent_runs']['Row'];

const mapSubagentRunToAgent = (run: SubagentRun): Agent => {
  const statusMap = {
    idle: 'running' as const,
    active: 'running' as const,
    completed: 'completed' as const,
    error: 'failed' as const,
    failed: 'failed' as const,
  };

  const elapsedMs = Date.now() - new Date(run.started_at).getTime();
  const elapsedSec = Math.floor(elapsedMs / 1000);
  const min = Math.floor(elapsedSec / 60);
  const sec = elapsedSec % 60;
  const elapsedTime = min > 0 ? `${min}m ${sec}s` : `${sec}s`;

  return {
    id: run.id,
    name: run.name,
    model: run.model,
    progress: run.progress,
    elapsedTime,
    tokens: run.tokens_used,
    status: statusMap[run.status],
    started_at: run.started_at,
  };
};

const mapSubagentRunToActivity = (run: SubagentRun): Activity => {
  const now = Date.now();
  const createdAt = new Date(run.started_at).getTime();
  const diffMs = now - createdAt;
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  let relativeTime = 'Just now';
  if (diffMins < 1) {
    relativeTime = 'Just now';
  } else if (diffMins < 60) {
    relativeTime = `${diffMins}m ago`;
  } else if (diffHours < 24) {
    relativeTime = `${diffHours}h ago`;
  } else {
    relativeTime = `${diffDays}d ago`;
  }

  // Determine activity type based on status
  let type: 'spawned' | 'completed' | 'failed' = 'spawned';
  if (run.status === 'completed') {
    type = 'completed';
  } else if (run.status === 'failed' || run.status === 'error') {
    type = 'failed';
  }

  return {
    id: run.id,
    title: `${run.name} ${type}`,
    description: run.task_description || `Agent ${run.model || 'unknown model'}`,
    type,
    time: relativeTime,
    cost: run.cost || 0,
    timestamp: run.started_at,
  };
};

const mapSubagentRunToActionItem = (run: SubagentRun): ActionItem | null => {
  // Failed agents
  if (run.status === 'failed' || run.status === 'error') {
    return {
      id: run.id,
      agentName: run.name,
      type: 'failed',
      issueType: 'Agent Failed',
      actionNeeded: 'Review error and retry or fix',
      urgency: 'high',
      cost: run.cost || 0,
      timestamp: run.started_at,
    };
  }

  // High-cost agents (> $1.00)
  if (run.cost && run.cost > 1.00) {
    return {
      id: run.id,
      agentName: run.name,
      type: 'high-cost',
      issueType: 'High Cost',
      actionNeeded: 'Review cost and approve continuation',
      urgency: 'medium',
      cost: run.cost,
      timestamp: run.started_at,
    };
  }

  // Completed agents awaiting review
  if (run.status === 'completed' && run.review_status === 'pending') {
    return {
      id: run.id,
      agentName: run.name,
      type: 'review',
      issueType: 'Review Pending',
      actionNeeded: 'Review output and approve or request changes',
      urgency: 'low',
      cost: run.cost || 0,
      timestamp: run.completed_at || run.started_at,
    };
  }

  return null;
};

export interface Agent {
  id: string;
  name: string;
  model: string | null;
  progress: number;
  elapsedTime: string;
  tokens: number;
  status: 'running' | 'completed' | 'failed';
  started_at: string;
}

export interface Activity {
  id: string;
  title: string;
  description: string;
  type: 'spawned' | 'completed' | 'failed';
  time: string;
  cost?: number;
  timestamp: string;
}

export interface Stats {
  agentsRun: number;
  totalCost: number;
  tokensUsed: number;
  avgTime: number;
  actionsPending: number;
}

export interface ActionItem {
  id: string;
  agentName: string;
  type: 'failed' | 'high-cost' | 'review';
  issueType: string;
  actionNeeded: string;
  urgency: 'high' | 'medium' | 'low';
  cost?: number;
  timestamp: string;
}

interface DashboardStore {
  agents: Agent[];
  activities: Activity[];
  stats: Stats;
  actionItems: ActionItem[];

  // Actions
  setAgents: (agents: Agent[]) => void;
  addAgent: (agent: Agent) => void;
  updateAgentProgress: (id: string, progress: number) => void;
  removeAgent: (id: string) => void;

  loadAgentsFromSupabase: () => Promise<void>;
  subscribeToAgents: () => () => void;

  setActivities: (activities: Activity[]) => void;
  addActivity: (activity: Activity) => void;
  loadActivitiesFromSupabase: () => Promise<void>;
  subscribeToActivities: () => () => void;

  setStats: (stats: Stats) => void;
  updateStats: (updates: Partial<Stats>) => void;
  loadStatsFromSupabase: () => Promise<void>;
  subscribeToStats: () => () => void;

  setActionItems: (actionItems: ActionItem[]) => void;
  loadActionItemsFromSupabase: () => Promise<void>;
  subscribeToActionItems: () => () => void;
}

// Initial mock data for development
const initialAgents: Agent[] = [
  {
    id: '1',
    name: 'Dashboard Builder',
    model: 'DeepSeek Coder',
    progress: 80,
    elapsedTime: '2m 30s',
    tokens: 1250,
    status: 'running'
  },
  {
    id: '2',
    name: 'Data Analyzer',
    model: 'Gemini Flash',
    progress: 45,
    elapsedTime: '1m 15s',
    tokens: 850,
    status: 'running'
  }
];

const initialActivities: Activity[] = [
  {
    id: '1',
    title: 'Agent spawned',
    description: 'Dashboard Builder started',
    type: 'spawned',
    time: '2m ago',
    cost: 0.25
  },
  {
    id: '2',
    title: 'Agent completed',
    description: 'Data cleanup finished',
    type: 'completed',
    time: '5m ago',
    cost: 1.50
  },
  {
    id: '3',
    title: 'Agent failed',
    description: 'API connection timeout',
    type: 'failed',
    time: '10m ago',
    cost: 0.75
  }
];

const initialStats: Stats = {
  agentsRun: 12,
  totalCost: 24.50,
  tokensUsed: 125000,
  avgTime: 8,
  actionsPending: 3
};

const initialActionItems: ActionItem[] = [
  {
    id: '1',
    agentName: 'Build Dashboard',
    type: 'failed',
    issueType: 'Agent Failed',
    actionNeeded: 'Review error and retry or fix',
    urgency: 'high',
    cost: 0.75,
    timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
  },
  {
    id: '2',
    agentName: 'Data Processor',
    type: 'high-cost',
    issueType: 'High Cost',
    actionNeeded: 'Review cost and approve continuation',
    urgency: 'medium',
    cost: 12.45,
    timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
  },
  {
    id: '3',
    agentName: 'Code Review',
    type: 'review',
    issueType: 'Review Pending',
    actionNeeded: 'Review output and approve or request changes',
    urgency: 'low',
    cost: 2.30,
    timestamp: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
  },
];

export const useDashboardStore = create<DashboardStore>((set, get) => ({
  agents: initialAgents,
  activities: initialActivities,
  stats: initialStats,
  actionItems: initialActionItems,

  setAgents: (agents) => set({ agents }),

  addAgent: (agent) => set((state) => ({
    agents: [...state.agents, agent]
  })),

  updateAgentProgress: (id, progress) => set((state) => ({
    agents: state.agents.map(agent =>
      agent.id === id ? { ...agent, progress } : agent
    )
  })),

  removeAgent: (id) => set((state) => ({
    agents: state.agents.filter(agent => agent.id !== id)
  })),

  loadAgentsFromSupabase: async () => {
    try {
      const { data, error } = await supabase
        .from('subagent_runs')
        .select('*')
        .eq('status', 'active')
        .order('started_at', { ascending: false });

      if (error) throw error;

      const agents = (data || []).map(mapSubagentRunToAgent);
      set({ agents });
    } catch (error) {
      console.error('Error loading agents from Supabase:', error);
    }
  },

  subscribeToAgents: () => {
    const channel = supabase
      .channel('active-agents-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'subagent_runs'
        },
        (payload) => {
          const run = payload.new as SubagentRun || payload.old as SubagentRun;
          if (run.status !== 'active') return;

          switch (payload.eventType) {
            case 'INSERT':
              if (run.status === 'active') {
                const agent = mapSubagentRunToAgent(run);
                set((state) => ({ agents: [agent, ...state.agents] }));
              }
              break;
            case 'UPDATE':
              set((state) => ({
                agents: state.agents.map(agent =>
                  agent.id === run.id ? mapSubagentRunToAgent(run) : agent
                ).filter(agent => run.status === 'active')
              }));
              break;
            case 'DELETE':
              set((state) => ({
                agents: state.agents.filter(agent => agent.id !== run.id)
              }));
              break;
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  },

  setActivities: (activities) => set({ activities }),

  addActivity: (activity) => set((state) => ({
    activities: [activity, ...state.activities.slice(0, 9)] // Keep only last 10
  })),

  loadActivitiesFromSupabase: async () => {
    try {
      const { data, error } = await supabase
        .from('subagent_runs')
        .select('*')
        .order('started_at', { ascending: false })
        .limit(10);

      if (error) throw error;

      const activities = (data || []).map(mapSubagentRunToActivity);
      set({ activities });
    } catch (error) {
      console.error('Error loading activities from Supabase:', error);
    }
  },

  subscribeToActivities: () => {
    const channel = supabase
      .channel('activities-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'subagent_runs'
        },
        (payload) => {
          const run = payload.new as SubagentRun || payload.old as SubagentRun;
          const activity = mapSubagentRunToActivity(run);

          switch (payload.eventType) {
            case 'INSERT':
              set((state) => ({ 
                activities: [activity, ...state.activities.slice(0, 9)] 
              }));
              break;
            case 'UPDATE':
              // Only update if it's a status change that affects the timeline
              if (run.status === 'completed' || run.status === 'failed' || run.status === 'error') {
                set((state) => ({
                  activities: [activity, ...state.activities.filter(a => a.id !== run.id).slice(0, 9)]
                }));
              }
              break;
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  },

  setStats: (stats) => set({ stats }),

  updateStats: (updates) => set((state) => ({
    stats: { ...state.stats, ...updates }
  })),

  loadStatsFromSupabase: async () => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayISO = today.toISOString();

      // Get today's runs
      const { data: todayRuns, error: runsError } = await supabase
        .from('subagent_runs')
        .select('*')
        .gte('started_at', todayISO);

      if (runsError) throw runsError;

      const runs = todayRuns || [];

      // Calculate stats
      const agentsRun = runs.length;
      const totalCost = runs.reduce((sum, run) => sum + (run.cost || 0), 0);
      const tokensUsed = runs.reduce((sum, run) => sum + (run.tokens_used || 0), 0);

      // Calculate avg time for completed agents
      const completedRuns = runs.filter(run => run.status === 'completed' && run.completed_at);
      const avgTime = completedRuns.length > 0
        ? completedRuns.reduce((sum, run) => {
            const duration = new Date(run.completed_at!).getTime() - new Date(run.started_at).getTime();
            return sum + (duration / (1000 * 60)); // minutes
          }, 0) / completedRuns.length
        : 0;

      // Count pending actions
      const actionItems = runs
        .map(mapSubagentRunToActionItem)
        .filter((item): item is ActionItem => item !== null);

      set({
        stats: {
          agentsRun,
          totalCost: Math.round(totalCost * 100) / 100, // round to 2 decimals
          tokensUsed,
          avgTime: Math.round(avgTime * 10) / 10, // round to 1 decimal
          actionsPending: actionItems.length,
        },
        actionItems,
      });
    } catch (error) {
      console.error('Error loading stats from Supabase:', error);
    }
  },

  subscribeToStats: () => {
    const channel = supabase
      .channel('stats-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'subagent_runs'
        },
        () => {
          // Reload stats on any change
          get().loadStatsFromSupabase();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  },

  setActionItems: (actionItems) => set({ actionItems }),

  loadActionItemsFromSupabase: async () => {
    try {
      const { data, error } = await supabase
        .from('subagent_runs')
        .select('*')
        .or('status.eq.failed,status.eq.error,cost.gt.1,and(status.eq.completed,review_status.eq.pending)');

      if (error) throw error;

      const actionItems = (data || [])
        .map(mapSubagentRunToActionItem)
        .filter((item): item is ActionItem => item !== null);

      set({ actionItems });
    } catch (error) {
      console.error('Error loading action items from Supabase:', error);
    }
  },

  subscribeToActionItems: () => {
    const channel = supabase
      .channel('action-items-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'subagent_runs'
        },
        () => {
          // Reload action items on any change
          get().loadActionItemsFromSupabase();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  },
}));