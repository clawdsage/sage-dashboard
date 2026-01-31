import { create } from 'zustand';

export interface Agent {
  id: string;
  name: string;
  model: string;
  progress: number;
  elapsedTime: string;
  tokens: number;
  status: 'running' | 'completed' | 'failed';
}

export interface Activity {
  id: string;
  title: string;
  description: string;
  type: 'spawned' | 'completed' | 'failed';
  time: string;
  cost?: number;
}

export interface Stats {
  agentsRun: number;
  totalCost: number;
  tokensUsed: number;
  avgTime: number;
  actionsPending: number;
}

interface DashboardStore {
  agents: Agent[];
  activities: Activity[];
  stats: Stats;
  
  // Actions
  setAgents: (agents: Agent[]) => void;
  addAgent: (agent: Agent) => void;
  updateAgentProgress: (id: string, progress: number) => void;
  removeAgent: (id: string) => void;
  
  setActivities: (activities: Activity[]) => void;
  addActivity: (activity: Activity) => void;
  
  setStats: (stats: Stats) => void;
  updateStats: (updates: Partial<Stats>) => void;
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

export const useDashboardStore = create<DashboardStore>((set) => ({
  agents: initialAgents,
  activities: initialActivities,
  stats: initialStats,
  
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
  
  setActivities: (activities) => set({ activities }),
  
  addActivity: (activity) => set((state) => ({
    activities: [activity, ...state.activities.slice(0, 9)] // Keep only last 10
  })),
  
  setStats: (stats) => set({ stats }),
  
  updateStats: (updates) => set((state) => ({
    stats: { ...state.stats, ...updates }
  }))
}));