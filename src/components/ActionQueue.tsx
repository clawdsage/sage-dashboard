import React from 'react';
import { ActionItem } from '../stores/dashboardStore';

interface ActionQueueProps {
  actionItems: ActionItem[];
}

const getUrgencyColor = (urgency: ActionItem['urgency']) => {
  switch (urgency) {
    case 'high':
      return 'border-red-500';
    case 'medium':
      return 'border-orange-500';
    case 'low':
      return 'border-blue-500';
    default:
      return 'border-slate-500';
  }
};

const getUrgencyBg = (urgency: ActionItem['urgency']) => {
  switch (urgency) {
    case 'high':
      return 'bg-red-500/10';
    case 'medium':
      return 'bg-orange-500/10';
    case 'low':
      return 'bg-blue-500/10';
    default:
      return 'bg-slate-500/10';
  }
};

const ActionQueue: React.FC<ActionQueueProps> = ({ actionItems }) => {
  return (
    <div className="space-y-3 max-h-80 overflow-y-auto">
      {actionItems.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-slate-400">No action items</div>
          <div className="text-sm text-slate-500 mt-1">All caught up!</div>
        </div>
      ) : (
        actionItems.map((item) => (
          <div
            key={item.id}
            className={`bg-slate-800/50 rounded-lg p-4 border-l-4 ${getUrgencyColor(item.urgency)} ${getUrgencyBg(item.urgency)}`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="font-medium text-slate-100">{item.agentName}</div>
                <div className="text-sm text-slate-400 mt-1">{item.issueType}</div>
                <div className="text-sm text-slate-300 mt-2">{item.actionNeeded}</div>
              </div>
              {item.cost && item.cost > 0 && (
                <div className="text-sm font-medium text-slate-300 ml-4">
                  ${item.cost.toFixed(2)}
                </div>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default ActionQueue;