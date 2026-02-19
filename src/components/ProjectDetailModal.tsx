import { useState, useRef, useEffect } from 'react';
import { X, Calendar, DollarSign, User, AlertCircle, CheckCircle, Clock, FileText, MessageSquare, Users, Sparkles, Paperclip, Receipt, Download, Eye as EyeIcon, ChevronDown, Image, Upload, Trash2 } from 'lucide-react';
import type { Project, ProjectAttachment } from '../lib/projects';
import { STATUS_LABELS, PRIORITY_LABELS, CATEGORY_LABELS, getProjectAttachments, createProjectAttachment, deleteProjectAttachment } from '../lib/projects';
import { notifyOwnerOfProjectUpdate } from '../lib/notifications';
import { getVendorById } from '../lib/vendors';
import { getBOMByProjectId } from '../lib/bom';
import { getExpensesByProject } from '../pages/Maintenance';
import type { Expense } from '../pages/Maintenance';
import { getDocumentsByProject, formatFileSize, getFileIcon, CATEGORY_LABELS as DOC_CATEGORY_LABELS } from '../lib/documents';
import type { DocumentFile } from '../lib/documents';
import ProjectPhases from './ProjectPhases';
import ProjectMessageCenter from './ProjectMessageCenter';
import StakeholderManager from './StakeholderManager';
import ImpactAnalysisView from './ImpactAnalysisView';
import BOMDetailView from './bom/BOMDetailView';
import { useAuth } from '../contexts/AuthContext';

interface ProjectDetailModalProps {
  project: Project;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
}

/**
 * @navigation-tab-count 8
 * Tab types for project detail modal navigation.
 * Note: These are NOT all top-level - they are grouped using a "More" dropdown.
 * Actual top-level count: 4 (Overview, Images, Milestones, More dropdown)
 */
type Tab = 'overview' | 'images' | 'milestones' | 'expenses' | 'documents' | 'messages' | 'stakeholders' | 'details';

