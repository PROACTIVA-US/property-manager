import { useState } from 'react';
import { X, Calendar, DollarSign, User, AlertCircle, CheckCircle, Clock, FileText, MessageSquare, Users, Sparkles, Paperclip, Receipt } from 'lucide-react';
import type { Project } from '../lib/projects';
import { STATUS_LABELS, PRIORITY_LABELS, CATEGORY_LABELS } from '../lib/projects';
import { getVendorById } from '../lib/vendors';
import { getBOMByProjectId } from '../lib/bom';
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

type Tab = 'overview' | 'milestones' | 'messages' | 'stakeholders' | 'bom' | 'impact' | 'attachments';

export default function ProjectDetailModal({ project, isOpen, onClose, onUpdate }: ProjectDetailModalProps) {
  const [activeTab, setActiveTab] = useState<Tab>('overview');

  if (!isOpen) return null;

  const vendor = project.primaryVendorId ? getVendorById(project.primaryVendorId) : null;
  const bom = getBOMByProjectId(project.id);

  const tabs = [
    { id: 'overview' as Tab, label: 'Overview', icon: FileText },
    { id: 'milestones' as Tab, label: 'Milestones', icon: CheckCircle, count: project.phases.length },
    { id: 'messages' as Tab, label: 'Messages', icon: MessageSquare },
    { id: 'stakeholders' as Tab, label: 'Stakeholders', icon: Users, count: project.stakeholders.length },
    { id: 'bom' as Tab, label: 'Bill of Materials', icon: Receipt, show: !!bom },
    { id: 'impact' as Tab, label: 'Impact Analysis', icon: Sparkles, show: !!project.impactAnalysis },
    { id: 'attachments' as Tab, label: 'Attachments', icon: Paperclip },
  ].filter(tab => tab.show !== false);

  const getStatusColor = (status: string) => {
    const colors = {
      draft: 'bg-slate-500/20 text-slate-400',
      pending_approval: 'bg-yellow-500/20 text-yellow-400',
      approved: 'bg-blue-500/20 text-blue-400',
      in_progress: 'bg-orange-500/20 text-orange-400',
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
      high: 'bg-orange-500/20 text-orange-400',
      urgent: 'bg-red-500/20 text-red-400',
    };
    return colors[priority as keyof typeof colors] || colors.medium;
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-brand-darker rounded-xl shadow-2xl max-w-5xl w-full max-h-[90vh] flex flex-col border border-white/10">
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-white/10">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-2xl font-bold text-brand-light truncate">{project.title}</h2>
              <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(project.status)}`}>
                {STATUS_LABELS[project.status]}
              </span>
              <span className={`px-2 py-1 rounded text-xs font-medium ${getPriorityColor(project.priority)}`}>
                {PRIORITY_LABELS[project.priority]}
              </span>
            </div>
            <p className="text-sm text-brand-muted">{CATEGORY_LABELS[project.category]}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors text-brand-muted hover:text-brand-light"
          >
            <X size={20} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 px-6 pt-4 border-b border-white/10 overflow-x-auto">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-t-lg transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-brand-orange text-white'
                    : 'text-brand-muted hover:text-brand-light hover:bg-white/5'
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
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Description */}
              <div>
                <h3 className="text-sm font-semibold text-brand-light mb-2">Description</h3>
                <p className="text-sm text-brand-muted whitespace-pre-wrap">{project.description}</p>
              </div>

              {/* Key Details Grid */}
              <div className="grid grid-cols-2 gap-4">
                {/* Vendor */}
                <div className="bg-brand-dark rounded-lg p-4 border border-white/10">
                  <div className="flex items-center gap-2 text-brand-muted mb-2">
                    <User size={16} />
                    <span className="text-xs font-semibold uppercase">Primary Vendor</span>
                  </div>
                  <p className="text-brand-light">{vendor?.name || 'Not assigned'}</p>
                  {vendor && (
                    <p className="text-sm text-brand-muted mt-1">{vendor.phone}</p>
                  )}
                </div>

                {/* Project Owner */}
                <div className="bg-brand-dark rounded-lg p-4 border border-white/10">
                  <div className="flex items-center gap-2 text-brand-muted mb-2">
                    <User size={16} />
                    <span className="text-xs font-semibold uppercase">Project Owner</span>
                  </div>
                  <p className="text-brand-light">{project.projectOwnerName}</p>
                </div>

                {/* Estimated Cost */}
                <div className="bg-brand-dark rounded-lg p-4 border border-white/10">
                  <div className="flex items-center gap-2 text-brand-muted mb-2">
                    <DollarSign size={16} />
                    <span className="text-xs font-semibold uppercase">Estimated Cost</span>
                  </div>
                  <p className="text-brand-light text-xl font-bold">
                    {project.estimatedCost ? `$${project.estimatedCost.toLocaleString()}` : 'Not set'}
                  </p>
                  {project.actualCost && (
                    <p className="text-sm text-brand-muted mt-1">
                      Actual: ${project.actualCost.toLocaleString()}
                    </p>
                  )}
                </div>

                {/* Timeline */}
                <div className="bg-brand-dark rounded-lg p-4 border border-white/10">
                  <div className="flex items-center gap-2 text-brand-muted mb-2">
                    <Calendar size={16} />
                    <span className="text-xs font-semibold uppercase">Timeline</span>
                  </div>
                  {project.estimatedStartDate ? (
                    <div className="space-y-1">
                      <p className="text-sm text-brand-light">
                        Start: {new Date(project.estimatedStartDate).toLocaleDateString()}
                      </p>
                      {project.estimatedEndDate && (
                        <p className="text-sm text-brand-light">
                          End: {new Date(project.estimatedEndDate).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="text-brand-light">Not scheduled</p>
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
                  <h3 className="text-sm font-semibold text-brand-light mb-3">Emergency Contacts</h3>
                  <div className="space-y-2">
                    {project.emergencyContacts.map((contact, idx) => (
                      <div key={idx} className="bg-brand-dark rounded-lg p-3 border border-white/10">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-brand-light font-medium">{contact.name}</p>
                            <p className="text-sm text-brand-muted">{contact.relationship}</p>
                          </div>
                          <div className="text-right text-sm">
                            <p className="text-brand-light">{contact.phone}</p>
                            {contact.email && <p className="text-brand-muted">{contact.email}</p>}
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
                  <h3 className="text-sm font-semibold text-brand-light mb-2">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {project.tags.map(tag => (
                      <span key={tag} className="px-2 py-1 bg-white/10 rounded text-xs text-brand-muted">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Notes */}
              {project.notes && (
                <div>
                  <h3 className="text-sm font-semibold text-brand-light mb-2">Additional Notes</h3>
                  <div className="bg-brand-dark rounded-lg p-4 border border-white/10">
                    <p className="text-sm text-brand-muted whitespace-pre-wrap">{project.notes}</p>
                  </div>
                </div>
              )}

              {/* Metadata */}
              <div className="flex items-center gap-4 text-xs text-brand-muted pt-4 border-t border-white/10">
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

          {activeTab === 'bom' && bom && (
            <BOMDetailView bom={bom} showExport={true} />
          )}

          {activeTab === 'impact' && project.impactAnalysis && (
            <ImpactAnalysisView analysis={project.impactAnalysis} />
          )}

          {activeTab === 'attachments' && (
            <div className="text-center py-12">
              <Paperclip size={48} className="mx-auto text-brand-muted mb-4" />
              <p className="text-brand-muted">Attachment management coming soon</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-white/10">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-600 hover:bg-slate-500 text-white rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
