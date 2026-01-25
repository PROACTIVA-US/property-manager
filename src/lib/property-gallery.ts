/**
 * Property Gallery System
 * Manages property photos with categorization and before/after comparisons
 */

export type ImageCategory =
  | 'exterior_front'
  | 'exterior_back'
  | 'exterior_side'
  | 'living_room'
  | 'kitchen'
  | 'bedroom_1'
  | 'bedroom_2'
  | 'bedroom_3'
  | 'bathroom'
  | 'basement'
  | 'garage'
  | 'yard'
  | 'other';

export const CATEGORY_LABELS: Record<ImageCategory, string> = {
  exterior_front: 'Front Exterior',
  exterior_back: 'Back Exterior',
  exterior_side: 'Side Exterior',
  living_room: 'Living Room',
  kitchen: 'Kitchen',
  bedroom_1: 'Bedroom 1',
  bedroom_2: 'Bedroom 2',
  bedroom_3: 'Bedroom 3',
  bathroom: 'Bathroom',
  basement: 'Basement',
  garage: 'Garage',
  yard: 'Yard',
  other: 'Other',
};

export interface PropertyImage {
  id: string;
  category: ImageCategory;
  description: string;
  dataUrl: string; // Base64 encoded image
  fileName: string;
  fileSize: number;
  mimeType: string;
  uploadedAt: string;
  uploadedBy: string;
  tags: string[];

  // For before/after comparisons
  isBeforeImage?: boolean;
  isAfterImage?: boolean;
  relatedProjectId?: string;
  beforeImageId?: string; // Reference to before image if this is an after image

  // Image metadata
  width?: number;
  height?: number;
  isFavorite: boolean;
  isPrimary: boolean; // Primary image for the category
}

export interface ImageUploadOptions {
  category: ImageCategory;
  description?: string;
  tags?: string[];
  isBeforeImage?: boolean;
  relatedProjectId?: string;
  uploadedBy: string;
}

// Storage key
const GALLERY_KEY = 'pm_property_gallery';

// Maximum file size (5MB)
const MAX_FILE_SIZE = 5 * 1024 * 1024;

// Allowed mime types
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];

// ============ Core Functions ============

export function getAllImages(): PropertyImage[] {
  const data = localStorage.getItem(GALLERY_KEY);
  const images: PropertyImage[] = data ? JSON.parse(data) : [];

  // Sort by upload date (newest first)
  return images.sort((a, b) =>
    new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
  );
}

export function saveImages(images: PropertyImage[]): void {
  localStorage.setItem(GALLERY_KEY, JSON.stringify(images));
}

export function getImagesByCategory(category: ImageCategory): PropertyImage[] {
  return getAllImages().filter(img => img.category === category);
}

export function getImagesByProject(projectId: string): PropertyImage[] {
  return getAllImages().filter(img => img.relatedProjectId === projectId);
}

export function getBeforeAfterPairs(): Array<{
  before: PropertyImage;
  after: PropertyImage | null;
  projectId?: string;
}> {
  const images = getAllImages();
  const beforeImages = images.filter(img => img.isBeforeImage);

  return beforeImages.map(before => ({
    before,
    after: images.find(img => img.beforeImageId === before.id) || null,
    projectId: before.relatedProjectId,
  }));
}

export function getFavoriteImages(): PropertyImage[] {
  return getAllImages().filter(img => img.isFavorite);
}

export function getPrimaryImages(): PropertyImage[] {
  return getAllImages().filter(img => img.isPrimary);
}

/**
 * Upload a new image to the gallery
 */
