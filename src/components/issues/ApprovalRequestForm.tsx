import { useEffect, useId, useMemo, useState } from 'react';
import {
  AlertCircle,
  Check,
  Copy,
  ExternalLink,
  ImagePlus,
  Link2,
  Loader2,
  ShieldCheck,
  X,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import {
  createApprovalRequest,
  type CreatedApprovalRequest,
} from '../../lib/client-approvals';

interface ApprovalRequestFormProps {
  onClose: () => void;
  onCreated?: () => void;
}

export default function ApprovalRequestForm({ onClose, onCreated }: ApprovalRequestFormProps) {
  const { user } = useAuth();
  const titleId = useId();
  const [description, setDescription] = useState('');
  const [actionQuestion, setActionQuestion] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [createdRequest, setCreatedRequest] = useState<CreatedApprovalRequest | null>(null);
  const [copied, setCopied] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const imagePreview = useMemo(() => image ? URL.createObjectURL(image) : null, [image]);

  useEffect(() => () => {
    if (imagePreview) URL.revokeObjectURL(imagePreview);
  }, [imagePreview]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    if (!user || !['owner', 'pm', 'admin'].includes(user.role || '')) {
      setError('Only property staff can create client approval requests.');
      return;
    }

    if (!image) {
      setError('Add the stitched composite image the client should review.');
      return;
    }

    setIsSubmitting(true);
    try {
      const request = await createApprovalRequest({
        description,
        actionQuestion,
        compositeImage: image,
        userId: user.uid,
      });
      setCreatedRequest(request);
      onCreated?.();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Could not create the request.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyLink = async () => {
    if (!createdRequest) return;
    try {
      await navigator.clipboard.writeText(createdRequest.publicUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setError('Copy failed. Select the link below and copy it manually.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-cc-border bg-cc-surface shadow-2xl"
      >
        <header className="flex items-start justify-between gap-4 border-b border-cc-border px-6 py-5">
          <div className="flex gap-3">
            <div className="mt-0.5 rounded-xl bg-indigo-500/15 p-2.5 text-indigo-300">
              <Link2 size={20} aria-hidden="true" />
            </div>
            <div>
              <h2 id={titleId} className="text-xl font-semibold text-cc-text">
                {createdRequest ? 'Approval link ready' : 'Request client approval'}
              </h2>
              <p className="mt-1 text-sm text-cc-muted">
                {createdRequest
                  ? 'Share this private link with the decision-maker.'
                  : 'Package the evidence and decision into one clear review.'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close approval request"
            className="rounded-lg p-2 text-cc-muted transition-all duration-200 hover:bg-cc-bg hover:text-cc-text focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <X size={20} />
          </button>
        </header>

        {createdRequest ? (
          <div className="overflow-y-auto p-6">
            <div className="rounded-2xl border border-emerald-500/25 bg-emerald-500/10 p-5">
              <div className="flex items-center gap-3 text-emerald-300">
                <ShieldCheck size={22} aria-hidden="true" />
                <p className="font-semibold">Secure one-time decision link created</p>
              </div>
              <p className="mt-2 text-sm leading-6 text-cc-muted">
                The link expires on {new Date(createdRequest.expiresAt).toLocaleDateString()}.
                After approval or decline, it cannot be used again.
              </p>
            </div>

            <div className="mt-6">
              <label htmlFor="approval-url" className="mb-2 block text-sm font-medium text-cc-text">
                Client portal link
              </label>
              <div className="flex flex-col gap-3 sm:flex-row">
                <input
                  id="approval-url"
                  value={createdRequest.publicUrl}
                  readOnly
                  onFocus={event => event.currentTarget.select()}
                  className="input-field min-w-0 flex-1 font-mono text-xs"
                />
                <button
                  type="button"
                  onClick={copyLink}
                  className="btn-primary flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-cc-surface"
                >
                  {copied ? <Check size={17} /> : <Copy size={17} />}
                  {copied ? 'Copied' : 'Copy link'}
                </button>
              </div>
            </div>

            <article className="mt-6 grid gap-4 rounded-2xl bg-cc-bg/60 p-4 sm:grid-cols-[160px_1fr]">
              <img
                src={createdRequest.compositeImageUrl}
                alt="Composite evidence sent for client approval"
                className="aspect-[4/3] w-full rounded-xl object-cover"
              />
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-wider text-indigo-300">Decision</p>
                <h3 className="mt-1 text-lg font-semibold text-cc-text">{createdRequest.actionQuestion}</h3>
                <p className="mt-2 line-clamp-3 text-sm leading-6 text-cc-muted">
                  {createdRequest.description}
                </p>
              </div>
            </article>

            {error && (
              <div role="alert" className="mt-4 flex gap-2 rounded-xl border border-red-500/25 bg-red-500/10 p-3 text-sm text-red-300">
                <AlertCircle className="mt-0.5 shrink-0" size={17} />
                <span>{error}</span>
              </div>
            )}

            <footer className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button type="button" onClick={onClose} className="btn-secondary">
                Done
              </button>
              <a
                href={createdRequest.publicUrl}
                target="_blank"
                rel="noreferrer"
                className="btn-primary flex items-center justify-center gap-2"
              >
                Preview portal
                <ExternalLink size={16} />
              </a>
            </footer>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
            <div className="space-y-6 overflow-y-auto p-6">
              {error && (
                <div role="alert" className="flex gap-2 rounded-xl border border-red-500/25 bg-red-500/10 p-3 text-sm text-red-300">
                  <AlertCircle className="mt-0.5 shrink-0" size={17} />
                  <span>{error}</span>
                </div>
              )}

              <div>
                <label htmlFor="approval-question" className="mb-2 block text-sm font-medium text-cc-text">
                  What decision do you need? <span className="text-red-300">*</span>
                </label>
                <input
                  id="approval-question"
                  value={actionQuestion}
                  onChange={event => setActionQuestion(event.target.value)}
                  placeholder="Approve the proposed roof repair?"
                  maxLength={500}
                  required
                  className="input-field w-full"
                />
                <p className="mt-1.5 text-xs text-cc-muted">Phrase this as one clear yes-or-no action.</p>
              </div>

              <div>
                <label htmlFor="approval-description" className="mb-2 block text-sm font-medium text-cc-text">
                  Context for the client <span className="text-red-300">*</span>
                </label>
                <textarea
                  id="approval-description"
                  value={description}
                  onChange={event => setDescription(event.target.value)}
                  placeholder="Explain the issue, recommendation, timing, and expected impact."
                  rows={5}
                  maxLength={5000}
                  required
                  className="input-field w-full resize-y"
                />
                <p className="mt-1.5 text-right text-xs text-cc-muted">{description.length}/5,000</p>
              </div>

              <div>
                <span className="mb-2 block text-sm font-medium text-cc-text">
                  Stitched composite image <span className="text-red-300">*</span>
                </span>
                <label className="group flex cursor-pointer flex-col items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-cc-border bg-cc-bg/40 transition-all duration-200 hover:border-indigo-400/60 hover:bg-indigo-500/5 focus-within:ring-2 focus-within:ring-indigo-500">
                  {imagePreview ? (
                    <div className="relative w-full">
                      <img
                        src={imagePreview}
                        alt="Composite image preview"
                        className="max-h-72 w-full object-contain"
                      />
                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent px-4 pb-3 pt-10 text-center text-sm text-white">
                        Choose a different image
                      </div>
                    </div>
                  ) : (
                    <div className="flex min-h-44 flex-col items-center justify-center px-6 py-8 text-center">
                      <div className="rounded-xl bg-indigo-500/15 p-3 text-indigo-300 transition-transform duration-200 group-hover:scale-105">
                        <ImagePlus size={24} />
                      </div>
                      <p className="mt-3 text-sm font-medium text-cc-text">Add the full review image</p>
                      <p className="mt-1 text-xs text-cc-muted">JPG, PNG, or WebP · 8 MB maximum</p>
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    required
                    onChange={event => setImage(event.target.files?.[0] || null)}
                    className="sr-only"
                  />
                </label>
              </div>
            </div>

            <footer className="flex flex-col-reverse gap-3 border-t border-cc-border bg-cc-bg/30 px-6 py-4 sm:flex-row sm:justify-end">
              <button type="button" onClick={onClose} disabled={isSubmitting} className="btn-secondary">
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-primary flex items-center justify-center gap-2 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? <Loader2 className="animate-spin" size={17} /> : <Link2 size={17} />}
                {isSubmitting ? 'Creating secure link…' : 'Create approval link'}
              </button>
            </footer>
          </form>
        )}
      </section>
    </div>
  );
}
