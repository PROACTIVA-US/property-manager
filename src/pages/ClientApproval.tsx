import { useEffect, useState } from 'react';
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Clock3,
  Loader2,
  ShieldCheck,
  XCircle,
} from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import {
  getApprovalRequest,
  submitApprovalDecision,
  type ApprovalDecision,
  type ApprovalRequest,
} from '../lib/client-approvals';

type PageState = 'loading' | 'ready' | 'invalid' | 'error';

export default function ClientApproval() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const [request, setRequest] = useState<ApprovalRequest | null>(null);
  const [pageState, setPageState] = useState<PageState>('loading');
  const [selectedDecision, setSelectedDecision] = useState<ApprovalDecision | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const loadRequest = async () => {
      setPageState('loading');
      try {
        const data = await getApprovalRequest(token);
        if (cancelled) return;
        if (!data) {
          setPageState('invalid');
          return;
        }
        setRequest(data);
        setPageState('ready');
      } catch {
        if (!cancelled) setPageState('error');
      }
    };

    void loadRequest();
    return () => {
      cancelled = true;
    };
  }, [token]);

  const submitDecision = async () => {
    if (!selectedDecision || !request) return;
    setIsSubmitting(true);
    setError(null);

    try {
      const result = await submitApprovalDecision(token, selectedDecision);
      setRequest({
        ...request,
        status: result.status,
        projectId: result.projectId,
        decidedAt: new Date().toISOString(),
      });
      setSelectedDecision(null);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Could not record your decision.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (pageState === 'loading') {
    return (
      <PublicPageShell>
        <div className="flex min-h-[48vh] flex-col items-center justify-center text-center">
          <Loader2 className="animate-spin text-indigo-300" size={30} />
          <p className="mt-4 text-sm text-cc-muted">Loading your approval request…</p>
        </div>
      </PublicPageShell>
    );
  }

  if (pageState === 'invalid' || pageState === 'error' || !request) {
    return (
      <PublicPageShell>
        <div className="mx-auto max-w-lg py-14 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-500/15 text-rose-300">
            <AlertCircle size={28} />
          </div>
          <h1 className="mt-5 text-2xl font-semibold text-cc-text">
            {pageState === 'error' ? 'We could not load this request' : 'This link is invalid or expired'}
          </h1>
          <p className="mt-3 text-sm leading-6 text-cc-muted">
            Ask the property manager who sent the link to create a new approval request.
          </p>
        </div>
      </PublicPageShell>
    );
  }

  const hasDecision = request.status !== 'pending';

  return (
    <PublicPageShell>
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1.35fr)_minmax(340px,0.65fr)] lg:items-start">
        <section aria-labelledby="evidence-heading" className="overflow-hidden rounded-2xl border border-cc-border bg-cc-surface shadow-2xl">
          <div className="border-b border-cc-border px-5 py-4">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-indigo-300">Review evidence</p>
            <h2 id="evidence-heading" className="mt-1 text-lg font-semibold text-cc-text">Composite issue image</h2>
          </div>
          <div className="bg-black/20 p-3 sm:p-5">
            <img
              src={request.compositeImageUrl}
              alt="Composite evidence for this approval request"
              referrerPolicy="no-referrer"
              className="mx-auto max-h-[68vh] w-full rounded-xl object-contain"
            />
          </div>
        </section>

        <main className="lg:sticky lg:top-8">
          <section className="rounded-2xl border border-cc-border bg-cc-surface p-6 shadow-2xl sm:p-7">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-indigo-300">
              <ShieldCheck size={16} />
              Secure client decision
            </div>
            <h1 className="mt-4 text-2xl font-semibold leading-tight text-cc-text sm:text-3xl">
              {request.actionQuestion}
            </h1>
            <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-cc-muted">
              {request.description}
            </p>

            <div className="mt-6 flex items-center gap-2 border-t border-cc-border pt-5 text-xs text-cc-muted">
              <Clock3 size={15} />
              {hasDecision && request.decidedAt
                ? `Decision recorded ${new Date(request.decidedAt).toLocaleDateString()}`
                : `Link expires ${new Date(request.expiresAt).toLocaleDateString()}`}
            </div>

            {hasDecision ? (
              <DecisionComplete status={request.status} />
            ) : selectedDecision ? (
              <div className="mt-6 rounded-2xl border border-cc-border bg-cc-bg/60 p-4">
                <p className="text-sm font-medium text-cc-text">
                  Confirm you want to {selectedDecision === 'approve' ? 'approve this work' : 'decline this request'}.
                </p>
                <p className="mt-1.5 text-xs leading-5 text-cc-muted">Your response is final and the link cannot be reused.</p>
                {error && (
                  <div role="alert" className="mt-4 flex gap-2 rounded-xl bg-red-500/10 p-3 text-sm text-red-300">
                    <AlertCircle className="mt-0.5 shrink-0" size={16} />
                    <span>{error}</span>
                  </div>
                )}
                <div className="mt-4 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={() => setSelectedDecision(null)}
                    disabled={isSubmitting}
                    className="btn-secondary"
                  >
                    <span className="inline-flex items-center justify-center gap-2">
                      <ArrowLeft size={15} />
                      Go back
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={submitDecision}
                    disabled={isSubmitting}
                    className={selectedDecision === 'approve'
                      ? 'rounded-lg bg-emerald-600 px-4 py-2 font-medium text-white transition-all duration-200 hover:bg-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-400 disabled:opacity-60'
                      : 'rounded-lg bg-rose-600 px-4 py-2 font-medium text-white transition-all duration-200 hover:bg-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-400 disabled:opacity-60'}
                  >
                    <span className="inline-flex items-center justify-center gap-2">
                      {isSubmitting && <Loader2 className="animate-spin" size={15} />}
                      {isSubmitting ? 'Recording…' : `Confirm ${selectedDecision}`}
                    </span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => setSelectedDecision('decline')}
                  className="flex items-center justify-center gap-2 rounded-xl border border-rose-500/35 bg-rose-500/10 px-4 py-3 font-medium text-rose-200 transition-all duration-200 hover:scale-[1.01] hover:bg-rose-500/15 focus:outline-none focus:ring-2 focus:ring-rose-400"
                >
                  <XCircle size={18} />
                  Decline
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedDecision('approve')}
                  className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 font-medium text-white shadow-lg shadow-emerald-950/25 transition-all duration-200 hover:scale-[1.01] hover:bg-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                >
                  <CheckCircle2 size={18} />
                  Approve
                </button>
              </div>
            )}
          </section>
        </main>
      </div>
    </PublicPageShell>
  );
}

