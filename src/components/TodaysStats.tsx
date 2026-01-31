import React from 'react';
import { Stats } from '../stores/dashboardStore';

interface TodaysStatsProps {
  stats: Stats;
}

const TodaysStats: React.FC<TodaysStatsProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="bg-slate-800/50 rounded-lg p-4">
        <div className="text-2xl font-bold text-slate-100">{stats.agentsRun}</div>
        <div className="text-sm text-slate-400 mt-1">Agents Run</div>
      </div>
      <div className="bg-slate-800/50 rounded-lg p-4">
        <div className="text-2xl font-bold text-slate-100">${stats.totalCost.toFixed(2)}</div>
        <div className="text-sm text-slate-400 mt-1">Total Cost</div>
      </div>
      <div className="bg-slate-800/50 rounded-lg p-4">
        <div className="text-2xl font-bold text-slate-100">{stats.tokensUsed.toLocaleString()}</div>
        <div className="text-sm text-slate-400 mt-1">Tokens Used</div>
      </div>
      <div className="bg-slate-800/50 rounded-lg p-4">
        <div className="text-2xl font-bold text-slate-100">{stats.avgTime.toFixed(1)}m</div>
        <div className="text-sm text-slate-400 mt-1">Avg Time</div>
      </div>
    </div>
  );
};

export default TodaysStats;