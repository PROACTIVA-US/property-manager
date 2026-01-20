import { useState } from 'react';
import { Star, Send, TrendingUp, MessageCircle, ThumbsUp, AlertCircle } from 'lucide-react';
import type { SatisfactionEntry } from '../lib/messages';
import { formatRelativeTime } from '../lib/messages';
import { cn } from '../lib/utils';

interface SatisfactionSurveyProps {
  entries: SatisfactionEntry[];
  averageRating: number;
  currentTenantId: string;
  onSubmit: (entry: Omit<SatisfactionEntry, 'id' | 'timestamp'>) => void;
  isReadOnly?: boolean;
}

export default function SatisfactionSurvey({
  entries,
  averageRating,
  currentTenantId,
  onSubmit,
  isReadOnly = false,
}: SatisfactionSurveyProps) {
  const [showSurvey, setShowSurvey] = useState(false);
  const [rating, setRating] = useState<1 | 2 | 3 | 4 | 5 | null>(null);
  const [hoveredRating, setHoveredRating] = useState<number | null>(null);
  const [category, setCategory] = useState<SatisfactionEntry['category']>('overall');
  const [feedback, setFeedback] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (rating) {
      onSubmit({
        tenantId: currentTenantId,
        rating,
        category,
        feedback: feedback.trim() || undefined,
      });
      setRating(null);
      setFeedback('');
      setShowSurvey(false);
    }
  };

  const getSatisfactionLabel = (value: number): { label: string; color: string; icon: React.ReactNode } => {
    if (value >= 4.5) return { label: 'Excellent', color: 'text-green-400', icon: <ThumbsUp size={20} /> };
    if (value >= 3.5) return { label: 'Good', color: 'text-blue-400', icon: <TrendingUp size={20} /> };
    if (value >= 2.5) return { label: 'Average', color: 'text-yellow-400', icon: <MessageCircle size={20} /> };
    return { label: 'Needs Attention', color: 'text-red-400', icon: <AlertCircle size={20} /> };
  };

  const satisfaction = getSatisfactionLabel(averageRating);
  const tenantEntries = entries.filter(e => e.tenantId === currentTenantId);

  return (
    <div className="space-y-6">
      {/* Satisfaction Overview */}
      <div className="card bg-gradient-to-br from-brand-navy to-slate-800">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-brand-light">Tenant Satisfaction</h2>
          {!isReadOnly && (
            <button
              onClick={() => setShowSurvey(!showSurvey)}
              className="text-sm text-brand-orange hover:underline"
            >
              {showSurvey ? 'Cancel' : 'Submit Feedback'}
            </button>
          )}
        </div>

        <div className="flex items-center gap-6">
          {/* Average Rating */}
          <div className="text-center">
            <div className="text-4xl font-bold text-brand-light mb-1">
              {averageRating > 0 ? averageRating.toFixed(1) : '--'}
            </div>
            <div className="flex items-center justify-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  size={16}
                  className={cn(
                    star <= Math.round(averageRating)
                      ? 'text-yellow-400 fill-yellow-400'
                      : 'text-slate-600'
                  )}
                />
              ))}
            </div>
          </div>

          {/* Status Label */}
          <div className="flex-1">
            <div className={cn('flex items-center gap-2 mb-1', satisfaction.color)}>
              {satisfaction.icon}
              <span className="font-bold">{satisfaction.label}</span>
            </div>
            <p className="text-sm text-brand-muted">
              Based on {entries.length} feedback submission{entries.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
      </div>

      {/* Survey Form */}
      {showSurvey && !isReadOnly && (
        <div className="card border-brand-orange/30">
          <h3 className="font-bold text-brand-light mb-4">Submit Your Feedback</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Category Selection */}
            <div>
              <label className="block text-xs font-medium text-brand-muted uppercase tracking-wider mb-2">
                Category
              </label>
              <div className="flex flex-wrap gap-2">
                {(['overall', 'maintenance', 'communication', 'amenities'] as const).map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategory(cat)}
                    className={cn(
                      'px-3 py-1 rounded-full text-sm font-medium transition-colors capitalize',
                      category === cat
                        ? 'bg-brand-orange text-white'
                        : 'bg-slate-700/50 text-brand-muted hover:bg-slate-700'
                    )}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Star Rating */}
            <div>
              <label className="block text-xs font-medium text-brand-muted uppercase tracking-wider mb-2">
                Rating
              </label>
              <div className="flex items-center gap-2">
                {([1, 2, 3, 4, 5] as const).map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoveredRating(star)}
                    onMouseLeave={() => setHoveredRating(null)}
                    className="p-1 transition-transform hover:scale-110"
                  >
                    <Star
                      size={32}
                      className={cn(
                        'transition-colors',
                        star <= (hoveredRating || rating || 0)
                          ? 'text-yellow-400 fill-yellow-400'
                          : 'text-slate-600 hover:text-slate-500'
                      )}
                    />
                  </button>
                ))}
                {rating && (
                  <span className="ml-2 text-sm text-brand-muted">
                    {rating === 5 && 'Excellent!'}
                    {rating === 4 && 'Good'}
                    {rating === 3 && 'Average'}
                    {rating === 2 && 'Below Average'}
                    {rating === 1 && 'Poor'}
                  </span>
                )}
              </div>
            </div>

            {/* Feedback Text */}
            <div>
              <label className="block text-xs font-medium text-brand-muted uppercase tracking-wider mb-2">
                Additional Feedback (Optional)
              </label>
              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Share your thoughts, concerns, or suggestions..."
                rows={3}
                className="w-full input-field resize-none"
              />
            </div>

            {/* Submit */}
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={!rating}
                className={cn(
                  'btn-primary flex items-center gap-2',
                  !rating && 'opacity-50 cursor-not-allowed'
                )}
              >
                <Send size={18} />
                Submit Feedback
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Recent Feedback */}
      <div className="card">
        <h3 className="font-bold text-brand-light mb-4">
          {isReadOnly ? 'Recent Tenant Feedback' : 'Your Recent Feedback'}
        </h3>
        <div className="space-y-3">
          {(isReadOnly ? entries : tenantEntries).slice(0, 5).map((entry) => (
            <div
              key={entry.id}
              className="p-3 bg-brand-dark/50 rounded-lg border border-slate-700/50"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-medium uppercase bg-slate-600/50 text-slate-300 capitalize">
                    {entry.category}
                  </span>
                  <div className="flex items-center">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        size={12}
                        className={cn(
                          star <= entry.rating
                            ? 'text-yellow-400 fill-yellow-400'
                            : 'text-slate-600'
                        )}
                      />
                    ))}
                  </div>
                </div>
                <span className="text-[10px] text-brand-muted">
                  {formatRelativeTime(entry.timestamp)}
                </span>
              </div>
              {entry.feedback && (
                <p className="text-sm text-brand-light">{entry.feedback}</p>
              )}
            </div>
          ))}
          {(isReadOnly ? entries : tenantEntries).length === 0 && (
            <p className="text-center text-brand-muted py-4">
              No feedback submitted yet
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// Compact Satisfaction Widget for Dashboards
interface SatisfactionWidgetProps {
  averageRating: number;
  totalEntries: number;
  onClick?: () => void;
}

export function SatisfactionWidget({ averageRating, totalEntries, onClick }: SatisfactionWidgetProps) {
  const getSatisfactionColor = (value: number) => {
    if (value >= 4) return 'text-green-400';
    if (value >= 3) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <div
      onClick={onClick}
      className={cn(
        'flex items-center gap-3 p-3 rounded-lg bg-brand-dark/50 border border-slate-700/50',
        onClick && 'cursor-pointer hover:bg-brand-dark/70 transition-colors'
      )}
    >
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={14}
            className={cn(
              star <= Math.round(averageRating)
                ? 'text-yellow-400 fill-yellow-400'
                : 'text-slate-600'
            )}
          />
        ))}
      </div>
      <span className={cn('font-bold', getSatisfactionColor(averageRating))}>
        {averageRating > 0 ? averageRating.toFixed(1) : '--'}
      </span>
      <span className="text-xs text-brand-muted">
        ({totalEntries} review{totalEntries !== 1 ? 's' : ''})
      </span>
    </div>
  );
}
