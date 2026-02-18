import { useState, useRef, useEffect, useCallback } from 'react';
import { FileText, Upload, Download, Trash2, Search, Eye, FolderKanban, Filter, Loader2 } from 'lucide-react';
import type { DocumentFile, DocumentCategory, DocumentsData } from '../lib/documents';
import {
  loadDocumentsAsync,
  addDocumentAsync,
  deleteDocumentAsync,
  getDocumentsByCategoryAsync,
  searchDocumentsAsync,
  getDocumentUrlAsync,
  exportDocuments,
  importDocuments,
  formatFileSize,
  getFileIcon,
  getTotalStorageUsed,
  getRemainingStorage,
  CATEGORY_LABELS,
  CATEGORY_DESCRIPTIONS,
  ACCEPTED_FILE_TYPES,
} from '../lib/documents';
import { getProjectsAsync } from '../lib/projects';
import type { Project } from '../lib/projects';

type TabId = DocumentCategory;

interface Tab {
  id: TabId;
  label: string;
  description: string;
}

const tabs: Tab[] = [
  { id: 'lease', label: 'Leases', description: CATEGORY_DESCRIPTIONS.lease },
  { id: 'receipt', label: 'Receipts', description: CATEGORY_DESCRIPTIONS.receipt },
  { id: 'photo', label: 'Photos', description: CATEGORY_DESCRIPTIONS.photo },
];

