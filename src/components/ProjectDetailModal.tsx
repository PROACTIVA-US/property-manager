import { useState, useRef, useEffect } from 'react';
import { X, Calendar, DollarSign, User, AlertCircle, CheckCircle, Clock, FileText, MessageSquare, Users, Sparkles, Paperclip, Receipt, Download, Eye as EyeIcon, ChevronDown } from 'lucide-react';
import type { Project } from '../lib/projects';
import { STATUS_LABELS, PRIORITY_LABELS, CATEGORY_LABELS } from '../lib/projects';
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

interface ProjectDetailModalProps {
  project: Project;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
}

/**
 * @navigation-tab-count 7
 * Tab types for project detail modal navigation.
 * Note: These are NOT all top-level - they are grouped using a "More" dropdown.
 * Actual top-level count: 4 (Overview, Milestones, Expenses, More dropdown)
 */
type Tab = 'overview' | 'milestones' | 'expenses' | 'documents' | 'messages' | 'stakeholders' | 'details';

export default function ProjectDetailModal({ project, isOpen, onClose, onUpdate }: ProjectDetailModalProps) {
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);
  const moreMenuRef = useRef<HTMLDivElement>(null);

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
   * @top-level-items Overview, Milestones, Expenses, More
   * @grouped-items More: [Documents, Messages, Stakeholders, Details]
   *
   * This component uses a "More" dropdown to group secondary tabs,
   * keeping the visible top-level navigation well under the 7-item limit.
   * Total navigation items: 7 (3 primary + 4 in dropdown = 4 top-level clickable)
   */

  // Primary tabs (always visible) - 3 items + "More" dropdown = 4 top-level items
  const primaryTabs = [
    { id: 'overview' as Tab, label: 'Overview', icon: FileText },
    { id: 'milestones' as Tab, label: 'Milestones', icon: CheckCircle, count: project.phases.length },
    { id: 'expenses' as Tab, label: 'Expenses', icon: DollarSign, count: projectExpenses.length },
  ];

  // Secondary tabs (grouped under "More" dropdown) - NOT top-level items
  // These are nested inside a collapsible dropdown, reducing cognitive load
  // Consolidated from 6 items to 4 for better navigation
  const secondaryTabs = [
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
      <div className="bg-cc-bger rounded-xl shadow-2xl max-w-5xl w-full max-h-[90vh] flex flex-col border border-white/10">
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-white/10">
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
            className="p-2 hover:bg-white/10 rounded-lg transition-colors text-cc-muted hover:text-cc-text"
          >
            <X size={20} />
          </button>
        </div>

        {/* Tabs - 3 primary tabs + "More" dropdown = 4 top-level items (Miller's Law: max 7) */}
        <div className="flex gap-1 px-6 pt-4 border-b border-white/10 overflow-x-auto">
          {primaryTabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-t-lg transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-cc-accent text-white'
                    : 'text-cc-muted hover:text-cc-text hover:bg-white/5'
                }`}
              >
                <Icon size={16} />
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span className={`ml-1 px-1.5 py-0.5 rounded text-xs ${
                    activeTab === tab.id ? 'bg-white/20' : 'bg-white/10'
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
                    : 'text-cc-muted hover:text-cc-text hover:bg-white/5'
                }`}
              >
                <span>{isSecondaryTabActive ? secondaryTabs.find(t => t.id === activeTab)?.label : 'More'}</span>
                <ChevronDown size={14} className={`transition-transform ${moreMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {moreMenuOpen && (
                <div className="absolute top-full left-0 mt-1 bg-cc-bger border border-white/10 rounded-lg shadow-xl z-10 min-w-[180px] py-1">
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
                            : 'text-cc-muted hover:text-cc-text hover:bg-white/5'
                        }`}
                      >
                        <Icon size={16} />
                        <span>{tab.label}</span>
                        {tab.count !== undefined && (
                          <span className="ml-auto px-1.5 py-0.5 rounded text-xs bg-white/10">
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
                <div className="bg-cc-bg rounded-lg p-4 border border-white/10">
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
                <div className="bg-cc-bg rounded-lg p-4 border border-white/10">
                  <div className="flex items-center gap-2 text-cc-muted mb-2">
                    <User size={16} />
                    <span className="text-xs font-semibold uppercase">Project Owner</span>
                  </div>
                  <p className="text-cc-text">{project.projectOwnerName}</p>
                </div>

                {/* Estimated Cost */}
                <div className="bg-cc-bg rounded-lg p-4 border border-white/10">
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
                <div className="bg-cc-bg rounded-lg p-4 border border-white/10">
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
                      <div key={idx} className="bg-cc-bg rounded-lg p-3 border border-white/10">
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
                      <span key={tag} className="px-2 py-1 bg-white/10 rounded text-xs text-cc-muted">
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
                  <div className="bg-cc-bg rounded-lg p-4 border border-white/10">
                    <p className="text-sm text-cc-muted whitespace-pre-wrap">{project.notes}</p>
                  </div>
                </div>
              )}

              {/* Metadata */}
              <div className="flex items-center gap-4 text-xs text-cc-muted pt-4 border-t border-white/10">
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
                    <div key={doc.id} className="bg-cc-bg rounded-lg p-3 border border-white/10 flex items-center gap-4">
                      <div className="text-2xl">{getFileIcon(doc.mimeType)}</div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-cc-text truncate">{doc.name}</h4>
                        <div className="flex items-center gap-3 mt-0.5 text-xs text-cc-muted">
                          <span>{formatFileSize(doc.fileSize)}</span>
                          <span>{new Date(doc.uploadDate).toLocaleDateString()}</span>
                          <span className="px-1.5 py-0.5 rounded bg-white/10">
                            {DOC_CATEGORY_LABELS[doc.category]}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {doc.mimeType.startsWith('image/') && (
                          <a href={doc.dataUrl} target="_blank" rel="noopener noreferrer" className="p-1.5 hover:bg-white/10 rounded text-cc-muted hover:text-cc-text">
                            <EyeIcon size={16} />
                          </a>
                        )}
                        <a href={doc.dataUrl} download={doc.name} className="p-1.5 hover:bg-white/10 rounded text-cc-muted hover:text-cc-text">
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
                    <div className="bg-cc-bg rounded-lg p-4 border border-white/10">
                      <p className="text-xs text-cc-muted uppercase mb-1">Total Expenses</p>
                      <p className="text-xl font-bold text-cc-text">
                        ${projectExpenses.reduce((sum: number, e: Expense) => sum + e.amount, 0).toLocaleString()}
                      </p>
                    </div>
                    <div className="bg-cc-bg rounded-lg p-4 border border-white/10">
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
                      <div key={expense.id} className="bg-cc-bg rounded-lg p-3 border border-white/10 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <DollarSign size={16} className="text-cc-accent" />
                          <div>
                            <p className="text-sm font-medium text-cc-text">{expense.description}</p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-xs text-cc-muted">
                                {new Date(expense.date).toLocaleDateString()}
                              </span>
                              <span className="text-xs px-1.5 py-0.5 rounded bg-white/10 text-cc-muted">
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
        <div className="flex items-center justify-end gap-3 p-6 border-t border-white/10">
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
