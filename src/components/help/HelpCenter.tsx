import { X, Search, ArrowLeft, BookOpen, Rocket, Building2, Wrench, Users, DollarSign, Keyboard } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useHelpStore } from '../../stores/helpStore';
import { HELP_CATEGORIES, searchArticles, getArticlesByCategory, getArticleById } from '../../data/helpContent';
import type { HelpArticle } from '../../data/helpContent';

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Rocket,
  Building2,
  Wrench,
  Users,
  DollarSign,
  Keyboard,
};

export default function HelpCenter() {
  const {
    isOpen,
    closeHelp,
    searchQuery,
    setSearchQuery,
    activeCategory,
    setActiveCategory,
    selectedArticleId,
    selectArticle,
    goBack,
  } = useHelpStore();

  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setSearchQuery(localSearchQuery);
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [localSearchQuery, setSearchQuery]);

  if (!isOpen) return null;

  // Determine which view to show
  const selectedArticle = selectedArticleId ? getArticleById(selectedArticleId) : null;
  const searchResults = searchQuery ? searchArticles(searchQuery) : [];
  const categoryArticles = activeCategory ? getArticlesByCategory(activeCategory) : [];

  const handleCategoryClick = (categoryId: string) => {
    setActiveCategory(categoryId);
  };

  const handleArticleClick = (article: HelpArticle) => {
    selectArticle(article.id);
  };

  const handleBackClick = () => {
    if (selectedArticleId) {
      goBack();
    } else if (activeCategory) {
      setActiveCategory(null);
    }
  };

  const showBackButton = !!(selectedArticleId || activeCategory || searchQuery);

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40 transition-opacity"
        onClick={closeHelp}
      />

      {/* Panel */}
      <div className="fixed top-0 right-0 h-full w-full max-w-2xl bg-gray-900 border-l border-gray-700 z-50 flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <div className="flex items-center gap-3">
            {showBackButton && (
              <button
                onClick={handleBackClick}
                className="p-1 hover:bg-gray-800 rounded transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-400" />
              </button>
            )}
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-indigo-400" />
              <h2 className="text-lg font-semibold text-gray-100">Help Center</h2>
            </div>
          </div>
          <button
            onClick={closeHelp}
            className="p-1 hover:bg-gray-800 rounded transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Search Bar */}
        {!selectedArticleId && (
          <div className="p-4 border-b border-gray-700">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="text"
                placeholder="Search help articles..."
                value={localSearchQuery}
                onChange={(e) => setLocalSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-100 placeholder-gray-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {selectedArticle ? (
            // Article View
            <ArticleView article={selectedArticle} />
          ) : searchQuery ? (
            // Search Results View
            <SearchResultsView results={searchResults} onArticleClick={handleArticleClick} />
          ) : activeCategory ? (
            // Category Articles View
            <CategoryArticlesView
              category={HELP_CATEGORIES.find((c) => c.id === activeCategory)!}
              articles={categoryArticles}
              onArticleClick={handleArticleClick}
            />
          ) : (
            // Categories View
            <CategoriesView onCategoryClick={handleCategoryClick} />
          )}
        </div>
      </div>
    </>
  );
}

// Categories View Component
function CategoriesView({ onCategoryClick }: { onCategoryClick: (id: string) => void }) {
  return (
    <div>
      <p className="text-gray-400 mb-6">
        Browse help articles by category or use the search bar above to find specific topics.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {HELP_CATEGORIES.map((category) => {
          const Icon = ICON_MAP[category.icon] || BookOpen;
          const articles = getArticlesByCategory(category.id);

          return (
            <button
              key={category.id}
              onClick={() => onCategoryClick(category.id)}
              className="flex items-start gap-4 p-4 bg-gray-800/50 hover:bg-gray-800 border border-gray-700 rounded-lg transition-colors text-left"
            >
              <div className="p-2 bg-indigo-500/10 rounded-lg flex-shrink-0">
                <Icon className="w-5 h-5 text-indigo-400" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-gray-100 mb-1">{category.name}</h3>
                <p className="text-sm text-gray-400 mb-2">{category.description}</p>
                <span className="text-xs text-gray-500">{articles.length} articles</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// Category Articles View Component
function CategoryArticlesView({
  category,
  articles,
  onArticleClick,
}: {
  category: { name: string; description: string };
  articles: HelpArticle[];
  onArticleClick: (article: HelpArticle) => void;
}) {
  return (
    <div>
      <h3 className="text-xl font-semibold text-gray-100 mb-2">{category.name}</h3>
      <p className="text-gray-400 mb-6">{category.description}</p>
      <div className="space-y-2">
        {articles.map((article) => (
          <button
            key={article.id}
            onClick={() => onArticleClick(article)}
            className="w-full flex items-start gap-3 p-3 bg-gray-800/50 hover:bg-gray-800 border border-gray-700 rounded-lg transition-colors text-left"
          >
            <BookOpen className="w-4 h-4 text-indigo-400 mt-1 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-gray-100 mb-1">{article.title}</h4>
              <div className="flex flex-wrap gap-2">
                {article.tags.slice(0, 3).map((tag) => (
                  <span key={tag} className="text-xs text-gray-500">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

// Search Results View Component
function SearchResultsView({
  results,
  onArticleClick,
}: {
  results: HelpArticle[];
  onArticleClick: (article: HelpArticle) => void;
}) {
  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-100 mb-4">
        {results.length} {results.length === 1 ? 'result' : 'results'} found
      </h3>
      {results.length === 0 ? (
        <div className="text-center py-12">
          <Search className="w-12 h-12 text-gray-600 mx-auto mb-3" />
          <p className="text-gray-400 mb-2">No articles found</p>
          <p className="text-sm text-gray-500">Try different keywords or browse categories</p>
        </div>
      ) : (
        <div className="space-y-2">
          {results.map((article) => (
            <button
              key={article.id}
              onClick={() => onArticleClick(article)}
              className="w-full flex items-start gap-3 p-3 bg-gray-800/50 hover:bg-gray-800 border border-gray-700 rounded-lg transition-colors text-left"
            >
              <BookOpen className="w-4 h-4 text-indigo-400 mt-1 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-gray-100 mb-1">{article.title}</h4>
                <div className="flex flex-wrap gap-2 mb-2">
                  {article.tags.slice(0, 3).map((tag) => (
                    <span key={tag} className="text-xs text-gray-500">
                      #{tag}
                    </span>
                  ))}
                </div>
                <p className="text-sm text-gray-400 line-clamp-2">
                  {article.content.substring(0, 150)}...
                </p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// Article View Component
function ArticleView({ article }: { article: HelpArticle }) {
  return (
    <div className="prose prose-invert max-w-none">
      <h1 className="text-2xl font-bold text-gray-100 mb-4">{article.title}</h1>
      <div className="flex flex-wrap gap-2 mb-6">
        {article.tags.map((tag) => (
          <span
            key={tag}
            className="px-2 py-1 bg-indigo-500/10 text-indigo-400 text-xs rounded-full"
          >
            #{tag}
          </span>
        ))}
      </div>
      <div
        className="text-gray-300 leading-relaxed space-y-4"
        dangerouslySetInnerHTML={{ __html: formatMarkdown(article.content) }}
      />
    </div>
  );
}

// Simple markdown formatter (basic implementation)
function formatMarkdown(content: string): string {
  return content
    .replace(/\*\*(.*?)\*\*/g, '<strong class="text-gray-100">$1</strong>')
    .replace(/`(.*?)`/g, '<code class="px-1 py-0.5 bg-gray-800 rounded text-indigo-400">$1</code>')
    .replace(/^- (.+)$/gm, '<li class="ml-4">$1</li>')
    .replace(/^(\d+)\. (.+)$/gm, '<li class="ml-4">$2</li>')
    .replace(/\n\n/g, '<br/><br/>');
}