export default function Documents() {
  const [activeTab, setActiveTab] = useState<TabId>('lease');
  const [documentsData, setDocumentsData] = useState<DocumentsData>({ files: [], lastUpdated: '' });
  const [displayedDocs, setDisplayedDocs] = useState<DocumentFile[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');
  const [previewDoc, setPreviewDoc] = useState<DocumentFile | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [projectFilter, setProjectFilter] = useState<string>('all');
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [projects, setProjectsList] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [categoryCounts, setCategoryCounts] = useState<Record<DocumentCategory, number>>({ lease: 0, receipt: 0, photo: 0 });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const refreshDocuments = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await loadDocumentsAsync();
      setDocumentsData(data);

      // Update category counts
      const counts = { lease: 0, receipt: 0, photo: 0 };
      data.files.forEach(f => { counts[f.category]++; });
      setCategoryCounts(counts);
    } catch (error) {
      console.error('Error loading documents:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load documents on mount
  useEffect(() => {
    refreshDocuments();
    getProjectsAsync().then(setProjectsList);
  }, [refreshDocuments]);

  // Update displayed docs when filter/search/tab changes
  useEffect(() => {
    const loadDisplayedDocs = async () => {
      let docs: DocumentFile[];
      if (searchQuery) {
        docs = await searchDocumentsAsync(searchQuery);
      } else {
        docs = await getDocumentsByCategoryAsync(activeTab);
      }

      // Apply project filter
      if (projectFilter === 'unlinked') {
        docs = docs.filter(d => !d.projectId);
      } else if (projectFilter !== 'all') {
        docs = docs.filter(d => d.projectId === projectFilter);
      }

      setDisplayedDocs(docs);
    };
    loadDisplayedDocs();
  }, [activeTab, searchQuery, projectFilter, documentsData]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        await addDocumentAsync(file, activeTab, undefined, undefined, selectedProjectId || undefined);
      }
      await refreshDocuments();
      showMessage(`✓ ${files.length} file(s) uploaded successfully!`);
    } catch (error) {
      showMessage(`✗ Upload failed: ${(error as Error).message}`);
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete "${name}"?`)) {
      await deleteDocumentAsync(id);
      await refreshDocuments();
      showMessage('✓ Document deleted');
    }
  };

  const handleExport = () => {
    const jsonData = exportDocuments();
    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `property-documents-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const jsonString = e.target?.result as string;
        importDocuments(jsonString);
        refreshDocuments();
        showMessage('✓ Documents imported successfully!');
      } catch (error) {
        showMessage(`✗ Import failed: ${(error as Error).message}`);
      } finally {
        setIsImporting(false);
      }
    };
    reader.readAsText(file);
  };

  const handleDownload = async (doc: DocumentFile) => {
    let url = doc.dataUrl;
    if (!url && doc.storagePath) {
      url = await getDocumentUrlAsync(doc.storagePath);
    }
    if (url) {
      const link = document.createElement('a');
      link.href = url;
      link.download = doc.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handlePreview = (doc: DocumentFile) => {
    setPreviewDoc(doc);
  };

  const closePreview = () => {
    setPreviewDoc(null);
  };

  const showMessage = (msg: string) => {
    setMessage(msg);
    setTimeout(() => setMessage(''), 3000);
  };

  const storageUsed = getTotalStorageUsed();
  const storageRemaining = getRemainingStorage();
  const storagePercent = (storageUsed / (storageUsed + storageRemaining)) * 100;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-cc-accent/20 rounded-lg">
            <FileText className="text-cc-accent" size={28} />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-cc-text">Documents</h1>
            <p className="text-cc-muted mt-1">
              Manage leases, receipts, and property photos
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleExport}
            className="btn-secondary flex items-center gap-2 text-sm"
            title="Export all documents as JSON"
          >
            <Download size={16} />
            Export
          </button>
          <label className={`btn-secondary flex items-center gap-2 text-sm cursor-pointer ${isImporting ? 'opacity-50 pointer-events-none' : ''}`}>
            <Upload size={16} className={isImporting ? 'animate-spin' : ''} />
            {isImporting ? 'Importing...' : 'Import'}
            <input
              type="file"
              accept=".json"
              onChange={handleImport}
              className="hidden"
              disabled={isImporting}
            />
          </label>
        </div>
      </div>

      {/* Message */}
      {message && (
        <div
          className={`p-4 rounded-lg ${
            message.startsWith('✓')
              ? 'bg-green-500/10 border border-green-500/30 text-green-400'
              : 'bg-red-500/10 border border-red-500/30 text-red-400'
          }`}
        >
          {message}
        </div>
      )}

      {/* Storage Info */}
      <div className="card bg-cc-surface/30 p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-cc-muted">Storage Used</span>
          <span className="text-sm text-cc-text font-medium">
            {formatFileSize(storageUsed)} / {formatFileSize(storageUsed + storageRemaining)}
          </span>
        </div>
        <div className="w-full bg-cc-border rounded-full h-2">
          <div
            className="bg-cc-accent rounded-full h-2 transition-all"
            style={{ width: `${Math.min(storagePercent, 100)}%` }}
          />
        </div>
      </div>

      {/* Search & Project Filter */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-cc-muted" size={20} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search documents by name, description, or tags..."
            className="input pl-10 w-full"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter size={16} className="text-cc-muted" />
          <select
            value={projectFilter}
            onChange={(e) => setProjectFilter(e.target.value)}
            className="input text-sm py-1.5"
          >
            <option value="all">All Projects</option>
            <option value="unlinked">Unlinked</option>
            {projects.map(p => (
              <option key={p.id} value={p.id}>{p.title}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-cc-border">
        <div className="flex flex-wrap gap-1">
          {tabs.map((tab) => {
            const count = categoryCounts[tab.id];
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-3 text-sm font-medium transition-colors relative ${
                  activeTab === tab.id
                    ? 'text-cc-accent'
                    : 'text-cc-muted hover:text-cc-text'
                }`}
              >
                <div>
                  <div className="flex items-center gap-2">
                    {tab.label}
                    {count > 0 && (
                      <span className="px-2 py-0.5 rounded-full text-xs bg-cc-border text-cc-text">
                        {count}
                      </span>
                    )}
                  </div>
                  <div className="text-xs opacity-75">{tab.description}</div>
                </div>
                {activeTab === tab.id && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-cc-accent" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Upload Area */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-cc-text">
            Upload {CATEGORY_LABELS[activeTab]}
          </h3>
          <div className="flex items-center gap-2">
            <FolderKanban size={16} className="text-cc-muted" />
            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="input text-sm py-1.5"
            >
              <option value="">No project</option>
              {projects.map(p => (
                <option key={p.id} value={p.id}>{p.title}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="border-2 border-dashed border-cc-border rounded-lg p-8 text-center hover:border-cc-accent/50 transition-colors">
          <input
            ref={fileInputRef}
            type="file"
            accept={ACCEPTED_FILE_TYPES[activeTab]}
            onChange={handleFileUpload}
            multiple
            className="hidden"
            id="file-upload"
            disabled={uploading}
          />
          <label
            htmlFor="file-upload"
            className="cursor-pointer flex flex-col items-center gap-3"
          >
            <Upload className="text-cc-accent" size={48} />
            <div>
              <p className="text-cc-text font-medium">
                {uploading ? 'Uploading...' : 'Click to upload files'}
              </p>
              <p className="text-sm text-cc-muted mt-1">
                Accepted formats: {ACCEPTED_FILE_TYPES[activeTab]}
              </p>
              <p className="text-xs text-cc-muted mt-1">Max 5MB per file</p>
            </div>
          </label>
        </div>
      </div>

      {/* Documents List */}
      <div className="card p-6">
        <h3 className="text-lg font-bold text-cc-text mb-4">
          {searchQuery ? 'Search Results' : CATEGORY_LABELS[activeTab]}
        </h3>

        {displayedDocs.length === 0 ? (
          <div className="text-center py-8 text-cc-muted">
            {searchQuery
              ? 'No documents found matching your search'
              : `No ${CATEGORY_LABELS[activeTab].toLowerCase()} uploaded yet`}
          </div>
        ) : (
          <div className="space-y-3">
            {displayedDocs.map((doc) => (
              <div
                key={doc.id}
                className="flex items-center gap-4 p-4 bg-cc-surface/30 rounded-lg hover:bg-cc-surface/50 transition-colors"
              >
                <div className="text-3xl">{getFileIcon(doc.mimeType)}</div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-cc-text font-medium truncate">{doc.name}</h4>
                  <div className="flex items-center gap-4 mt-1 text-sm text-cc-muted">
                    <span>{formatFileSize(doc.fileSize)}</span>
                    <span>{new Date(doc.uploadDate).toLocaleDateString()}</span>
                    {searchQuery && (
                      <span className="px-2 py-0.5 rounded-full text-xs bg-cc-border text-cc-text">
                        {CATEGORY_LABELS[doc.category]}
                      </span>
                    )}
                    {doc.projectId && (
                      <span className="px-2 py-0.5 rounded-full text-xs bg-blue-500/20 text-blue-400 flex items-center gap-1">
                        <FolderKanban size={10} />
                        {projects.find(p => p.id === doc.projectId)?.title || 'Project'}
                      </span>
                    )}
                  </div>
                  {doc.description && (
                    <p className="text-sm text-cc-muted mt-1">{doc.description}</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {doc.mimeType.startsWith('image/') && (
                    <button
                      onClick={() => handlePreview(doc)}
                      className="btn-secondary text-sm flex items-center gap-1"
                      title="Preview"
                    >
                      <Eye size={16} />
                    </button>
                  )}
                  <button
                    onClick={() => handleDownload(doc)}
                    className="btn-secondary text-sm flex items-center gap-1"
                    title="Download"
                  >
                    <Download size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(doc.id, doc.name)}
                    className="btn-secondary text-sm flex items-center gap-1 text-red-400 hover:text-red-300"
                    title="Delete"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Info Footer */}
      <div className="card bg-cc-surface/30 p-4">
        <h4 className="text-sm font-bold text-cc-text mb-2">💡 Tips</h4>
        <ul className="text-sm text-cc-muted space-y-1">
          <li>• All documents are stored locally in your browser</li>
          <li>• Keep important documents backed up using the Export feature</li>
          <li>• Maximum file size is 5MB per document</li>
          <li>• Supported formats: PDF, images (JPG, PNG, GIF), and Word documents</li>
          <li>• Use the search feature to quickly find documents across all categories</li>
        </ul>
      </div>

      {/* Preview Modal */}
      {previewDoc && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50"
          onClick={closePreview}
        >
          <div
            className="bg-cc-bg rounded-lg p-4 max-w-4xl max-h-[90vh] overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-cc-text font-bold">{previewDoc.name}</h3>
              <button
                onClick={closePreview}
                className="text-cc-muted hover:text-cc-text"
              >
                ✕
              </button>
            </div>
            <img
              src={previewDoc.dataUrl}
              alt={previewDoc.name}
              className="max-w-full h-auto rounded"
            />
          </div>
        </div>
      )}
    </div>
  );
}
