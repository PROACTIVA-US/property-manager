import { Zap, Lightbulb, Bell, TrendingUp, X, ArrowRight } from 'lucide-react';
import type { Suggestion } from '../../stores/aiAssistantStore';

interface SuggestionCardProps {
  suggestion: Suggestion;
  onDismiss: (id: string) => void;
}

const TYPE_ICONS: Record<Suggestion['type'], React.ComponentType<{ className?: string }>> = {
  action: Zap,
  insight: Lightbulb,
  reminder: Bell,
  'next-step': TrendingUp,
};

const TYPE_COLORS: Record<Suggestion['type'], { bg: string; text: string; border: string }> = {
  action: {
    bg: 'bg-purple-500/10',
    text: 'text-purple-400',
    border: 'border-purple-500/30',
  },
  insight: {
    bg: 'bg-blue-500/10',
    text: 'text-blue-400',
    border: 'border-blue-500/30',
  },
  reminder: {
    bg: 'bg-indigo-400/10',
    text: 'text-indigo-300',
    border: 'border-indigo-400/30',
  },
  'next-step': {
    bg: 'bg-green-500/10',
    text: 'text-green-400',
    border: 'border-green-500/30',
  },
};

const PRIORITY_COLORS: Record<Suggestion['priority'], string> = {
  high: 'border-l-red-500',
  medium: 'border-l-yellow-500',
  low: 'border-l-gray-500',
};

export default function SuggestionCard({ suggestion, onDismiss }: SuggestionCardProps) {
  const Icon = TYPE_ICONS[suggestion.type];
  const colors = TYPE_COLORS[suggestion.type];
  const priorityColor = PRIORITY_COLORS[suggestion.priority];

  const handleAction = () => {
    if (suggestion.action) {
      suggestion.action();
      onDismiss(suggestion.id);
    }
  };

  return (
    <div
      className={`relative bg-gray-800/50 border ${colors.border} ${priorityColor} border-l-4 rounded-lg p-4 hover:bg-gray-800 transition-colors`}
    >
      <div className="flex items-start gap-3">
        <div className={`p-2 ${colors.bg} rounded-lg flex-shrink-0`}>
          <Icon className={`w-5 h-5 ${colors.text}`} />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-gray-100 mb-1">{suggestion.title}</h3>
          <p className="text-sm text-gray-400 mb-3">{suggestion.description}</p>
          {suggestion.actionLabel && (
            <button
              onClick={handleAction}
              className={`inline-flex items-center gap-2 text-sm ${colors.text} hover:opacity-80 transition-opacity`}
            >
              {suggestion.actionLabel}
              <ArrowRight className="w-3 h-3" />
            </button>
          )}
        </div>
        <button
          onClick={() => onDismiss(suggestion.id)}
          className="p-1 hover:bg-gray-700 rounded transition-colors flex-shrink-0"
        >
          <X className="w-4 h-4 text-gray-400" />
        </button>
      </div>
    </div>
  );
}
