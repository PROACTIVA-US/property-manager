/**
 * Documents Library - Supabase Implementation
 * Manages property-related documents (leases, receipts, photos)
 */

import { supabase } from './supabase';
import type { Tables, TablesInsert } from './database.types';

// Database type
type DbDocument = Tables<'documents'>;

// ============ Types ============

export type DocumentCategory = 'lease' | 'receipt' | 'photo';

export interface DocumentFile {
  id: string;
  name: string;
  category: DocumentCategory;
  uploadDate: string;
  fileSize: number;
  mimeType: string;
  description?: string;
  tags?: string[];
  projectId?: string;
  propertyId?: string;
  storagePath?: string;
  dataUrl?: string; // For demo mode (base64)
}

export interface DocumentsData {
  files: DocumentFile[];
  lastUpdated: string;
}

// ============ Constants ============

const STORAGE_KEY = 'propertymanager_documents';
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB limit for localStorage
const SUPABASE_BUCKET = 'documents';

export const CATEGORY_LABELS: Record<DocumentCategory, string> = {
  lease: 'Leases',
  receipt: 'Receipts',
  photo: 'Property Photos',
};

export const CATEGORY_DESCRIPTIONS: Record<DocumentCategory, string> = {
  lease: 'Lease agreements and rental contracts',
  receipt: 'Expense receipts and payment records',
  photo: 'Property photos and documentation',
};

export const ACCEPTED_FILE_TYPES: Record<DocumentCategory, string> = {
  lease: '.pdf,.doc,.docx',
  receipt: '.pdf,.jpg,.jpeg,.png,.gif',
  photo: '.jpg,.jpeg,.png,.gif,.webp',
};

// ============ Demo Mode ============

function isDemoMode(): boolean {
  const demoUser = localStorage.getItem('demoUser');
  return !!demoUser;
}

function getDefaultDocumentsData(): DocumentsData {
  return {
    files: [],
    lastUpdated: new Date().toISOString(),
  };
}

// ============ Helper Functions ============

function mapDbToDocument(doc: DbDocument): DocumentFile {
  return {
    id: doc.id,
    name: doc.name,
    category: doc.category as DocumentCategory,
    uploadDate: doc.created_at || new Date().toISOString(),
    fileSize: doc.file_size || 0,
    mimeType: doc.mime_type || '',
    description: doc.description || undefined,
    tags: doc.tags || undefined,
    projectId: doc.project_id || undefined,
    propertyId: doc.property_id || undefined,
    storagePath: doc.storage_path || undefined,
  };
}

// ============ Supabase Operations ============

export async function loadDocumentsAsync(): Promise<DocumentsData> {
  if (isDemoMode()) {
    return loadDocuments();
  }

  const { data, error } = await supabase
    .from('documents')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error loading documents:', error);
    return getDefaultDocumentsData();
  }

  return {
    files: data.map(mapDbToDocument),
    lastUpdated: new Date().toISOString(),
  };
}

