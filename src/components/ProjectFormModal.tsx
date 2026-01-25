import { useState, useEffect } from 'react';
import { X, Sparkles } from 'lucide-react';
import type { Project, ProjectCategory, ProjectPriority, ProjectStatus } from '../lib/projects';
import { createProject, updateProject, CATEGORY_LABELS, PRIORITY_LABELS } from '../lib/projects';
import { getVendors } from '../lib/vendors';
import { useAuth } from '../contexts/AuthContext';

interface ProjectFormModalProps {
  project: Project | null; // null for new project
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
}

export default function ProjectFormModal({ project, isOpen, onClose, onSave }: ProjectFormModalProps) {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'maintenance' as ProjectCategory,
    status: 'draft' as ProjectStatus,
    priority: 'medium' as ProjectPriority,
    primaryVendorId: '',
    estimatedCost: '',
    estimatedStartDate: '',
    estimatedEndDate: '',
    notes: '',
    tags: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const vendors = getVendors();

  useEffect(() => {
    if (project) {
      // Edit mode - populate form with project data
      setFormData({
        title: project.title,
        description: project.description,
        category: project.category,
        status: project.status,
        priority: project.priority,
        primaryVendorId: project.primaryVendorId || '',
        estimatedCost: project.estimatedCost?.toString() || '',
        estimatedStartDate: project.estimatedStartDate || '',
        estimatedEndDate: project.estimatedEndDate || '',
        notes: project.notes || '',
        tags: project.tags.join(', '),
      });
    } else {
      // Create mode - reset form
      setFormData({
        title: '',
        description: '',
        category: 'maintenance',
        status: 'draft',
        priority: 'medium',
        primaryVendorId: '',
        estimatedCost: '',
        estimatedStartDate: '',
        estimatedEndDate: '',
        notes: '',
        tags: '',
      });
    }
  }, [project, isOpen]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Required fields
    if (!formData.title.trim()) {
      newErrors.title = 'Project title is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    // Cost validation
    if (formData.estimatedCost) {
      const cost = parseFloat(formData.estimatedCost);
      if (isNaN(cost) || cost < 0) {
        newErrors.estimatedCost = 'Cost must be a positive number';
      }
    }

    // Date validation
    if (formData.estimatedStartDate && formData.estimatedEndDate) {
      const startDate = new Date(formData.estimatedStartDate);
      const endDate = new Date(formData.estimatedEndDate);
      if (endDate < startDate) {
        newErrors.estimatedEndDate = 'End date must be after start date';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    if (!user) {
      setErrors({ general: 'User not authenticated' });
      return;
    }

    const projectData = {
      title: formData.title.trim(),
      description: formData.description.trim(),
      category: formData.category,
      status: formData.status,
      priority: formData.priority,
      primaryVendorId: formData.primaryVendorId || undefined,
      estimatedCost: formData.estimatedCost ? parseFloat(formData.estimatedCost) : undefined,
      estimatedStartDate: formData.estimatedStartDate || undefined,
      estimatedEndDate: formData.estimatedEndDate || undefined,
      notes: formData.notes || undefined,
      tags: formData.tags
        .split(',')
        .map(t => t.trim())
        .filter(Boolean),
    };

    if (project) {
      // Update existing project
      updateProject(project.id, projectData);
    } else {
      // Create new project
      createProject({
        ...projectData,
        additionalVendorIds: [],
        projectOwnerId: user.email,
        projectOwnerName: user.displayName || user.email,
        stakeholders: [],
        emergencyContacts: [],
        phases: [],
        messages: [],
        createdBy: user.email,
      });
    }

    onSave();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-brand-darker rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col border border-white/10">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <h2 className="text-2xl font-bold text-brand-light">
            {project ? 'Edit Project' : 'New Project'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors text-brand-muted hover:text-brand-light"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6">
          <div className="space-y-4">
            {/* General Error */}
            {errors.general && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-sm text-red-400">
                {errors.general}
              </div>
            )}

            {/* Title */}
            <div>
              <label className="block text-sm font-semibold text-brand-light mb-1">
                Project Title <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={e => {
                  setFormData({ ...formData, title: e.target.value });
                  if (errors.title) setErrors({ ...errors, title: '' });
                }}
                className={`input-field w-full ${errors.title ? 'border-red-500' : ''}`}
                placeholder="e.g., HVAC System Upgrade"
              />
              {errors.title && (
                <p className="text-xs text-red-400 mt-1">{errors.title}</p>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-semibold text-brand-light mb-1">
                Description <span className="text-red-400">*</span>
              </label>
              <textarea
                value={formData.description}
                onChange={e => {
                  setFormData({ ...formData, description: e.target.value });
                  if (errors.description) setErrors({ ...errors, description: '' });
                }}
                className={`input-field w-full ${errors.description ? 'border-red-500' : ''}`}
                rows={4}
                placeholder="Describe the project scope, objectives, and key details..."
              />
              {errors.description && (
                <p className="text-xs text-red-400 mt-1">{errors.description}</p>
              )}
            </div>

            {/* Category, Priority, Status Grid */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold text-brand-light mb-1">Category</label>
                <select
                  value={formData.category}
                  onChange={e => setFormData({ ...formData, category: e.target.value as ProjectCategory })}
                  className="input-field w-full"
                >
                  {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-brand-light mb-1">Priority</label>
                <select
                  value={formData.priority}
                  onChange={e => setFormData({ ...formData, priority: e.target.value as ProjectPriority })}
                  className="input-field w-full"
                >
                  {Object.entries(PRIORITY_LABELS).map(([key, label]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-brand-light mb-1">Status</label>
                <select
                  value={formData.status}
                  onChange={e => setFormData({ ...formData, status: e.target.value as ProjectStatus })}
                  className="input-field w-full"
                >
                  <option value="draft">Draft</option>
                  <option value="pending_approval">Pending Approval</option>
                  <option value="approved">Approved</option>
                  <option value="in_progress">In Progress</option>
                  <option value="on_hold">On Hold</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            {/* Vendor */}
            <div>
              <label className="block text-sm font-semibold text-brand-light mb-1">Primary Vendor</label>
              <select
                value={formData.primaryVendorId}
                onChange={e => setFormData({ ...formData, primaryVendorId: e.target.value })}
                className="input-field w-full"
              >
                <option value="">None</option>
                {vendors.map(vendor => (
                  <option key={vendor.id} value={vendor.id}>
                    {vendor.name} - {vendor.specialty}
                  </option>
                ))}
              </select>
            </div>

            {/* Cost & Timeline */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold text-brand-light mb-1">Estimated Cost</label>
                <input
                  type="number"
                  value={formData.estimatedCost}
                  onChange={e => {
                    setFormData({ ...formData, estimatedCost: e.target.value });
                    if (errors.estimatedCost) setErrors({ ...errors, estimatedCost: '' });
                  }}
                  className={`input-field w-full ${errors.estimatedCost ? 'border-red-500' : ''}`}
                  placeholder="0"
                  min="0"
                  step="0.01"
                />
                {errors.estimatedCost && (
                  <p className="text-xs text-red-400 mt-1">{errors.estimatedCost}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-brand-light mb-1">Start Date</label>
                <input
                  type="date"
                  value={formData.estimatedStartDate}
                  onChange={e => {
                    setFormData({ ...formData, estimatedStartDate: e.target.value });
                    if (errors.estimatedEndDate) setErrors({ ...errors, estimatedEndDate: '' });
                  }}
                  className="input-field w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-brand-light mb-1">End Date</label>
                <input
                  type="date"
                  value={formData.estimatedEndDate}
                  onChange={e => {
                    setFormData({ ...formData, estimatedEndDate: e.target.value });
                    if (errors.estimatedEndDate) setErrors({ ...errors, estimatedEndDate: '' });
                  }}
                  className={`input-field w-full ${errors.estimatedEndDate ? 'border-red-500' : ''}`}
                />
                {errors.estimatedEndDate && (
                  <p className="text-xs text-red-400 mt-1">{errors.estimatedEndDate}</p>
                )}
              </div>
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-semibold text-brand-light mb-1">Tags</label>
              <input
                type="text"
                value={formData.tags}
                onChange={e => setFormData({ ...formData, tags: e.target.value })}
                className="input-field w-full"
                placeholder="urgent, winter, electrical (comma-separated)"
              />
              <p className="text-xs text-brand-muted mt-1">Separate tags with commas</p>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-semibold text-brand-light mb-1">Additional Notes</label>
              <textarea
                value={formData.notes}
                onChange={e => setFormData({ ...formData, notes: e.target.value })}
                className="input-field w-full"
                rows={3}
                placeholder="Any additional information, special considerations, or requirements..."
              />
            </div>

            {/* AI Analysis Notice */}
            {!project && (
              <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Sparkles className="text-purple-400 flex-shrink-0 mt-0.5" size={18} />
                  <div>
                    <h4 className="text-purple-400 font-semibold mb-1">AI Impact Analysis</h4>
                    <p className="text-sm text-purple-300">
                      After creating this project, you can generate an AI-powered impact analysis to understand effects on tenants and owners.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </form>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-white/10">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-600 hover:bg-slate-500 text-white rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            className="px-4 py-2 bg-brand-orange hover:bg-orange-600 text-white rounded-lg transition-colors font-semibold"
          >
            {project ? 'Save Changes' : 'Create Project'}
          </button>
        </div>
      </div>
    </div>
  );
}
