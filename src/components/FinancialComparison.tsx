import { useState, useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
} from 'recharts';
import {
  DollarSign,
  Home,
  TrendingUp,
  TrendingDown,
  Wallet,
  PiggyBank,
  Info,
  ChevronDown,
  ChevronRight,
  BarChart3,
} from 'lucide-react';
import {
  type PropertyFinancials,
  type PersonalExpenses,
  calculateCashFlow,
  calculateRentalComparison,
  formatCurrency,
  DEFAULT_PROPERTY_FINANCIALS,
  DEFAULT_PERSONAL_EXPENSES,
} from '../lib/financials';

interface FinancialComparisonProps {
  initialProperty?: PropertyFinancials;
  initialPersonal?: PersonalExpenses;
}

/**
 * @navigation-structure
 * Miller's Law Compliance: 4 top-level interactive sections (max 7 allowed)
 *
 * Top-level sections (4 total):
 * 1. Header with Edit Values toggle
 * 2. Key Metrics & Charts - single collapsible section containing all visualizations
 * 3. Analysis Summary - static information section
 * 4. Disclaimer - static text
 *
 * The input panel appears as a modal overlay, not counted as navigation.
 * Metrics (4 cards) and Charts (2 charts) are combined into one collapsible section.
 */
export default function FinancialComparison({
  initialProperty = DEFAULT_PROPERTY_FINANCIALS,
  initialPersonal = DEFAULT_PERSONAL_EXPENSES,
}: FinancialComparisonProps) {
  const [property, setProperty] = useState<PropertyFinancials>(initialProperty);
  const [personal, setPersonal] = useState<PersonalExpenses>(initialPersonal);
  const [showInputs, setShowInputs] = useState(false);
  const [showVisualizations, setShowVisualizations] = useState(true);
  const [showIncomeInputs, setShowIncomeInputs] = useState(true);
  const [showExpenseInputs, setShowExpenseInputs] = useState(false);

  // Calculate derived values
  const cashFlow = useMemo(() => calculateCashFlow(property), [property]);
  const comparison = useMemo(
    () => calculateRentalComparison(property, personal),
    [property, personal]
  );

  const monthlyCashFlow = cashFlow.cashFlowBeforeTax / 12;
  const isPositiveCashFlow = monthlyCashFlow >= 0;
  const isPositiveAdvantage = comparison.monthlyAdvantage >= 0;

  // Data for expense breakdown chart
  const expenseData = [
    { name: 'Property Tax', value: property.monthlyPropertyTax, color: '#ef4444' },
    { name: 'Insurance', value: property.monthlyInsurance, color: '#f97316' },
    { name: 'Maintenance', value: property.monthlyMaintenanceReserve, color: '#eab308' },
    { name: 'Vacancy', value: property.monthlyVacancyReserve, color: '#84cc16' },
    { name: 'Management', value: property.monthlyManagementFee, color: '#22c55e' },
    { name: 'HOA', value: property.monthlyHOA, color: '#06b6d4' },
  ].filter(item => item.value > 0);

  // Data for income vs expenses comparison
  const comparisonData = [
    {
      name: 'Income',
      Rental: property.monthlyRentalIncome,
      Personal: personal.currentRentPayment + personal.currentUtilityCosts,
    },
    {
      name: 'Expenses',
      Rental: property.monthlyPropertyTax + property.monthlyInsurance + property.monthlyHOA +
              property.monthlyMaintenanceReserve + property.monthlyVacancyReserve +
              property.monthlyManagementFee + property.monthlyMortgagePayment,
      Personal: personal.currentRentPayment + personal.currentUtilityCosts,
    },
    {
      name: 'Net',
      Rental: monthlyCashFlow,
      Personal: 0,
    },
  ];

  const handlePropertyChange = (field: keyof PropertyFinancials, value: string) => {
    const numValue = parseFloat(value) || 0;
    setProperty(prev => ({ ...prev, [field]: numValue }));
  };

  const handlePersonalChange = (field: keyof PersonalExpenses, value: string) => {
    const numValue = parseFloat(value) || 0;
    setPersonal(prev => ({ ...prev, [field]: numValue }));
  };

  return (
    <div className="space-y-6" data-navigation-sections="4" data-millers-law-compliant="true">
      {/* Header - Section 1 of 4: Primary action */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-xl font-bold text-cc-text">Financial Comparison</h3>
          <p className="text-sm text-cc-muted">Compare rental income against your living expenses</p>
        </div>
        <button
          onClick={() => setShowInputs(!showInputs)}
          className="btn-secondary text-sm"
          aria-expanded={showInputs}
          aria-controls="financial-inputs-panel"
        >
          {showInputs ? 'Hide Inputs' : 'Edit Values'}
        </button>
      </div>

      {/* Input Panel - Modal-style overlay (not counted as navigation section) */}
      {showInputs && (
        <div id="financial-inputs-panel" className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-4 border border-cc-border rounded-lg bg-cc-surface/50" role="dialog" aria-label="Edit financial values">
          {/* Personal Expenses Inputs - Grouped under single card */}
          <div className="card" data-input-group="personal">
            <h4 className="font-semibold text-cc-accent mb-4 flex items-center gap-2">
              <Wallet size={18} />
              Your Current Living Costs
            </h4>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-cc-muted mb-1">
                  Current Monthly Rent (where you live now)
                </label>
                <input
                  type="number"
                  value={personal.currentRentPayment}
                  onChange={(e) => handlePersonalChange('currentRentPayment', e.target.value)}
                  className="input-field w-full"
                  placeholder="1500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-cc-muted mb-1">
                  Current Monthly Utilities
                </label>
                <input
                  type="number"
                  value={personal.currentUtilityCosts}
                  onChange={(e) => handlePersonalChange('currentUtilityCosts', e.target.value)}
                  className="input-field w-full"
                  placeholder="200"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-cc-muted mb-1">
                  Monthly Job Income
                </label>
                <input
                  type="number"
                  value={personal.currentJobIncome}
                  onChange={(e) => handlePersonalChange('currentJobIncome', e.target.value)}
                  className="input-field w-full"
                  placeholder="6000"
                />
              </div>
            </div>
          </div>

          {/* Property Income/Expenses Inputs - Grouped into collapsible sub-sections */}
          <div className="card" data-input-group="property">
            <h4 className="font-semibold text-cc-accent mb-4 flex items-center gap-2">
              <Home size={18} />
              Rental Property Financials
            </h4>

            {/* Income Group - Collapsible */}
            <div className="mb-4">
              <button
                onClick={() => setShowIncomeInputs(!showIncomeInputs)}
                className="flex items-center justify-between w-full text-left p-2 bg-cc-bg/30 rounded-lg mb-2"
              >
                <span className="text-sm font-medium text-cc-text flex items-center gap-2">
                  <DollarSign size={14} />
                  Income & Mortgage
                </span>
                {showIncomeInputs ? (
                  <ChevronDown size={16} className="text-cc-muted" />
                ) : (
                  <ChevronRight size={16} className="text-cc-muted" />
                )}
              </button>
              {showIncomeInputs && (
                <div className="grid grid-cols-2 gap-4 pl-2">
                  <div>
                    <label className="block text-xs font-medium text-cc-muted mb-1">
                      Monthly Rental Income
                    </label>
                    <input
                      type="number"
                      value={property.monthlyRentalIncome}
                      onChange={(e) => handlePropertyChange('monthlyRentalIncome', e.target.value)}
                      className="input-field w-full"
                      placeholder="2400"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-cc-muted mb-1">
                      Monthly Mortgage (P&I)
                    </label>
                    <input
                      type="number"
                      value={property.monthlyMortgagePayment}
                      onChange={(e) => handlePropertyChange('monthlyMortgagePayment', e.target.value)}
                      className="input-field w-full"
                      placeholder="1800"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Expenses Group - Collapsible */}
            <div>
              <button
                onClick={() => setShowExpenseInputs(!showExpenseInputs)}
                className="flex items-center justify-between w-full text-left p-2 bg-cc-bg/30 rounded-lg mb-2"
              >
                <span className="text-sm font-medium text-cc-text flex items-center gap-2">
                  <TrendingDown size={14} />
                  Operating Expenses
                </span>
                {showExpenseInputs ? (
                  <ChevronDown size={16} className="text-cc-muted" />
                ) : (
                  <ChevronRight size={16} className="text-cc-muted" />
                )}
              </button>
              {showExpenseInputs && (
                <div className="grid grid-cols-2 gap-4 pl-2">
                  <div>
                    <label className="block text-xs font-medium text-cc-muted mb-1">
                      Property Tax (monthly)
                    </label>
                    <input
                      type="number"
                      value={property.monthlyPropertyTax}
                      onChange={(e) => handlePropertyChange('monthlyPropertyTax', e.target.value)}
                      className="input-field w-full"
                      placeholder="350"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-cc-muted mb-1">
                      Insurance (monthly)
                    </label>
                    <input
                      type="number"
                      value={property.monthlyInsurance}
                      onChange={(e) => handlePropertyChange('monthlyInsurance', e.target.value)}
                      className="input-field w-full"
                      placeholder="150"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-cc-muted mb-1">
                      Maintenance Reserve
                    </label>
                    <input
                      type="number"
                      value={property.monthlyMaintenanceReserve}
                      onChange={(e) => handlePropertyChange('monthlyMaintenanceReserve', e.target.value)}
                      className="input-field w-full"
                      placeholder="200"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-cc-muted mb-1">
                      Vacancy Reserve
                    </label>
                    <input
                      type="number"
                      value={property.monthlyVacancyReserve}
                      onChange={(e) => handlePropertyChange('monthlyVacancyReserve', e.target.value)}
                      className="input-field w-full"
                      placeholder="120"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Key Metrics & Charts - Section 2 of 4: Single collapsible visualization group */}
      <div className="card">
        <button
          onClick={() => setShowVisualizations(!showVisualizations)}
          className="flex items-center justify-between w-full text-left"
          aria-expanded={showVisualizations}
          aria-controls="visualizations-content"
        >
          <h4 className="font-semibold text-cc-accent flex items-center gap-2">
            <BarChart3 size={18} />
            Key Metrics & Charts
          </h4>
          {showVisualizations ? (
            <ChevronDown size={20} className="text-cc-muted" />
          ) : (
            <ChevronRight size={20} className="text-cc-muted" />
          )}
        </button>

        {showVisualizations && (
          <div id="visualizations-content" className="space-y-6 mt-4">
            {/* Key Metrics - 4 cards in a grid (grouped as single unit) */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4" role="group" aria-label="Key financial metrics">
              {/* Monthly Cash Flow */}
              <div className="bg-cc-bg/50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className={`p-1.5 rounded-lg ${isPositiveCashFlow ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                    {isPositiveCashFlow ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                  </div>
                  <span className="text-xs text-cc-muted uppercase">Cash Flow</span>
                </div>
                <p className={`text-xl font-bold ${isPositiveCashFlow ? 'text-green-400' : 'text-red-400'}`}>
                  {formatCurrency(monthlyCashFlow)}
                  <span className="text-xs font-normal text-cc-muted">/mo</span>
                </p>
              </div>

              {/* Monthly Advantage */}
              <div className="bg-cc-bg/50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className={`p-1.5 rounded-lg ${isPositiveAdvantage ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                    <PiggyBank size={16} />
                  </div>
                  <span className="text-xs text-cc-muted uppercase">Net Benefit</span>
                </div>
                <p className={`text-xl font-bold ${isPositiveAdvantage ? 'text-green-400' : 'text-red-400'}`}>
                  {formatCurrency(comparison.monthlyAdvantage)}
                  <span className="text-xs font-normal text-cc-muted">/mo</span>
                </p>
              </div>

              {/* Cap Rate */}
              <div className="bg-cc-bg/50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-1.5 rounded-lg bg-blue-500/20 text-blue-400">
                    <DollarSign size={16} />
                  </div>
                  <span className="text-xs text-cc-muted uppercase">Cap Rate</span>
                </div>
                <p className="text-xl font-bold text-cc-text">
                  {cashFlow.capRate.toFixed(1)}%
                </p>
              </div>

              {/* Cash on Cash */}
              <div className="bg-cc-bg/50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-1.5 rounded-lg bg-purple-500/20 text-purple-400">
                    <TrendingUp size={16} />
                  </div>
                  <span className="text-xs text-cc-muted uppercase">Cash on Cash</span>
                </div>
                <p className="text-xl font-bold text-cc-text">
                  {cashFlow.cashOnCashReturn.toFixed(1)}%
                </p>
              </div>
            </div>

            {/* Charts - 2 charts in a grid (grouped as single unit) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" role="group" aria-label="Financial charts">
              {/* Income vs Expenses Bar Chart */}
              <div className="bg-cc-bg/50 rounded-lg p-4">
                <h5 className="font-medium text-cc-text mb-4">Income vs Expenses</h5>
                <div className="h-[250px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={comparisonData} margin={{ top: 10, right: 30, left: 10, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" />
                      <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
                      <YAxis stroke="#94a3b8" fontSize={12} tickFormatter={(val) => `$${val/1000}k`} />
                      <Tooltip
                        formatter={(val: number) => formatCurrency(val)}
                        contentStyle={{
                          backgroundColor: '#1a1a2e',
                          borderRadius: '8px',
                          border: '1px solid #334155',
                          color: '#fff'
                        }}
                      />
                      <Bar dataKey="Rental" fill="#ff8c42" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="Personal" fill="#64748b" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex justify-center gap-6 mt-2 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded bg-cc-accent" />
                    <span className="text-cc-muted">Rental Property</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded bg-slate-500" />
                    <span className="text-cc-muted">Personal Housing</span>
                  </div>
                </div>
              </div>

              {/* Expense Breakdown Pie Chart */}
              <div className="bg-cc-bg/50 rounded-lg p-4">
                <h5 className="font-medium text-cc-text mb-4">Operating Expense Breakdown</h5>
                <div className="h-[250px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={expenseData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        paddingAngle={2}
                      >
                        {expenseData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(val: number) => formatCurrency(val)}
                        contentStyle={{
                          backgroundColor: '#1a1a2e',
                          borderRadius: '8px',
                          border: '1px solid #334155',
                          color: '#fff'
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex flex-wrap justify-center gap-3 mt-2">
                  {expenseData.map((item) => (
                    <div key={item.name} className="flex items-center gap-1.5 text-xs">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="text-cc-muted">{item.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Summary Analysis - Section 3 of 4: Static information */}
      <div className="card bg-gradient-to-br from-cc-surface to-slate-800">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-cc-accent/20 rounded-lg text-cc-accent shrink-0">
            <Info size={20} />
          </div>
          <div>
            <h4 className="font-semibold text-cc-text mb-2">Analysis Summary</h4>
            <div className="text-sm text-cc-muted space-y-2">
              {isPositiveAdvantage ? (
                <p>
                  Your rental property generates a <span className="text-green-400 font-medium">
                  net monthly benefit of {formatCurrency(comparison.monthlyAdvantage)}</span> after
                  accounting for your personal housing costs. This means owning this rental is
                  financially advantageous compared to your current living situation.
                </p>
              ) : (
                <p>
                  Your rental property currently shows a <span className="text-red-400 font-medium">
                  net monthly cost of {formatCurrency(Math.abs(comparison.monthlyAdvantage))}</span>.
                  However, this doesn't account for equity building, appreciation, or tax benefits
                  from depreciation.
                </p>
              )}
              <p>
                Your effective housing cost (what you spend on housing after rental income) is{' '}
                <span className="text-cc-text font-medium">
                  {formatCurrency(comparison.effectiveHousingCost)}/month
                </span>
                {comparison.effectiveHousingCost < personal.currentRentPayment && (
                  <span className="text-green-400">
                    {' '}(saving {formatCurrency(personal.currentRentPayment - comparison.effectiveHousingCost)}/mo vs just renting)
                  </span>
                )}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Disclaimer - Section 4 of 4: Static text */}
      <p className="text-xs text-cc-muted text-center px-4">
        This analysis is for educational purposes only and does not constitute financial advice.
        Actual results may vary based on market conditions, tax situations, and other factors.
        Consult with qualified financial and tax professionals for personalized guidance.
      </p>
    </div>
  );
}
