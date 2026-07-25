/**
 * Vendor Gallery - Supabase Storage with localStorage demo fallback
 */

import { supabase } from './supabase';

const SUPABASE_BUCKET = 'vendor-gallery';
const LOCAL_STORAGE_KEY = 'propertyMgr_vendorGallery';

export interface GalleryImage {
  id: string;
  url: string;
  category: string;
  vendorId: string;
  order: number;
}

function isDemoMode(): boolean {
  return !!localStorage.getItem('demoUser');
}

// ============ Image Compression ============

export function compressImage(dataUrl: string, maxDim: number = 1200): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      let { width, height } = img;
      if (width <= maxDim && height <= maxDim) {
        resolve(dataUrl);
        return;
      }
      const ratio = Math.min(maxDim / width, maxDim / height);
      width = Math.round(width * ratio);
      height = Math.round(height * ratio);
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL('image/jpeg', 0.8));
    };
    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });
}

function dataUrlToBlob(dataUrl: string): Blob {
  const [header, base64] = dataUrl.split(',');
  const mime = header.match(/:(.*?);/)?.[1] || 'image/jpeg';
  const binary = atob(base64);
  const array = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) array[i] = binary.charCodeAt(i);
  return new Blob([array], { type: mime });
}

// ============ localStorage helpers (demo mode) ============

function loadLocal(vendorId: string): GalleryImage[] {
  try {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (stored) {
      const all: GalleryImage[] = JSON.parse(stored);
      return all.filter(img => img.vendorId === vendorId).sort((a, b) => a.order - b.order);
    }
  } catch { /* empty */ }
  return [];
}

function saveLocal(vendorId: string, vendorImages: GalleryImage[]): void {
  try {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
    const all: GalleryImage[] = stored ? JSON.parse(stored) : [];
    const others = all.filter(img => img.vendorId !== vendorId);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify([...others, ...vendorImages]));
  } catch { /* empty */ }
}

// ============ Public API ============

export async function loadGalleryImages(vendorId: string): Promise<GalleryImage[]> {
  if (isDemoMode()) {
    return loadLocal(vendorId);
  }

  // List files in the vendor's folder
  const { data: files, error } = await supabase.storage
    .from(SUPABASE_BUCKET)
    .list(vendorId, { sortBy: { column: 'name', order: 'asc' } });

  if (error || !files) {
    console.error('Error loading gallery from Supabase:', error);
    // Fallback to localStorage
    return loadLocal(vendorId);
  }

  // Also load the metadata (order, category) from localStorage since
  // Supabase Storage doesn't store custom metadata easily without a DB table
  const meta = loadLocal(vendorId);
  const metaMap = new Map(meta.map(m => [m.id, m]));

  const images: GalleryImage[] = [];
  for (const file of files) {
    if (file.name.startsWith('.')) continue;

    const { data: urlData } = supabase.storage
      .from(SUPABASE_BUCKET)
      .getPublicUrl(`${vendorId}/${file.name}`);

    const existing = metaMap.get(file.name);
    images.push({
      id: file.name,
      url: urlData.publicUrl,
      category: existing?.category || 'Uncategorized',
      vendorId,
      order: existing?.order ?? 999,
    });
  }

  return images.sort((a, b) => a.order - b.order);
}

export async function uploadGalleryImages(
  vendorId: string,
  category: string,
  files: FileList,
  existingImages: GalleryImage[]
): Promise<GalleryImage[]> {
  const categoryImages = existingImages.filter(img => img.category === category);
  let nextOrder = categoryImages.length > 0
    ? Math.max(...categoryImages.map(img => img.order)) + 1
    : 0;

  const newImages: GalleryImage[] = [];

  for (const file of Array.from(files)) {
    // Read as data URL for compression
    const dataUrl = await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.readAsDataURL(file);
    });

    const compressed = await compressImage(dataUrl);
    const imageId = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    if (isDemoMode()) {
      newImages.push({
        id: imageId,
        url: compressed,
        category,
        vendorId,
        order: nextOrder++,
      });
    } else {
      // Upload to Supabase Storage
      const blob = dataUrlToBlob(compressed);
      const storagePath = `${vendorId}/${imageId}.jpg`;

      const { error } = await supabase.storage
        .from(SUPABASE_BUCKET)
        .upload(storagePath, blob, { contentType: 'image/jpeg', upsert: false });

      if (error) {
        console.error('Upload error:', error);
        // Fallback: save locally
        newImages.push({
          id: imageId,
          url: compressed,
          category,
          vendorId,
          order: nextOrder++,
        });
        continue;
      }

      const { data: urlData } = supabase.storage
        .from(SUPABASE_BUCKET)
        .getPublicUrl(storagePath);

      newImages.push({
        id: imageId,
        url: urlData.publicUrl,
        category,
        vendorId,
        order: nextOrder++,
      });
    }
  }

  const updated = [...existingImages, ...newImages];
  // Always save metadata locally (order + category mapping)
  saveLocal(vendorId, updated);
  return updated;
}

export async function deleteGalleryImage(
  vendorId: string,
  imageId: string,
  allImages: GalleryImage[]
): Promise<GalleryImage[]> {
  if (!isDemoMode()) {
    // Try to delete from Supabase Storage
    const image = allImages.find(img => img.id === imageId);
    if (image && !image.url.startsWith('data:')) {
      // It's a Supabase URL, delete from storage
      await supabase.storage
        .from(SUPABASE_BUCKET)
        .remove([`${vendorId}/${imageId}.jpg`]);
    }
  }

  const updated = allImages.filter(img => img.id !== imageId);
  saveLocal(vendorId, updated);
  return updated;
}

export async function deleteAllGalleryImages(
  vendorId: string,
  category: string,
  allImages: GalleryImage[]
): Promise<GalleryImage[]> {
  const toDelete = allImages.filter(img => img.category === category);
  const toKeep = allImages.filter(img => img.category !== category);

  if (!isDemoMode()) {
    const paths = toDelete
      .filter(img => !img.url.startsWith('data:'))
      .map(img => `${vendorId}/${img.id}.jpg`);

    if (paths.length > 0) {
      await supabase.storage.from(SUPABASE_BUCKET).remove(paths);
    }
  }

  saveLocal(vendorId, toKeep);
  return toKeep;
}

export function reorderGalleryImages(
  vendorId: string,
  category: string,
  fromIndex: number,
  toIndex: number,
  allImages: GalleryImage[]
): GalleryImage[] {
  const categoryImgs = allImages
    .filter(img => img.category === category)
    .sort((a, b) => a.order - b.order);
  const otherImgs = allImages.filter(img => img.category !== category);

  const [moved] = categoryImgs.splice(fromIndex, 1);
  categoryImgs.splice(toIndex, 0, moved);

  const reordered = categoryImgs.map((img, idx) => ({ ...img, order: idx }));
  const updated = [...otherImgs, ...reordered];
  saveLocal(vendorId, updated);
  return updated;
}