function DecisionComplete({ status }: { status: ApprovalRequest['status'] }) {
  const approved = status === 'approved';

  return (
    <div
      role="status"
      className={`mt-6 rounded-2xl border p-5 ${
        approved
          ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200'
          : 'border-rose-500/30 bg-rose-500/10 text-rose-200'
      }`}
    >
      <div className="flex items-center gap-3">
        {approved ? <CheckCircle2 size={22} /> : <XCircle size={22} />}
        <p className="font-semibold">Request {approved ? 'approved' : 'declined'}</p>
      </div>
      <p className="mt-2 text-sm leading-6 opacity-80">
        {approved
          ? 'Thank you. The approved work has been added to the property team’s project board.'
          : 'Thank you. Your decision has been recorded for the property team.'}
      </p>
    </div>
  );
}

function PublicPageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-cc-bg px-4 py-6 text-cc-text sm:px-6 lg:px-8 lg:py-8">
      <header className="mx-auto mb-6 flex max-w-7xl items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-500 text-sm font-bold text-white shadow-lg shadow-indigo-950/30">
            PM
          </div>
          <div>
            <p className="text-sm font-semibold text-cc-text">Property Manager</p>
            <p className="text-xs text-cc-muted">Client approval portal</p>
          </div>
        </div>
        <div className="hidden items-center gap-1.5 text-xs text-cc-muted sm:flex">
          <ShieldCheck size={15} className="text-emerald-400" />
          Protected decision link
        </div>
      </header>
      <div className="mx-auto max-w-7xl">{children}</div>
    </div>
  );
}
