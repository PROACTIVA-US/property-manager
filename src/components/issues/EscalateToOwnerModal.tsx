import { useState } from 'react';
import { X, AlertTriangle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { escalateIssue } from '../../lib/issues';
import type { Issue } from '../../types/issues.types';

interface EscalateToOwnerModalProps {
  issue: Issue;
  onClose: () => void;
  onEscalated: () => void;
}

export default function EscalateToOwnerModal({
  issue,
  onClose,
  onEscalated,
}: EscalateToOwnerModalProps) {
  const { user } = useAuth();
  const [reason, setReason] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim() || !user) return;

    setIsLoading(true);
    escalateIssue(
      issue.id,
      reason.trim(),
      user.uid,
      user.displayName || user.email || 'Unknown',
      user.role as 'owner' | 'pm' | 'tenant'
    );
    onEscalated();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-cc-surface border border-cc-border rounded-xl w-full max-w-md">
        <div className="flex items-start justify-between px-6 py-4 border-b border-cc-border">
          <div>
            <h2 className="text-lg font-bold text-cc-text">Escalate to Owner</h2>
            <p className="text-sm text-cc-muted mt-1">Request owner decision</p>
          </div>
          <button onClick={onClose} className="p-2 text-cc-muted hover:text-cc-text rounded-lg">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="bg-cc-bg/50 rounded-lg p-3 border border-cc-border/50">
            <p className="text-xs text-cc-muted uppercase mb-1">Issue</p>
            <p className="text-sm font-medium text-cc-text">{issue.title}</p>
          </div>

          <div className="flex gap-3 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
            <AlertTriangle size={18} className="text-yellow-500 shrink-0" />
            <p className="text-xs text-yellow-600">
              Owner will need to approve before this issue can proceed.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-cc-text mb-2">
              Reason for Escalation
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Explain why this needs owner decision..."
              className="input-field w-full h-24 resize-none"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">
              Cancel
            </button>
            <button type="submit" className="btn-primary flex-1" disabled={!reason.trim() || isLoading}>
              {isLoading ? 'Escalating...' : 'Escalate to Owner'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
