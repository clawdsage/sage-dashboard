import React from 'react';
import { Activity } from '../stores/dashboardStore';
import { Play, CheckCircle, XCircle, Clock } from 'lucide-react';

interface ActivityTimelineProps {
  activities: Activity[];
}

const ActivityTimeline: React.FC<ActivityTimelineProps> = ({ activities }) => {
  const getStatusIcon = (type: Activity['type']) => {
    switch (type) {
      case 'spawned':
        return <Play className="w-3 h-3 text-blue-500" />;
      case 'completed':
        return <CheckCircle className="w-3 h-3 text-green-500" />;
      case 'failed':
        return <XCircle className="w-3 h-3 text-red-500" />;
      default:
        return <Clock className="w-3 h-3 text-slate-400" />;
    }
  };

  const getStatusColor = (type: Activity['type']) => {
    switch (type) {
      case 'spawned':
        return 'bg-blue-500';
      case 'completed':
        return 'bg-green-500';
      case 'failed':
        return 'bg-red-500';
      default:
        return 'bg-slate-500';
    }
  };

  const getStatusBgColor = (type: Activity['type']) => {
    switch (type) {
      case 'spawned':
        return 'bg-blue-500/10';
      case 'completed':
        return 'bg-green-500/10';
      case 'failed':
        return 'bg-red-500/10';
      default:
        return 'bg-slate-500/10';
    }
  };

  const formatCost = (cost?: number) => {
    if (!cost) return '$0.00';
    return `$${cost.toFixed(2)}`;
  };

  if (activities.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-slate-400">No recent activity</div>
        <div className="text-sm text-slate-500 mt-1">Activity will appear here when agents run</div>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Vertical timeline line */}
      <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-slate-800" />
      
      <div className="space-y-4">
        {activities.map((activity, index) => (
          <div 
            key={activity.id} 
            className="relative flex items-start pl-10"
          >
            {/* Timeline dot */}
            <div className={`absolute left-3 w-3 h-3 rounded-full border-2 border-slate-900 ${getStatusColor(activity.type)}`}>
              <div className="absolute inset-0 flex items-center justify-center">
                {getStatusIcon(activity.type)}
              </div>
            </div>

            {/* Activity card */}
            <div className={`flex-1 rounded-lg p-3 ${getStatusBgColor(activity.type)} border border-slate-800`}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-slate-100 text-sm">
                      {activity.title}
                    </span>
                    <span className={`text-xs px-1.5 py-0.5 rounded ${getStatusBgColor(activity.type)} text-slate-300`}>
                      {activity.type}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1 truncate">
                    {activity.description}
                  </p>
                </div>
                <div className="text-right ml-2">
                  <div className="text-xs text-slate-500">{activity.time}</div>
                  <div className="text-xs font-medium text-slate-300 mt-1">
                    {formatCost(activity.cost)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ActivityTimeline;