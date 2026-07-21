import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getAllImages,
  getFavoriteImages,
  getPrimaryImages,
  CATEGORY_LABELS,
  type PropertyImage,
} from '../../lib/property-gallery';

interface ImageCarouselProps {
  autoPlay?: boolean;
  autoPlayInterval?: number;
  showFavoritesOnly?: boolean;
  showPrimaryOnly?: boolean;
  maxImages?: number;
  height?: string;
  showControls?: boolean;
  showIndicators?: boolean;
  showCaption?: boolean;
}

export function ImageCarousel({
  autoPlay = true,
  autoPlayInterval = 5000,
  showFavoritesOnly = false,
  showPrimaryOnly = false,
  maxImages = 10,
  height = '400px',
  showControls = true,
  showIndicators = true,
  showCaption = true,
}: ImageCarouselProps) {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  // Get images based on filters
  const getImages = useCallback((): PropertyImage[] => {
    let images: PropertyImage[];

    if (showFavoritesOnly) {
      images = getFavoriteImages();
    } else if (showPrimaryOnly) {
      images = getPrimaryImages();
    } else {
      images = getAllImages();
    }

    return images.slice(0, maxImages);
  }, [showFavoritesOnly, showPrimaryOnly, maxImages]);

  const [images, setImages] = useState<PropertyImage[]>(getImages());

  useEffect(() => {
    setImages(getImages());
  }, [getImages]);

  // Auto-play functionality
  useEffect(() => {
    if (!autoPlay || isHovered || images.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, autoPlayInterval);

    return () => clearInterval(interval);
  }, [autoPlay, autoPlayInterval, isHovered, images.length]);

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const goToIndex = (index: number) => {
    setCurrentIndex(index);
  };

  if (images.length === 0) {
    return (
      <div
        className="relative rounded-lg overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center"
        style={{ height }}
      >
        <div className="text-center p-8">
          <div className="text-6xl mb-4">📸</div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">No Property Images</h3>
          <p className="text-sm text-gray-600 mb-4">
            Upload some photos to see them in the gallery carousel
          </p>
          <button
            onClick={() => navigate('/gallery')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Go to Gallery
          </button>
        </div>
      </div>
    );
  }

  const currentImage = images[currentIndex];

  return (
    <div
      className="relative rounded-lg overflow-hidden group"
      style={{ height }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Images */}
      <div className="relative w-full h-full">
        {images.map((image, index) => (
          <div
            key={image.id}
            className={`absolute inset-0 transition-opacity duration-500 ${
              index === currentIndex ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <img
              src={image.dataUrl}
              alt={image.description || CATEGORY_LABELS[image.category]}
              className="w-full h-full object-cover"
            />

            {/* Gradient overlay for caption */}
            {showCaption && (
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            )}
          </div>
        ))}
      </div>

      {/* Navigation Controls */}
      {showControls && images.length > 1 && (
        <>
          <button
            onClick={goToPrevious}
            className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-white/80 hover:bg-white text-gray-800 rounded-full shadow-lg transition opacity-0 group-hover:opacity-100"
            aria-label="Previous image"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <button
            onClick={goToNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white/80 hover:bg-white text-gray-800 rounded-full shadow-lg transition opacity-0 group-hover:opacity-100"
            aria-label="Next image"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </>
      )}

      {/* Caption */}
      {showCaption && currentImage && (
        <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-lg font-semibold">
              {CATEGORY_LABELS[currentImage.category]}
            </h3>
            {currentImage.isFavorite && (
              <svg className="h-5 w-5 text-yellow-400 fill-current" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            )}
            {currentImage.isPrimary && (
              <span className="px-2 py-0.5 bg-yellow-500 text-white text-xs font-medium rounded">
                Primary
              </span>
            )}
          </div>

          {currentImage.description && (
            <p className="text-sm text-white/90 mb-2">{currentImage.description}</p>
          )}

          <div className="flex items-center justify-between">
            <p className="text-xs text-white/70">
              {new Date(currentImage.uploadedAt).toLocaleDateString()}
            </p>

            <button
              onClick={() => navigate('/gallery')}
              className="text-xs text-white/90 hover:text-white font-medium flex items-center gap-1 transition"
            >
              View Gallery
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Indicators */}
      {showIndicators && images.length > 1 && (
        <div className="absolute bottom-20 left-0 right-0 flex items-center justify-center gap-2 px-4">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => goToIndex(index)}
              className={`h-2 rounded-full transition-all ${
                index === currentIndex
                  ? 'w-8 bg-white'
                  : 'w-2 bg-white/50 hover:bg-white/75'
              }`}
              aria-label={`Go to image ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* Auto-play indicator */}
      {autoPlay && !isHovered && images.length > 1 && (
        <div className="absolute top-4 right-4 px-3 py-1 bg-black/40 text-white text-xs rounded-full backdrop-blur-sm">
          Auto-play
        </div>
      )}

      {/* Image counter */}
      {images.length > 1 && (
        <div className="absolute top-4 left-4 px-3 py-1 bg-black/40 text-white text-xs rounded-full backdrop-blur-sm">
          {currentIndex + 1} / {images.length}
        </div>
      )}
    </div>
  );
}

// Compact version for smaller spaces
export function ImageCarouselCompact({ maxImages = 5 }: { maxImages?: number }) {
  return (
    <ImageCarousel
      autoPlay={true}
      autoPlayInterval={4000}
      showFavoritesOnly={false}
      showPrimaryOnly={true}
      maxImages={maxImages}
      height="200px"
      showControls={false}
      showIndicators={true}
      showCaption={false}
    />
  );
}
