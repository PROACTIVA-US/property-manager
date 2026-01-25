import { X, Lightbulb, ArrowRight } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getTipForRoute } from '../../data/contextualTips';

const DISMISSED_TIPS_KEY = 'property-manager-dismissed-tips';

export default function ContextualTip() {
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
    <div className="fixed bottom-4 right-4 max-w-md bg-gradient-to-r from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 rounded-lg p-4 shadow-lg z-30 animate-slide-up">
      <div className="flex items-start gap-3">
        <div className="p-2 bg-indigo-500/20 rounded-lg flex-shrink-0">
          <Lightbulb className="w-5 h-5 text-indigo-400" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-100 mb-1">{tip.title}</h3>
          <p className="text-sm text-gray-300 mb-3">{tip.message}</p>
          {tip.actionText && (
            <button
              onClick={handleAction}
              className="inline-flex items-center gap-2 text-sm text-indigo-400 hover:text-indigo-300 transition-colors"
            >
              {tip.actionText}
              <ArrowRight className="w-3 h-3" />
            </button>
          )}
        </div>
        {tip.dismissable && (
          <button
            onClick={handleDismiss}
            className="p-1 hover:bg-gray-800 rounded transition-colors flex-shrink-0"
          >
            <X className="w-4 h-4 text-gray-400" />
          </button>
        )}
      </div>
    </div>
  );
}
