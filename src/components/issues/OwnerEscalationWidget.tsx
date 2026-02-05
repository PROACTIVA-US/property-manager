import { AlertTriangle, CheckCircle } from 'lucide-react';
import { getPendingEscalations } from '../../lib/issues';
import type { Issue } from '../../types/issues.types';

interface OwnerEscalationWidgetProps {
  onIssueClick: (issue: Issue) => void;
}

export default function OwnerEscalationWidget({ onIssueClick }: OwnerEscalationWidgetProps) {
  const pendingEscalations = getPendingEscalations();

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-red-500/20 text-red-400">
            <AlertTriangle size={20} />
          </div>
          <div>
            <h3 className="font-semibold text-cc-text">Attention Needed</h3>
            <p className="text-xs text-cc-muted">Escalated issues awaiting decision</p>
          </div>
        </div>
        {pendingEscalations.length > 0 && (
          <span className="px-2 py-1 text-xs font-bold bg-red-500 text-white rounded-full">
            {pendingEscalations.length}
          </span>
        )}
      </div>

      {pendingEscalations.length > 0 ? (
        <div className="space-y-2">
          {pendingEscalations.slice(0, 5).map((issue) => (
            <button
              key={issue.id}
              onClick={() => onIssueClick(issue)}
              className="w-full text-left p-3 rounded-lg bg-cc-bg/50 hover:bg-cc-bg border border-cc-border hover:border-cc-accent/50 transition-all"
            >
              <div className="flex items-start justify-between mb-1">
                <p className="font-medium text-cc-text text-sm flex-1 line-clamp-1">
                  {issue.title}
                </p>
                <span className="text-xs font-semibold text-red-400 shrink-0 ml-2">PENDING</span>
              </div>
              <p className="text-xs text-cc-muted line-clamp-1">{issue.escalationReason}</p>
            </button>
          ))}
        </div>
      ) : (
        <div className="text-center py-6 text-cc-muted">
          <CheckCircle size={32} className="mx-auto mb-2 opacity-50" />
          <p className="text-sm">All escalations addressed</p>
        </div>
      )}
    </div>
  );
}
