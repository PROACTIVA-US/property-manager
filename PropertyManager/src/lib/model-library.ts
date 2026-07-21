import type { ModelAsset, ModelCategory, UploadedModel, ModelUploadConfig } from '../types/viewer3d.types';

/**
 * Phase 3: Model Library and Asset Management
 *
 * This module manages 3D model assets including:
 * - Built-in asset catalog
 * - Uploaded model storage
 * - Asset search and filtering
 * - Model metadata management
 */

// ============================================================================
// Built-in Asset Catalog
// ============================================================================

/**
 * Built-in 3D assets library
 * Note: In production, these would point to actual GLTF/GLB files
 * For now, using placeholder paths that can be replaced with real models
 */
export const BUILTIN_ASSETS: ModelAsset[] = [
  // Landscape assets
  {
    id: 'tree_oak_1',
    name: 'Oak Tree',
    description: 'Mature oak tree, approximately 20ft tall',
    category: 'landscape',
    thumbnail: '/models/thumbnails/tree_oak.png',
    modelUrl: '/models/landscape/tree_oak.glb',
    dimensions: { width: 6, height: 6, depth: 6 },
    tags: ['tree', 'deciduous', 'shade', 'landscape'],
    source: 'builtin',
  },
  {
    id: 'tree_pine_1',
    name: 'Pine Tree',
    description: 'Evergreen pine tree, approximately 25ft tall',
    category: 'landscape',
    thumbnail: '/models/thumbnails/tree_pine.png',
    modelUrl: '/models/landscape/tree_pine.glb',
    dimensions: { width: 4, height: 8, depth: 4 },
    tags: ['tree', 'evergreen', 'pine', 'landscape'],
    source: 'builtin',
  },
  {
    id: 'shrub_boxwood_1',
    name: 'Boxwood Shrub',
    description: 'Trimmed boxwood hedge shrub',
    category: 'landscape',
    thumbnail: '/models/thumbnails/shrub_boxwood.png',
    modelUrl: '/models/landscape/shrub_boxwood.glb',
    dimensions: { width: 1, height: 0.8, depth: 1 },
    tags: ['shrub', 'hedge', 'landscape', 'evergreen'],
    source: 'builtin',
  },
  {
    id: 'flower_bed_1',
    name: 'Flower Bed',
    description: 'Rectangular flower bed with seasonal blooms',
    category: 'landscape',
    thumbnail: '/models/thumbnails/flower_bed.png',
    modelUrl: '/models/landscape/flower_bed.glb',
    dimensions: { width: 2, height: 0.5, depth: 1 },
    tags: ['flowers', 'bed', 'landscape', 'garden'],
    source: 'builtin',
  },
  {
    id: 'grass_patch_1',
    name: 'Grass Patch',
    description: 'Natural grass ground cover',
    category: 'landscape',
    thumbnail: '/models/thumbnails/grass.png',
    modelUrl: '/models/landscape/grass_patch.glb',
    dimensions: { width: 5, height: 0.1, depth: 5 },
    tags: ['grass', 'lawn', 'landscape', 'ground'],
    source: 'builtin',
  },

  // Structure assets
  {
    id: 'deck_10x12',
    name: 'Deck 10x12',
    description: 'Composite deck 10ft x 12ft with railings',
    category: 'structure',
    thumbnail: '/models/thumbnails/deck_10x12.png',
    modelUrl: '/models/structures/deck_10x12.glb',
    dimensions: { width: 3.05, height: 0.3, depth: 3.66 },
    tags: ['deck', 'outdoor', 'composite', 'structure'],
    price: 4500,
    source: 'builtin',
  },
  {
    id: 'deck_12x16',
    name: 'Deck 12x16',
    description: 'Composite deck 12ft x 16ft with railings and stairs',
    category: 'structure',
    thumbnail: '/models/thumbnails/deck_12x16.png',
    modelUrl: '/models/structures/deck_12x16.glb',
    dimensions: { width: 3.66, height: 0.3, depth: 4.88 },
    tags: ['deck', 'outdoor', 'composite', 'structure', 'stairs'],
    price: 7200,
    source: 'builtin',
  },
  {
    id: 'fence_section_1',
    name: 'Fence Section (6ft)',
    description: 'Wood privacy fence section, 6ft tall x 8ft wide',
    category: 'structure',
    thumbnail: '/models/thumbnails/fence_section.png',
    modelUrl: '/models/structures/fence_section.glb',
    dimensions: { width: 2.44, height: 1.83, depth: 0.1 },
    tags: ['fence', 'privacy', 'wood', 'structure'],
    price: 180,
    source: 'builtin',
  },
  {
    id: 'pergola_10x10',
    name: 'Pergola 10x10',
    description: 'Cedar pergola with open lattice roof',
    category: 'structure',
    thumbnail: '/models/thumbnails/pergola.png',
    modelUrl: '/models/structures/pergola_10x10.glb',
    dimensions: { width: 3.05, height: 2.74, depth: 3.05 },
    tags: ['pergola', 'shade', 'outdoor', 'structure'],
    price: 2800,
    source: 'builtin',
  },
  {
    id: 'shed_8x10',
    name: 'Storage Shed 8x10',
    description: 'Wood storage shed with double doors',
    category: 'structure',
    thumbnail: '/models/thumbnails/shed_8x10.png',
    modelUrl: '/models/structures/shed_8x10.glb',
    dimensions: { width: 2.44, height: 2.74, depth: 3.05 },
    tags: ['shed', 'storage', 'structure', 'wood'],
    price: 3500,
    source: 'builtin',
  },

  // Exterior assets
  {
    id: 'window_double_1',
    name: 'Double-Hung Window',
    description: 'Standard double-hung window 36" x 60"',
    category: 'exterior',
    thumbnail: '/models/thumbnails/window_double.png',
    modelUrl: '/models/exterior/window_double.glb',
    dimensions: { width: 0.91, height: 1.52, depth: 0.15 },
    tags: ['window', 'exterior', 'glass', 'replacement'],
    price: 450,
    source: 'builtin',
  },
  {
    id: 'door_entry_1',
    name: 'Entry Door',
    description: 'Solid wood entry door with sidelights',
    category: 'exterior',
    thumbnail: '/models/thumbnails/door_entry.png',
    modelUrl: '/models/exterior/door_entry.glb',
    dimensions: { width: 1.07, height: 2.13, depth: 0.05 },
    tags: ['door', 'entry', 'exterior', 'wood'],
    price: 1200,
    source: 'builtin',
  },

  // Interior assets
  {
    id: 'cabinet_base_1',
    name: 'Base Cabinet',
    description: 'Kitchen base cabinet 36" wide',
    category: 'interior',
    thumbnail: '/models/thumbnails/cabinet_base.png',
    modelUrl: '/models/interior/cabinet_base.glb',
    dimensions: { width: 0.91, height: 0.86, depth: 0.61 },
    tags: ['cabinet', 'kitchen', 'interior', 'storage'],
    price: 380,
    source: 'builtin',
  },
];

