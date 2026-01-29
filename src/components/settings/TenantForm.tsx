import { useState } from 'react';
import type { TenantData } from '../../lib/settings';
import { updateTenant, formatCurrency } from '../../lib/settings';
import { Users, Save } from 'lucide-react';

interface TenantFormProps {
  initialData: TenantData;
  onSave?: (data: TenantData) => void;
}

export default function TenantForm({ initialData, onSave }: TenantFormProps) {
  const [formData, setFormData] = useState<TenantData>(initialData);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  const handleChange = (field: keyof TenantData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setSaveMessage('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveMessage('');

    try {
      updateTenant(formData);
      setSaveMessage('✓ Tenant information saved successfully!');
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

  const leaseStart = new Date(formData.leaseStartDate);
  const leaseEnd = new Date(formData.leaseEndDate);
  const leaseDuration = Math.ceil((leaseEnd.getTime() - leaseStart.getTime()) / (1000 * 60 * 60 * 24 * 30));

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-blue-500/20 rounded-lg">
          <Users className="text-blue-400" size={24} />
        </div>
        <div>
          <h3 className="text-xl font-bold text-cc-text">Tenant Information</h3>
          <p className="text-sm text-cc-muted">Current tenant and lease details</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-cc-text mb-2">
            Tenant Full Name *
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            className="w-full px-4 py-2 bg-cc-bg border border-cc-border rounded-lg text-cc-text focus:outline-none focus:border-cc-accent"
            placeholder="Gregg Marshall"
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
            placeholder="tenant@email.com"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

        <div>
          <label className="block text-sm font-medium text-cc-text mb-2">
            Move-In Date
          </label>
          <input
            type="date"
            value={formData.moveInDate || ''}
            onChange={(e) => handleChange('moveInDate', e.target.value)}
            className="w-full px-4 py-2 bg-cc-bg border border-cc-border rounded-lg text-cc-text focus:outline-none focus:border-cc-accent"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-cc-text mb-2">
            Lease Start Date *
          </label>
          <input
            type="date"
            value={formData.leaseStartDate}
            onChange={(e) => handleChange('leaseStartDate', e.target.value)}
            className="w-full px-4 py-2 bg-cc-bg border border-cc-border rounded-lg text-cc-text focus:outline-none focus:border-cc-accent"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-cc-text mb-2">
            Lease End Date *
          </label>
          <input
            type="date"
            value={formData.leaseEndDate}
            onChange={(e) => handleChange('leaseEndDate', e.target.value)}
            className="w-full px-4 py-2 bg-cc-bg border border-cc-border rounded-lg text-cc-text focus:outline-none focus:border-cc-accent"
            required
          />
        </div>

        <div className="card bg-cc-surface/50 p-3 flex flex-col justify-center">
          <p className="text-xs text-cc-muted">Lease Duration</p>
          <p className="text-lg font-bold text-cc-text">{leaseDuration} months</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-cc-text mb-2">
            Monthly Rent *
          </label>
          <input
            type="number"
            value={formData.monthlyRent}
            onChange={(e) => handleChange('monthlyRent', parseFloat(e.target.value) || 0)}
            className="w-full px-4 py-2 bg-cc-bg border border-cc-border rounded-lg text-cc-text focus:outline-none focus:border-cc-accent"
            required
            min="0"
            step="10"
          />
          <p className="text-xs text-cc-muted mt-1">{formatCurrency(formData.monthlyRent)}/month</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-cc-text mb-2">
            Security Deposit *
          </label>
          <input
            type="number"
            value={formData.securityDeposit}
            onChange={(e) => handleChange('securityDeposit', parseFloat(e.target.value) || 0)}
            className="w-full px-4 py-2 bg-cc-bg border border-cc-border rounded-lg text-cc-text focus:outline-none focus:border-cc-accent"
            required
            min="0"
            step="100"
          />
          <p className="text-xs text-cc-muted mt-1">{formatCurrency(formData.securityDeposit)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-cc-text mb-2">
            Emergency Contact Name
          </label>
          <input
            type="text"
            value={formData.emergencyContact || ''}
            onChange={(e) => handleChange('emergencyContact', e.target.value)}
            className="w-full px-4 py-2 bg-cc-bg border border-cc-border rounded-lg text-cc-text focus:outline-none focus:border-cc-accent"
            placeholder="Sarah Marshall"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-cc-text mb-2">
            Emergency Contact Phone
          </label>
          <input
            type="tel"
            value={formData.emergencyContactPhone || ''}
            onChange={(e) => handleChange('emergencyContactPhone', e.target.value)}
            className="w-full px-4 py-2 bg-cc-bg border border-cc-border rounded-lg text-cc-text focus:outline-none focus:border-cc-accent"
            placeholder="(555) 987-6543"
          />
        </div>
      </div>

      <div className="flex items-center gap-4 pt-4 border-t border-cc-border">
        <button
          type="submit"
          disabled={isSaving}
          className="btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Save size={18} />
          {isSaving ? 'Saving...' : 'Save Tenant Information'}
        </button>
        {saveMessage && (
          <span className={`text-sm ${saveMessage.startsWith('✓') ? 'text-green-400' : 'text-red-400'}`}>
            {saveMessage}
          </span>
        )}
      </div>
    </form>
  );
}
