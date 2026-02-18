import { useState, useRef, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ChevronLeft,
  Star,
  Phone,
  Mail,
  Shield,
  Clock,
  Upload,
  X,
  ChevronRight,
  Image as ImageIcon,
  GripVertical,
  Pause,
  Play,
  Trash2,
} from 'lucide-react';
import { getVendorById, SPECIALTY_LABELS, RESPONSE_TIME_LABELS } from '../lib/vendors';
import type { Vendor } from '../lib/vendors';
import {
  type GalleryImage,
  loadGalleryImages as loadGallery,
  uploadGalleryImages,
  deleteGalleryImage as deleteImage,
  deleteAllGalleryImages,
  reorderGalleryImages,
} from '../lib/vendorGallery';

// ============ Gallery Categories per Vendor ============

const VENDOR_GALLERY_CONFIG: Record<string, string[]> = {
  'vendor-dan': ['Remodels', 'Decks', 'Siding'],
};

const DEFAULT_CATEGORIES = ['Completed Work', 'In Progress', 'Before & After'];

// ============ Lightbox Component ============

function GalleryLightbox({
  images,
  initialIndex,
  onClose,
}: {
  images: GalleryImage[];
  initialIndex: number;
  onClose: () => void;
}) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') setCurrentIndex(i => (i > 0 ? i - 1 : images.length - 1));
      if (e.key === 'ArrowRight') setCurrentIndex(i => (i < images.length - 1 ? i + 1 : 0));
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [images.length, onClose]);

  return (
    <div
      className="fixed inset-0 bg-black/90 z-[60] flex items-center justify-center"
      onClick={onClose}
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 p-2 text-white/70 hover:text-white bg-white/10 rounded-full transition-colors z-10"
      >
        <X size={24} />
      </button>

      {images.length > 1 && (
        <>
          <button
            onClick={e => { e.stopPropagation(); setCurrentIndex(i => (i > 0 ? i - 1 : images.length - 1)); }}
            className="absolute left-4 p-3 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 rounded-full transition-colors z-10"
          >
            <ChevronLeft size={28} />
          </button>
          <button
            onClick={e => { e.stopPropagation(); setCurrentIndex(i => (i < images.length - 1 ? i + 1 : 0)); }}
            className="absolute right-4 p-3 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 rounded-full transition-colors z-10"
          >
            <ChevronRight size={28} />
          </button>
        </>
      )}

      <div className="max-w-[90vw] max-h-[85vh] flex flex-col items-center" onClick={e => e.stopPropagation()}>
        <img
          src={images[currentIndex]?.url}
          alt={`Gallery image ${currentIndex + 1}`}
          className="max-w-full max-h-[80vh] object-contain rounded-lg"
        />
        <p className="text-white/60 text-sm mt-3">
          {currentIndex + 1} / {images.length}
        </p>
      </div>
    </div>
  );
}

// ============ Slideshow Card ============

