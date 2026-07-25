import { getIssues } from '../../lib/issues';

interface IssuesByPriorityProps {
  onPriorityClick?: (priority: string) => void;
}

export default function IssuesByPriority({ onPriorityClick }: IssuesByPriorityProps) {
  const issues = getIssues().filter(i => i.status !== 'closed' && i.status !== 'resolved');

  const counts = {
    urgent: issues.filter(i => i.priority === 'urgent').length,
    high: issues.filter(i => i.priority === 'high').length,
    medium: issues.filter(i => i.priority === 'medium').length,
    low: issues.filter(i => i.priority === 'low').length,
  };

  const total = counts.urgent + counts.high + counts.medium + counts.low;

  const priorities = [
    { key: 'urgent', label: 'Emergency', color: 'bg-red-500', count: counts.urgent },
    { key: 'high', label: 'Urgent', color: 'bg-orange-500', count: counts.high },
    { key: 'medium', label: 'Standard', color: 'bg-yellow-500', count: counts.medium },
    { key: 'low', label: 'Low', color: 'bg-green-500', count: counts.low },
  ];

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-cc-text">Issues by Priority</h3>
        <span className="text-xs text-cc-muted">{total} open</span>
      </div>

      {total > 0 ? (
        <div className="space-y-2">
          {priorities.map(p => (
            <button
              key={p.key}
              onClick={() => onPriorityClick?.(p.key)}
              className="w-full flex items-center justify-between p-2 rounded hover:bg-cc-bg/50 transition-colors group"
              disabled={p.count === 0}
            >
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${p.color} ${p.count === 0 ? 'opacity-30' : ''}`} />
                <span className={`text-sm ${p.count > 0 ? 'text-cc-text group-hover:text-cc-accent' : 'text-cc-muted'}`}>
                  {p.label}
                </span>
              </div>
              <span className={`text-sm font-medium ${p.count > 0 ? 'text-cc-text' : 'text-cc-muted'}`}>
                {p.count}
              </span>
            </button>
          ))}
        </div>
      ) : (
        <div className="text-center py-4 text-cc-muted text-sm">
          No open issues
        </div>
      )}
    </div>
  );
}
