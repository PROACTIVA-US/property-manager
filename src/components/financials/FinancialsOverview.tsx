import { useState, useEffect, useMemo } from 'react';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Home,
  Briefcase,
  Calculator,
  ChevronDown,
  ChevronUp,
  Loader2,
} from 'lucide-react';
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts';
import { loadSettings, saveSettings, type SettingsData } from '../../lib/settings';
import {
  calculateAmortizationSchedule,
  analyzeSchedules,
  calculateCurrentPrincipal,
  type LoanParams,
} from '../../lib/mortgage';
import { formatCurrency } from '../../lib/financials';

// Slider component for interactive value adjustment
function ValueSlider({
  label,
  value,
  min,
  max,
  step,
  onChange,
  formatValue = (v: number) => formatCurrency(v, 0),
  color = 'cc-accent',
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
  formatValue?: (value: number) => string;
  color?: string;
}) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-sm text-cc-muted">{label}</span>
        <span className={`font-bold text-${color}`}>{formatValue(value)}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className={`w-full h-2 bg-cc-border rounded-lg appearance-none cursor-pointer accent-${color}`}
      />
    </div>
  );
}

export default function FinancialsOverview() {
  const [settings, setSettings] = useState<SettingsData>(loadSettings());
  const [showMortgageDetails, setShowMortgageDetails] = useState(true);
  const [extraPayment, setExtraPayment] = useState(0);
  const [loading, setLoading] = useState(true);

  // Reload settings on mount
  useEffect(() => {
    setSettings(loadSettings());
    setLoading(false);
  }, []);

  // Save settings when values change
  const handleSettingChange = (
    section: 'rentalIncome' | 'personalExpenses',
    field: string,
    value: number
  ) => {
    const updated = {
      ...settings,
      [section]: {
        ...settings[section],
        [field]: value,
      },
    };
    setSettings(updated);
    saveSettings(updated);
  };

  // Calculate loan params for mortgage analysis
  const loanParams: LoanParams = useMemo(() => ({
    principal: settings.mortgage.principal,
    annualRate: settings.mortgage.interestRate / 100,
    baseMonthlyPAndI: settings.mortgage.monthlyPAndI,
    escrow: settings.mortgage.monthlyEscrow,
    totalPayment: settings.mortgage.totalMonthlyPayment,
    startDate: new Date(settings.mortgage.loanStartDate),
  }), [settings.mortgage]);

  // Calculate dynamic current principal
  const currentPrincipal = useMemo(() => {
    return calculateCurrentPrincipal(loanParams);
  }, [loanParams]);

  // Mortgage comparison (original vs accelerated)
  const comparison = useMemo(() => {
    const originalSchedule = calculateAmortizationSchedule(loanParams, 0, { amount: 0, month: 0 });
    const acceleratedSchedule = calculateAmortizationSchedule(loanParams, extraPayment, { amount: 0, month: 0 });
    return analyzeSchedules(originalSchedule, acceleratedSchedule, loanParams.principal);
  }, [loanParams, extraPayment]);

  // Chart data for mortgage payoff
  const chartData = useMemo(() => {
    const maxLength = Math.max(comparison.originalSchedule.length, comparison.acceleratedSchedule.length);
    const data = [];
    // Sample every few months for cleaner chart
    const sampleRate = Math.max(1, Math.floor(maxLength / 50));
    for (let i = 0; i < maxLength; i += sampleRate) {
      data.push({
        month: i + 1,
        Original: comparison.originalSchedule[i]?.remainingBalance || 0,
        Accelerated: comparison.acceleratedSchedule[i]?.remainingBalance || 0,
      });
    }
    return data;
  }, [comparison]);

  // Calculate rental financials
  const monthlyRent = settings.rentalIncome.monthlyRent;
  const annualRentalIncome = monthlyRent * 12;

  // Property expenses (NO office space - this is rental property only)
  const propertyExpenses = {
    mortgage: settings.mortgage.monthlyPAndI,
    propertyTax: settings.rentalIncome.monthlyPropertyTax,
    insurance: settings.rentalIncome.monthlyInsurance,
    hoa: settings.rentalIncome.monthlyHOA,
    maintenance: settings.rentalIncome.monthlyMaintenanceReserve,
    vacancy: settings.rentalIncome.monthlyVacancyReserve,
    management: settings.rentalIncome.monthlyManagementFee,
  };
  const totalPropertyExpenses = Object.values(propertyExpenses).reduce((a, b) => a + b, 0);
  const netRentalCashFlow = monthlyRent - totalPropertyExpenses;

  // Personal income and office space (SEPARATE from rental)
  const personalMonthlyIncome = settings.personalExpenses.currentJobIncome;
  const personalAnnualIncome = personalMonthlyIncome * 12;
  const officeSpaceCost = settings.personalExpenses.currentRentPayment;
  const annualOfficeSpace = officeSpaceCost * 12;
  const netPersonalAfterOffice = personalAnnualIncome - annualOfficeSpace;

  // Format helpers
  const fmtCurrency = (val: number) => formatCurrency(val, 0);
  const fmtDate = (date: Date | null) => date ? date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : '-';

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="animate-spin text-cc-muted" size={24} />
        <span className="ml-2 text-cc-muted text-sm">Loading financials...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-6">
      {/* ========== SECTION 1: RENTAL PROPERTY INCOME ========== */}
      <section>
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-green-500/20 rounded-lg">
            <TrendingUp className="text-green-400" size={20} />
          </div>
          <h2 className="text-xl font-bold text-cc-text">Rental Property Income</h2>
        </div>

        <div className="card bg-green-500/5 border border-green-500/20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <ValueSlider
                label="Monthly Rent"
                value={monthlyRent}
                min={500}
                max={10000}
                step={50}
                onChange={(val) => handleSettingChange('rentalIncome', 'monthlyRent', val)}
                color="green-400"
              />
            </div>
            <div className="flex items-center justify-between bg-green-500/10 rounded-lg p-4">
              <div>
                <p className="text-sm text-cc-muted">Annual Rental Income</p>
                <p className="text-3xl font-bold text-green-400">{fmtCurrency(annualRentalIncome)}</p>
              </div>
              <Home className="text-green-400/50" size={40} />
            </div>
          </div>
        </div>
      </section>

      {/* ========== SECTION 2: RENTAL PROPERTY EXPENSES ========== */}
      <section>
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-red-500/20 rounded-lg">
            <TrendingDown className="text-red-400" size={20} />
          </div>
          <h2 className="text-xl font-bold text-cc-text">Rental Property Expenses</h2>
          <span className="text-xs text-cc-muted">(excludes personal office space)</span>
        </div>

        <div className="card bg-red-500/5 border border-red-500/20">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-cc-bg/50 rounded-lg p-3">
              <p className="text-xs text-cc-muted uppercase">Mortgage P&I</p>
              <p className="text-lg font-bold text-cc-text">{fmtCurrency(propertyExpenses.mortgage)}</p>
            </div>
            <div className="bg-cc-bg/50 rounded-lg p-3">
              <p className="text-xs text-cc-muted uppercase">Property Tax</p>
              <p className="text-lg font-bold text-cc-text">{fmtCurrency(propertyExpenses.propertyTax)}</p>
            </div>
            <div className="bg-cc-bg/50 rounded-lg p-3">
              <p className="text-xs text-cc-muted uppercase">Insurance</p>
              <p className="text-lg font-bold text-cc-text">{fmtCurrency(propertyExpenses.insurance)}</p>
            </div>
            <div className="bg-cc-bg/50 rounded-lg p-3">
              <p className="text-xs text-cc-muted uppercase">Maintenance</p>
              <p className="text-lg font-bold text-cc-text">{fmtCurrency(propertyExpenses.maintenance)}</p>
            </div>
          </div>

          <div className="flex items-center justify-between bg-red-500/10 rounded-lg p-4">
            <div>
              <p className="text-sm text-cc-muted">Total Monthly Expenses</p>
              <p className="text-3xl font-bold text-red-400">{fmtCurrency(totalPropertyExpenses)}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-cc-muted">Annual</p>
              <p className="text-xl font-bold text-red-400">{fmtCurrency(totalPropertyExpenses * 12)}</p>
            </div>
          </div>
        </div>
      </section>

      {/* ========== SECTION 3: NET RENTAL CASH FLOW ========== */}
      <section>
        <div className="flex items-center gap-3 mb-4">
          <div className={`p-2 rounded-lg ${netRentalCashFlow >= 0 ? 'bg-cc-accent/20' : 'bg-cc-border'}`}>
            <DollarSign className={netRentalCashFlow >= 0 ? 'text-cc-accent' : 'text-slate-400'} size={20} />
          </div>
          <h2 className="text-xl font-bold text-cc-text">Net Rental Cash Flow</h2>
        </div>

        <div className={`card ${netRentalCashFlow >= 0 ? 'bg-cc-accent/5 border border-cc-accent/20' : 'bg-slate-800/50'}`}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-green-500/10 rounded-lg p-4 text-center">
              <p className="text-sm text-green-400 mb-1">Monthly Income</p>
              <p className="text-2xl font-bold text-green-400">+{fmtCurrency(monthlyRent)}</p>
            </div>
            <div className="bg-red-500/10 rounded-lg p-4 text-center">
              <p className="text-sm text-red-400 mb-1">Monthly Expenses</p>
              <p className="text-2xl font-bold text-red-400">-{fmtCurrency(totalPropertyExpenses)}</p>
            </div>
            <div className={`rounded-lg p-4 text-center ${netRentalCashFlow >= 0 ? 'bg-cc-accent/10' : 'bg-cc-border'}`}>
              <p className={`text-sm mb-1 ${netRentalCashFlow >= 0 ? 'text-cc-accent' : 'text-slate-400'}`}>Net Cash Flow</p>
              <p className={`text-2xl font-bold ${netRentalCashFlow >= 0 ? 'text-cc-accent' : 'text-red-400'}`}>
                {netRentalCashFlow >= 0 ? '+' : ''}{fmtCurrency(netRentalCashFlow)}
              </p>
              <p className="text-xs text-cc-muted mt-1">
                {fmtCurrency(netRentalCashFlow * 12)}/year
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ========== SECTION 4: MORTGAGE PAYOFF ANALYSIS ========== */}
      <section>
        <button
          onClick={() => setShowMortgageDetails(!showMortgageDetails)}
          className="flex items-center gap-3 mb-4 w-full text-left"
        >
          <div className="p-2 bg-blue-500/20 rounded-lg">
            <Calculator className="text-blue-400" size={20} />
          </div>
          <h2 className="text-xl font-bold text-cc-text flex-1">Mortgage Payoff Analysis</h2>
          {showMortgageDetails ? <ChevronUp className="text-cc-muted" /> : <ChevronDown className="text-cc-muted" />}
        </button>

        {showMortgageDetails && (
          <div className="card bg-blue-500/5 border border-blue-500/20 space-y-6">
            {/* Current Status */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-cc-bg/50 rounded-lg p-4">
                <p className="text-xs text-cc-muted uppercase">Current Principal</p>
                <p className="text-xl font-bold text-blue-400">{fmtCurrency(currentPrincipal)}</p>
                <p className="text-xs text-cc-muted">dynamically calculated</p>
              </div>
              <div className="bg-cc-bg/50 rounded-lg p-4">
                <p className="text-xs text-cc-muted uppercase">Interest Rate</p>
                <p className="text-xl font-bold text-cc-text">{settings.mortgage.interestRate}%</p>
              </div>
              <div className="bg-cc-bg/50 rounded-lg p-4">
                <p className="text-xs text-cc-muted uppercase">Original Payoff</p>
                <p className="text-xl font-bold text-cc-text">{fmtDate(comparison.originalPayoffDate)}</p>
              </div>
              <div className="bg-cc-bg/50 rounded-lg p-4">
                <p className="text-xs text-cc-muted uppercase">Monthly P&I</p>
                <p className="text-xl font-bold text-cc-text">{fmtCurrency(settings.mortgage.monthlyPAndI)}</p>
              </div>
            </div>

            {/* Extra Payment Slider */}
            <div className="bg-cc-bg/30 rounded-lg p-4">
              <ValueSlider
                label="Extra Monthly Payment"
                value={extraPayment}
                min={0}
                max={5000}
                step={50}
                onChange={setExtraPayment}
                color="blue-400"
              />
            </div>

            {/* Impact Summary */}
            {extraPayment > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                  <p className="text-xs text-green-400 uppercase">New Payoff Date</p>
                  <p className="text-xl font-bold text-green-400">{fmtDate(comparison.acceleratedPayoffDate)}</p>
                </div>
                <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                  <p className="text-xs text-green-400 uppercase">Time Saved</p>
                  <p className="text-xl font-bold text-green-400">
                    {Math.round(comparison.monthsSaved / 12 * 10) / 10} years
                  </p>
                </div>
                <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                  <p className="text-xs text-green-400 uppercase">Interest Saved</p>
                  <p className="text-xl font-bold text-green-400">{fmtCurrency(comparison.interestSaved)}</p>
                </div>
                <div className="bg-cc-bg/50 rounded-lg p-4">
                  <p className="text-xs text-cc-muted uppercase">Total Interest</p>
                  <p className="text-xl font-bold text-cc-text">{fmtCurrency(comparison.acceleratedTotalInterest)}</p>
                </div>
              </div>
            )}

            {/* Balance Chart */}
            <div>
              <h4 className="text-sm font-medium text-cc-muted mb-3">Principal Balance Over Time</h4>
              <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <defs>
                      <linearGradient id="originalGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#64748b" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#64748b" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="acceleratedGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" />
                    <XAxis
                      dataKey="month"
                      stroke="#94a3b8"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(val) => `${Math.round(val / 12)}y`}
                    />
                    <YAxis
                      stroke="#94a3b8"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(val) => `$${Math.round(val / 1000)}k`}
                    />
                    <Tooltip
                      formatter={(val: number) => fmtCurrency(val)}
                      contentStyle={{
                        backgroundColor: '#1a1a2e',
                        borderRadius: '8px',
                        border: '1px solid #334155',
                        color: '#fff',
                      }}
                    />
                    <Legend wrapperStyle={{ color: '#e2e8f0' }} />
                    <Area
                      type="monotone"
                      dataKey="Original"
                      stroke="#64748b"
                      strokeWidth={2}
                      fill="url(#originalGradient)"
                    />
                    {extraPayment > 0 && (
                      <Area
                        type="monotone"
                        dataKey="Accelerated"
                        stroke="#3b82f6"
                        strokeWidth={2}
                        fill="url(#acceleratedGradient)"
                      />
                    )}
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* ========== SECTION 5: PERSONAL INCOME vs OFFICE SPACE ========== */}
      <section>
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-purple-500/20 rounded-lg">
            <Briefcase className="text-purple-400" size={20} />
          </div>
          <h2 className="text-xl font-bold text-cc-text">Personal Income vs Office Space</h2>
          <span className="text-xs text-cc-muted">(separate from rental property)</span>
        </div>

        <div className="card bg-purple-500/5 border border-purple-500/20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <div className="space-y-4">
              <ValueSlider
                label="Annual Personal Income"
                value={personalAnnualIncome}
                min={0}
                max={500000}
                step={5000}
                onChange={(val) => handleSettingChange('personalExpenses', 'currentJobIncome', val / 12)}
                formatValue={(v) => fmtCurrency(v) + '/yr'}
                color="purple-400"
              />
            </div>
            <div className="space-y-4">
              <ValueSlider
                label="Monthly Office Space Cost"
                value={officeSpaceCost}
                min={0}
                max={5000}
                step={50}
                onChange={(val) => handleSettingChange('personalExpenses', 'currentRentPayment', val)}
                formatValue={(v) => fmtCurrency(v) + '/mo'}
                color="purple-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-purple-500/10 rounded-lg p-4 text-center">
              <p className="text-sm text-purple-400 mb-1">Annual Income</p>
              <p className="text-2xl font-bold text-purple-400">{fmtCurrency(personalAnnualIncome)}</p>
            </div>
            <div className="bg-purple-500/10 rounded-lg p-4 text-center">
              <p className="text-sm text-purple-400 mb-1">Annual Office Cost</p>
              <p className="text-2xl font-bold text-purple-400">-{fmtCurrency(annualOfficeSpace)}</p>
            </div>
            <div className="bg-purple-500/20 border border-purple-500/30 rounded-lg p-4 text-center">
              <p className="text-sm text-purple-300 mb-1">Net After Office</p>
              <p className="text-2xl font-bold text-purple-300">{fmtCurrency(netPersonalAfterOffice)}</p>
            </div>
          </div>

          <div className="mt-4 text-sm text-cc-muted bg-cc-bg/30 rounded-lg p-3">
            <p>
              <strong>Note:</strong> Office space expenses are separate from your rental property finances.
              This section tracks your personal income against your office/workspace costs.
            </p>
          </div>
        </div>
      </section>

      {/* ========== COMBINED SUMMARY ========== */}
      <section>
        <div className="card bg-gradient-to-br from-cc-surface to-slate-800/50 border border-cc-border">
          <h3 className="text-lg font-bold text-cc-text mb-4">Combined Financial Summary</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-xs text-cc-muted uppercase mb-1">Rental Net (Annual)</p>
              <p className={`text-xl font-bold ${netRentalCashFlow >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {fmtCurrency(netRentalCashFlow * 12)}
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs text-cc-muted uppercase mb-1">Personal Net (Annual)</p>
              <p className="text-xl font-bold text-purple-400">{fmtCurrency(netPersonalAfterOffice)}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-cc-muted uppercase mb-1">Total Net Income</p>
              <p className="text-xl font-bold text-cc-accent">
                {fmtCurrency((netRentalCashFlow * 12) + netPersonalAfterOffice)}
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs text-cc-muted uppercase mb-1">Current Equity</p>
              <p className="text-xl font-bold text-cc-text">
                {fmtCurrency(settings.property.currentMarketValue - currentPrincipal)}
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
