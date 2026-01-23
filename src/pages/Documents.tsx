import { useState, useRef } from 'react';
import { FileText, Upload, Download, Trash2, Search, Eye } from 'lucide-react';
import type { DocumentFile, DocumentCategory } from '../lib/documents';
import {
  loadDocuments,
  addDocument,
  deleteDocument,
  exportDocuments,
  importDocuments,
  getDocumentsByCategory,
  searchDocuments,
  formatFileSize,
  getFileIcon,
  getTotalStorageUsed,
  getRemainingStorage,
  CATEGORY_LABELS,
  CATEGORY_DESCRIPTIONS,
  ACCEPTED_FILE_TYPES,
} from '../lib/documents';

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
  const [, setDocuments] = useState(() => loadDocuments());
  const [searchQuery, setSearchQuery] = useState('');
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');
  const [previewDoc, setPreviewDoc] = useState<DocumentFile | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const refreshDocuments = () => {
    setDocuments(loadDocuments());
  };

  const displayedDocs = searchQuery
    ? searchDocuments(searchQuery)
    : getDocumentsByCategory(activeTab);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        await addDocument(file, activeTab);
      }
      refreshDocuments();
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

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete "${name}"?`)) {
      deleteDocument(id);
      refreshDocuments();
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

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const jsonString = e.target?.result as string;
        importDocuments(jsonString);
        refreshDocuments();
        showMessage('✓ Documents imported successfully!');
      } catch (error) {
        showMessage(`✗ Import failed: ${(error as Error).message}`);
      }
    };
    reader.readAsText(file);
  };

  const handleDownload = (doc: DocumentFile) => {
    const link = document.createElement('a');
    link.href = doc.dataUrl;
    link.download = doc.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
          <div className="p-2 bg-brand-orange/20 rounded-lg">
            <FileText className="text-brand-orange" size={28} />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-brand-light">Documents</h1>
            <p className="text-brand-muted mt-1">
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
          <label className="btn-secondary flex items-center gap-2 text-sm cursor-pointer">
            <Upload size={16} />
            Import
            <input
              type="file"
              accept=".json"
              onChange={handleImport}
              className="hidden"
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
      <div className="card bg-brand-navy/30 p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-brand-muted">Storage Used</span>
          <span className="text-sm text-brand-light font-medium">
            {formatFileSize(storageUsed)} / {formatFileSize(storageUsed + storageRemaining)}
          </span>
        </div>
        <div className="w-full bg-slate-700 rounded-full h-2">
          <div
            className="bg-brand-orange rounded-full h-2 transition-all"
            style={{ width: `${Math.min(storagePercent, 100)}%` }}
          />
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-muted" size={20} />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search documents by name, description, or tags..."
          className="input pl-10 w-full"
        />
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-700">
        <div className="flex flex-wrap gap-1">
          {tabs.map((tab) => {
            const count = getDocumentsByCategory(tab.id).length;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-3 text-sm font-medium transition-colors relative ${
                  activeTab === tab.id
                    ? 'text-brand-orange'
                    : 'text-brand-muted hover:text-brand-light'
                }`}
              >
                <div>
                  <div className="flex items-center gap-2">
                    {tab.label}
                    {count > 0 && (
                      <span className="px-2 py-0.5 rounded-full text-xs bg-slate-700 text-brand-light">
                        {count}
                      </span>
                    )}
                  </div>
                  <div className="text-xs opacity-75">{tab.description}</div>
                </div>
                {activeTab === tab.id && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-orange" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Upload Area */}
      <div className="card p-6">
        <h3 className="text-lg font-bold text-brand-light mb-4">
          Upload {CATEGORY_LABELS[activeTab]}
        </h3>
        <div className="border-2 border-dashed border-slate-600 rounded-lg p-8 text-center hover:border-brand-orange/50 transition-colors">
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
            <Upload className="text-brand-orange" size={48} />
            <div>
              <p className="text-brand-light font-medium">
                {uploading ? 'Uploading...' : 'Click to upload files'}
              </p>
              <p className="text-sm text-brand-muted mt-1">
                Accepted formats: {ACCEPTED_FILE_TYPES[activeTab]}
              </p>
              <p className="text-xs text-brand-muted mt-1">Max 5MB per file</p>
            </div>
          </label>
        </div>
      </div>

      {/* Documents List */}
      <div className="card p-6">
        <h3 className="text-lg font-bold text-brand-light mb-4">
          {searchQuery ? 'Search Results' : CATEGORY_LABELS[activeTab]}
        </h3>

        {displayedDocs.length === 0 ? (
          <div className="text-center py-8 text-brand-muted">
            {searchQuery
              ? 'No documents found matching your search'
              : `No ${CATEGORY_LABELS[activeTab].toLowerCase()} uploaded yet`}
          </div>
        ) : (
          <div className="space-y-3">
            {displayedDocs.map((doc) => (
              <div
                key={doc.id}
                className="flex items-center gap-4 p-4 bg-brand-navy/30 rounded-lg hover:bg-brand-navy/50 transition-colors"
              >
                <div className="text-3xl">{getFileIcon(doc.mimeType)}</div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-brand-light font-medium truncate">{doc.name}</h4>
                  <div className="flex items-center gap-4 mt-1 text-sm text-brand-muted">
                    <span>{formatFileSize(doc.fileSize)}</span>
                    <span>{new Date(doc.uploadDate).toLocaleDateString()}</span>
                    {searchQuery && (
                      <span className="px-2 py-0.5 rounded-full text-xs bg-slate-700 text-brand-light">
                        {CATEGORY_LABELS[doc.category]}
                      </span>
                    )}
                  </div>
                  {doc.description && (
                    <p className="text-sm text-brand-muted mt-1">{doc.description}</p>
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
      <div className="card bg-brand-navy/30 p-4">
        <h4 className="text-sm font-bold text-brand-light mb-2">💡 Tips</h4>
        <ul className="text-sm text-brand-muted space-y-1">
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
            className="bg-brand-dark rounded-lg p-4 max-w-4xl max-h-[90vh] overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-brand-light font-bold">{previewDoc.name}</h3>
              <button
                onClick={closePreview}
                className="text-brand-muted hover:text-brand-light"
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
