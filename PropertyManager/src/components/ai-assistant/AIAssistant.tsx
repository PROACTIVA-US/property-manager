import { X, Sparkles, RefreshCw } from 'lucide-react';
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAIAssistantStore } from '../../stores/aiAssistantStore';
import SuggestionCard from './SuggestionCard';

export default function AIAssistant() {
  const location = useLocation();
  const {
    isOpen,
    closeAssistant,
    suggestions,
    isLoading,
    dismissSuggestion,
    setCurrentRoute,
    refreshSuggestions,
    lastRefresh,
  } = useAIAssistantStore();

  // Update route when location changes
  useEffect(() => {
    setCurrentRoute(location.pathname);
  }, [location.pathname, setCurrentRoute]);

  if (!isOpen) return null;

  const formatLastRefresh = () => {
    if (!lastRefresh) return 'Never';
    const now = new Date();
    const diff = now.getTime() - lastRefresh.getTime();
    const seconds = Math.floor(diff / 1000);
    if (seconds < 60) return 'Just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ago`;
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40 transition-opacity"
        onClick={closeAssistant}
      />

      {/* Panel */}
      <div className="fixed top-0 right-0 h-full w-full max-w-md bg-gray-900 border-l border-gray-700 z-50 flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-purple-500/10 rounded-lg">
              <Sparkles className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-100">AI Assistant</h2>
              <p className="text-xs text-gray-500">Last updated: {formatLastRefresh()}</p>
            </div>
          </div>
          <button
            onClick={closeAssistant}
            className="p-1 hover:bg-gray-800 rounded transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm text-gray-400">
              Smart suggestions based on your current context
            </p>
            <button
              onClick={refreshSuggestions}
              disabled={isLoading}
              className="p-2 hover:bg-gray-800 rounded transition-colors disabled:opacity-50"
              title="Refresh suggestions"
            >
              <RefreshCw className={`w-4 h-4 text-gray-400 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {isLoading && suggestions.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <RefreshCw className="w-8 h-8 text-gray-500 mx-auto mb-3 animate-spin" />
                <p className="text-gray-400">Generating suggestions...</p>
              </div>
            </div>
          ) : suggestions.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <Sparkles className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                <p className="text-gray-400 mb-2">No suggestions right now</p>
                <p className="text-sm text-gray-500">
                  Check back later or try navigating to different pages
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {suggestions.map((suggestion) => (
                <SuggestionCard
                  key={suggestion.id}
                  suggestion={suggestion}
                  onDismiss={dismissSuggestion}
                />
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-700 bg-gray-800/50">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Sparkles className="w-3 h-3" />
            <span>
              Suggestions are generated based on your projects, route, and recent activity
            </span>
          </div>
        </div>
      </div>
    </>
  );
}
