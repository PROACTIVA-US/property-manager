import { useEffect, useState } from 'react';
import { CheckCircle2, Clock3, ExternalLink, Loader2, RefreshCw, XCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  listApprovalRequests,
  type ApprovalRequest,
  type ApprovalStatus,
} from '../../lib/client-approvals';
import { cn } from '../../lib/utils';

interface ApprovalRequestListProps {
  refreshKey?: number;
}

const STATUS_STYLES: Record<ApprovalStatus, string> = {
  pending: 'bg-amber-500/15 text-amber-300 ring-amber-500/25',
  approved: 'bg-emerald-500/15 text-emerald-300 ring-emerald-500/25',
  declined: 'bg-rose-500/15 text-rose-300 ring-rose-500/25',
};

function ApprovalStatusIcon({ status }: { status: ApprovalStatus }) {
  if (status === 'approved') return <CheckCircle2 size={15} aria-hidden="true" />;
  if (status === 'declined') return <XCircle size={15} aria-hidden="true" />;
  return <Clock3 size={15} aria-hidden="true" />;
}

export default function ApprovalRequestList({ refreshKey = 0 }: ApprovalRequestListProps) {
  const [requests, setRequests] = useState<ApprovalRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadCount, setReloadCount] = useState(0);

  useEffect(() => {
    let cancelled = false;

    const loadRequests = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await listApprovalRequests();
        if (!cancelled) setRequests(data);
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError instanceof Error ? loadError.message : 'Could not load approval requests.');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void loadRequests();
    return () => {
      cancelled = true;
    };
  }, [refreshKey, reloadCount]);

  return (
    <section aria-labelledby="client-approvals-heading" className="card !p-0 overflow-hidden">
      <header className="flex items-center justify-between gap-4 border-b border-cc-border px-5 py-4">
        <div>
          <h2 id="client-approvals-heading" className="font-semibold text-cc-text">Client approvals</h2>
          <p className="mt-0.5 text-xs text-cc-muted">Recent decisions and requests awaiting a response</p>
        </div>
        <button
          type="button"
          onClick={() => setReloadCount(count => count + 1)}
          disabled={loading}
          aria-label="Refresh client approvals"
          className="rounded-lg p-2 text-cc-muted transition-all duration-200 hover:bg-cc-bg hover:text-cc-text focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          <RefreshCw className={cn(loading && 'animate-spin')} size={17} />
        </button>
      </header>

      {loading ? (
        <div className="flex items-center justify-center gap-2 px-5 py-10 text-sm text-cc-muted">
          <Loader2 className="animate-spin" size={18} />
          Loading approvals…
        </div>
      ) : error ? (
        <div className="px-5 py-8 text-center">
          <p className="text-sm text-red-300">{error}</p>
          <button type="button" onClick={() => setReloadCount(count => count + 1)} className="btn-secondary mt-4 text-sm">
            Try again
          </button>
        </div>
      ) : requests.length === 0 ? (
        <div className="px-5 py-10 text-center">
          <Clock3 className="mx-auto text-cc-muted" size={24} />
          <p className="mt-3 text-sm font-medium text-cc-text">No approval requests yet</p>
          <p className="mt-1 text-xs text-cc-muted">Create a secure link when a client decision is needed.</p>
        </div>
      ) : (
        <div className="divide-y divide-cc-border">
          {requests.slice(0, 6).map(request => (
            <article key={request.id} className="flex flex-col gap-3 px-5 py-4 transition-colors duration-200 hover:bg-cc-bg/35 sm:flex-row sm:items-center">
              <img
                src={request.compositeImageUrl}
                alt=""
                loading="lazy"
                className="h-14 w-20 shrink-0 rounded-lg object-cover"
              />
              <div className="min-w-0 flex-1">
                <h3 className="truncate text-sm font-medium text-cc-text">{request.actionQuestion}</h3>
                <p className="mt-1 truncate text-xs text-cc-muted">{request.description}</p>
              </div>
              <div className="flex shrink-0 items-center justify-between gap-3 sm:justify-end">
                <span
                  className={cn(
                    'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium capitalize ring-1 ring-inset',
                    STATUS_STYLES[request.status],
                  )}
                >
                  <ApprovalStatusIcon status={request.status} />
                  {request.status}
                </span>
                {request.projectId && (
                  <Link
                    to="/projects"
                    aria-label="Open the approved project"
                    className="rounded-lg p-2 text-indigo-300 transition-all duration-200 hover:bg-indigo-500/10 hover:text-indigo-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <ExternalLink size={16} />
                  </Link>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
