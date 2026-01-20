import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import {
  type Vendor,
  type VendorSpecialty,
  type VendorStatus,
  SPECIALTY_LABELS,
  STATUS_LABELS,
  createVendor,
  updateVendor,
} from '../lib/vendors';

interface VendorFormProps {
  vendor?: Vendor | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
}

interface FormData {
  name: string;
  specialty: VendorSpecialty;
  phone: string;
  email: string;
  status: VendorStatus;
  notes: string;
}

const initialFormData: FormData = {
  name: '',
  specialty: 'plumber',
  phone: '',
  email: '',
  status: 'available',
  notes: '',
};

export default function VendorForm({ vendor, isOpen, onClose, onSave }: VendorFormProps) {
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEditing = !!vendor;

  useEffect(() => {
    if (vendor) {
      setFormData({
        name: vendor.name,
        specialty: vendor.specialty,
        phone: vendor.phone,
        email: vendor.email,
        status: vendor.status,
        notes: vendor.notes || '',
      });
    } else {
      setFormData(initialFormData);
    }
    setErrors({});
  }, [vendor, isOpen]);

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof FormData, string>> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      if (isEditing && vendor) {
        updateVendor(vendor.id, formData);
      } else {
        createVendor(formData);
      }

      onSave();
      onClose();
    } catch (error) {
      console.error('Error saving vendor:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name as keyof FormData]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-lg mx-4 card bg-brand-navy border-slate-600">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-700/50">
          <h2 className="text-xl font-bold text-brand-light">
            {isEditing ? 'Edit Vendor' : 'Add New Vendor'}
          </h2>
          <button
            onClick={onClose}
            className="p-1 text-brand-muted hover:text-brand-light transition-colors rounded-lg hover:bg-white/5"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {/* Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-brand-light mb-1">
              Vendor Name *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`input-field w-full ${errors.name ? 'border-red-500' : ''}`}
              placeholder="e.g., Smith Plumbing"
            />
            {errors.name && (
              <p className="mt-1 text-xs text-red-400">{errors.name}</p>
            )}
          </div>

          {/* Specialty */}
          <div>
            <label htmlFor="specialty" className="block text-sm font-medium text-brand-light mb-1">
              Specialty / Trade *
            </label>
            <select
              id="specialty"
              name="specialty"
              value={formData.specialty}
              onChange={handleChange}
              className="input-field w-full"
            >
              {(Object.keys(SPECIALTY_LABELS) as VendorSpecialty[]).map(key => (
                <option key={key} value={key}>
                  {SPECIALTY_LABELS[key]}
                </option>
              ))}
            </select>
          </div>

          {/* Phone and Email Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-brand-light mb-1">
                Phone *
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className={`input-field w-full ${errors.phone ? 'border-red-500' : ''}`}
                placeholder="(555) 123-4567"
              />
              {errors.phone && (
                <p className="mt-1 text-xs text-red-400">{errors.phone}</p>
              )}
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-brand-light mb-1">
                Email *
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`input-field w-full ${errors.email ? 'border-red-500' : ''}`}
                placeholder="contact@vendor.com"
              />
              {errors.email && (
                <p className="mt-1 text-xs text-red-400">{errors.email}</p>
              )}
            </div>
          </div>

          {/* Status */}
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-brand-light mb-1">
              Status
            </label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="input-field w-full"
            >
              {(Object.keys(STATUS_LABELS) as VendorStatus[]).map(key => (
                <option key={key} value={key}>
                  {STATUS_LABELS[key]}
                </option>
              ))}
            </select>
          </div>

          {/* Notes */}
          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-brand-light mb-1">
              Notes
            </label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={3}
              className="input-field w-full resize-none"
              placeholder="Additional notes about this vendor..."
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-700/50">
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
              {isSubmitting ? 'Saving...' : isEditing ? 'Update Vendor' : 'Add Vendor'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
