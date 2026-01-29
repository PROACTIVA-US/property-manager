import { useState } from 'react';
import type { RentalIncomeData, MortgageData } from '../../lib/settings';
import { updateRentalIncome, formatCurrency, calculateMonthlyOperatingExpenses, calculateMonthlyCashFlow } from '../../lib/settings';
import { DollarSign, Save } from 'lucide-react';

interface RentalIncomeFormProps {
  initialData: RentalIncomeData;
  mortgageData?: MortgageData;
  onSave?: (data: RentalIncomeData) => void;
}

export default function RentalIncomeForm({ initialData, mortgageData, onSave }: RentalIncomeFormProps) {
  const [formData, setFormData] = useState<RentalIncomeData>(initialData);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  const handleChange = (field: keyof RentalIncomeData, value: string | number | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setSaveMessage('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveMessage('');

    try {
      updateRentalIncome(formData);
      setSaveMessage('✓ Rental income saved successfully!');
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

  const operatingExpenses = calculateMonthlyOperatingExpenses(formData);
  const netOperatingIncome = formData.monthlyRent - operatingExpenses;
  const cashFlow = mortgageData ? calculateMonthlyCashFlow(formData, mortgageData) : null;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-green-500/20 rounded-lg">
          <DollarSign className="text-green-400" size={24} />
        </div>
        <div>
          <h3 className="text-xl font-bold text-cc-text">Rental Income & Expenses</h3>
          <p className="text-sm text-cc-muted">Monthly rental income and operating costs</p>
        </div>
      </div>

      {/* Rental Income */}
      <div>
        <label className="block text-sm font-medium text-cc-text mb-2">
          Monthly Rental Income *
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

      {/* Operating Expenses */}
      <div className="space-y-4">
        <h4 className="text-sm font-bold text-cc-accent">Monthly Operating Expenses</h4>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-cc-text mb-2">
              Property Tax *
            </label>
            <input
              type="number"
              value={formData.monthlyPropertyTax}
              onChange={(e) => handleChange('monthlyPropertyTax', parseFloat(e.target.value) || 0)}
              className="w-full px-4 py-2 bg-cc-bg border border-cc-border rounded-lg text-cc-text focus:outline-none focus:border-cc-accent"
              required
              min="0"
              step="10"
            />
            <p className="text-xs text-cc-muted mt-1">{formatCurrency(formData.monthlyPropertyTax)}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-cc-text mb-2">
              Insurance *
            </label>
            <input
              type="number"
              value={formData.monthlyInsurance}
              onChange={(e) => handleChange('monthlyInsurance', parseFloat(e.target.value) || 0)}
              className="w-full px-4 py-2 bg-cc-bg border border-cc-border rounded-lg text-cc-text focus:outline-none focus:border-cc-accent"
              required
              min="0"
              step="10"
            />
            <p className="text-xs text-cc-muted mt-1">{formatCurrency(formData.monthlyInsurance)}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-cc-text mb-2">
              HOA Fees
            </label>
            <input
              type="number"
              value={formData.monthlyHOA}
              onChange={(e) => handleChange('monthlyHOA', parseFloat(e.target.value) || 0)}
              className="w-full px-4 py-2 bg-cc-bg border border-cc-border rounded-lg text-cc-text focus:outline-none focus:border-cc-accent"
              min="0"
              step="10"
            />
            <p className="text-xs text-cc-muted mt-1">{formatCurrency(formData.monthlyHOA)}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-cc-text mb-2">
              Maintenance Reserve *
            </label>
            <input
              type="number"
              value={formData.monthlyMaintenanceReserve}
              onChange={(e) => handleChange('monthlyMaintenanceReserve', parseFloat(e.target.value) || 0)}
              className="w-full px-4 py-2 bg-cc-bg border border-cc-border rounded-lg text-cc-text focus:outline-none focus:border-cc-accent"
              required
              min="0"
              step="10"
            />
            <p className="text-xs text-cc-muted mt-1">{formatCurrency(formData.monthlyMaintenanceReserve)}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-cc-text mb-2">
              Vacancy Reserve *
            </label>
            <input
              type="number"
              value={formData.monthlyVacancyReserve}
              onChange={(e) => handleChange('monthlyVacancyReserve', parseFloat(e.target.value) || 0)}
              className="w-full px-4 py-2 bg-cc-bg border border-cc-border rounded-lg text-cc-text focus:outline-none focus:border-cc-accent"
              required
              min="0"
              step="10"
            />
            <p className="text-xs text-cc-muted mt-1">
              {formatCurrency(formData.monthlyVacancyReserve)} (Usually 5-8% of rent)
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-cc-text mb-2">
              Management Fee
            </label>
            <input
              type="number"
              value={formData.monthlyManagementFee}
              onChange={(e) => handleChange('monthlyManagementFee', parseFloat(e.target.value) || 0)}
              className="w-full px-4 py-2 bg-cc-bg border border-cc-border rounded-lg text-cc-text focus:outline-none focus:border-cc-accent"
              min="0"
              step="10"
            />
            <p className="text-xs text-cc-muted mt-1">
              {formatCurrency(formData.monthlyManagementFee)} (8-10% if managed, $0 if self)
            </p>
          </div>
        </div>
      </div>

      {/* Utilities */}
      <div>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={formData.includesUtilities}
            onChange={(e) => handleChange('includesUtilities', e.target.checked)}
            className="w-4 h-4 rounded border-cc-border bg-cc-bg text-cc-accent focus:ring-cc-accent"
          />
          <span className="text-sm text-cc-text">Rent includes utilities</span>
        </label>
      </div>

      {/* Summary Card */}
      <div className="card bg-cc-surface/50 p-4">
        <h4 className="text-sm font-bold text-cc-accent mb-3">Financial Summary</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <p className="text-cc-muted">Gross Rent</p>
            <p className="font-bold text-green-400">{formatCurrency(formData.monthlyRent)}</p>
          </div>
          <div>
            <p className="text-cc-muted">Operating Expenses</p>
            <p className="font-bold text-red-400">-{formatCurrency(operatingExpenses)}</p>
          </div>
          <div>
            <p className="text-cc-muted">Net Operating Income</p>
            <p className="font-bold text-cc-text">{formatCurrency(netOperatingIncome)}</p>
          </div>
          {cashFlow !== null && (
            <div>
              <p className="text-cc-muted">Net Cash Flow</p>
              <p className={`font-bold ${cashFlow >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {cashFlow >= 0 ? '+' : ''}{formatCurrency(cashFlow)}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Save Button */}
      <div className="flex items-center gap-4 pt-4 border-t border-cc-border">
        <button
          type="submit"
          disabled={isSaving}
          className="btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Save size={18} />
          {isSaving ? 'Saving...' : 'Save Rental Income'}
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
