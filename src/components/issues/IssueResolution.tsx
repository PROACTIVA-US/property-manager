/**
 * IssueResolution Component
 * Form for resolving issues (PM only)
 */

import { useState } from 'react';
import { Upload, X, CheckCircle, AlertCircle } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useAuth } from '../../contexts/AuthContext';
import { updateIssue, addIssueImage } from '../../lib/issues';
import type { Issue, CostPayer } from '../../types/issues.types';

interface IssueResolutionProps {
  issue: Issue;
  onResolved: () => void;
  onCancel: () => void;
}

export default function IssueResolution({
  issue,
  onResolved,
  onCancel,
}: IssueResolutionProps) {
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    resolutionNotes: '',
    actualCost: issue.estimatedCost || 0,
    costPaidBy: 'owner' as CostPayer,
    costNotes: '',
    vendorRating: 5,
  });

  const [afterImages, setAfterImages] = useState<Array<{ preview: string; caption?: string }>>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'actualCost' || name === 'vendorRating' ? parseFloat(value) || 0 : value,
    }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const remainingSlots = 5 - afterImages.length;
    const filesToAdd = Array.from(files).slice(0, remainingSlots);

    filesToAdd.forEach(file => {
      const reader = new FileReader();
      reader.onload = event => {
        const dataUrl = event.target?.result as string;
        setAfterImages(prev => [...prev, { preview: dataUrl }]);
      };
      reader.readAsDataURL(file);
    });

    e.target.value = '';
  };

  const removeImage = (index: number) => {
    setAfterImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      setError('You must be logged in');
      return;
    }

    if (!formData.resolutionNotes.trim()) {
      setError('Resolution notes are required');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // Upload after images first
      for (const img of afterImages) {
        addIssueImage(
          issue.id,
          {
            url: img.preview,
            caption: img.caption || '',
            type: 'after',
            uploadedBy: user.uid,
            uploadedByName: user.displayName,
          },
          user.uid,
          user.displayName,
          user.role as 'owner' | 'pm' | 'tenant'
        );
      }

      // Update issue to resolved
      updateIssue(
        issue.id,
        {
          status: 'resolved',
          resolutionNotes: formData.resolutionNotes,
          actualCost: formData.actualCost,
          costPaidBy: formData.costPaidBy,
          costNotes: formData.costNotes,
        },
        user.uid,
        user.displayName,
        user.role as 'owner' | 'pm' | 'tenant'
      );

      onResolved();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to resolve issue');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* Resolution Notes */}
      <div>
        <label htmlFor="resolutionNotes" className="block text-sm font-medium text-cc-text mb-2">
          Resolution Summary <span className="text-red-400">*</span>
        </label>
        <textarea
          id="resolutionNotes"
          name="resolutionNotes"
          value={formData.resolutionNotes}
          onChange={handleInputChange}
          placeholder="Describe how the issue was resolved..."
          rows={4}
          className="input-field w-full resize-none"
          required
        />
      </div>

      {/* After Photos */}
      <div>
        <label className="block text-sm font-medium text-cc-text mb-2">
          After Photos <span className="text-cc-muted">(optional)</span>
        </label>

        {afterImages.length > 0 && (
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 mb-3">
            {afterImages.map((img, index) => (
              <div key={index} className="relative aspect-square">
                <img
                  src={img.preview}
                  alt={`After ${index + 1}`}
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

        {afterImages.length < 5 && (
          <label
            className={cn(
              'flex flex-col items-center justify-center',
              'w-full h-24 border-2 border-dashed border-cc-border rounded-lg',
              'cursor-pointer hover:border-cc-accent/50 hover:bg-cc-bg/30 transition-colors'
            )}
          >
            <Upload size={20} className="text-cc-muted mb-1" />
            <span className="text-sm text-cc-muted">Add after photos</span>
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

      {/* Cost */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="actualCost" className="block text-sm font-medium text-cc-text mb-2">
            Final Cost
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-cc-muted">$</span>
            <input
              type="number"
              id="actualCost"
              name="actualCost"
              value={formData.actualCost}
              onChange={handleInputChange}
              min="0"
              step="0.01"
              className="input-field w-full pl-7"
            />
          </div>
        </div>

        <div>
          <label htmlFor="costPaidBy" className="block text-sm font-medium text-cc-text mb-2">
            Paid By
          </label>
          <select
            id="costPaidBy"
            name="costPaidBy"
            value={formData.costPaidBy}
            onChange={handleInputChange}
            className="input-field w-full"
          >
            <option value="owner">Owner</option>
            <option value="tenant">Tenant</option>
            <option value="insurance">Insurance</option>
            <option value="warranty">Warranty</option>
          </select>
        </div>
      </div>

      {/* Cost Notes */}
      <div>
        <label htmlFor="costNotes" className="block text-sm font-medium text-cc-text mb-2">
          Cost Notes <span className="text-cc-muted">(optional)</span>
        </label>
        <input
          type="text"
          id="costNotes"
          name="costNotes"
          value={formData.costNotes}
          onChange={handleInputChange}
          placeholder="Any notes about the cost..."
          className="input-field w-full"
        />
      </div>

      {/* Vendor Rating (if vendor assigned) */}
      {issue.assignedToType === 'vendor' && (
        <div>
          <label className="block text-sm font-medium text-cc-text mb-2">
            Vendor Rating
          </label>
          <div className="flex items-center gap-4">
            <input
              type="range"
              name="vendorRating"
              value={formData.vendorRating}
              onChange={handleInputChange}
              min="1"
              max="5"
              step="1"
              className="flex-1 h-2 bg-cc-border rounded-lg appearance-none cursor-pointer accent-cc-accent"
            />
            <span className="text-cc-text font-medium w-8 text-center">
              {formData.vendorRating}/5
            </span>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-cc-border">
        <button
          type="button"
          onClick={onCancel}
          className="btn-secondary"
          disabled={isSubmitting}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="btn-primary flex items-center gap-2"
          disabled={isSubmitting}
        >
          <CheckCircle size={16} />
          {isSubmitting ? 'Resolving...' : 'Mark as Resolved'}
        </button>
      </div>
    </form>
  );
}
