import { useState } from 'react';
import type { MortgageData } from '../../lib/settings';
import { updateMortgage, formatCurrency } from '../../lib/settings';
import { Calculator, Save, Info } from 'lucide-react';

interface MortgageFormProps {
  initialData: MortgageData;
  onSave?: (data: MortgageData) => void;
}

export default function MortgageForm({ initialData, onSave }: MortgageFormProps) {
  const [formData, setFormData] = useState<MortgageData>(initialData);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  const handleChange = (field: keyof MortgageData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setSaveMessage('');
  };

  // Auto-calculate P&I from Total - Escrow
  const calculatePAndI = () => {
    const calculated = formData.totalMonthlyPayment - formData.monthlyEscrow;
    setFormData(prev => ({ ...prev, monthlyPAndI: calculated }));
  };

  // Auto-calculate Total from P&I + Escrow
  const calculateTotal = () => {
    const calculated = formData.monthlyPAndI + formData.monthlyEscrow;
    setFormData(prev => ({ ...prev, totalMonthlyPayment: calculated }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveMessage('');

    try {
      updateMortgage(formData);
      setSaveMessage('✓ Mortgage information saved successfully!');
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

  const remainingBalance = formData.principal;
  const monthsRemaining = formData.loanTermYears * 12;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-green-500/20 rounded-lg">
          <Calculator className="text-green-400" size={24} />
        </div>
        <div>
          <h3 className="text-xl font-bold text-brand-light">Mortgage Details</h3>
          <p className="text-sm text-brand-muted">Current loan information from your lender</p>
        </div>
      </div>

      {/* Info Banner */}
      <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg flex items-start gap-3">
        <Info className="text-blue-400 flex-shrink-0 mt-0.5" size={18} />
        <div className="text-sm text-brand-muted">
          <p className="font-medium text-brand-light mb-1">Pre-filled with accurate data</p>
          <p>These values were imported from your legacy mortgage calculator. Update as needed.</p>
        </div>
      </div>

      {/* Core Loan Details */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-brand-light mb-2">
            Current Principal Balance *
          </label>
          <input
            type="number"
            value={formData.principal}
            onChange={(e) => handleChange('principal', parseFloat(e.target.value) || 0)}
            className="w-full px-4 py-2 bg-brand-dark border border-slate-700 rounded-lg text-brand-light focus:outline-none focus:border-brand-orange"
            required
            min="0"
            step="0.01"
          />
          <p className="text-xs text-brand-muted mt-1">{formatCurrency(formData.principal)}</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-brand-light mb-2">
            Interest Rate (%) *
          </label>
          <input
            type="number"
            value={formData.interestRate}
            onChange={(e) => handleChange('interestRate', parseFloat(e.target.value) || 0)}
            className="w-full px-4 py-2 bg-brand-dark border border-slate-700 rounded-lg text-brand-light focus:outline-none focus:border-brand-orange"
            required
            min="0"
            max="100"
            step="0.001"
          />
          <p className="text-xs text-brand-muted mt-1">{formData.interestRate.toFixed(3)}%</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-brand-light mb-2">
            Loan Term (Years) *
          </label>
          <input
            type="number"
            value={formData.loanTermYears}
            onChange={(e) => handleChange('loanTermYears', parseInt(e.target.value) || 30)}
            className="w-full px-4 py-2 bg-brand-dark border border-slate-700 rounded-lg text-brand-light focus:outline-none focus:border-brand-orange"
            required
            min="1"
            max="50"
          />
          <p className="text-xs text-brand-muted mt-1">{monthsRemaining} months</p>
        </div>
      </div>

      {/* Monthly Payments */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-brand-light mb-2">
            Monthly P&I Payment *
          </label>
          <input
            type="number"
            value={formData.monthlyPAndI}
            onChange={(e) => handleChange('monthlyPAndI', parseFloat(e.target.value) || 0)}
            className="w-full px-4 py-2 bg-brand-dark border border-slate-700 rounded-lg text-brand-light focus:outline-none focus:border-brand-orange"
            required
            min="0"
            step="0.01"
          />
          <p className="text-xs text-brand-muted mt-1">
            {formatCurrency(formData.monthlyPAndI)} Principal & Interest
          </p>
        </div>
        <div>
          <label className="block text-sm font-medium text-brand-light mb-2">
            Monthly Escrow *
          </label>
          <input
            type="number"
            value={formData.monthlyEscrow}
            onChange={(e) => handleChange('monthlyEscrow', parseFloat(e.target.value) || 0)}
            className="w-full px-4 py-2 bg-brand-dark border border-slate-700 rounded-lg text-brand-light focus:outline-none focus:border-brand-orange"
            required
            min="0"
            step="0.01"
          />
          <p className="text-xs text-brand-muted mt-1">
            {formatCurrency(formData.monthlyEscrow)} Taxes & Insurance
          </p>
        </div>
        <div>
          <label className="block text-sm font-medium text-brand-light mb-2">
            Total Monthly Payment *
          </label>
          <input
            type="number"
            value={formData.totalMonthlyPayment}
            onChange={(e) => handleChange('totalMonthlyPayment', parseFloat(e.target.value) || 0)}
            className="w-full px-4 py-2 bg-brand-dark border border-slate-700 rounded-lg text-green-400 focus:outline-none focus:border-brand-orange font-bold"
            required
            min="0"
            step="0.01"
          />
          <p className="text-xs text-brand-muted mt-1">
            {formatCurrency(formData.totalMonthlyPayment)}
          </p>
        </div>
      </div>

      {/* Quick Calculators */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={calculatePAndI}
          className="btn-secondary text-sm"
        >
          P&I = Total - Escrow
        </button>
        <button
          type="button"
          onClick={calculateTotal}
          className="btn-secondary text-sm"
        >
          Total = P&I + Escrow
        </button>
      </div>

      {/* Additional Details */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-brand-light mb-2">
            Loan Start Date *
          </label>
          <input
            type="date"
            value={formData.loanStartDate}
            onChange={(e) => handleChange('loanStartDate', e.target.value)}
            className="w-full px-4 py-2 bg-brand-dark border border-slate-700 rounded-lg text-brand-light focus:outline-none focus:border-brand-orange"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-brand-light mb-2">
            Original Loan Amount
          </label>
          <input
            type="number"
            value={formData.originalLoanAmount || ''}
            onChange={(e) => handleChange('originalLoanAmount', parseFloat(e.target.value) || undefined)}
            className="w-full px-4 py-2 bg-brand-dark border border-slate-700 rounded-lg text-brand-light focus:outline-none focus:border-brand-orange"
            min="0"
            step="1000"
          />
          <p className="text-xs text-brand-muted mt-1">
            {formData.originalLoanAmount ? formatCurrency(formData.originalLoanAmount) : 'Optional'}
          </p>
        </div>
        <div>
          <label className="block text-sm font-medium text-brand-light mb-2">
            Lender Name
          </label>
          <input
            type="text"
            value={formData.lender || ''}
            onChange={(e) => handleChange('lender', e.target.value)}
            className="w-full px-4 py-2 bg-brand-dark border border-slate-700 rounded-lg text-brand-light focus:outline-none focus:border-brand-orange"
            placeholder="Bank of America"
          />
        </div>
      </div>

      {/* Summary Card */}
      <div className="card bg-brand-navy/50 p-4">
        <h4 className="text-sm font-bold text-brand-orange mb-3">Loan Summary</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <p className="text-brand-muted">Remaining Balance</p>
            <p className="font-bold text-brand-light">{formatCurrency(remainingBalance)}</p>
          </div>
          <div>
            <p className="text-brand-muted">Monthly P&I</p>
            <p className="font-bold text-brand-light">{formatCurrency(formData.monthlyPAndI)}</p>
          </div>
          <div>
            <p className="text-brand-muted">Monthly Escrow</p>
            <p className="font-bold text-brand-light">{formatCurrency(formData.monthlyEscrow)}</p>
          </div>
          <div>
            <p className="text-brand-muted">Total Payment</p>
            <p className="font-bold text-green-400">{formatCurrency(formData.totalMonthlyPayment)}</p>
          </div>
        </div>
        <p className="text-xs text-brand-muted mt-3">
          Note: Only P&I affects payoff calculations. Escrow is for taxes and insurance.
        </p>
      </div>

      {/* Save Button */}
      <div className="flex items-center gap-4 pt-4 border-t border-slate-700">
        <button
          type="submit"
          disabled={isSaving}
          className="btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Save size={18} />
          {isSaving ? 'Saving...' : 'Save Mortgage Details'}
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
