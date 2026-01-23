import { useState } from 'react';
import type { TaxInfoData } from '../../lib/settings';
import { updateTaxInfo, formatCurrency } from '../../lib/settings';
import { FileText, Save } from 'lucide-react';

interface TaxInfoFormProps {
  initialData: TaxInfoData;
  onSave?: (data: TaxInfoData) => void;
}

export default function TaxInfoForm({ initialData, onSave }: TaxInfoFormProps) {
  const [formData, setFormData] = useState<TaxInfoData>(initialData);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  const handleChange = (field: keyof TaxInfoData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setSaveMessage('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveMessage('');

    try {
      updateTaxInfo(formData);
      setSaveMessage('✓ Tax information saved successfully!');
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
        <div className="p-2 bg-purple-500/20 rounded-lg">
          <FileText className="text-purple-400" size={24} />
        </div>
        <div>
          <h3 className="text-xl font-bold text-brand-light">Tax Information</h3>
          <p className="text-sm text-brand-muted">For capital gains and tax planning estimates</p>
        </div>
      </div>

      <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg text-sm text-brand-muted">
        <p className="font-medium text-brand-light mb-1">⚠️ Disclaimer</p>
        <p>This information is for educational estimates only. Consult a tax professional for actual tax planning.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-brand-light mb-2">
            Filing Status *
          </label>
          <select
            value={formData.filingStatus}
            onChange={(e) => handleChange('filingStatus', e.target.value as TaxInfoData['filingStatus'])}
            className="w-full px-4 py-2 bg-brand-dark border border-slate-700 rounded-lg text-brand-light focus:outline-none focus:border-brand-orange"
            required
          >
            <option value="single">Single</option>
            <option value="married_filing_jointly">Married Filing Jointly</option>
            <option value="married_filing_separately">Married Filing Separately</option>
            <option value="head_of_household">Head of Household</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-brand-light mb-2">
            Annual Household Income *
          </label>
          <input
            type="number"
            value={formData.annualIncome}
            onChange={(e) => handleChange('annualIncome', parseFloat(e.target.value) || 0)}
            className="w-full px-4 py-2 bg-brand-dark border border-slate-700 rounded-lg text-brand-light focus:outline-none focus:border-brand-orange"
            required
            min="0"
            step="1000"
          />
          <p className="text-xs text-brand-muted mt-1">{formatCurrency(formData.annualIncome)}/year</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-brand-light mb-2">
            Depreciable Value *
          </label>
          <input
            type="number"
            value={formData.depreciableValue}
            onChange={(e) => handleChange('depreciableValue', parseFloat(e.target.value) || 0)}
            className="w-full px-4 py-2 bg-brand-dark border border-slate-700 rounded-lg text-brand-light focus:outline-none focus:border-brand-orange"
            required
            min="0"
            step="1000"
          />
          <p className="text-xs text-brand-muted mt-1">
            {formatCurrency(formData.depreciableValue)} (Purchase price - land value)
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-brand-light mb-2">
            Capital Improvements *
          </label>
          <input
            type="number"
            value={formData.capitalImprovementsCost}
            onChange={(e) => handleChange('capitalImprovementsCost', parseFloat(e.target.value) || 0)}
            className="w-full px-4 py-2 bg-brand-dark border border-slate-700 rounded-lg text-brand-light focus:outline-none focus:border-brand-orange"
            required
            min="0"
            step="1000"
          />
          <p className="text-xs text-brand-muted mt-1">
            {formatCurrency(formData.capitalImprovementsCost)} (Roof, HVAC, etc.)
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-brand-light mb-2">
            Estimated Selling Costs *
          </label>
          <input
            type="number"
            value={formData.estimatedSellingCosts}
            onChange={(e) => handleChange('estimatedSellingCosts', parseFloat(e.target.value) || 0)}
            className="w-full px-4 py-2 bg-brand-dark border border-slate-700 rounded-lg text-brand-light focus:outline-none focus:border-brand-orange"
            required
            min="0"
            step="100"
          />
          <p className="text-xs text-brand-muted mt-1">
            {formatCurrency(formData.estimatedSellingCosts)} (Usually 6-10% of sale price)
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-brand-light mb-2">
            State Income Tax Rate (%) *
          </label>
          <input
            type="number"
            value={formData.stateIncomeTaxRate}
            onChange={(e) => handleChange('stateIncomeTaxRate', parseFloat(e.target.value) || 0)}
            className="w-full px-4 py-2 bg-brand-dark border border-slate-700 rounded-lg text-brand-light focus:outline-none focus:border-brand-orange"
            required
            min="0"
            max="100"
            step="0.1"
          />
          <p className="text-xs text-brand-muted mt-1">{formData.stateIncomeTaxRate.toFixed(1)}%</p>
        </div>
      </div>

      <div className="flex items-center gap-4 pt-4 border-t border-slate-700">
        <button
          type="submit"
          disabled={isSaving}
          className="btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Save size={18} />
          {isSaving ? 'Saving...' : 'Save Tax Information'}
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
