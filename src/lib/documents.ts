/**
 * Documents Library
 * Manages property-related documents (leases, receipts, photos)
 */

// ============================================================================
// Types
// ============================================================================

export type DocumentCategory = 'lease' | 'receipt' | 'photo';

export interface DocumentFile {
  id: string;
  name: string;
  category: DocumentCategory;
  uploadDate: string; // ISO timestamp
  fileSize: number; // in bytes
  mimeType: string;
  description?: string;
  tags?: string[];
  projectId?: string;
  // For small files, we store base64 data directly
  // For larger files, we'd need a different storage strategy
  dataUrl: string; // base64 encoded data URL
}

export interface DocumentsData {
  files: DocumentFile[];
  lastUpdated: string; // ISO timestamp
}

// ============================================================================
// Constants
// ============================================================================

const STORAGE_KEY = 'propertymanager_documents';
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB limit for localStorage

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

// ============================================================================
// Storage Functions
// ============================================================================

function getDefaultDocumentsData(): DocumentsData {
  return {
    files: [],
    lastUpdated: new Date().toISOString(),
  };
}

export function loadDocuments(): DocumentsData {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return getDefaultDocumentsData();

    const parsed = JSON.parse(stored);
    return parsed;
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

// ============================================================================
// File Management Functions
// ============================================================================

export function addDocument(file: File, category: DocumentCategory, description?: string, tags?: string[], projectId?: string): Promise<DocumentFile> {
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

// ============================================================================
// Export/Import Functions
// ============================================================================

export function exportDocuments(): string {
  const data = loadDocuments();
  return JSON.stringify(data, null, 2);
}

export function importDocuments(jsonString: string): DocumentsData {
  try {
    const parsed = JSON.parse(jsonString);

    // Validate structure
    if (!parsed.files || !Array.isArray(parsed.files)) {
      throw new Error('Invalid documents data format');
    }

    // Validate each file has required fields
    for (const file of parsed.files) {
      if (!file.id || !file.name || !file.category || !file.dataUrl) {
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

// ============================================================================
// Utility Functions
// ============================================================================

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function getFileIcon(mimeType: string): string {
  if (mimeType.startsWith('image/')) return '🖼️';
  if (mimeType === 'application/pdf') return '📄';
  if (mimeType.includes('word')) return '📝';
  return '📎';
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