// ============================================================================
// Default Configuration Export
// ============================================================================

export const DEFAULT_UPLOAD_CONFIG: ModelUploadConfig = {
  maxFileSize: 50 * 1024 * 1024,  // 50 MB
  allowedFormats: ['gltf', 'glb'],
  compressionEnabled: false,
  generateThumbnail: true,
};

// ============================================================================
// Asset Management Functions
// ============================================================================

const STORAGE_KEY_UPLOADED = 'propertymanager_uploaded_models';
const STORAGE_KEY_FAVORITES = 'propertymanager_favorite_assets';

/**
 * Get all available assets (builtin + uploaded)
 */
export function getAllAssets(): ModelAsset[] {
  const uploaded = getUploadedModels();
  const uploadedAssets: ModelAsset[] = uploaded.map((model) => ({
    id: model.id,
    name: model.filename.replace(/\.(gltf|glb)$/i, ''),
    category: 'other',
    thumbnail: model.thumbnailUrl || '/models/thumbnails/default.png',
    modelUrl: model.modelUrl,
    dimensions: { width: 1, height: 1, depth: 1 }, // Unknown dimensions
    tags: ['uploaded', 'custom'],
    source: 'uploaded',
    createdAt: model.uploadedAt,
  }));

  return [...BUILTIN_ASSETS, ...uploadedAssets];
}

/**
 * Get assets by category
 */
export function getAssetsByCategory(category: ModelCategory): ModelAsset[] {
  return getAllAssets().filter((asset) => asset.category === category);
}

/**
 * Search assets by query
 */
export function searchAssets(query: string): ModelAsset[] {
  const lowerQuery = query.toLowerCase();
  return getAllAssets().filter(
    (asset) =>
      asset.name.toLowerCase().includes(lowerQuery) ||
      asset.description?.toLowerCase().includes(lowerQuery) ||
      asset.tags.some((tag) => tag.toLowerCase().includes(lowerQuery))
  );
}

/**
 * Get asset by ID
 */
export function getAssetById(id: string): ModelAsset | undefined {
  return getAllAssets().find((asset) => asset.id === id);
}

/**
 * Filter assets by multiple criteria
 */
