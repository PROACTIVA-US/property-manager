import { useState, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import {
  getAllImages,
  getImagesByCategory,
  uploadImage,
  deleteImage,
  toggleFavorite,
  setPrimaryImage,
  updateImage,
  getTotalStorageUsed,
  formatFileSize,
  type PropertyImage,
  type ImageCategory,
  CATEGORY_LABELS,
} from '../../lib/property-gallery';

interface PropertyGalleryProps {
  relatedProjectId?: string;
  allowUpload?: boolean;
  maxImages?: number;
}

export function PropertyGallery({ relatedProjectId, allowUpload = true, maxImages }: PropertyGalleryProps) {
  const { user } = useAuth();
  const [images, setImages] = useState<PropertyImage[]>(getAllImages());
  const [selectedCategory, setSelectedCategory] = useState<ImageCategory | 'all'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [lightboxImage, setLightboxImage] = useState<PropertyImage | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredImages = selectedCategory === 'all'
    ? images
    : getImagesByCategory(selectedCategory);

  const displayImages = relatedProjectId
    ? filteredImages.filter(img => img.relatedProjectId === relatedProjectId)
    : filteredImages;

  const limitedImages = maxImages
    ? displayImages.slice(0, maxImages)
    : displayImages;

  const storageUsed = getTotalStorageUsed();
  const storageLimit = 50 * 1024 * 1024; // 50MB limit
  const storagePercent = (storageUsed / storageLimit) * 100;

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || !user) return;

    setUploading(true);

    for (const file of Array.from(files)) {
      const result = await uploadImage(file, {
        category: selectedCategory === 'all' ? 'other' : selectedCategory,
        uploadedBy: user.displayName,
        relatedProjectId,
      });

      if ('error' in result) {
        alert(result.error);
      }
    }

    setImages(getAllImages());
    setUploading(false);

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDelete = (imageId: string) => {
    if (confirm('Delete this image?')) {
      deleteImage(imageId);
      setImages(getAllImages());
    }
  };

  const handleToggleFavorite = (imageId: string) => {
    toggleFavorite(imageId);
    setImages(getAllImages());
  };

  const handleSetPrimary = (imageId: string) => {
    setPrimaryImage(imageId);
    setImages(getAllImages());
  };

  const handleUpdateDescription = (imageId: string, description: string) => {
    updateImage(imageId, { description });
    setImages(getAllImages());
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Property Gallery</h3>
            <p className="text-sm text-gray-500 mt-1">
              {displayImages.length} image{displayImages.length !== 1 ? 's' : ''} •{' '}
              {formatFileSize(storageUsed)} / {formatFileSize(storageLimit)} used
            </p>
          </div>

          {allowUpload && (
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading || storagePercent >= 100}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              {uploading ? 'Uploading...' : 'Upload Images'}
            </button>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>

        {/* Storage Bar */}
        {storagePercent > 50 && (
          <div className="mb-4">
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all ${
                  storagePercent >= 90 ? 'bg-red-600' : storagePercent >= 70 ? 'bg-orange-500' : 'bg-blue-600'
                }`}
                style={{ width: `${Math.min(storagePercent, 100)}%` }}
              />
            </div>
            {storagePercent >= 90 && (
              <p className="text-xs text-red-600 mt-1">Storage almost full. Consider deleting unused images.</p>
            )}
          </div>
        )}

        {/* Filters and View Mode */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 overflow-x-auto">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1 rounded-full text-sm whitespace-nowrap transition ${
                selectedCategory === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              All ({images.length})
            </button>
            {(Object.keys(CATEGORY_LABELS) as ImageCategory[]).map(category => {
              const count = getImagesByCategory(category).length;
              if (count === 0) return null;

              return (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-3 py-1 rounded-full text-sm whitespace-nowrap transition ${
                    selectedCategory === category
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {CATEGORY_LABELS[category]} ({count})
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded transition ${
                viewMode === 'grid' ? 'bg-white shadow-sm' : 'text-gray-600 hover:text-gray-900'
              }`}
              title="Grid view"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded transition ${
                viewMode === 'list' ? 'bg-white shadow-sm' : 'text-gray-600 hover:text-gray-900'
              }`}
              title="List view"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Images */}
      <div className="p-6">
        {limitedImages.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-5xl mb-3">📸</div>
            <h4 className="text-lg font-medium text-gray-900 mb-1">No images yet</h4>
            <p className="text-sm text-gray-500 mb-4">
              {allowUpload ? 'Upload your first property photo to get started' : 'No images in this category'}
            </p>
            {allowUpload && (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Upload Now
              </button>
            )}
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {limitedImages.map(image => (
              <ImageCard
                key={image.id}
                image={image}
                onView={() => setLightboxImage(image)}
                onDelete={() => handleDelete(image.id)}
                onToggleFavorite={() => handleToggleFavorite(image.id)}
                onSetPrimary={() => handleSetPrimary(image.id)}
              />
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {limitedImages.map(image => (
              <ImageListItem
                key={image.id}
                image={image}
                onView={() => setLightboxImage(image)}
                onDelete={() => handleDelete(image.id)}
                onToggleFavorite={() => handleToggleFavorite(image.id)}
                onSetPrimary={() => handleSetPrimary(image.id)}
                onUpdateDescription={(desc) => handleUpdateDescription(image.id, desc)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightboxImage && (
        <ImageLightbox image={lightboxImage} onClose={() => setLightboxImage(null)} />
      )}
    </div>
  );
}

// Image Card Component (Grid View)
function ImageCard({
  image,
  onView,
  onDelete,
  onToggleFavorite,
  onSetPrimary,
}: {
  image: PropertyImage;
  onView: () => void;
  onDelete: () => void;
  onToggleFavorite: () => void;
  onSetPrimary: () => void;
}) {
  return (
    <div className="group relative aspect-square rounded-lg overflow-hidden bg-gray-100 cursor-pointer">
      {/* Image */}
      <img
        src={image.dataUrl}
        alt={image.description || CATEGORY_LABELS[image.category]}
        className="w-full h-full object-cover transition group-hover:scale-105"
        onClick={onView}
      />

      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition">
        {/* Top badges */}
        <div className="absolute top-2 left-2 flex flex-wrap gap-1">
          {image.isPrimary && (
            <span className="px-2 py-0.5 bg-yellow-500 text-white text-xs font-medium rounded">
              Primary
            </span>
          )}
          {image.isBeforeImage && (
            <span className="px-2 py-0.5 bg-purple-500 text-white text-xs font-medium rounded">
              Before
            </span>
          )}
          {image.isAfterImage && (
            <span className="px-2 py-0.5 bg-green-500 text-white text-xs font-medium rounded">
              After
            </span>
          )}
        </div>

        {/* Favorite button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite();
          }}
          className="absolute top-2 right-2"
        >
          <svg
            className={`h-6 w-6 ${image.isFavorite ? 'text-yellow-400 fill-current' : 'text-white'}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
          </svg>
        </button>

        {/* Bottom info and actions */}
        <div className="absolute bottom-0 left-0 right-0 p-3">
          <p className="text-white text-sm font-medium truncate mb-2">
            {CATEGORY_LABELS[image.category]}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onSetPrimary();
              }}
              className="flex-1 px-2 py-1 bg-white/20 hover:bg-white/30 text-white text-xs rounded transition backdrop-blur-sm"
            >
              Set Primary
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className="px-2 py-1 bg-red-500/80 hover:bg-red-600 text-white text-xs rounded transition"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Image List Item Component (List View)
function ImageListItem({
  image,
  onView,
  onDelete,
  onToggleFavorite,
  onSetPrimary,
  onUpdateDescription,
}: {
  image: PropertyImage;
  onView: () => void;
  onDelete: () => void;
  onToggleFavorite: () => void;
  onSetPrimary: () => void;
  onUpdateDescription: (description: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [description, setDescription] = useState(image.description);

  const handleSave = () => {
    onUpdateDescription(description);
    setEditing(false);
  };

  return (
    <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
      {/* Thumbnail */}
      <img
        src={image.dataUrl}
        alt={image.description || CATEGORY_LABELS[image.category]}
        className="w-20 h-20 object-cover rounded cursor-pointer"
        onClick={onView}
      />

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h4 className="font-medium text-gray-900">{CATEGORY_LABELS[image.category]}</h4>
          {image.isPrimary && (
            <span className="px-2 py-0.5 bg-yellow-100 text-yellow-800 text-xs font-medium rounded">
              Primary
            </span>
          )}
          <button onClick={onToggleFavorite}>
            <svg
              className={`h-5 w-5 ${image.isFavorite ? 'text-yellow-500 fill-current' : 'text-gray-400'}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
          </button>
        </div>

        {editing ? (
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
              placeholder="Add description..."
            />
            <button
              onClick={handleSave}
              className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
            >
              Save
            </button>
            <button
              onClick={() => {
                setDescription(image.description);
                setEditing(false);
              }}
              className="px-3 py-1 bg-gray-300 text-gray-700 text-sm rounded hover:bg-gray-400"
            >
              Cancel
            </button>
          </div>
        ) : (
          <p className="text-sm text-gray-600">
            {image.description || (
              <button
                onClick={() => setEditing(true)}
                className="text-blue-600 hover:text-blue-700"
              >
                Add description
              </button>
            )}
          </p>
        )}

        <p className="text-xs text-gray-500 mt-1">
          {formatFileSize(image.fileSize)} • {new Date(image.uploadedAt).toLocaleDateString()}
        </p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        {!image.isPrimary && (
          <button
            onClick={onSetPrimary}
            className="px-3 py-1 bg-gray-200 text-gray-700 text-sm rounded hover:bg-gray-300"
          >
            Set Primary
          </button>
        )}
        <button
          onClick={onDelete}
          className="px-3 py-1 bg-red-100 text-red-700 text-sm rounded hover:bg-red-200"
        >
          Delete
        </button>
      </div>
    </div>
  );
}

// Lightbox Component
function ImageLightbox({ image, onClose }: { image: PropertyImage; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90" onClick={onClose}>
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white hover:text-gray-300 transition"
      >
        <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      <div className="max-w-5xl max-h-[90vh] p-4" onClick={(e) => e.stopPropagation()}>
        <img
          src={image.dataUrl}
          alt={image.description || CATEGORY_LABELS[image.category]}
          className="max-w-full max-h-[80vh] object-contain rounded-lg"
        />
        <div className="mt-4 text-white text-center">
          <h3 className="text-lg font-semibold">{CATEGORY_LABELS[image.category]}</h3>
          {image.description && <p className="text-sm text-gray-300 mt-1">{image.description}</p>}
          <p className="text-xs text-gray-400 mt-2">
            {image.width} × {image.height} • {formatFileSize(image.fileSize)} •{' '}
            {new Date(image.uploadedAt).toLocaleDateString()}
          </p>
        </div>
      </div>
    </div>
  );
}
