import { AlertTriangle, X } from 'lucide-react';
import { useState } from 'react';
import { getIssues } from '../../lib/issues';

interface PMAlertBarProps {
  onViewIssues?: () => void;
}

export default function PMAlertBar({ onViewIssues }: PMAlertBarProps) {
  const [dismissed, setDismissed] = useState(false);

  const issues = getIssues();
  const atRiskCount = issues.filter(i =>
    i.status !== 'closed' && i.status !== 'resolved' &&
    (i.priority === 'urgent' || i.priority === 'high')
  ).length;

  if (dismissed || atRiskCount === 0) return null;

  return (
    <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-3 flex items-center justify-between">
      <button
        onClick={onViewIssues}
        className="flex items-center gap-3 flex-1 text-left"
      >
        <AlertTriangle size={18} className="text-red-400 shrink-0" />
        <span className="text-sm text-red-300">
          <strong>{atRiskCount}</strong> high-priority issue{atRiskCount > 1 ? 's' : ''} need attention
        </span>
      </button>
      <button
        onClick={() => setDismissed(true)}
        className="text-red-400 hover:text-red-300 p-1 rounded hover:bg-red-500/20 transition-colors"
        aria-label="Dismiss alert"
      >
        <X size={16} />
      </button>
    </div>
  );
}
