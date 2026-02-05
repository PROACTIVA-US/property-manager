import { useState, useMemo } from 'react';
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
  Area,
  ComposedChart,
  Line,
} from 'recharts';
import {
  Scale,
  TrendingUp,
  TrendingDown,
  Clock,
  Building2,
  BarChart3,
  Info,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import FinancialAccessDenied from './FinancialAccessDenied';
import {
  type PropertyFinancials,
  type TaxInputs,
  type KeepVsSellAnalysis,
  calculateKeepVsSell,
  formatCurrency,
  DEFAULT_PROPERTY_FINANCIALS,
  DEFAULT_TAX_INPUTS,
} from '../lib/financials';

interface KeepVsSellProps {
  initialProperty?: PropertyFinancials;
  initialTaxInputs?: TaxInputs;
}

export default function KeepVsSell({
  initialProperty = DEFAULT_PROPERTY_FINANCIALS,
  initialTaxInputs = DEFAULT_TAX_INPUTS,
}: KeepVsSellProps) {
  const { user } = useAuth();

  // Owner-only guard
  if (user?.role !== 'owner') {
    return <FinancialAccessDenied />;
  }

  const [property, setProperty] = useState<PropertyFinancials>(initialProperty);
  const [taxInputs] = useState<TaxInputs>(initialTaxInputs);
  const [alternativeReturn, setAlternativeReturn] = useState(7); // S&P 500 average
  const [projectionYears, setProjectionYears] = useState(10);
  const [showInputs, setShowInputs] = useState(false);

  // Calculate analysis
  const analysis = useMemo(
    () => calculateKeepVsSell(property, taxInputs, alternativeReturn / 100, projectionYears),
    [property, taxInputs, alternativeReturn, projectionYears]
  );

  // Prepare chart data
  const chartData = analysis.projections.map(proj => ({
    year: proj.year,
    'Keep Property': proj.totalReturn,
    'Sell & Invest': proj.alternativeInvestmentValue,
    Advantage: proj.keepAdvantage,
  }));

  // Determine recommendation color
  const getRecommendationColor = (rec: KeepVsSellAnalysis['recommendation']) => {
    switch (rec) {
      case 'keep': return 'text-green-400';
      case 'sell': return 'text-blue-400';
      default: return 'text-yellow-400';
    }
  };

  const getRecommendationBg = (rec: KeepVsSellAnalysis['recommendation']) => {
    switch (rec) {
      case 'keep': return 'bg-green-500/10 border-green-500/30';
      case 'sell': return 'bg-blue-500/10 border-blue-500/30';
      default: return 'bg-yellow-500/10 border-yellow-500/30';
    }
  };

  const handlePropertyChange = (field: keyof PropertyFinancials, value: string) => {
    const numValue = parseFloat(value) || 0;
    setProperty(prev => ({ ...prev, [field]: numValue }));
  };

  // Calculate some helpful metrics
  const currentEquity = property.currentMarketValue - property.mortgageBalance;
  const tenYearProjection = analysis.projections[projectionYears - 1];
  const keepVsSellDiff = tenYearProjection
    ? tenYearProjection.totalReturn - tenYearProjection.alternativeInvestmentValue
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-xl font-bold text-cc-text">Keep vs Sell Analysis</h3>
          <p className="text-sm text-cc-muted">Compare long-term wealth building scenarios</p>
        </div>
        <button
          onClick={() => setShowInputs(!showInputs)}
          className="btn-secondary text-sm"
        >
          {showInputs ? 'Hide Inputs' : 'Adjust Assumptions'}
        </button>
      </div>

      {/* Input Section (Collapsible) */}
      {showInputs && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Property Inputs */}
          <div className="card">
            <h4 className="font-semibold text-cc-accent mb-4 flex items-center gap-2">
              <Building2 size={18} />
              Property Assumptions
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-cc-muted mb-1">
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
                <label className="block text-xs font-medium text-cc-muted mb-1">
                  Mortgage Balance
                </label>
                <input
                  type="number"
                  value={property.mortgageBalance}
                  onChange={(e) => handlePropertyChange('mortgageBalance', e.target.value)}
                  className="input-field w-full"
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
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-cc-muted mb-1">
                  Monthly Rental Income
                </label>
                <input
                  type="number"
                  value={property.monthlyRentalIncome}
                  onChange={(e) => handlePropertyChange('monthlyRentalIncome', e.target.value)}
                  className="input-field w-full"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-medium text-cc-muted mb-1">
                  Expected Annual Appreciation: {(property.annualAppreciationRate * 100).toFixed(1)}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="10"
                  step="0.5"
                  value={property.annualAppreciationRate * 100}
                  onChange={(e) => setProperty(prev => ({
                    ...prev,
                    annualAppreciationRate: parseFloat(e.target.value) / 100
                  }))}
                  className="w-full h-2 bg-cc-border rounded-lg appearance-none cursor-pointer accent-cc-accent"
                />
                <div className="flex justify-between text-xs text-cc-muted mt-1">
                  <span>0%</span>
                  <span>5%</span>
                  <span>10%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Investment Assumptions */}
          <div className="card">
            <h4 className="font-semibold text-cc-accent mb-4 flex items-center gap-2">
              <BarChart3 size={18} />
              Investment Assumptions
            </h4>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-cc-muted mb-1">
                  Alternative Investment Return: {alternativeReturn.toFixed(1)}%
                </label>
                <input
                  type="range"
                  min="2"
                  max="12"
                  step="0.5"
                  value={alternativeReturn}
                  onChange={(e) => setAlternativeReturn(parseFloat(e.target.value))}
                  className="w-full h-2 bg-cc-border rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
                <div className="flex justify-between text-xs text-cc-muted mt-1">
                  <span>2% (Bonds)</span>
                  <span>7% (S&P Avg)</span>
                  <span>12% (Aggressive)</span>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-cc-muted mb-1">
                  Projection Period: {projectionYears} Years
                </label>
                <input
                  type="range"
                  min="5"
                  max="20"
                  step="1"
                  value={projectionYears}
                  onChange={(e) => setProjectionYears(parseInt(e.target.value))}
                  className="w-full h-2 bg-cc-border rounded-lg appearance-none cursor-pointer accent-purple-500"
                />
                <div className="flex justify-between text-xs text-cc-muted mt-1">
                  <span>5 years</span>
                  <span>10 years</span>
                  <span>20 years</span>
                </div>
              </div>
              <div className="text-xs text-cc-muted bg-cc-bg/50 p-3 rounded-lg">
                <p className="font-medium text-cc-text mb-1">About the Alternative Return</p>
                <p>
                  This represents the expected annual return if you sold the property and invested
                  the net proceeds (after taxes and selling costs) in stocks or other investments.
                  The S&P 500 has averaged ~7% real return historically.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Key Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card !p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 rounded-lg bg-blue-500/20 text-blue-400">
              <Building2 size={16} />
            </div>
            <span className="text-xs text-cc-muted uppercase">Current Equity</span>
          </div>
          <p className="text-xl font-bold text-cc-text">{formatCurrency(currentEquity)}</p>
        </div>

        <div className="card !p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 rounded-lg bg-green-500/20 text-green-400">
              <TrendingUp size={16} />
            </div>
            <span className="text-xs text-cc-muted uppercase">{projectionYears}Y Keep Value</span>
          </div>
          <p className="text-xl font-bold text-green-400">
            {formatCurrency(analysis.tenYearKeepValue)}
          </p>
        </div>

        <div className="card !p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 rounded-lg bg-purple-500/20 text-purple-400">
              <BarChart3 size={16} />
            </div>
            <span className="text-xs text-cc-muted uppercase">{projectionYears}Y Sell Value</span>
          </div>
          <p className="text-xl font-bold text-purple-400">
            {formatCurrency(analysis.tenYearSellValue)}
          </p>
        </div>

        <div className="card !p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className={`p-1.5 rounded-lg ${keepVsSellDiff >= 0 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
              {keepVsSellDiff >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
            </div>
            <span className="text-xs text-cc-muted uppercase">Difference</span>
          </div>
          <p className={`text-xl font-bold ${keepVsSellDiff >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {keepVsSellDiff >= 0 ? '+' : ''}{formatCurrency(keepVsSellDiff)}
          </p>
        </div>
      </div>

      {/* Main Projection Chart */}
      <div className="card">
        <h4 className="font-semibold text-cc-accent mb-4">Wealth Projection Over Time</h4>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData} margin={{ top: 10, right: 30, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" />
              <XAxis
                dataKey="year"
                stroke="#94a3b8"
                fontSize={12}
                tickFormatter={(val) => `Year ${val}`}
              />
              <YAxis
                stroke="#94a3b8"
                fontSize={12}
                tickFormatter={(val) => `$${(val/1000).toFixed(0)}k`}
              />
              <Tooltip
                formatter={(val: number) => formatCurrency(val)}
                labelFormatter={(label) => `Year ${label}`}
                contentStyle={{
                  backgroundColor: '#1a1a2e',
                  borderRadius: '8px',
                  border: '1px solid #334155',
                  color: '#fff'
                }}
              />
              <Legend wrapperStyle={{ color: '#e2e8f0' }} />
              {analysis.breakEvenYear && (
                <ReferenceLine
                  x={analysis.breakEvenYear}
                  stroke="#ff8c42"
                  strokeDasharray="5 5"
                  label={{
                    value: 'Break-even',
                    fill: '#ff8c42',
                    fontSize: 11,
                    position: 'top',
                  }}
                />
              )}
              <Area
                type="monotone"
                dataKey="Advantage"
                fill="#22c55e"
                fillOpacity={0.1}
                stroke="none"
              />
              <Line
                type="monotone"
                dataKey="Keep Property"
                stroke="#22c55e"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 6 }}
              />
              <Line
                type="monotone"
                dataKey="Sell & Invest"
                stroke="#a855f7"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 6 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
        <div className="flex justify-center gap-6 mt-4 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-green-500" />
            <span className="text-cc-muted">Keep Property (Equity + Cash Flow)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-purple-500" />
            <span className="text-cc-muted">Sell & Invest in Stocks</span>
          </div>
        </div>
      </div>

      {/* Recommendation Card */}
      <div className={`card border ${getRecommendationBg(analysis.recommendation)}`}>
        <div className="flex items-start gap-4">
          <div className={`p-3 rounded-xl ${
            analysis.recommendation === 'keep' ? 'bg-green-500/20' :
            analysis.recommendation === 'sell' ? 'bg-red-500/20' : 'bg-yellow-500/20'
          }`}>
            <Scale className={`w-6 h-6 ${getRecommendationColor(analysis.recommendation)}`} />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-semibold text-cc-text">Analysis Recommendation</h4>
              <span className={`px-2 py-0.5 rounded text-xs font-medium uppercase ${
                analysis.recommendation === 'keep' ? 'bg-green-500/20 text-green-400' :
                analysis.recommendation === 'sell' ? 'bg-red-500/20 text-red-400' :
                'bg-yellow-500/20 text-yellow-400'
              }`}>
                {analysis.recommendation === 'keep' ? 'Consider Keeping' :
                 analysis.recommendation === 'sell' ? 'Consider Selling' : 'Neutral'}
              </span>
            </div>
            <p className="text-sm text-cc-muted">{analysis.recommendationReason}</p>

            {analysis.breakEvenYear && (
              <div className="flex items-center gap-2 mt-3 text-sm">
                <Clock className="w-4 h-4 text-cc-accent" />
                <span className="text-cc-muted">
                  Break-even point: <span className="text-cc-text font-medium">Year {analysis.breakEvenYear}</span>
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Year-by-Year Table */}
      <div className="card !p-0 overflow-hidden">
        <div className="p-4 border-b border-cc-border/50">
          <h4 className="font-semibold text-cc-accent">Year-by-Year Projection</h4>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-cc-border/50 text-sm">
            <thead className="bg-cc-bg">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-cc-muted uppercase">Year</th>
                <th className="px-4 py-3 text-right font-medium text-cc-muted uppercase">Equity</th>
                <th className="px-4 py-3 text-right font-medium text-cc-muted uppercase">Cash Flow</th>
                <th className="px-4 py-3 text-right font-medium text-cc-muted uppercase">Total (Keep)</th>
                <th className="px-4 py-3 text-right font-medium text-cc-muted uppercase">Alt Investment</th>
                <th className="px-4 py-3 text-right font-medium text-cc-muted uppercase">Advantage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cc-border/50">
              {analysis.projections.map((proj) => (
                <tr key={proj.year} className="hover:bg-cc-surface/30 transition-colors">
                  <td className="px-4 py-3 whitespace-nowrap text-cc-text">Year {proj.year}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-right text-cc-text">
                    {formatCurrency(proj.equityValue)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-right text-cc-text">
                    {formatCurrency(proj.cumulativeCashFlow)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-right text-green-400 font-medium">
                    {formatCurrency(proj.totalReturn)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-right text-purple-400 font-medium">
                    {formatCurrency(proj.alternativeInvestmentValue)}
                  </td>
                  <td className={`px-4 py-3 whitespace-nowrap text-right font-medium ${
                    proj.keepAdvantage >= 0 ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {proj.keepAdvantage >= 0 ? '+' : ''}{formatCurrency(proj.keepAdvantage)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Important Factors Not Considered */}
      <div className="card bg-gradient-to-br from-cc-surface to-slate-800">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-blue-500/20 rounded-lg text-blue-400 shrink-0">
            <Info size={20} />
          </div>
          <div>
            <h4 className="font-semibold text-cc-text mb-2">Factors Not Fully Captured</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-cc-muted">
              <div>
                <p className="font-medium text-cc-text text-xs uppercase mb-1">Keep Property Considerations</p>
                <ul className="space-y-1">
                  <li>- Tax benefits from depreciation</li>
                  <li>- Potential rent increases</li>
                  <li>- Leverage amplifying returns</li>
                  <li>- Property management time/stress</li>
                  <li>- Major repair/replacement costs</li>
                </ul>
              </div>
              <div>
                <p className="font-medium text-cc-text text-xs uppercase mb-1">Sell & Invest Considerations</p>
                <ul className="space-y-1">
                  <li>- Portfolio diversification benefits</li>
                  <li>- Liquidity and flexibility</li>
                  <li>- No landlord responsibilities</li>
                  <li>- Market volatility risk</li>
                  <li>- Dividend tax implications</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