export async function uploadImage(
  file: File,
  options: ImageUploadOptions
): Promise<PropertyImage | { error: string }> {
  // Validate file size
  if (file.size > MAX_FILE_SIZE) {
    return { error: `File size exceeds ${MAX_FILE_SIZE / 1024 / 1024}MB limit` };
  }

  // Validate file type
  if (!ALLOWED_TYPES.includes(file.type)) {
    return { error: 'Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed' };
  }

  try {
    // Read file as base64
    const dataUrl = await readFileAsDataUrl(file);

    // Get image dimensions
    const dimensions = await getImageDimensions(dataUrl);

    // Create image object
    const image: PropertyImage = {
      id: generateId(),
      category: options.category,
      description: options.description || '',
      dataUrl,
      fileName: file.name,
      fileSize: file.size,
      mimeType: file.type,
      uploadedAt: new Date().toISOString(),
      uploadedBy: options.uploadedBy,
      tags: options.tags || [],
      isBeforeImage: options.isBeforeImage || false,
      isAfterImage: false,
      relatedProjectId: options.relatedProjectId,
      width: dimensions.width,
      height: dimensions.height,
      isFavorite: false,
      isPrimary: false,
    };

    // Save to storage
    const images = getAllImages();
    images.unshift(image);
    saveImages(images);

    return image;
  } catch (error) {
    return { error: 'Failed to upload image' };
  }
}

/**
 * Upload an "after" image linked to a "before" image
 */
export async function uploadAfterImage(
  file: File,
  beforeImageId: string,
  uploadedBy: string
): Promise<PropertyImage | { error: string }> {
  const beforeImage = getAllImages().find(img => img.id === beforeImageId);

  if (!beforeImage) {
    return { error: 'Before image not found' };
  }

  const result = await uploadImage(file, {
    category: beforeImage.category,
    description: `After: ${beforeImage.description}`,
    tags: beforeImage.tags,
    relatedProjectId: beforeImage.relatedProjectId,
    uploadedBy,
  });

  if ('error' in result) {
    return result;
  }

  // Mark as after image and link to before
  result.isAfterImage = true;
  result.beforeImageId = beforeImageId;

  const images = getAllImages();
  const index = images.findIndex(img => img.id === result.id);
  if (index !== -1) {
    images[index] = result;
    saveImages(images);
  }

  return result;
}

/**
 * Update image metadata
 */
export function updateImage(imageId: string, updates: Partial<PropertyImage>): void {
  const images = getAllImages();
  const index = images.findIndex(img => img.id === imageId);

  if (index !== -1) {
    images[index] = { ...images[index], ...updates };
    saveImages(images);
  }
}

/**
 * Toggle favorite status
 */
export function toggleFavorite(imageId: string): void {
  const images = getAllImages();
  const image = images.find(img => img.id === imageId);

  if (image) {
    image.isFavorite = !image.isFavorite;
    saveImages(images);
  }
}

/**
 * Set as primary image for category
 */
export function setPrimaryImage(imageId: string): void {
  const images = getAllImages();
  const image = images.find(img => img.id === imageId);

  if (image) {
    // Unset any other primary images in the same category
    images.forEach(img => {
      if (img.category === image.category) {
        img.isPrimary = false;
      }
    });

    // Set this as primary
    image.isPrimary = true;
    saveImages(images);
  }
}

/**
 * Delete an image
 */
export function deleteImage(imageId: string): void {
  const images = getAllImages();
  const filtered = images.filter(img => img.id !== imageId);

  // If this was a before image, also remove the after image link
  const deletedImage = images.find(img => img.id === imageId);
  if (deletedImage?.isBeforeImage) {
    filtered.forEach(img => {
      if (img.beforeImageId === imageId) {
        img.beforeImageId = undefined;
        img.isAfterImage = false;
      }
    });
  }

  saveImages(filtered);
}

/**
 * Get total storage used by images
 */
export function getTotalStorageUsed(): number {
  const images = getAllImages();
  return images.reduce((total, img) => total + img.fileSize, 0);
}

/**
 * Format storage size
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${Math.round(bytes / Math.pow(k, i) * 100) / 100} ${sizes[i]}`;
}

// ============ Helper Functions ============

function generateId(): string {
  return `img_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function getImageDimensions(dataUrl: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      resolve({ width: img.width, height: img.height });
    };
    img.src = dataUrl;
  });
}

/**
 * Compress image if needed (for future use)
 */
export function compressImage(
  dataUrl: string,
  maxWidth: number = 1920,
  maxHeight: number = 1080,
  quality: number = 0.8
): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let { width, height } = img;

      // Calculate new dimensions
      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }
      if (height > maxHeight) {
        width = (width * maxHeight) / height;
        height = maxHeight;
      }

      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      } else {
        resolve(dataUrl);
      }
    };
    img.src = dataUrl;
  });
}
