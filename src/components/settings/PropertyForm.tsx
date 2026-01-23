import { useState } from 'react';
import type { PropertyData } from '../../lib/settings';
import { updateProperty, formatCurrency } from '../../lib/settings';
import { Building2, Save } from 'lucide-react';

interface PropertyFormProps {
  initialData: PropertyData;
  onSave?: (data: PropertyData) => void;
}

export default function PropertyForm({ initialData, onSave }: PropertyFormProps) {
  const [formData, setFormData] = useState<PropertyData>(initialData);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  const handleChange = (field: keyof PropertyData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setSaveMessage(''); // Clear message on change
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveMessage('');

    try {
      updateProperty(formData);
      setSaveMessage('✓ Property information saved successfully!');
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

  const equity = formData.currentMarketValue - (formData.purchasePrice || 0);
  const landPercentage = formData.purchasePrice > 0
    ? ((formData.landValue / formData.purchasePrice) * 100).toFixed(1)
    : '0';

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-brand-orange/20 rounded-lg">
          <Building2 className="text-brand-orange" size={24} />
        </div>
        <div>
          <h3 className="text-xl font-bold text-brand-light">Property Details</h3>
          <p className="text-sm text-brand-muted">Basic information about your property</p>
        </div>
      </div>

      {/* Address */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-brand-light mb-2">
            Property Address *
          </label>
          <input
            type="text"
            value={formData.address}
            onChange={(e) => handleChange('address', e.target.value)}
            className="w-full px-4 py-2 bg-brand-dark border border-slate-700 rounded-lg text-brand-light focus:outline-none focus:border-brand-orange"
            placeholder="123 Main Street"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-brand-light mb-2">
            Unit Number
          </label>
          <input
            type="text"
            value={formData.unitNumber || ''}
            onChange={(e) => handleChange('unitNumber', e.target.value)}
            className="w-full px-4 py-2 bg-brand-dark border border-slate-700 rounded-lg text-brand-light focus:outline-none focus:border-brand-orange"
            placeholder="Apt 4B"
          />
        </div>
      </div>

      {/* Financial Details */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-brand-light mb-2">
            Purchase Price *
          </label>
          <input
            type="number"
            value={formData.purchasePrice}
            onChange={(e) => handleChange('purchasePrice', parseFloat(e.target.value) || 0)}
            className="w-full px-4 py-2 bg-brand-dark border border-slate-700 rounded-lg text-brand-light focus:outline-none focus:border-brand-orange"
            placeholder="350000"
            required
            min="0"
            step="1000"
          />
          <p className="text-xs text-brand-muted mt-1">{formatCurrency(formData.purchasePrice)}</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-brand-light mb-2">
            Purchase Date *
          </label>
          <input
            type="date"
            value={formData.purchaseDate}
            onChange={(e) => handleChange('purchaseDate', e.target.value)}
            className="w-full px-4 py-2 bg-brand-dark border border-slate-700 rounded-lg text-brand-light focus:outline-none focus:border-brand-orange"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-brand-light mb-2">
            Current Market Value *
          </label>
          <input
            type="number"
            value={formData.currentMarketValue}
            onChange={(e) => handleChange('currentMarketValue', parseFloat(e.target.value) || 0)}
            className="w-full px-4 py-2 bg-brand-dark border border-slate-700 rounded-lg text-brand-light focus:outline-none focus:border-brand-orange"
            placeholder="420000"
            required
            min="0"
            step="1000"
          />
          <p className="text-xs text-brand-muted mt-1">{formatCurrency(formData.currentMarketValue)}</p>
        </div>
      </div>

      {/* Land Value & Equity Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-brand-light mb-2">
            Land Value *
          </label>
          <input
            type="number"
            value={formData.landValue}
            onChange={(e) => handleChange('landValue', parseFloat(e.target.value) || 0)}
            className="w-full px-4 py-2 bg-brand-dark border border-slate-700 rounded-lg text-brand-light focus:outline-none focus:border-brand-orange"
            placeholder="70000"
            required
            min="0"
            step="1000"
          />
          <p className="text-xs text-brand-muted mt-1">
            {formatCurrency(formData.landValue)} ({landPercentage}% of purchase price)
          </p>
        </div>
        <div className="card bg-brand-navy/50 p-4 flex flex-col justify-center">
          <p className="text-sm text-brand-muted">Estimated Equity</p>
          <p className="text-2xl font-bold text-green-400">
            {formatCurrency(equity)}
          </p>
          <p className="text-xs text-brand-muted mt-1">
            Market Value - Purchase Price
          </p>
        </div>
      </div>

      {/* Property Characteristics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-medium text-brand-light mb-2">
            Year Built
          </label>
          <input
            type="number"
            value={formData.yearBuilt || ''}
            onChange={(e) => handleChange('yearBuilt', parseInt(e.target.value) || undefined)}
            className="w-full px-4 py-2 bg-brand-dark border border-slate-700 rounded-lg text-brand-light focus:outline-none focus:border-brand-orange"
            placeholder="2010"
            min="1800"
            max={new Date().getFullYear()}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-brand-light mb-2">
            Square Footage
          </label>
          <input
            type="number"
            value={formData.squareFootage || ''}
            onChange={(e) => handleChange('squareFootage', parseInt(e.target.value) || undefined)}
            className="w-full px-4 py-2 bg-brand-dark border border-slate-700 rounded-lg text-brand-light focus:outline-none focus:border-brand-orange"
            placeholder="1200"
            min="0"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-brand-light mb-2">
            Bedrooms
          </label>
          <input
            type="number"
            value={formData.bedrooms || ''}
            onChange={(e) => handleChange('bedrooms', parseInt(e.target.value) || undefined)}
            className="w-full px-4 py-2 bg-brand-dark border border-slate-700 rounded-lg text-brand-light focus:outline-none focus:border-brand-orange"
            placeholder="2"
            min="0"
            max="20"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-brand-light mb-2">
            Bathrooms
          </label>
          <input
            type="number"
            value={formData.bathrooms || ''}
            onChange={(e) => handleChange('bathrooms', parseFloat(e.target.value) || undefined)}
            className="w-full px-4 py-2 bg-brand-dark border border-slate-700 rounded-lg text-brand-light focus:outline-none focus:border-brand-orange"
            placeholder="2"
            min="0"
            max="20"
            step="0.5"
          />
        </div>
      </div>

      {/* Property Type */}
      <div>
        <label className="block text-sm font-medium text-brand-light mb-2">
          Property Type
        </label>
        <select
          value={formData.propertyType || 'single_family'}
          onChange={(e) => handleChange('propertyType', e.target.value as PropertyData['propertyType'])}
          className="w-full px-4 py-2 bg-brand-dark border border-slate-700 rounded-lg text-brand-light focus:outline-none focus:border-brand-orange"
        >
          <option value="single_family">Single Family Home</option>
          <option value="condo">Condominium</option>
          <option value="townhouse">Townhouse</option>
          <option value="multi_family">Multi-Family</option>
          <option value="other">Other</option>
        </select>
      </div>

      {/* Save Button */}
      <div className="flex items-center gap-4 pt-4 border-t border-slate-700">
        <button
          type="submit"
          disabled={isSaving}
          className="btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Save size={18} />
          {isSaving ? 'Saving...' : 'Save Property Details'}
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