function SlideshowCard({
  category,
  images,
  onUpload,
  onOpenGallery,
}: {
  category: string;
  images: GalleryImage[];
  onUpload: (category: string, files: FileList) => void;
  onOpenGallery: (category: string) => void;
}) {
  const [slideIndex, setSlideIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-advance slideshow
  useEffect(() => {
    if (images.length <= 1 || paused) return;
    const interval = setInterval(() => {
      setSlideIndex(i => (i + 1) % images.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [images.length, paused]);

  // Clamp index if images change
  useEffect(() => {
    if (slideIndex >= images.length && images.length > 0) {
      setSlideIndex(0);
    }
  }, [images.length, slideIndex]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onUpload(category, e.target.files);
      e.target.value = '';
    }
  };

  const currentImage = images[slideIndex];

  return (
    <div className="flex-1 min-w-0">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-semibold text-cc-text">{category}</h4>
        <span className="text-xs text-cc-muted">{images.length} photo{images.length !== 1 ? 's' : ''}</span>
      </div>

      {/* Slideshow / Upload Area */}
      {currentImage ? (
        <div
          className="relative aspect-[4/3] rounded-lg overflow-hidden cursor-pointer group"
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          onClick={() => onOpenGallery(category)}
        >
          {/* Crossfade images */}
          {images.map((img, idx) => (
            <img
              key={img.id}
              src={img.url}
              alt={`${category} ${idx + 1}`}
              className="absolute inset-0 w-full h-full object-cover transition-opacity duration-700"
              style={{ opacity: idx === slideIndex ? 1 : 0 }}
            />
          ))}

          {/* Overlay on hover */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
            <span className="text-white opacity-0 group-hover:opacity-100 transition-opacity text-sm font-medium">
              {images.length > 1 ? `View all ${images.length}` : 'View'}
            </span>
          </div>

          {/* Slideshow controls */}
          {images.length > 1 && hovered && (
            <div className="absolute bottom-2 left-0 right-0 flex items-center justify-center gap-2" onClick={e => e.stopPropagation()}>
              {/* Pause/Play */}
              <button
                onClick={() => setPaused(p => !p)}
                className="p-1 bg-black/50 rounded-full text-white/80 hover:text-white transition-colors"
              >
                {paused ? <Play size={12} /> : <Pause size={12} />}
              </button>
              {/* Dots */}
              <div className="flex gap-1">
                {images.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSlideIndex(idx)}
                    className={`w-1.5 h-1.5 rounded-full transition-colors ${idx === slideIndex ? 'bg-white' : 'bg-white/40'}`}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="aspect-[4/3] rounded-lg border-2 border-dashed border-cc-border hover:border-cc-accent/50 flex flex-col items-center justify-center cursor-pointer transition-colors bg-cc-bg/30"
        >
          <ImageIcon size={32} className="text-cc-muted mb-2" />
          <span className="text-xs text-cc-muted">Add photos</span>
        </div>
      )}

      {/* Upload button */}
      <button
        onClick={() => fileInputRef.current?.click()}
        className="mt-2 w-full flex items-center justify-center gap-1 text-xs text-cc-muted hover:text-cc-accent py-1.5 rounded-lg border border-cc-border/50 hover:border-cc-accent/30 transition-colors"
      >
        <Upload size={12} />
        Add photos
      </button>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  );
}

// ============ Expanded Gallery Modal with Reorder ============

function ExpandedGalleryModal({
  category,
  images,
  onClose,
  onReorder,
  onDelete,
  onDeleteAll,
  onUpload,
}: {
  category: string;
  images: GalleryImage[];
  onClose: () => void;
  onReorder: (category: string, fromIndex: number, toIndex: number) => void;
  onDelete: (imageId: string) => void;
  onDeleteAll: (category: string) => void;
  onUpload: (category: string, files: FileList) => void;
}) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [confirmDeleteAll, setConfirmDeleteAll] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragStart = (idx: number) => {
    setDragIndex(idx);
  };

  const handleDragOver = (e: React.DragEvent, idx: number) => {
    e.preventDefault();
    setDragOverIndex(idx);
  };

  const handleDrop = (idx: number) => {
    if (dragIndex !== null && dragIndex !== idx) {
      onReorder(category, dragIndex, idx);
    }
    setDragIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDragIndex(null);
    setDragOverIndex(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onUpload(category, e.target.files);
      e.target.value = '';
    }
  };

  return (
    <>
      <div
        className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <div
          className="bg-cc-surface border border-cc-border rounded-xl w-full max-w-3xl max-h-[85vh] flex flex-col shadow-2xl"
          onClick={e => e.stopPropagation()}
        >
          <div className="flex items-center justify-between p-4 border-b border-cc-border">
            <div>
              <h3 className="text-lg font-bold text-cc-text">{category}</h3>
              <p className="text-xs text-cc-muted mt-0.5">Drag to reorder, click to view full size</p>
            </div>
            <div className="flex items-center gap-2">
              {images.length > 0 && !confirmDeleteAll && (
                <button
                  onClick={() => setConfirmDeleteAll(true)}
                  className="flex items-center gap-1 px-3 py-1.5 text-sm text-red-400 bg-red-500/10 rounded-lg hover:bg-red-500/20 transition-colors"
                >
                  <Trash2 size={14} />
                  Delete All
                </button>
              )}
              {confirmDeleteAll && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-red-400">Delete all {images.length} photos?</span>
                  <button
                    onClick={() => { onDeleteAll(category); setConfirmDeleteAll(false); }}
                    className="px-2 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                  >
                    Yes, delete
                  </button>
                  <button
                    onClick={() => setConfirmDeleteAll(false)}
                    className="px-2 py-1 text-xs bg-cc-border text-cc-text rounded hover:bg-cc-muted transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              )}
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-1 px-3 py-1.5 text-sm text-cc-accent bg-cc-accent/10 rounded-lg hover:bg-cc-accent/20 transition-colors"
              >
                <Upload size={14} />
                Upload
              </button>
              <button
                onClick={onClose}
                className="p-1.5 text-cc-muted hover:text-cc-text transition-colors"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {images.length === 0 ? (
              <div className="text-center py-12 text-cc-muted">
                <ImageIcon size={48} className="mx-auto mb-3 opacity-50" />
                <p>No photos yet</p>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="mt-3 text-sm text-cc-accent hover:text-indigo-300"
                >
                  Upload your first photo
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {images.map((img, idx) => (
                  <div
                    key={img.id}
                    draggable
                    onDragStart={() => handleDragStart(idx)}
                    onDragOver={e => handleDragOver(e, idx)}
                    onDrop={() => handleDrop(idx)}
                    onDragEnd={handleDragEnd}
                    className={`relative aspect-[4/3] rounded-lg overflow-hidden cursor-grab active:cursor-grabbing group transition-all ${
                      dragIndex === idx ? 'opacity-40 scale-95' : ''
                    } ${dragOverIndex === idx && dragIndex !== idx ? 'ring-2 ring-cc-accent' : ''}`}
                  >
                    <img
                      src={img.url}
                      alt={`${category} ${idx + 1}`}
                      className="w-full h-full object-cover"
                      onClick={() => setLightboxIndex(idx)}
                    />
                    {/* Drag handle */}
                    <div className="absolute top-2 left-2 p-1 bg-black/50 rounded text-white/70 opacity-0 group-hover:opacity-100 transition-opacity">
                      <GripVertical size={14} />
                    </div>
                    {/* Order badge */}
                    <div className="absolute bottom-2 left-2 px-1.5 py-0.5 bg-black/60 rounded text-white/80 text-[10px] font-medium">
                      {idx + 1}
                    </div>
                    {/* Delete */}
                    <button
                      onClick={e => { e.stopPropagation(); onDelete(img.id); }}
                      className="absolute top-2 right-2 p-1.5 bg-red-600/80 hover:bg-red-600 text-white rounded-lg transition-colors"
                      title="Delete image"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={handleFileChange}
      />

      {lightboxIndex !== null && (
        <GalleryLightbox
          images={images}
          initialIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
        />
      )}
    </>
  );
}

// ============ Main Vendor Profile Page ============

export default function VendorProfile() {
  const { vendorId } = useParams<{ vendorId: string }>();
  const navigate = useNavigate();

  const vendor: Vendor | undefined = vendorId ? getVendorById(vendorId) : undefined;

  const [images, setImages] = useState<GalleryImage[]>([]);
  const [openCategory, setOpenCategory] = useState<string | null>(null);

  // Load images on mount (async for Supabase support)
  useEffect(() => {
    if (vendorId) {
      loadGallery(vendorId).then(setImages);
    }
  }, [vendorId]);

  const handleUpload = useCallback(async (category: string, files: FileList) => {
    if (!vendorId) return;
    const updated = await uploadGalleryImages(vendorId, category, files, images);
    setImages(updated);
  }, [images, vendorId]);

  const handleDelete = useCallback(async (imageId: string) => {
    if (!vendorId) return;
    const updated = await deleteImage(vendorId, imageId, images);
    setImages(updated);
  }, [images, vendorId]);

  const handleDeleteAll = useCallback(async (category: string) => {
    if (!vendorId) return;
    const updated = await deleteAllGalleryImages(vendorId, category, images);
    setImages(updated);
  }, [images, vendorId]);

  const handleReorder = useCallback((category: string, fromIndex: number, toIndex: number) => {
    if (!vendorId) return;
    const updated = reorderGalleryImages(vendorId, category, fromIndex, toIndex, images);
    setImages(updated);
  }, [images, vendorId]);

  const getImagesForCategory = (category: string) =>
    images.filter(img => img.category === category).sort((a, b) => a.order - b.order);

  if (!vendor) {
    return (
      <div className="space-y-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1 text-cc-muted hover:text-cc-text transition-colors"
        >
          <ChevronLeft size={20} />
          Back
        </button>
        <div className="text-center py-16">
          <h2 className="text-xl font-bold text-cc-text">Vendor Not Found</h2>
          <p className="text-cc-muted mt-2">This vendor doesn't exist or has been removed.</p>
        </div>
      </div>
    );
  }

  const categories = VENDOR_GALLERY_CONFIG[vendor.id] || DEFAULT_CATEGORIES;

  const renderStars = (rating: number) =>
    Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        size={16}
        className={i < Math.round(rating) ? 'text-yellow-400 fill-yellow-400' : 'text-cc-border'}
      />
    ));

  return (
    <div className="space-y-6">
      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1 text-cc-muted hover:text-cc-text transition-colors"
      >
        <ChevronLeft size={20} />
        Back
      </button>

      {/* Vendor Header - Compact */}
      <div className="card !py-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-cc-accent/20 flex items-center justify-center text-cc-accent text-xl font-bold flex-shrink-0">
            {vendor.name.charAt(0)}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-xl font-bold text-cc-text">{vendor.companyName || vendor.name}</h1>
              {vendor.isPreferred && (
                <span className="px-2 py-0.5 text-[10px] font-medium bg-yellow-500/20 text-yellow-400 rounded-full">
                  Preferred
                </span>
              )}
              {vendor.averageRating && (
                <div className="flex items-center gap-1">
                  <div className="flex">{renderStars(vendor.averageRating)}</div>
                  <span className="text-xs text-cc-text font-medium">{vendor.averageRating}</span>
                </div>
              )}
            </div>
            <div className="flex items-center gap-3 mt-1 flex-wrap text-xs text-cc-muted">
              <span>{vendor.name} &bull; {SPECIALTY_LABELS[vendor.specialty]}</span>
              <span className="text-cc-border">|</span>
              <a href={`tel:${vendor.phone}`} className="flex items-center gap-1 hover:text-cc-accent transition-colors">
                <Phone size={11} /> {vendor.phone}
              </a>
              <a href={`mailto:${vendor.email}`} className="flex items-center gap-1 hover:text-cc-accent transition-colors">
                <Mail size={11} /> {vendor.email}
              </a>
              {vendor.responseTime && (
                <><span className="text-cc-border">|</span><span className="flex items-center gap-1"><Clock size={11} /> {RESPONSE_TIME_LABELS[vendor.responseTime]}</span></>
              )}
              {vendor.licenseNumber && (
                <><span className="text-cc-border">|</span><span className="flex items-center gap-1"><Shield size={11} /> {vendor.licenseNumber}</span></>
              )}
              {vendor.insuranceExpiry && (
                <><span className="text-cc-border">|</span><span>Insured until {new Date(vendor.insuranceExpiry).toLocaleDateString()}</span></>
              )}
            </div>
            {vendor.notes && (
              <p className="text-xs text-cc-muted mt-2">{vendor.notes}</p>
            )}
          </div>
        </div>
      </div>

      {/* Example Work Gallery */}
      <div className="card">
        <h3 className="text-lg font-bold text-cc-text mb-4">Example Work</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {categories.map(category => (
            <SlideshowCard
              key={category}
              category={category}
              images={getImagesForCategory(category)}
              onUpload={handleUpload}
              onOpenGallery={setOpenCategory}
            />
          ))}
        </div>
      </div>

      {/* Expanded Gallery Modal */}
      {openCategory && (
        <ExpandedGalleryModal
          category={openCategory}
          images={getImagesForCategory(openCategory)}
          onClose={() => setOpenCategory(null)}
          onReorder={handleReorder}
          onDelete={handleDelete}
          onDeleteAll={handleDeleteAll}
          onUpload={handleUpload}
        />
      )}
    </div>
  );
}