export function filterAssets(filters: {
  category?: ModelCategory;
  tags?: string[];
  priceMax?: number;
  source?: ModelAsset['source'];
  searchQuery?: string;
}): ModelAsset[] {
  let assets = getAllAssets();

  if (filters.category) {
    assets = assets.filter((a) => a.category === filters.category);
  }

  if (filters.tags && filters.tags.length > 0) {
    assets = assets.filter((a) =>
      filters.tags!.some((tag) => a.tags.includes(tag))
    );
  }

  if (filters.priceMax !== undefined) {
    assets = assets.filter((a) => !a.price || a.price <= filters.priceMax!);
  }

  if (filters.source) {
    assets = assets.filter((a) => a.source === filters.source);
  }

  if (filters.searchQuery) {
    const query = filters.searchQuery.toLowerCase();
    assets = assets.filter(
      (a) =>
        a.name.toLowerCase().includes(query) ||
        a.description?.toLowerCase().includes(query) ||
        a.tags.some((tag) => tag.toLowerCase().includes(query))
    );
  }

  return assets;
}

// ============================================================================
// Uploaded Model Management
// ============================================================================

/**
 * Get all uploaded models from localStorage
 */
export function getUploadedModels(): UploadedModel[] {
  const stored = localStorage.getItem(STORAGE_KEY_UPLOADED);
  return stored ? JSON.parse(stored) : [];
}

/**
 * Save an uploaded model
 */
export function saveUploadedModel(model: UploadedModel): void {
  const models = getUploadedModels();
  models.push(model);
  localStorage.setItem(STORAGE_KEY_UPLOADED, JSON.stringify(models));
}

/**
 * Delete an uploaded model
 */
export function deleteUploadedModel(id: string): void {
  const models = getUploadedModels().filter((m) => m.id !== id);
  localStorage.setItem(STORAGE_KEY_UPLOADED, JSON.stringify(models));
}

/**
 * Get uploaded model by ID
 */
export function getUploadedModelById(id: string): UploadedModel | undefined {
  return getUploadedModels().find((m) => m.id === id);
}

// ============================================================================
// Favorites Management
// ============================================================================

/**
 * Get favorite asset IDs
 */
export function getFavoriteAssetIds(): string[] {
  const stored = localStorage.getItem(STORAGE_KEY_FAVORITES);
  return stored ? JSON.parse(stored) : [];
}

/**
 * Add asset to favorites
 */
export function addFavoriteAsset(assetId: string): void {
  const favorites = getFavoriteAssetIds();
  if (!favorites.includes(assetId)) {
    favorites.push(assetId);
    localStorage.setItem(STORAGE_KEY_FAVORITES, JSON.stringify(favorites));
  }
}

/**
 * Remove asset from favorites
 */
export function removeFavoriteAsset(assetId: string): void {
  const favorites = getFavoriteAssetIds().filter((id) => id !== assetId);
  localStorage.setItem(STORAGE_KEY_FAVORITES, JSON.stringify(favorites));
}

/**
 * Check if asset is favorited
 */
export function isAssetFavorited(assetId: string): boolean {
  return getFavoriteAssetIds().includes(assetId);
}

/**
 * Get favorite assets
 */
export function getFavoriteAssets(): ModelAsset[] {
  const favoriteIds = getFavoriteAssetIds();
  return getAllAssets().filter((asset) => favoriteIds.includes(asset.id));
}

// ============================================================================
// Category Helpers
// ============================================================================

/**
 * Get all available categories with asset counts
 */
export function getCategoriesWithCounts(): Array<{
  category: ModelCategory;
  count: number;
  label: string;
}> {
  const assets = getAllAssets();
  const categories: ModelCategory[] = [
    'landscape',
    'structure',
    'exterior',
    'interior',
    'furniture',
    'other',
  ];

  return categories.map((category) => ({
    category,
    count: assets.filter((a) => a.category === category).length,
    label: getCategoryLabel(category),
  }));
}

/**
 * Get human-readable label for category
 */
export function getCategoryLabel(category: ModelCategory): string {
  const labels: Record<ModelCategory, string> = {
    landscape: 'Landscape',
    structure: 'Structures',
    exterior: 'Exterior',
    interior: 'Interior',
    furniture: 'Furniture',
    other: 'Other',
  };
  return labels[category];
}

/**
 * Get icon for category
 */
export function getCategoryIcon(category: ModelCategory): string {
  const icons: Record<ModelCategory, string> = {
    landscape: '🌳',
    structure: '🏗️',
    exterior: '🏠',
    interior: '🛋️',
    furniture: '🪑',
    other: '📦',
  };
  return icons[category];
}

// ============================================================================
// Validation and Utilities
// ============================================================================

/**
 * Validate model file format
 */
export function isValidModelFormat(filename: string): boolean {
  const ext = filename.toLowerCase().split('.').pop();
  return ext === 'gltf' || ext === 'glb';
}

/**
 * Get model format from filename
 */
export function getModelFormat(filename: string): 'gltf' | 'glb' | null {
  const ext = filename.toLowerCase().split('.').pop();
  if (ext === 'gltf' || ext === 'glb') {
    return ext;
  }
  return null;
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

/**
 * Generate unique ID for uploaded model
 */
export function generateModelId(): string {
  return `model_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
