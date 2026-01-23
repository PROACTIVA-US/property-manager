import { useState } from 'react';
import type { OwnerData } from '../../lib/settings';
import { updateOwner } from '../../lib/settings';
import { UserCircle, Save } from 'lucide-react';

interface OwnerFormProps {
  initialData: OwnerData;
  onSave?: (data: OwnerData) => void;
}

export default function OwnerForm({ initialData, onSave }: OwnerFormProps) {
  const [formData, setFormData] = useState<OwnerData>(initialData);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  const handleChange = (field: keyof OwnerData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setSaveMessage('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveMessage('');

    try {
      updateOwner(formData);
      setSaveMessage('✓ Owner information saved successfully!');
      if (onSave) {
        onSave(formData);
      }
    } catch (error) {
      setSaveMessage('✗ Failed to save. Please try again.');
      console.error('Save error:', error);
    } finally {
      setIsSaving(false);
      setTimeout(() => setSaveMessage(''), 3000);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-brand-orange/20 rounded-lg">
          <UserCircle className="text-brand-orange" size={24} />
        </div>
        <div>
          <h3 className="text-xl font-bold text-brand-light">Owner Information</h3>
          <p className="text-sm text-brand-muted">Your contact and business details</p>
        </div>
      </div>

      {/* Contact Information */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-brand-light mb-2">
            Owner Name *
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            className="w-full px-4 py-2 bg-brand-dark border border-slate-700 rounded-lg text-brand-light focus:outline-none focus:border-brand-orange"
            placeholder="John Smith"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-brand-light mb-2">
            Email Address *
          </label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => handleChange('email', e.target.value)}
            className="w-full px-4 py-2 bg-brand-dark border border-slate-700 rounded-lg text-brand-light focus:outline-none focus:border-brand-orange"
            placeholder="john@example.com"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-brand-light mb-2">
            Phone Number *
          </label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => handleChange('phone', e.target.value)}
            className="w-full px-4 py-2 bg-brand-dark border border-slate-700 rounded-lg text-brand-light focus:outline-none focus:border-brand-orange"
            placeholder="(555) 123-4567"
            required
          />
        </div>
      </div>

      {/* Business Entity Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-brand-light mb-2">
            Entity Type *
          </label>
          <select
            value={formData.entityType}
            onChange={(e) => handleChange('entityType', e.target.value)}
            className="w-full px-4 py-2 bg-brand-dark border border-slate-700 rounded-lg text-brand-light focus:outline-none focus:border-brand-orange"
            required
          >
            <option value="individual">Individual</option>
            <option value="llc">LLC</option>
            <option value="s_corp">S Corporation</option>
            <option value="c_corp">C Corporation</option>
            <option value="partnership">Partnership</option>
            <option value="trust">Trust</option>
          </select>
          <p className="text-xs text-brand-muted mt-1">
            How you hold the property for tax purposes
          </p>
        </div>
        <div>
          <label className="block text-sm font-medium text-brand-light mb-2">
            Entity Name
          </label>
          <input
            type="text"
            value={formData.entityName || ''}
            onChange={(e) => handleChange('entityName', e.target.value)}
            className="w-full px-4 py-2 bg-brand-dark border border-slate-700 rounded-lg text-brand-light focus:outline-none focus:border-brand-orange"
            placeholder="Smith Properties LLC"
          />
          <p className="text-xs text-brand-muted mt-1">
            If different from your name (e.g., LLC or company name)
          </p>
        </div>
      </div>

      {/* Optional Business Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-brand-light mb-2">
            Business Address
          </label>
          <input
            type="text"
            value={formData.businessAddress || ''}
            onChange={(e) => handleChange('businessAddress', e.target.value)}
            className="w-full px-4 py-2 bg-brand-dark border border-slate-700 rounded-lg text-brand-light focus:outline-none focus:border-brand-orange"
            placeholder="123 Business St, City, ST 12345"
          />
          <p className="text-xs text-brand-muted mt-1">
            If different from property address
          </p>
        </div>
        <div>
          <label className="block text-sm font-medium text-brand-light mb-2">
            Tax ID (Last 4 Digits)
          </label>
          <input
            type="text"
            value={formData.taxId || ''}
            onChange={(e) => handleChange('taxId', e.target.value)}
            className="w-full px-4 py-2 bg-brand-dark border border-slate-700 rounded-lg text-brand-light focus:outline-none focus:border-brand-orange"
            placeholder="XXXX"
            maxLength={4}
          />
          <p className="text-xs text-brand-muted mt-1">
            Last 4 digits of EIN or SSN (for reference only)
          </p>
        </div>
      </div>

      {/* Info Box */}
      <div className="card bg-blue-500/10 border border-blue-500/30 p-4">
        <h4 className="text-sm font-bold text-brand-light mb-2">💡 Why This Matters</h4>
        <ul className="text-sm text-brand-muted space-y-1">
          <li>• Entity type affects how rental income and expenses are reported on taxes</li>
          <li>• This information helps with accurate financial projections and tax planning</li>
          <li>• Your contact details are used for document generation and communications</li>
        </ul>
      </div>

      {/* Save Button */}
      <div className="flex items-center gap-4 pt-4 border-t border-slate-700">
        <button
          type="submit"
          disabled={isSaving}
          className="btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Save size={16} />
          {isSaving ? 'Saving...' : 'Save Owner Information'}
        </button>

        {saveMessage && (
          <div
            className={`text-sm font-medium ${
              saveMessage.startsWith('✓') ? 'text-green-400' : 'text-red-400'
            }`}
          >
            {saveMessage}
          </div>
        )}
      </div>
    </form>
  );
}
