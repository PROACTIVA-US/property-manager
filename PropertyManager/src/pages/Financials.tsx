import { useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Calculator,
  Scale,
  ChevronDown,
  ChevronUp,
  FileText,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import FinancialAccessDenied from '../components/FinancialAccessDenied';
import MortgageCalculator from '../components/MortgageCalculator';
import KeepVsSell from '../components/KeepVsSell';
import TaxAnalysis from '../components/TaxAnalysis';
import { loadSettings } from '../lib/settings';
import {
  formatCurrency,
  getPropertyFinancials,
  getTaxInputs,
  calculateSimpleCashFlow,
} from '../lib/financials';

type ExpandedCard = 'incoming' | 'outgoing' | 'mortgage' | 'tax' | 'keepvssell' | null;

export default function Financials() {
  const { user } = useAuth();
  const [expandedCard, setExpandedCard] = useState<ExpandedCard>(null);

  // Redirect tenants - they have no access
  if (user?.role === 'tenant') {
    return <FinancialAccessDenied />;
  }

  const settings = loadSettings();
  const simpleCashFlow = calculateSimpleCashFlow();
  const property = getPropertyFinancials();
  const taxInputs = getTaxInputs();

  // Financial calculations
  const monthlyRent = settings.rentalIncome.monthlyRent;
  const monthlyUtilitiesIncome = settings.rentalIncome.monthlyUtilities;
  const totalIncoming = monthlyRent + monthlyUtilitiesIncome;

  const monthlyMortgage = simpleCashFlow.monthlyPITI;
  const monthlyExpenses = 300; // TODO: Make dynamic based on actual utilities costs
  const totalOutgoing = monthlyMortgage + monthlyExpenses;

  const netCashFlow = totalIncoming - totalOutgoing;

  // PITI Breakdown
  const pitiBreakdown = {
    principal: settings.mortgage.monthlyPAndI * 0.3, // Approximate
    interest: settings.mortgage.monthlyPAndI * 0.7, // Approximate
    tax: settings.rentalIncome.monthlyPropertyTax,
    insurance: settings.rentalIncome.monthlyInsurance,
  };

  const handleCardClick = (card: ExpandedCard) => {
    setExpandedCard(expandedCard === card ? null : card);
  };

  return (
    <div className="space-y-6">
      {/* Net Cash Flow Summary - Always visible at top */}
      <div className="card bg-gradient-to-br from-cc-surface to-slate-800/50">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-cc-text">Monthly Cash Flow</h1>
            <p className="text-sm text-cc-muted mt-1">Annual: {formatCurrency(netCashFlow * 12, 0)}</p>
          </div>
          <div className="text-right">
            <span className={`text-4xl font-bold ${netCashFlow >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {netCashFlow >= 0 ? '+' : ''}{formatCurrency(netCashFlow, 0)}
            </span>
            <p className="text-sm text-cc-muted">per month</p>
          </div>
        </div>
      </div>

      {/* Income & Expense Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Incoming Card */}
        <div>
          <button
            onClick={() => handleCardClick('incoming')}
            className={`w-full card text-left transition-all cursor-pointer ${
              expandedCard === 'incoming'
                ? 'border-green-500/50 ring-2 ring-green-500/20'
                : 'hover:border-green-500/30'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-3 rounded-xl ${expandedCard === 'incoming' ? 'bg-green-500/20' : 'bg-slate-700/50'}`}>
                  <TrendingUp size={24} className="text-green-400" />
                </div>
                <div>
                  <h2 className="font-semibold text-cc-text">Incoming</h2>
                  <p className="text-sm text-cc-muted">Rent + Utilities</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-2xl font-bold text-green-400">{formatCurrency(totalIncoming, 0)}</span>
                {expandedCard === 'incoming' ? (
                  <ChevronUp size={20} className="text-cc-muted" />
                ) : (
                  <ChevronDown size={20} className="text-cc-muted" />
                )}
              </div>
            </div>
          </button>

          {/* Incoming Details */}
          {expandedCard === 'incoming' && (
            <div className="mt-2 card bg-green-500/5 border-green-500/30 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-cc-border/30">
                  <span className="text-cc-text">Base Rent</span>
                  <span className="font-semibold text-green-400">+{formatCurrency(monthlyRent, 0)}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-cc-border/30">
                  <span className="text-cc-text">Utilities Reimbursement</span>
                  <span className="font-semibold text-green-400">+{formatCurrency(monthlyUtilitiesIncome, 0)}</span>
                </div>
                <div className="flex justify-between items-center py-2 bg-green-500/10 rounded-lg px-3">
                  <span className="font-medium text-cc-text">Total Monthly</span>
                  <span className="font-bold text-green-400">{formatCurrency(totalIncoming, 0)}</span>
                </div>
                <div className="pt-2 text-sm text-cc-muted">
                  <p>Annual Income: {formatCurrency(totalIncoming * 12, 0)}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Outgoing Card */}
        <div>
          <button
            onClick={() => handleCardClick('outgoing')}
            className={`w-full card text-left transition-all cursor-pointer ${
              expandedCard === 'outgoing'
                ? 'border-red-500/50 ring-2 ring-red-500/20'
                : 'hover:border-red-500/30'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-3 rounded-xl ${expandedCard === 'outgoing' ? 'bg-red-500/20' : 'bg-slate-700/50'}`}>
                  <TrendingDown size={24} className="text-red-400" />
                </div>
                <div>
                  <h2 className="font-semibold text-cc-text">Outgoing</h2>
                  <p className="text-sm text-cc-muted">Mortgage + Expenses</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-2xl font-bold text-red-400">{formatCurrency(totalOutgoing, 0)}</span>
                {expandedCard === 'outgoing' ? (
                  <ChevronUp size={20} className="text-cc-muted" />
                ) : (
                  <ChevronDown size={20} className="text-cc-muted" />
                )}
              </div>
            </div>
          </button>

          {/* Outgoing Details */}
          {expandedCard === 'outgoing' && (
            <div className="mt-2 card bg-red-500/5 border-red-500/30 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="space-y-4">
                {/* Mortgage PITI Breakdown */}
                <div>
                  <h4 className="text-sm font-medium text-cc-muted uppercase mb-2">Mortgage (PITI)</h4>
                  <div className="space-y-2 pl-3 border-l-2 border-red-500/30">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-cc-muted">Principal</span>
                      <span className="text-cc-text">{formatCurrency(pitiBreakdown.principal, 0)}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-cc-muted">Interest</span>
                      <span className="text-cc-text">{formatCurrency(pitiBreakdown.interest, 0)}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-cc-muted">Property Tax</span>
                      <span className="text-cc-text">{formatCurrency(pitiBreakdown.tax, 0)}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-cc-muted">Insurance</span>
                      <span className="text-cc-text">{formatCurrency(pitiBreakdown.insurance, 0)}</span>
                    </div>
                    <div className="flex justify-between items-center pt-1 border-t border-cc-border/30">
                      <span className="text-cc-text font-medium">Subtotal</span>
                      <span className="font-semibold text-red-400">-{formatCurrency(monthlyMortgage, 0)}</span>
                    </div>
                  </div>
                </div>

                {/* Expenses Breakdown */}
                <div>
                  <h4 className="text-sm font-medium text-cc-muted uppercase mb-2">Expenses</h4>
                  <div className="space-y-2 pl-3 border-l-2 border-red-500/30">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-cc-muted">Utilities</span>
                      <span className="text-cc-text">{formatCurrency(monthlyExpenses, 0)}</span>
                    </div>
                    <div className="flex justify-between items-center pt-1 border-t border-cc-border/30">
                      <span className="text-cc-text font-medium">Subtotal</span>
                      <span className="font-semibold text-red-400">-{formatCurrency(monthlyExpenses, 0)}</span>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-center py-2 bg-red-500/10 rounded-lg px-3">
                  <span className="font-medium text-cc-text">Total Monthly</span>
                  <span className="font-bold text-red-400">{formatCurrency(totalOutgoing, 0)}</span>
                </div>
                <div className="pt-2 text-sm text-cc-muted">
                  <p>Annual Expenses: {formatCurrency(totalOutgoing * 12, 0)}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Analysis Tools Section */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-cc-text">Analysis Tools</h2>

        {/* Analysis Tools Grid */}
        <div className={`grid grid-cols-1 ${user?.role === 'owner' ? 'md:grid-cols-3' : 'md:grid-cols-1'} gap-4`}>
          {/* Mortgage Calculator Card */}
          <button
            onClick={() => handleCardClick('mortgage')}
            className={`card text-left transition-all cursor-pointer ${
              expandedCard === 'mortgage'
                ? 'border-blue-500/50 ring-2 ring-blue-500/20'
                : 'hover:border-blue-500/30'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-3 rounded-xl ${expandedCard === 'mortgage' ? 'bg-blue-500/20' : 'bg-slate-700/50'}`}>
                  <Calculator size={24} className="text-blue-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-cc-text">Mortgage Calculator</h3>
                  <p className="text-sm text-cc-muted">Extra payment savings</p>
                </div>
              </div>
              {expandedCard === 'mortgage' ? (
                <ChevronUp size={20} className="text-cc-muted" />
              ) : (
                <ChevronDown size={20} className="text-cc-muted" />
              )}
            </div>
          </button>

          {/* Tax Analysis Card - Only for owners */}
          {user?.role === 'owner' && (
            <button
              onClick={() => handleCardClick('tax')}
              className={`card text-left transition-all cursor-pointer ${
                expandedCard === 'tax'
                  ? 'border-purple-500/50 ring-2 ring-purple-500/20'
                  : 'hover:border-purple-500/30'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-xl ${expandedCard === 'tax' ? 'bg-purple-500/20' : 'bg-slate-700/50'}`}>
                    <FileText size={24} className="text-purple-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-cc-text">Tax Analysis</h3>
                    <p className="text-sm text-cc-muted">Capital gains & recapture</p>
                  </div>
                </div>
                {expandedCard === 'tax' ? (
                  <ChevronUp size={20} className="text-cc-muted" />
                ) : (
                  <ChevronDown size={20} className="text-cc-muted" />
                )}
              </div>
            </button>
          )}

          {/* Keep vs Sell Card - Only for owners */}
          {user?.role === 'owner' && (
            <button
              onClick={() => handleCardClick('keepvssell')}
              className={`card text-left transition-all cursor-pointer ${
                expandedCard === 'keepvssell'
                  ? 'border-cc-accent/50 ring-2 ring-cc-accent/20'
                  : 'hover:border-cc-accent/30'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-xl ${expandedCard === 'keepvssell' ? 'bg-cc-accent/20' : 'bg-slate-700/50'}`}>
                    <Scale size={24} className="text-cc-accent" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-cc-text">Keep vs Sell</h3>
                    <p className="text-sm text-cc-muted">Investment comparison</p>
                  </div>
                </div>
                {expandedCard === 'keepvssell' ? (
                  <ChevronUp size={20} className="text-cc-muted" />
                ) : (
                  <ChevronDown size={20} className="text-cc-muted" />
                )}
              </div>
            </button>
          )}
        </div>

        {/* Expanded Content - shown below the grid */}
        {expandedCard === 'mortgage' && (
          <div className="card bg-blue-500/5 border-blue-500/30 animate-in fade-in slide-in-from-top-2 duration-200">
            <MortgageCalculator />
          </div>
        )}

        {expandedCard === 'tax' && user?.role === 'owner' && (
          <div className="card bg-purple-500/5 border-purple-500/30 animate-in fade-in slide-in-from-top-2 duration-200">
            <TaxAnalysis
              initialProperty={property}
              initialTaxInputs={taxInputs}
            />
          </div>
        )}

        {expandedCard === 'keepvssell' && user?.role === 'owner' && (
          <div className="card bg-cc-accent/5 border-cc-accent/30 animate-in fade-in slide-in-from-top-2 duration-200">
            <KeepVsSell
              initialProperty={property}
              initialTaxInputs={taxInputs}
            />
          </div>
        )}
      </div>

    </div>
  );
}
