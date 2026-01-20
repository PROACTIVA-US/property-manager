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
} from 'recharts';
import {
  Calculator,
  AlertTriangle,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  Shield,
  FileText,
  Building2,
  Repeat,
  Clock,
  Heart,
  Info,
} from 'lucide-react';
import {
  type PropertyFinancials,
  type TaxInputs,
  calculateTaxEstimate,
  getMarginalTaxRate,
  TAX_MITIGATION_STRATEGIES,
  formatCurrency,
  formatPercent,
  DEFAULT_PROPERTY_FINANCIALS,
  DEFAULT_TAX_INPUTS,
} from '../lib/financials';

interface TaxAnalysisProps {
  initialProperty?: PropertyFinancials;
  initialTaxInputs?: TaxInputs;
}

const STRATEGY_ICONS: Record<string, React.ElementType> = {
  '1031-exchange': Repeat,
  'primary-residence-conversion': Building2,
  'installment-sale': Clock,
  'opportunity-zone': Shield,
  'charitable-remainder-trust': Heart,
};

export default function TaxAnalysis({
  initialProperty = DEFAULT_PROPERTY_FINANCIALS,
  initialTaxInputs = DEFAULT_TAX_INPUTS,
}: TaxAnalysisProps) {
  const [property, setProperty] = useState<PropertyFinancials>(initialProperty);
  const [taxInputs, setTaxInputs] = useState<TaxInputs>(initialTaxInputs);
  const [showInputs, setShowInputs] = useState(false);
  const [expandedStrategy, setExpandedStrategy] = useState<string | null>(null);

  // Calculate tax estimate
  const taxEstimate = useMemo(
    () => calculateTaxEstimate(property, taxInputs),
    [property, taxInputs]
  );

  const marginalRate = useMemo(
    () => getMarginalTaxRate(taxInputs.annualIncome, taxInputs.filingStatus),
    [taxInputs.annualIncome, taxInputs.filingStatus]
  );

  // Data for tax breakdown chart
  const taxBreakdownData = [
    { name: 'Capital Gains Tax', value: taxEstimate.estimatedCapitalGainsTax, color: '#ef4444' },
    { name: 'Depreciation Recapture', value: taxEstimate.estimatedDepreciationRecaptureTax, color: '#f97316' },
    { name: 'State Tax', value: taxEstimate.estimatedStateTax, color: '#eab308' },
  ].filter(item => item.value > 0);

  // Data for proceeds breakdown
  const proceedsData = [
    { name: 'Net Proceeds', value: taxEstimate.netProceedsAfterTax, color: '#22c55e' },
    { name: 'Selling Costs', value: taxInputs.sellingCosts, color: '#64748b' },
    { name: 'Total Taxes', value: taxEstimate.estimatedTotalTax + taxEstimate.estimatedStateTax, color: '#ef4444' },
  ];

  const handlePropertyChange = (field: keyof PropertyFinancials, value: string) => {
    const numValue = parseFloat(value) || 0;
    setProperty(prev => ({ ...prev, [field]: numValue }));
  };

  const handleTaxInputChange = (field: keyof TaxInputs, value: string | number) => {
    if (field === 'filingStatus') {
      setTaxInputs(prev => ({ ...prev, [field]: value as TaxInputs['filingStatus'] }));
    } else {
      const numValue = typeof value === 'string' ? parseFloat(value) || 0 : value;
      setTaxInputs(prev => ({ ...prev, [field]: numValue }));
    }
  };

  const toggleStrategy = (strategyId: string) => {
    setExpandedStrategy(expandedStrategy === strategyId ? null : strategyId);
  };

  return (
    <div className="space-y-6">
      {/* Header with Warning */}
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
        <div>
          <h3 className="text-xl font-bold text-brand-light">Tax Liability Analysis</h3>
          <p className="text-sm text-brand-muted">Estimated taxes if sold as non-primary residence</p>
        </div>
        <button
          onClick={() => setShowInputs(!showInputs)}
          className="btn-secondary text-sm"
        >
          {showInputs ? 'Hide Inputs' : 'Edit Values'}
        </button>
      </div>

      {/* Warning Banner */}
      <div className="flex items-start gap-3 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
        <AlertTriangle className="w-5 h-5 text-yellow-500 shrink-0 mt-0.5" />
        <div className="text-sm">
          <p className="text-yellow-500 font-medium">Important Disclaimer</p>
          <p className="text-brand-muted mt-1">
            These are simplified estimates for educational purposes only. Tax laws are complex
            and change frequently. Always consult with a qualified tax professional or CPA
            for accurate tax planning and advice specific to your situation.
          </p>
        </div>
      </div>

      {/* Input Section (Collapsible) */}
      {showInputs && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Property Values */}
          <div className="card">
            <h4 className="font-semibold text-brand-orange mb-4 flex items-center gap-2">
              <Building2 size={18} />
              Property Values
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-brand-muted mb-1">
                  Purchase Price
                </label>
                <input
                  type="number"
                  value={property.purchasePrice}
                  onChange={(e) => handlePropertyChange('purchasePrice', e.target.value)}
                  className="input-field w-full"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-brand-muted mb-1">
                  Current Market Value
                </label>
                <input
                  type="number"
                  value={property.currentMarketValue}
                  onChange={(e) => handlePropertyChange('currentMarketValue', e.target.value)}
                  className="input-field w-full"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-brand-muted mb-1">
                  Years Owned
                </label>
                <input
                  type="number"
                  value={property.yearsOwned}
                  onChange={(e) => handlePropertyChange('yearsOwned', e.target.value)}
                  className="input-field w-full"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-brand-muted mb-1">
                  Improvements Cost
                </label>
                <input
                  type="number"
                  value={taxInputs.improvementsCost}
                  onChange={(e) => handleTaxInputChange('improvementsCost', e.target.value)}
                  className="input-field w-full"
                />
              </div>
            </div>
          </div>

          {/* Tax Inputs */}
          <div className="card">
            <h4 className="font-semibold text-brand-orange mb-4 flex items-center gap-2">
              <Calculator size={18} />
              Tax Information
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-xs font-medium text-brand-muted mb-1">
                  Filing Status
                </label>
                <select
                  value={taxInputs.filingStatus}
                  onChange={(e) => handleTaxInputChange('filingStatus', e.target.value)}
                  className="input-field w-full"
                >
                  <option value="single">Single</option>
                  <option value="married_filing_jointly">Married Filing Jointly</option>
                  <option value="married_filing_separately">Married Filing Separately</option>
                  <option value="head_of_household">Head of Household</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-brand-muted mb-1">
                  Annual Income
                </label>
                <input
                  type="number"
                  value={taxInputs.annualIncome}
                  onChange={(e) => handleTaxInputChange('annualIncome', e.target.value)}
                  className="input-field w-full"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-brand-muted mb-1">
                  Land Value
                </label>
                <input
                  type="number"
                  value={taxInputs.landValue}
                  onChange={(e) => handleTaxInputChange('landValue', e.target.value)}
                  className="input-field w-full"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-brand-muted mb-1">
                  Selling Costs
                </label>
                <input
                  type="number"
                  value={taxInputs.sellingCosts}
                  onChange={(e) => handleTaxInputChange('sellingCosts', e.target.value)}
                  className="input-field w-full"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-brand-muted mb-1">
                  State Tax Rate (%)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={(taxInputs.stateIncomeTaxRate * 100).toFixed(1)}
                  onChange={(e) => handleTaxInputChange('stateIncomeTaxRate', parseFloat(e.target.value) / 100)}
                  className="input-field w-full"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Key Tax Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card !p-4">
          <p className="text-[10px] text-brand-muted uppercase mb-1">Capital Gain</p>
          <p className="text-xl font-bold text-brand-light">{formatCurrency(taxEstimate.capitalGain)}</p>
        </div>
        <div className="card !p-4">
          <p className="text-[10px] text-brand-muted uppercase mb-1">Depreciation Taken</p>
          <p className="text-xl font-bold text-brand-light">{formatCurrency(taxEstimate.depreciationTaken)}</p>
        </div>
        <div className="card !p-4">
          <p className="text-[10px] text-brand-muted uppercase mb-1">Total Tax Estimate</p>
          <p className="text-xl font-bold text-red-400">
            {formatCurrency(taxEstimate.estimatedTotalTax + taxEstimate.estimatedStateTax)}
          </p>
        </div>
        <div className="card !p-4">
          <p className="text-[10px] text-brand-muted uppercase mb-1">Net After Tax</p>
          <p className="text-xl font-bold text-green-400">{formatCurrency(taxEstimate.netProceedsAfterTax)}</p>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tax Breakdown */}
        <div className="card">
          <h4 className="font-semibold text-brand-orange mb-4">Estimated Tax Breakdown</h4>
          {taxBreakdownData.length > 0 ? (
            <div className="h-[200px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={taxBreakdownData}
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#334155" />
                  <XAxis type="number" hide />
                  <YAxis
                    dataKey="name"
                    type="category"
                    stroke="#94a3b8"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    width={130}
                  />
                  <Tooltip
                    formatter={(val: number) => formatCurrency(val)}
                    contentStyle={{
                      backgroundColor: '#1a1a2e',
                      borderRadius: '8px',
                      border: '1px solid #334155',
                      color: '#fff'
                    }}
                  />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                    {taxBreakdownData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-[200px] flex items-center justify-center text-brand-muted">
              No significant tax liability estimated
            </div>
          )}
          <div className="mt-4 pt-4 border-t border-slate-700/50 grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-brand-muted text-xs">Marginal Tax Bracket</p>
              <p className="font-medium text-brand-light">{formatPercent(marginalRate * 100)}</p>
            </div>
            <div>
              <p className="text-brand-muted text-xs">Adjusted Basis</p>
              <p className="font-medium text-brand-light">{formatCurrency(taxEstimate.adjustedBasis)}</p>
            </div>
          </div>
        </div>

        {/* Proceeds Breakdown */}
        <div className="card">
          <h4 className="font-semibold text-brand-orange mb-4">Sale Proceeds Distribution</h4>
          <div className="h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={proceedsData}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#334155" />
                <XAxis type="number" hide />
                <YAxis
                  dataKey="name"
                  type="category"
                  stroke="#94a3b8"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  width={100}
                />
                <Tooltip
                  formatter={(val: number) => formatCurrency(val)}
                  contentStyle={{
                    backgroundColor: '#1a1a2e',
                    borderRadius: '8px',
                    border: '1px solid #334155',
                    color: '#fff'
                  }}
                />
                <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                  {proceedsData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 pt-4 border-t border-slate-700/50">
            <div className="flex justify-between items-center">
              <span className="text-brand-muted text-sm">Market Value</span>
              <span className="font-bold text-brand-light">{formatCurrency(property.currentMarketValue)}</span>
            </div>
            <div className="flex justify-between items-center mt-2">
              <span className="text-brand-muted text-sm">You Keep</span>
              <span className="font-bold text-green-400">{formatCurrency(taxEstimate.netProceedsAfterTax)}</span>
            </div>
            <div className="flex justify-between items-center mt-1 text-xs">
              <span className="text-brand-muted">Effective tax rate on proceeds</span>
              <span className="text-red-400">
                {formatPercent(((taxEstimate.estimatedTotalTax + taxEstimate.estimatedStateTax) / property.currentMarketValue) * 100)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tax Mitigation Strategies */}
      <div className="card">
        <div className="flex items-center gap-2 mb-4">
          <Shield className="w-5 h-5 text-brand-orange" />
          <h4 className="font-semibold text-brand-light">Tax Mitigation Strategies</h4>
        </div>
        <p className="text-sm text-brand-muted mb-4">
          Educational information about legal strategies that may help reduce or defer taxes.
          Consult with a qualified tax professional before implementing any strategy.
        </p>

        <div className="space-y-3">
          {TAX_MITIGATION_STRATEGIES.map((strategy) => {
            const Icon = STRATEGY_ICONS[strategy.id] || FileText;
            const isExpanded = expandedStrategy === strategy.id;

            return (
              <div
                key={strategy.id}
                className="border border-slate-700/50 rounded-lg overflow-hidden"
              >
                <button
                  onClick={() => toggleStrategy(strategy.id)}
                  className="w-full flex items-center justify-between p-4 hover:bg-brand-navy/30 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-brand-orange/20 rounded-lg text-brand-orange">
                      <Icon size={18} />
                    </div>
                    <div className="text-left">
                      <p className="font-medium text-brand-light">{strategy.name}</p>
                      <p className="text-xs text-brand-muted">{strategy.summary}</p>
                    </div>
                  </div>
                  {isExpanded ? (
                    <ChevronDown className="w-5 h-5 text-brand-muted" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-brand-muted" />
                  )}
                </button>

                {isExpanded && (
                  <div className="px-4 pb-4 pt-2 border-t border-slate-700/50 bg-brand-dark/30">
                    <p className="text-sm text-brand-muted mb-4">{strategy.description}</p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <h5 className="text-xs font-medium text-brand-orange uppercase mb-2">
                          Key Requirements
                        </h5>
                        <ul className="text-xs text-brand-muted space-y-1">
                          {strategy.requirements.slice(0, 4).map((req, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <span className="text-brand-orange mt-0.5">-</span>
                              {req}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h5 className="text-xs font-medium text-green-400 uppercase mb-2">
                          Potential Benefits
                        </h5>
                        <ul className="text-xs text-brand-muted space-y-1">
                          {strategy.benefits.slice(0, 4).map((benefit, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <span className="text-green-400 mt-0.5">+</span>
                              {benefit}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div className="mb-4">
                      <h5 className="text-xs font-medium text-yellow-400 uppercase mb-2">
                        Important Considerations
                      </h5>
                      <ul className="text-xs text-brand-muted space-y-1">
                        {strategy.considerations.slice(0, 3).map((consideration, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="text-yellow-400 mt-0.5">!</span>
                            {consideration}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {strategy.learnMoreUrl && (
                      <a
                        href={strategy.learnMoreUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 transition-colors"
                      >
                        Learn more from IRS
                        <ExternalLink size={12} />
                      </a>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Professional Advice Reminder */}
      <div className="card bg-gradient-to-br from-brand-navy to-slate-800">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-blue-500/20 rounded-lg text-blue-400 shrink-0">
            <Info size={20} />
          </div>
          <div className="text-sm">
            <p className="text-brand-light font-medium mb-1">Professional Guidance Recommended</p>
            <p className="text-brand-muted">
              Tax planning for real estate involves complex regulations that vary by jurisdiction
              and individual circumstances. The estimates and strategies shown here are
              simplified for educational purposes. Before making any decisions, consult with:
            </p>
            <ul className="mt-2 space-y-1 text-brand-muted">
              <li>- A Certified Public Accountant (CPA) familiar with real estate</li>
              <li>- A tax attorney for complex situations</li>
              <li>- A qualified financial planner for overall strategy</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
