/**
 * IssueCreateForm Component
 * Form for creating new issues (all roles can create)
 */

import { useState, useCallback } from 'react';
import { X, Upload, AlertCircle } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useAuth } from '../../contexts/AuthContext';
import { createIssue } from '../../lib/issues';
import type {
  IssueCategory,
  IssuePriority,
  CreateIssueInput,
  IssueImage,
} from '../../types/issues.types';
import {
  ISSUE_CATEGORY_CONFIG,
  ISSUE_PRIORITY_CONFIG,
  PROPERTY_LOCATIONS,
  SLA_TARGETS,
} from '../../types/issues.types';

interface IssueCreateFormProps {
  onClose: () => void;
  onCreated?: () => void;
}

export default function IssueCreateForm({ onClose, onCreated }: IssueCreateFormProps) {
  const { user } = useAuth();

  const [formData, setFormData] = useState<CreateIssueInput>({
    title: '',
    description: '',
    category: 'maintenance',
    priority: 'medium',
    location: '',
    images: [],
    tags: [],
  });

  const [images, setImages] = useState<Array<{ preview: string; file?: File; caption?: string }>>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    // Limit to 5 images
    const remainingSlots = 5 - images.length;
    const filesToAdd = Array.from(files).slice(0, remainingSlots);

    filesToAdd.forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        setImages(prev => [...prev, { preview: dataUrl, file }]);
      };
      reader.readAsDataURL(file);
    });

    // Reset input
    e.target.value = '';
  }, [images.length]);

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      setError('You must be logged in to create an issue');
      return;
    }

    if (!formData.title.trim()) {
      setError('Title is required');
      return;
    }

    if (!formData.description.trim()) {
      setError('Description is required');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // Convert images to the format expected by createIssue
      const issueImages: Omit<IssueImage, 'id' | 'uploadedAt' | 'uploadedBy' | 'uploadedByName'>[] =
        images.map(img => ({
          url: img.preview,
          caption: img.caption || '',
          type: 'before' as const,
        }));

      const issueData: CreateIssueInput = {
        ...formData,
        images: issueImages,
      };

      createIssue(
        issueData,
        user.uid,
        user.displayName,
        user.role as 'owner' | 'pm' | 'tenant'
      );

      onCreated?.();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create issue');
    } finally {
      setIsSubmitting(false);
    }
  };

  const categories = Object.entries(ISSUE_CATEGORY_CONFIG) as [IssueCategory, typeof ISSUE_CATEGORY_CONFIG[IssueCategory]][];
  const priorities = Object.entries(ISSUE_PRIORITY_CONFIG) as [IssuePriority, typeof ISSUE_PRIORITY_CONFIG[IssuePriority]][];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-cc-surface border border-cc-border rounded-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-cc-border">
          <h2 className="text-xl font-bold text-cc-text">Report New Issue</h2>
          <button
            onClick={onClose}
            className="p-2 text-cc-muted hover:text-cc-text rounded-lg hover:bg-cc-bg/50 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-6">
            {/* Error message */}
            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-cc-text mb-2">
                Title <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Brief description of the issue"
                className="input-field w-full"
                required
              />
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-cc-text mb-2">
                Description <span className="text-red-400">*</span>
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Provide details about the issue, when it started, and any relevant information..."
                rows={4}
                className="input-field w-full resize-none"
                required
              />
            </div>

            {/* Category and Priority */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Category */}
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-cc-text mb-2">
                  Category
                </label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="input-field w-full"
                >
                  {categories.map(([value, config]) => (
                    <option key={value} value={value}>
                      {config.icon} {config.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Priority */}
              <div>
                <label htmlFor="priority" className="block text-sm font-medium text-cc-text mb-2">
                  Priority
                </label>
                <select
                  id="priority"
                  name="priority"
                  value={formData.priority}
                  onChange={handleInputChange}
                  className="input-field w-full"
                >
                  {priorities.map(([value, config]) => (
                    <option key={value} value={value}>
                      {config.icon} {config.label}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-cc-muted mt-1">
                  {ISSUE_PRIORITY_CONFIG[formData.priority].description}
                </p>
              </div>
            </div>

            {/* Location */}
            <div>
              <label htmlFor="location" className="block text-sm font-medium text-cc-text mb-2">
                Location
              </label>
              <select
                id="location"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                className="input-field w-full"
              >
                <option value="">Select location...</option>
                {PROPERTY_LOCATIONS.map(loc => (
                  <option key={loc} value={loc}>
                    {loc}
                  </option>
                ))}
              </select>
            </div>

            {/* Photo Upload */}
            <div>
              <label className="block text-sm font-medium text-cc-text mb-2">
                Photos <span className="text-cc-muted">(optional, max 5)</span>
              </label>

              {/* Image previews */}
              {images.length > 0 && (
                <div className="grid grid-cols-5 gap-2 mb-3">
                  {images.map((img, index) => (
                    <div key={index} className="relative aspect-square">
                      <img
                        src={img.preview}
                        alt={`Upload ${index + 1}`}
                        className="w-full h-full object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute -top-1 -right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Upload button */}
              {images.length < 5 && (
                <label
                  className={cn(
                    'flex flex-col items-center justify-center',
                    'w-full h-32 border-2 border-dashed border-cc-border rounded-lg',
                    'cursor-pointer hover:border-cc-accent/50 hover:bg-cc-bg/30 transition-colors'
                  )}
                >
                  <Upload size={24} className="text-cc-muted mb-2" />
                  <span className="text-sm text-cc-muted">Click to upload photos</span>
                  <span className="text-xs text-cc-muted mt-1">
                    {5 - images.length} remaining
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            {/* SLA Info */}
            <div className="bg-cc-bg/50 rounded-lg p-4 text-sm">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle size={16} className="text-cc-accent" />
                <span className="font-medium text-cc-text">Response Time</span>
              </div>
              <p className="text-cc-muted">
                Based on the selected priority ({ISSUE_PRIORITY_CONFIG[formData.priority].label}),
                this issue should be addressed within{' '}
                <span className="text-cc-text font-medium">
                  {SLA_TARGETS[formData.priority]} hours
                </span>
                .
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-cc-border bg-cc-bg/30">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Creating...' : 'Create Issue'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
