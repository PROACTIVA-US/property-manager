import { X, Lightbulb, ArrowRight } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getTipForRoute } from '../../data/contextualTips';
import { useAuth } from '../../contexts/AuthContext';

const DISMISSED_TIPS_KEY = 'property-manager-dismissed-tips';

export default function ContextualTip() {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [dismissedTips, setDismissedTips] = useState<string[]>(() => {
    const stored = localStorage.getItem(DISMISSED_TIPS_KEY);
    return stored ? JSON.parse(stored) : [];
  });

  const tip = getTipForRoute(location.pathname);
  const shouldShow = tip && !dismissedTips.includes(tip.id);

  useEffect(() => {
    localStorage.setItem(DISMISSED_TIPS_KEY, JSON.stringify(dismissedTips));
  }, [dismissedTips]);

  // Don't show tips for owner role - they have a simplified UI
  if (user?.role === 'owner') return null;

  if (!shouldShow || !tip) return null;

  const handleDismiss = () => {
    if (tip.dismissable) {
      setDismissedTips([...dismissedTips, tip.id]);
    }
  };

  const handleAction = () => {
    if (tip.actionRoute) {
      navigate(tip.actionRoute);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 left-4 sm:left-auto max-w-md bg-cc-surface border border-cc-accent/30 rounded-lg p-4 shadow-2xl z-30 animate-slide-up">
      {/* Gradient accent bar at top */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-t-lg" />
      <div className="flex items-start gap-3">
        <div className="p-2 bg-cc-accent/20 rounded-lg flex-shrink-0">
          <Lightbulb className="w-5 h-5 text-cc-accent" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-cc-text mb-1">{tip.title}</h3>
          <p className="text-sm text-cc-muted mb-3">{tip.message}</p>
          {tip.actionText && (
            <button
              onClick={handleAction}
              className="inline-flex items-center gap-2 text-sm text-cc-accent hover:text-indigo-400 transition-colors"
            >
              {tip.actionText}
              <ArrowRight className="w-3 h-3" />
            </button>
          )}
        </div>
        {tip.dismissable && (
          <button
            onClick={handleDismiss}
            className="p-1 hover:bg-cc-border rounded transition-colors flex-shrink-0"
          >
            <X className="w-4 h-4 text-cc-muted" />
          </button>
        )}
      </div>
    </div>
  );
}
