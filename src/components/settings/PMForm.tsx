import { useState } from 'react';
import type { PMData } from '../../lib/settings';
import { updatePM } from '../../lib/settings';
import { Briefcase, Save } from 'lucide-react';

interface PMFormProps {
  initialData: PMData;
  onSave?: (data: PMData) => void;
}

export default function PMForm({ initialData, onSave }: PMFormProps) {
  const [formData, setFormData] = useState<PMData>(initialData);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  const handleChange = (field: keyof PMData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setSaveMessage('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveMessage('');

    try {
      updatePM(formData);
      setSaveMessage('✓ Property Manager information saved successfully!');
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
        <div className="p-2 bg-cc-accent/20 rounded-lg">
          <Briefcase className="text-cc-accent" size={24} />
        </div>
        <div>
          <h3 className="text-xl font-bold text-cc-text">Property Manager Information</h3>
          <p className="text-sm text-cc-muted">Contact details for your property manager</p>
        </div>
      </div>

      {/* Contact Information */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-cc-text mb-2">
            PM Name *
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            className="w-full px-4 py-2 bg-cc-bg border border-cc-border rounded-lg text-cc-text focus:outline-none focus:border-cc-accent"
            placeholder="Mike Johnson"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-cc-text mb-2">
            Email Address *
          </label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => handleChange('email', e.target.value)}
            className="w-full px-4 py-2 bg-cc-bg border border-cc-border rounded-lg text-cc-text focus:outline-none focus:border-cc-accent"
            placeholder="pm@example.com"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-cc-text mb-2">
            Phone Number *
          </label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => handleChange('phone', e.target.value)}
            className="w-full px-4 py-2 bg-cc-bg border border-cc-border rounded-lg text-cc-text focus:outline-none focus:border-cc-accent"
            placeholder="(555) 123-4567"
            required
          />
        </div>
      </div>

      {/* Company Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-cc-text mb-2">
            Management Company
          </label>
          <input
            type="text"
            value={formData.companyName || ''}
            onChange={(e) => handleChange('companyName', e.target.value)}
            className="w-full px-4 py-2 bg-cc-bg border border-cc-border rounded-lg text-cc-text focus:outline-none focus:border-cc-accent"
            placeholder="ABC Property Management"
          />
          <p className="text-xs text-cc-muted mt-1">
            The management company name (if applicable)
          </p>
        </div>
        <div>
          <label className="block text-sm font-medium text-cc-text mb-2">
            License Number
          </label>
          <input
            type="text"
            value={formData.licenseNumber || ''}
            onChange={(e) => handleChange('licenseNumber', e.target.value)}
            className="w-full px-4 py-2 bg-cc-bg border border-cc-border rounded-lg text-cc-text focus:outline-none focus:border-cc-accent"
            placeholder="PM123456"
          />
          <p className="text-xs text-cc-muted mt-1">
            Property management license number (if applicable)
          </p>
        </div>
      </div>

      {/* Fee Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-cc-text mb-2">
            Management Fee (%)
          </label>
          <input
            type="number"
            step="0.01"
            min="0"
            max="100"
            value={formData.managementFeePercent || 0}
            onChange={(e) => handleChange('managementFeePercent', parseFloat(e.target.value) || 0)}
            className="w-full px-4 py-2 bg-cc-bg border border-cc-border rounded-lg text-cc-text focus:outline-none focus:border-cc-accent"
            placeholder="10"
          />
          <p className="text-xs text-cc-muted mt-1">
            Percentage of monthly rent charged for management (0 if self-managed)
          </p>
        </div>
      </div>

      {/* Info Box */}
      <div className="card bg-blue-500/10 border border-blue-500/30 p-4">
        <h4 className="text-sm font-bold text-cc-text mb-2">💡 Why This Matters</h4>
        <ul className="text-sm text-cc-muted space-y-1">
          <li>• Property manager contact information is used throughout the application</li>
          <li>• Management fees are included in financial calculations</li>
          <li>• This information appears in reports and communications</li>
          <li>• Set management fee to 0% if you self-manage the property</li>
        </ul>
      </div>

      {/* Save Button */}
      <div className="flex items-center gap-4 pt-4 border-t border-cc-border">
        <button
          type="submit"
          disabled={isSaving}
          className="btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Save size={16} />
          {isSaving ? 'Saving...' : 'Save PM Information'}
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