export async function addDocumentAsync(
  file: File,
  category: DocumentCategory,
  description?: string,
  tags?: string[],
  projectId?: string,
  propertyId?: string
): Promise<DocumentFile> {
  if (isDemoMode()) {
    return addDocument(file, category, description, tags, projectId);
  }

  if (file.size > MAX_FILE_SIZE) {
    throw new Error(`File size exceeds ${MAX_FILE_SIZE / 1024 / 1024}MB limit`);
  }

  // Upload to Supabase Storage
  const fileName = `${Date.now()}-${file.name}`;
  const storagePath = `${category}/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from(SUPABASE_BUCKET)
    .upload(storagePath, file);

  if (uploadError) {
    throw new Error('Failed to upload file: ' + uploadError.message);
  }

  // Create database record
  const { data: { user } } = await supabase.auth.getUser();

  const insertData: TablesInsert<'documents'> = {
    name: file.name,
    category,
    file_size: file.size,
    mime_type: file.type,
    storage_path: storagePath,
    description,
    tags,
    project_id: projectId,
    property_id: propertyId,
    uploaded_by: user?.id,
  };

  const { data, error } = await supabase
    .from('documents')
    .insert(insertData)
    .select()
    .single();

  if (error || !data) {
    // Clean up uploaded file on error
    await supabase.storage.from(SUPABASE_BUCKET).remove([storagePath]);
    throw new Error('Failed to save document record: ' + error?.message);
  }

  return mapDbToDocument(data);
}

export async function deleteDocumentAsync(id: string): Promise<void> {
  if (isDemoMode()) {
    deleteDocument(id);
    return;
  }

  // Get document to find storage path
  const { data: doc } = await supabase
    .from('documents')
    .select('storage_path')
    .eq('id', id)
    .single();

  if (doc?.storage_path) {
    await supabase.storage.from(SUPABASE_BUCKET).remove([doc.storage_path]);
  }

  await supabase.from('documents').delete().eq('id', id);
}

export async function updateDocumentAsync(
  id: string,
  updates: Partial<Pick<DocumentFile, 'description' | 'tags'>>
): Promise<void> {
  if (isDemoMode()) {
    updateDocument(id, updates);
    return;
  }

  await supabase
    .from('documents')
    .update({
      description: updates.description,
      tags: updates.tags,
    })
    .eq('id', id);
}

export async function getDocumentsByCategoryAsync(category: DocumentCategory): Promise<DocumentFile[]> {
  if (isDemoMode()) {
    return getDocumentsByCategory(category);
  }

  const { data, error } = await supabase
    .from('documents')
    .select('*')
    .eq('category', category)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching documents by category:', error);
    return [];
  }

  return data.map(mapDbToDocument);
}

export async function getDocumentsByProjectAsync(projectId: string): Promise<DocumentFile[]> {
  if (isDemoMode()) {
    return getDocumentsByProject(projectId);
  }

  const { data, error } = await supabase
    .from('documents')
    .select('*')
    .eq('project_id', projectId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching documents by project:', error);
    return [];
  }

  return data.map(mapDbToDocument);
}

export async function getDocumentUrlAsync(storagePath: string): Promise<string> {
  const { data } = supabase.storage
    .from(SUPABASE_BUCKET)
    .getPublicUrl(storagePath);

  return data.publicUrl;
}

export async function searchDocumentsAsync(query: string): Promise<DocumentFile[]> {
  if (isDemoMode()) {
    return searchDocuments(query);
  }

  // Supabase doesn't have built-in full-text search on arrays, so we search name and description
  const { data, error } = await supabase
    .from('documents')
    .select('*')
    .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error searching documents:', error);
    return [];
  }

  return data.map(mapDbToDocument);
}

// ============ Synchronous Functions (Demo Mode) ============

export function loadDocuments(): DocumentsData {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return getDefaultDocumentsData();
    return JSON.parse(stored);
  } catch (error) {
    console.error('Failed to load documents:', error);
    return getDefaultDocumentsData();
  }
}

function saveDocuments(data: DocumentsData): void {
  try {
    data.lastUpdated = new Date().toISOString();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Failed to save documents:', error);
    throw new Error('Failed to save documents. Storage may be full.');
  }
}

export function addDocument(
  file: File,
  category: DocumentCategory,
  description?: string,
  tags?: string[],
  projectId?: string
): Promise<DocumentFile> {
  return new Promise((resolve, reject) => {
    if (file.size > MAX_FILE_SIZE) {
      reject(new Error(`File size exceeds ${MAX_FILE_SIZE / 1024 / 1024}MB limit`));
      return;
    }

    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const dataUrl = e.target?.result as string;

        const newDoc: DocumentFile = {
          id: `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          name: file.name,
          category,
          uploadDate: new Date().toISOString(),
          fileSize: file.size,
          mimeType: file.type,
          description,
          tags,
          projectId,
          dataUrl,
        };

        const data = loadDocuments();
        data.files.push(newDoc);
        saveDocuments(data);

        resolve(newDoc);
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };

    reader.readAsDataURL(file);
  });
}

export function deleteDocument(id: string): void {
  const data = loadDocuments();
  data.files = data.files.filter(f => f.id !== id);
  saveDocuments(data);
}

export function updateDocument(id: string, updates: Partial<Pick<DocumentFile, 'description' | 'tags'>>): void {
  const data = loadDocuments();
  const index = data.files.findIndex(f => f.id === id);

  if (index === -1) {
    throw new Error('Document not found');
  }

  data.files[index] = {
    ...data.files[index],
    ...updates,
  };

  saveDocuments(data);
}

export function getDocumentsByCategory(category: DocumentCategory): DocumentFile[] {
  const data = loadDocuments();
  return data.files.filter(f => f.category === category);
}

export function getDocumentsByProject(projectId: string): DocumentFile[] {
  const data = loadDocuments();
  return data.files.filter(f => f.projectId === projectId);
}

export function getDocument(id: string): DocumentFile | undefined {
  const data = loadDocuments();
  return data.files.find(f => f.id === id);
}

export function searchDocuments(query: string): DocumentFile[] {
  const data = loadDocuments();
  const lowerQuery = query.toLowerCase();

  return data.files.filter(f =>
    f.name.toLowerCase().includes(lowerQuery) ||
    f.description?.toLowerCase().includes(lowerQuery) ||
    f.tags?.some(tag => tag.toLowerCase().includes(lowerQuery))
  );
}

// ============ Export/Import Functions ============

export function exportDocuments(): string {
  const data = loadDocuments();
  return JSON.stringify(data, null, 2);
}

export function importDocuments(jsonString: string): DocumentsData {
  try {
    const parsed = JSON.parse(jsonString);

    if (!parsed.files || !Array.isArray(parsed.files)) {
      throw new Error('Invalid documents data format');
    }

    for (const file of parsed.files) {
      if (!file.id || !file.name || !file.category) {
        throw new Error('Invalid document file format');
      }
    }

    saveDocuments(parsed);
    return parsed;
  } catch (error) {
    console.error('Import failed:', error);
    throw new Error('Failed to import documents. Invalid format.');
  }
}

export function clearAllDocuments(): void {
  const data = getDefaultDocumentsData();
  saveDocuments(data);
}

// ============ Utility Functions ============

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function getFileIcon(mimeType: string): string {
  if (mimeType.startsWith('image/')) return 'image';
  if (mimeType === 'application/pdf') return 'pdf';
  if (mimeType.includes('word')) return 'word';
  return 'file';
}

export function getTotalStorageUsed(): number {
  const data = loadDocuments();
  return data.files.reduce((total, file) => total + file.fileSize, 0);
}

export function getRemainingStorage(): number {
  const used = getTotalStorageUsed();
  const limit = MAX_FILE_SIZE * 10; // Allow up to 50MB total
  return Math.max(0, limit - used);
}
