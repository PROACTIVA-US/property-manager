import { useState, useMemo } from 'react';
import type { ModelLibraryProps, ModelCategory, ModelAsset } from '../../types/viewer3d.types';
import {
  filterAssets,
  getCategoriesWithCounts,
  getCategoryIcon,
  isAssetFavorited,
  addFavoriteAsset,
  removeFavoriteAsset,
} from '../../lib/model-library';

/**
 * ModelLibrary Component
 *
 * Displays a browsable library of 3D model assets.
 * Users can filter by category, search, and select assets to add to the scene.
 */
export function ModelLibrary({
  onSelectAsset,
  selectedCategory,
  onCategoryChange,
  searchQuery = '',
  onSearchChange,
}: ModelLibraryProps) {
  const [localSelectedCategory, setLocalSelectedCategory] = useState<ModelCategory | undefined>(
    selectedCategory
  );
  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery);
  const [favoritesOnly, setFavoritesOnly] = useState(false);

  const categories = useMemo(() => getCategoriesWithCounts(), []);

  // Get filtered assets
  const filteredAssets = useMemo(() => {
    const category = selectedCategory ?? localSelectedCategory;
    const query = searchQuery || localSearchQuery;

    let assets = filterAssets({
      category,
      searchQuery: query,
    });

    // Filter by favorites if enabled
    if (favoritesOnly) {
      assets = assets.filter((asset) => isAssetFavorited(asset.id));
    }

    return assets;
  }, [selectedCategory, localSelectedCategory, searchQuery, localSearchQuery, favoritesOnly]);

  const handleCategoryClick = (category: ModelCategory | undefined) => {
    if (onCategoryChange) {
      onCategoryChange(category!);
    } else {
      setLocalSelectedCategory(category);
    }
  };

  const handleSearchChange = (value: string) => {
    if (onSearchChange) {
      onSearchChange(value);
    } else {
      setLocalSearchQuery(value);
    }
  };

  const handleFavoriteToggle = (assetId: string) => {
    if (isAssetFavorited(assetId)) {
      removeFavoriteAsset(assetId);
    } else {
      addFavoriteAsset(assetId);
    }
    // Force re-render
    setFavoritesOnly((prev) => prev);
  };

  const activeCategory = selectedCategory ?? localSelectedCategory;
  const activeSearchQuery = searchQuery || localSearchQuery;

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-xl font-semibold mb-4">Model Library</h2>

        {/* Search */}
        <div className="relative mb-4">
          <input
            type="text"
            placeholder="Search models..."
            value={activeSearchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
            🔍
          </span>
        </div>

        {/* Favorites Toggle */}
        <button
          type="button"
          onClick={() => setFavoritesOnly(!favoritesOnly)}
          className={`
            w-full px-4 py-2 rounded-lg transition-colors text-sm font-medium
            ${favoritesOnly ? 'bg-yellow-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}
          `}
        >
          {favoritesOnly ? '⭐ Showing Favorites' : '☆ Show Favorites Only'}
        </button>
      </div>

      {/* Categories */}
      <div className="px-4 py-3 border-b border-gray-200 overflow-x-auto">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => handleCategoryClick(undefined)}
            className={`
              px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors
              ${!activeCategory ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}
            `}
          >
            All
          </button>
          {categories.map(({ category, count, label }) => (
            <button
              key={category}
              type="button"
              onClick={() => handleCategoryClick(category)}
              className={`
                px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors
                ${activeCategory === category ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}
              `}
            >
              {getCategoryIcon(category)} {label} ({count})
            </button>
          ))}
        </div>
      </div>

      {/* Asset Grid */}
      <div className="flex-1 overflow-y-auto p-4">
        {filteredAssets.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <div className="text-4xl mb-2">📦</div>
            <p>No models found</p>
            <p className="text-sm mt-1">
              {activeSearchQuery ? 'Try a different search term' : 'No models in this category'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {filteredAssets.map((asset) => (
              <AssetCard
                key={asset.id}
                asset={asset}
                onSelect={onSelectAsset}
                onFavoriteToggle={handleFavoriteToggle}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * AssetCard Component
 *
 * Displays a single asset card in the library.
 */
function AssetCard({
  asset,
  onSelect,
  onFavoriteToggle,
}: {
  asset: ModelAsset;
  onSelect: (asset: ModelAsset) => void;
  onFavoriteToggle: (assetId: string) => void;
}) {
  const isFavorite = isAssetFavorited(asset.id);

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow cursor-pointer group">
      {/* Thumbnail */}
      <div
        className="aspect-square bg-gray-100 relative overflow-hidden"
        onClick={() => onSelect(asset)}
      >
        <div className="w-full h-full flex items-center justify-center text-4xl">
          {getCategoryIcon(asset.category)}
        </div>

        {/* Favorite Button Overlay */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onFavoriteToggle(asset.id);
          }}
          className="absolute top-2 right-2 p-1.5 bg-white/90 rounded-full hover:bg-white transition-colors"
        >
          <span className="text-lg">{isFavorite ? '⭐' : '☆'}</span>
        </button>

        {/* Source Badge */}
        {asset.source === 'uploaded' && (
          <div className="absolute bottom-2 left-2 px-2 py-0.5 bg-blue-500 text-white text-xs rounded">
            Uploaded
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3" onClick={() => onSelect(asset)}>
        <h3 className="font-medium text-sm mb-1 truncate" title={asset.name}>
          {asset.name}
        </h3>
        {asset.description && (
          <p className="text-xs text-gray-600 mb-2 line-clamp-2">
            {asset.description}
          </p>
        )}

        {/* Dimensions */}
        <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
          <span>📏</span>
          <span>
            {asset.dimensions.width}m × {asset.dimensions.height}m × {asset.dimensions.depth}m
          </span>
        </div>

        {/* Price */}
        {asset.price && (
          <div className="flex items-center gap-2 text-xs text-green-700 font-medium">
            <span>💰</span>
            <span>${asset.price.toLocaleString()}</span>
          </div>
        )}

        {/* Tags */}
        <div className="flex flex-wrap gap-1 mt-2">
          {asset.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="px-1.5 py-0.5 bg-gray-100 text-gray-600 text-xs rounded"
            >
              {tag}
            </span>
          ))}
          {asset.tags.length > 3 && (
            <span className="px-1.5 py-0.5 text-gray-400 text-xs">
              +{asset.tags.length - 3}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