export default function ProjectDetailModal({ project, isOpen, onClose, onUpdate }: ProjectDetailModalProps) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);
  const moreMenuRef = useRef<HTMLDivElement>(null);
  const [projectImages, setProjectImages] = useState<ProjectAttachment[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [lightboxImage, setLightboxImage] = useState<ProjectAttachment | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load project images
  useEffect(() => {
    if (isOpen) {
      setProjectImages(getProjectAttachments(project.id));
    }
  }, [isOpen, project.id]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    let uploadedCount = 0;
    try {
      for (const file of Array.from(files)) {
        if (!file.type.startsWith('image/')) continue;
        await createProjectAttachment(
          project.id,
          file,
          user?.displayName || 'Unknown',
          'other' // Default category
        );
        uploadedCount++;
      }
      setProjectImages(getProjectAttachments(project.id));
      onUpdate();

      // Notify owner if PM uploaded images
      if (user?.role === 'pm' && uploadedCount > 0) {
        notifyOwnerOfProjectUpdate({
          projectId: project.id,
          projectTitle: project.title,
          updateType: 'images_added',
          updateDescription: `${uploadedCount} image${uploadedCount > 1 ? 's' : ''} added`,
          pmName: user.displayName,
        });
      }
    } catch (error) {
      console.error('Error uploading image:', error);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDeleteImage = (attachmentId: string) => {
    if (deleteProjectAttachment(attachmentId)) {
      setProjectImages(getProjectAttachments(project.id));
      onUpdate();
    }
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (moreMenuRef.current && !moreMenuRef.current.contains(event.target as Node)) {
        setMoreMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!isOpen) return null;

  const vendor = project.primaryVendorId ? getVendorById(project.primaryVendorId) : null;
  const bom = getBOMByProjectId(project.id);
  const projectExpenses = getExpensesByProject(project.id);
  const projectDocuments = getDocumentsByProject(project.id);

  /**
   * @navigation-structure
   * Miller's Law Compliance: 4 top-level navigation items (max 7 allowed)
   *
   * @top-level-count 4
   * @top-level-items Overview, Images, Milestones, More
   * @grouped-items More: [Expenses, Documents, Messages, Stakeholders, Details]
   *
   * This component uses a "More" dropdown to group secondary tabs,
   * keeping the visible top-level navigation well under the 7-item limit.
   */

  // Primary tabs (always visible) - 3 items + "More" dropdown = 4 top-level items
  const primaryTabs = [
    { id: 'overview' as Tab, label: 'Overview', icon: FileText },
    { id: 'images' as Tab, label: 'Images', icon: Image, count: projectImages.length },
    { id: 'milestones' as Tab, label: 'Milestones', icon: CheckCircle, count: project.phases.length },
  ];

  // Secondary tabs (grouped under "More" dropdown) - NOT top-level items
  const secondaryTabs = [
    { id: 'expenses' as Tab, label: 'Expenses', icon: DollarSign, count: projectExpenses.length },
    { id: 'documents' as Tab, label: 'Documents', icon: Paperclip, count: projectDocuments.length },
    { id: 'messages' as Tab, label: 'Messages', icon: MessageSquare },
    { id: 'stakeholders' as Tab, label: 'Stakeholders', icon: Users, count: project.stakeholders.length },
    { id: 'details' as Tab, label: 'Details', icon: FileText, show: !!(bom || project.impactAnalysis) },
  ].filter(tab => tab.show !== false);

  const isSecondaryTabActive = secondaryTabs.some(tab => tab.id === activeTab);

  const getStatusColor = (status: string) => {
    const colors = {
      draft: 'bg-slate-500/20 text-slate-400',
      pending_approval: 'bg-yellow-500/20 text-yellow-400',
      approved: 'bg-blue-500/20 text-blue-400',
      in_progress: 'bg-indigo-400/20 text-indigo-300',
      on_hold: 'bg-purple-500/20 text-purple-400',
      completed: 'bg-green-500/20 text-green-400',
      cancelled: 'bg-red-500/20 text-red-400',
    };
    return colors[status as keyof typeof colors] || colors.draft;
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      low: 'bg-blue-500/20 text-blue-400',
      medium: 'bg-yellow-500/20 text-yellow-400',
      high: 'bg-indigo-400/20 text-indigo-300',
      urgent: 'bg-red-500/20 text-red-400',
    };
    return colors[priority as keyof typeof colors] || colors.medium;
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-cc-surface rounded-xl shadow-2xl max-w-5xl w-full max-h-[90vh] flex flex-col border border-cc-border">
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-cc-border">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-2xl font-bold text-cc-text truncate">{project.title}</h2>
              <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(project.status)}`}>
                {STATUS_LABELS[project.status]}
              </span>
              <span className={`px-2 py-1 rounded text-xs font-medium ${getPriorityColor(project.priority)}`}>
                {PRIORITY_LABELS[project.priority]}
              </span>
            </div>
            <p className="text-sm text-cc-muted">{CATEGORY_LABELS[project.category]}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-cc-border rounded-lg transition-colors text-cc-muted hover:text-cc-text"
          >
            <X size={20} />
          </button>
        </div>

        {/* Tabs - 3 primary tabs + "More" dropdown = 4 top-level items (Miller's Law: max 7) */}
        <div className="flex gap-1 px-6 pt-4 border-b border-cc-border overflow-x-auto">
          {primaryTabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-t-lg transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-cc-accent text-white'
                    : 'text-cc-muted hover:text-cc-text hover:bg-cc-border/50'
                }`}
              >
                <Icon size={16} />
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span className={`ml-1 px-1.5 py-0.5 rounded text-xs ${
                    activeTab === tab.id ? 'bg-white/20' : 'bg-cc-border'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}

          {/* More dropdown for secondary tabs */}
          {secondaryTabs.length > 0 && (
            <div className="relative" ref={moreMenuRef}>
              <button
                onClick={() => setMoreMenuOpen(!moreMenuOpen)}
                className={`flex items-center gap-2 px-4 py-2 rounded-t-lg transition-colors whitespace-nowrap ${
                  isSecondaryTabActive
                    ? 'bg-cc-accent text-white'
                    : 'text-cc-muted hover:text-cc-text hover:bg-cc-border/50'
                }`}
              >
                <span>{isSecondaryTabActive ? secondaryTabs.find(t => t.id === activeTab)?.label : 'More'}</span>
                <ChevronDown size={14} className={`transition-transform ${moreMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {moreMenuOpen && (
                <div className="absolute top-full left-0 mt-1 bg-cc-surface border border-cc-border rounded-lg shadow-xl z-10 min-w-[180px] py-1">
                  {secondaryTabs.map(tab => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => {
                          setActiveTab(tab.id);
                          setMoreMenuOpen(false);
                        }}
                        className={`w-full flex items-center gap-2 px-4 py-2 transition-colors ${
                          activeTab === tab.id
                            ? 'bg-cc-accent/20 text-cc-accent'
                            : 'text-cc-muted hover:text-cc-text hover:bg-cc-border/50'
                        }`}
                      >
                        <Icon size={16} />
                        <span>{tab.label}</span>
                        {tab.count !== undefined && (
                          <span className="ml-auto px-1.5 py-0.5 rounded text-xs bg-cc-border">
                            {tab.count}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Description */}
              <div>
                <h3 className="text-sm font-semibold text-cc-text mb-2">Description</h3>
                <p className="text-sm text-cc-muted whitespace-pre-wrap">{project.description}</p>
              </div>

              {/* Key Details Grid */}
              <div className="grid grid-cols-2 gap-4">
                {/* Vendor */}
                <div className="bg-cc-bg rounded-lg p-4 border border-cc-border">
                  <div className="flex items-center gap-2 text-cc-muted mb-2">
                    <User size={16} />
                    <span className="text-xs font-semibold uppercase">Primary Vendor</span>
                  </div>
                  <p className="text-cc-text">{vendor?.name || 'Not assigned'}</p>
                  {vendor && (
                    <p className="text-sm text-cc-muted mt-1">{vendor.phone}</p>
                  )}
                </div>

                {/* Project Owner */}
                <div className="bg-cc-bg rounded-lg p-4 border border-cc-border">
                  <div className="flex items-center gap-2 text-cc-muted mb-2">
                    <User size={16} />
                    <span className="text-xs font-semibold uppercase">Project Owner</span>
                  </div>
                  <p className="text-cc-text">{project.projectOwnerName}</p>
                </div>

                {/* Estimated Cost */}
                <div className="bg-cc-bg rounded-lg p-4 border border-cc-border">
                  <div className="flex items-center gap-2 text-cc-muted mb-2">
                    <DollarSign size={16} />
                    <span className="text-xs font-semibold uppercase">Estimated Cost</span>
                  </div>
                  <p className="text-cc-text text-xl font-bold">
                    {project.estimatedCost ? `$${project.estimatedCost.toLocaleString()}` : 'Not set'}
                  </p>
                  {project.actualCost && (
                    <p className="text-sm text-cc-muted mt-1">
                      Actual: ${project.actualCost.toLocaleString()}
                    </p>
                  )}
                </div>

                {/* Timeline */}
                <div className="bg-cc-bg rounded-lg p-4 border border-cc-border">
                  <div className="flex items-center gap-2 text-cc-muted mb-2">
                    <Calendar size={16} />
                    <span className="text-xs font-semibold uppercase">Timeline</span>
                  </div>
                  {project.estimatedStartDate ? (
                    <div className="space-y-1">
                      <p className="text-sm text-cc-text">
                        Start: {new Date(project.estimatedStartDate).toLocaleDateString()}
                      </p>
                      {project.estimatedEndDate && (
                        <p className="text-sm text-cc-text">
                          End: {new Date(project.estimatedEndDate).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="text-cc-text">Not scheduled</p>
                  )}
                </div>
              </div>

              {/* Priority Warning */}
              {project.priority === 'urgent' && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 flex items-start gap-3">
                  <AlertCircle className="text-red-400 flex-shrink-0" size={20} />
                  <div>
                    <h4 className="text-red-400 font-semibold mb-1">Urgent Priority</h4>
                    <p className="text-sm text-red-300">This project requires immediate attention.</p>
                  </div>
                </div>
              )}

              {/* Emergency Contacts */}
              {project.emergencyContacts.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-cc-text mb-3">Emergency Contacts</h3>
                  <div className="space-y-2">
                    {project.emergencyContacts.map((contact, idx) => (
                      <div key={idx} className="bg-cc-bg rounded-lg p-3 border border-cc-border">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-cc-text font-medium">{contact.name}</p>
                            <p className="text-sm text-cc-muted">{contact.relationship}</p>
                          </div>
                          <div className="text-right text-sm">
                            <p className="text-cc-text">{contact.phone}</p>
                            {contact.email && <p className="text-cc-muted">{contact.email}</p>}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tags */}
              {project.tags.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-cc-text mb-2">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {project.tags.map(tag => (
                      <span key={tag} className="px-2 py-1 bg-cc-border rounded text-xs text-cc-muted">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Notes */}
              {project.notes && (
                <div>
                  <h3 className="text-sm font-semibold text-cc-text mb-2">Additional Notes</h3>
                  <div className="bg-cc-bg rounded-lg p-4 border border-cc-border">
                    <p className="text-sm text-cc-muted whitespace-pre-wrap">{project.notes}</p>
                  </div>
                </div>
              )}

              {/* Metadata */}
              <div className="flex items-center gap-4 text-xs text-cc-muted pt-4 border-t border-cc-border">
                <div className="flex items-center gap-1">
                  <Clock size={12} />
                  Created {new Date(project.createdAt).toLocaleString()}
                </div>
                <div className="flex items-center gap-1">
                  <Clock size={12} />
                  Updated {new Date(project.updatedAt).toLocaleString()}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'milestones' && (
            <ProjectPhases project={project} onUpdate={onUpdate} />
          )}

          {activeTab === 'images' && (
            <div className="space-y-6">
              {/* Upload Section */}
              <div className="flex items-center justify-between">
                <p className="text-sm text-cc-muted">
                  {projectImages.length} image{projectImages.length !== 1 ? 's' : ''} uploaded
                </p>
                <div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    className="hidden"
                    id="image-upload"
                  />
                  <label
                    htmlFor="image-upload"
                    className={`btn-primary text-sm cursor-pointer inline-flex items-center gap-2 ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <Upload size={14} />
                    {isUploading ? 'Uploading...' : 'Upload Images'}
                  </label>
                </div>
              </div>

              {/* Images Grid */}
              {projectImages.length === 0 ? (
                <div className="text-center py-12">
                  <Image size={48} className="mx-auto text-cc-muted mb-4" />
                  <p className="text-cc-muted">No images uploaded yet</p>
                  <p className="text-sm text-cc-muted mt-1">
                    Click "Upload Images" to add project photos
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {projectImages.map(img => (
                    <div
                      key={img.id}
                      className="relative group rounded-lg overflow-hidden border border-cc-border bg-cc-bg aspect-square"
                    >
                      <img
                        src={(img as any).dataUrl}
                        alt={img.fileName}
                        className="w-full h-full object-cover cursor-pointer transition-transform group-hover:scale-105"
                        onClick={() => setLightboxImage(img)}
                      />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <button
                          onClick={() => setLightboxImage(img)}
                          className="p-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
                        >
                          <EyeIcon size={16} className="text-white" />
                        </button>
                        <button
                          onClick={() => handleDeleteImage(img.id)}
                          className="p-2 bg-red-500/50 rounded-lg hover:bg-red-500/70 transition-colors"
                        >
                          <Trash2 size={16} className="text-white" />
                        </button>
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/70 to-transparent">
                        <p className="text-xs text-white truncate">{img.fileName}</p>
                        <p className="text-[10px] text-white/70">
                          {new Date(img.uploadedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Lightbox */}
              {lightboxImage && (
                <div
                  className="fixed inset-0 bg-black/90 z-[60] flex items-center justify-center p-4"
                  onClick={() => setLightboxImage(null)}
                >
                  <button
                    onClick={() => setLightboxImage(null)}
                    className="absolute top-4 right-4 p-2 text-white hover:bg-cc-border rounded-lg"
                  >
                    <X size={24} />
                  </button>
                  <img
                    src={(lightboxImage as any).dataUrl}
                    alt={lightboxImage.fileName}
                    className="max-w-full max-h-full object-contain"
                    onClick={(e) => e.stopPropagation()}
                  />
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/70 px-4 py-2 rounded-lg text-center">
                    <p className="text-white text-sm">{lightboxImage.fileName}</p>
                    <p className="text-white/70 text-xs">
                      {new Date(lightboxImage.uploadedAt).toLocaleDateString()} • {lightboxImage.uploadedBy}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'messages' && (
            <ProjectMessageCenter project={project} />
          )}

          {activeTab === 'stakeholders' && (
            <StakeholderManager project={project} onUpdate={onUpdate} />
          )}

          {activeTab === 'details' && (
            <div className="space-y-8">
              {/* Bill of Materials Section */}
              {bom && (
                <div>
                  <h3 className="text-lg font-semibold text-cc-text mb-4 flex items-center gap-2">
                    <Receipt size={20} />
                    Bill of Materials
                  </h3>
                  <BOMDetailView bom={bom} showExport={true} />
                </div>
              )}

              {/* Impact Analysis Section */}
              {project.impactAnalysis && (
                <div>
                  <h3 className="text-lg font-semibold text-cc-text mb-4 flex items-center gap-2">
                    <Sparkles size={20} />
                    Impact Analysis
                  </h3>
                  <ImpactAnalysisView analysis={project.impactAnalysis} />
                </div>
              )}
            </div>
          )}

          {activeTab === 'documents' && (
            <div className="space-y-4">
              {projectDocuments.length === 0 ? (
                <div className="text-center py-12">
                  <Paperclip size={48} className="mx-auto text-cc-muted mb-4" />
                  <p className="text-cc-muted">No documents linked to this project</p>
                  <p className="text-sm text-cc-muted mt-1">
                    Link documents from the Documents page when uploading
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {projectDocuments.map((doc: DocumentFile) => (
                    <div key={doc.id} className="bg-cc-bg rounded-lg p-3 border border-cc-border flex items-center gap-4">
                      <div className="text-2xl">{getFileIcon(doc.mimeType)}</div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-cc-text truncate">{doc.name}</h4>
                        <div className="flex items-center gap-3 mt-0.5 text-xs text-cc-muted">
                          <span>{formatFileSize(doc.fileSize)}</span>
                          <span>{new Date(doc.uploadDate).toLocaleDateString()}</span>
                          <span className="px-1.5 py-0.5 rounded bg-cc-border">
                            {DOC_CATEGORY_LABELS[doc.category]}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {doc.mimeType.startsWith('image/') && (
                          <a href={doc.dataUrl} target="_blank" rel="noopener noreferrer" className="p-1.5 hover:bg-cc-border rounded text-cc-muted hover:text-cc-text">
                            <EyeIcon size={16} />
                          </a>
                        )}
                        <a href={doc.dataUrl} download={doc.name} className="p-1.5 hover:bg-cc-border rounded text-cc-muted hover:text-cc-text">
                          <Download size={16} />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'expenses' && (
            <div className="space-y-4">
              {projectExpenses.length === 0 ? (
                <div className="text-center py-12">
                  <DollarSign size={48} className="mx-auto text-cc-muted mb-4" />
                  <p className="text-cc-muted">No expenses linked to this project</p>
                  <p className="text-sm text-cc-muted mt-1">
                    Link expenses from the Maintenance &gt; Costs tab
                  </p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="bg-cc-bg rounded-lg p-4 border border-cc-border">
                      <p className="text-xs text-cc-muted uppercase mb-1">Total Expenses</p>
                      <p className="text-xl font-bold text-cc-text">
                        ${projectExpenses.reduce((sum: number, e: Expense) => sum + e.amount, 0).toLocaleString()}
                      </p>
                    </div>
                    <div className="bg-cc-bg rounded-lg p-4 border border-cc-border">
                      <p className="text-xs text-cc-muted uppercase mb-1">vs Estimated</p>
                      <p className="text-xl font-bold text-cc-text">
                        {project.estimatedCost
                          ? `$${project.estimatedCost.toLocaleString()}`
                          : 'No estimate'}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {projectExpenses.map((expense: Expense) => (
                      <div key={expense.id} className="bg-cc-bg rounded-lg p-3 border border-cc-border flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <DollarSign size={16} className="text-cc-accent" />
                          <div>
                            <p className="text-sm font-medium text-cc-text">{expense.description}</p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-xs text-cc-muted">
                                {new Date(expense.date).toLocaleDateString()}
                              </span>
                              <span className="text-xs px-1.5 py-0.5 rounded bg-cc-border text-cc-muted">
                                {expense.category}
                              </span>
                              {expense.isCapitalImprovement && (
                                <span className="text-xs px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-400">
                                  Capital
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <p className="text-sm font-bold text-cc-text">${expense.amount.toLocaleString()}</p>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-cc-border">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-cc-border hover:bg-slate-500 text-white rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
