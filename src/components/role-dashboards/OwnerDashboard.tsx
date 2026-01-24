import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import MortgageCalculator from '../MortgageCalculator';
import FinancialComparison from '../FinancialComparison';
import TaxAnalysis from '../TaxAnalysis';
import KeepVsSell from '../KeepVsSell';
import PropertyValueWidget from '../PropertyValueWidget';
import {
  Bot,
  DollarSign,
  TrendingUp,
  HelpCircle,
  Calculator,
  Scale,
  FileText,
  ChevronRight,
  Sparkles,
  Pencil,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  DEFAULT_PROPERTY_FINANCIALS,
  DEFAULT_PERSONAL_EXPENSES,
  DEFAULT_TAX_INPUTS,
  calculateCashFlow,
  formatCurrency,
} from '../../lib/financials';

type AnalysisView = 'overview' | 'comparison' | 'tax' | 'keepvssell' | 'mortgage';

export default function OwnerDashboard() {
  const { user } = useAuth();
  const [activeView, setActiveView] = useState<AnalysisView>('overview');

  // Calculate summary metrics using defaults
  const cashFlow = calculateCashFlow(DEFAULT_PROPERTY_FINANCIALS);
  const monthlyCashFlow = cashFlow.cashFlowBeforeTax / 12;
  const equity = DEFAULT_PROPERTY_FINANCIALS.currentMarketValue - DEFAULT_PROPERTY_FINANCIALS.mortgageBalance;

  const analysisTools = [
    {
      id: 'comparison' as const,
      title: 'Cash Flow Analysis',
      description: 'Compare rental income vs your living expenses',
      icon: DollarSign,
      color: 'bg-green-500/20 text-green-400',
    },
    {
      id: 'tax' as const,
      title: 'Tax Estimates',
      description: 'Capital gains and mitigation strategies',
      icon: FileText,
      color: 'bg-red-500/20 text-red-400',
    },
    {
      id: 'keepvssell' as const,
      title: 'Keep vs Sell',
      description: 'Compare long-term investment scenarios',
      icon: Scale,
      color: 'bg-purple-500/20 text-purple-400',
    },
    {
      id: 'mortgage' as const,
      title: 'Mortgage Payoff',
      description: 'Accelerate your loan payoff',
      icon: Calculator,
      color: 'bg-blue-500/20 text-blue-400',
    },
  ];

  const renderContent = () => {
    switch (activeView) {
      case 'comparison':
        return (
          <FinancialComparison
            initialProperty={DEFAULT_PROPERTY_FINANCIALS}
            initialPersonal={DEFAULT_PERSONAL_EXPENSES}
          />
        );
      case 'tax':
        return (
          <TaxAnalysis
            initialProperty={DEFAULT_PROPERTY_FINANCIALS}
            initialTaxInputs={DEFAULT_TAX_INPUTS}
          />
        );
      case 'keepvssell':
        return (
          <KeepVsSell
            initialProperty={DEFAULT_PROPERTY_FINANCIALS}
            initialTaxInputs={DEFAULT_TAX_INPUTS}
          />
        );
      case 'mortgage':
        return <MortgageCalculator />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-brand-light">Owner Overview</h1>
          <p className="text-brand-muted mt-1">
            Financial health and property insights for {user?.displayName}
          </p>
        </div>
        <button className="btn-primary flex items-center gap-2 bg-gradient-to-r from-purple-600 to-brand-navy border border-purple-400/30">
          <Bot size={18} />
          Ask Gem
        </button>
      </div>

      {/* Overview Mode */}
      {activeView === 'overview' && (
        <>
          {/* High-level metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="card bg-gradient-to-br from-brand-navy to-slate-800 group relative">
              <Link
                to="/settings?tab=rental"
                className="absolute top-3 right-3 p-1.5 bg-slate-700/50 rounded-lg text-brand-muted hover:text-brand-orange hover:bg-slate-700 transition-all opacity-0 group-hover:opacity-100"
                title="Edit rental income and expenses"
              >
                <Pencil size={14} />
              </Link>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-green-500/20 rounded-lg text-green-400">
                  <DollarSign size={24} />
                </div>
                <h3 className="font-semibold text-brand-light">Net Cash Flow</h3>
              </div>
              <p className="text-3xl font-bold text-brand-light">
                {monthlyCashFlow >= 0 ? '+' : ''}{formatCurrency(monthlyCashFlow)}
                <span className="text-sm font-normal text-brand-muted">/mo</span>
              </p>
              <p className={`text-xs mt-2 flex items-center gap-1 ${monthlyCashFlow >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                <TrendingUp size={12} />
                {monthlyCashFlow >= 0 ? 'Positive cash flow' : 'Negative cash flow'}
              </p>
            </div>

            <div className="card group relative">
              <Link
                to="/settings?tab=property"
                className="absolute top-3 right-3 p-1.5 bg-slate-700/50 rounded-lg text-brand-muted hover:text-brand-orange hover:bg-slate-700 transition-all opacity-0 group-hover:opacity-100"
                title="Edit property value and mortgage"
              >
                <Pencil size={14} />
              </Link>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-blue-500/20 rounded-lg text-blue-400">
                  <TrendingUp size={24} />
                </div>
                <h3 className="font-semibold text-brand-light">Equity Built</h3>
              </div>
              <p className="text-3xl font-bold text-brand-light">{formatCurrency(equity)}</p>
              <p className="text-xs text-brand-muted mt-2">Current equity position</p>
            </div>

            <div className="card relative overflow-hidden group cursor-pointer hover:border-brand-orange/50 transition-colors">
              <div className="absolute -right-4 -top-4 bg-brand-orange/10 w-24 h-24 rounded-full group-hover:bg-brand-orange/20 transition-all" />
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-brand-orange/20 rounded-lg text-brand-orange">
                  <HelpCircle size={24} />
                </div>
                <h3 className="font-semibold text-brand-light">Ask Gem</h3>
              </div>
              <p className="text-sm text-brand-muted mb-3">
                "Am I losing money this month?"<br />
                "Show me repair costs for 2024."
              </p>
              <span className="text-xs text-brand-orange font-medium">Start Chat &rarr;</span>
            </div>
          </div>

          {/* Property Value Widget */}
          <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <PropertyValueWidget />
            </div>
            <div className="lg:col-span-2">
              <div className="card h-full">
                <h3 className="text-lg font-bold text-brand-light mb-2">Market Insights</h3>
                <p className="text-sm text-brand-muted mb-4">
                  Track your property's value over time and compare with recent market trends.
                </p>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-brand-muted">Purchase Price</span>
                    <span className="text-brand-light font-medium">
                      {formatCurrency(DEFAULT_PROPERTY_FINANCIALS.purchasePrice)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-brand-muted">Current Value</span>
                    <span className="text-brand-light font-medium">
                      {formatCurrency(DEFAULT_PROPERTY_FINANCIALS.currentMarketValue)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm pt-3 border-t border-slate-700">
                    <span className="text-brand-muted">Appreciation</span>
                    <span className="text-green-400 font-bold">
                      +{formatCurrency(equity)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Analysis Tools Grid */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-brand-light">Financial Analysis Tools</h2>
                <span className="px-2 py-0.5 rounded text-[10px] bg-brand-orange/20 text-brand-orange font-medium uppercase tracking-wide flex items-center gap-1">
                  <Sparkles size={10} />
                  Interactive
                </span>
              </div>
              <Link
                to="/financials"
                className="text-sm text-brand-orange hover:text-orange-400 transition-colors flex items-center gap-1"
              >
                View All
                <ChevronRight size={14} />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {analysisTools.map((tool) => {
                const Icon = tool.icon;
                return (
                  <button
                    key={tool.id}
                    onClick={() => setActiveView(tool.id)}
                    className="card text-left hover:border-brand-orange/50 transition-all hover:scale-[1.02] group"
                  >
                    <div className={`p-2 rounded-lg w-fit ${tool.color} mb-3`}>
                      <Icon size={20} />
                    </div>
                    <h3 className="font-semibold text-brand-light mb-1 group-hover:text-brand-orange transition-colors">
                      {tool.title}
                    </h3>
                    <p className="text-xs text-brand-muted">{tool.description}</p>
                  </button>
                );
              })}
            </div>
          </section>

          {/* Quick Cash Flow Summary */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <h2 className="text-xl font-bold text-brand-light">Quick Cash Flow Summary</h2>
            </div>
            <div className="card">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div>
                  <p className="text-xs text-brand-muted uppercase mb-1">Gross Rental Income</p>
                  <p className="text-lg font-semibold text-brand-light">
                    {formatCurrency(DEFAULT_PROPERTY_FINANCIALS.monthlyRentalIncome)}/mo
                  </p>
                </div>
                <div>
                  <p className="text-xs text-brand-muted uppercase mb-1">Operating Expenses</p>
                  <p className="text-lg font-semibold text-red-400">
                    -{formatCurrency(cashFlow.operatingExpenses / 12)}/mo
                  </p>
                </div>
                <div>
                  <p className="text-xs text-brand-muted uppercase mb-1">Debt Service</p>
                  <p className="text-lg font-semibold text-red-400">
                    -{formatCurrency(DEFAULT_PROPERTY_FINANCIALS.monthlyMortgagePayment)}/mo
                  </p>
                </div>
                <div>
                  <p className="text-xs text-brand-muted uppercase mb-1">Net Cash Flow</p>
                  <p className={`text-lg font-bold ${monthlyCashFlow >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {monthlyCashFlow >= 0 ? '+' : ''}{formatCurrency(monthlyCashFlow)}/mo
                  </p>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-slate-700/50 flex flex-wrap gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-brand-muted">Cap Rate:</span>
                  <span className="font-medium text-brand-light">{cashFlow.capRate.toFixed(1)}%</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-brand-muted">Cash on Cash:</span>
                  <span className="font-medium text-brand-light">{cashFlow.cashOnCashReturn.toFixed(1)}%</span>
                </div>
              </div>
            </div>
          </section>
        </>
      )}

      {/* Analysis View Mode */}
      {activeView !== 'overview' && (
        <section>
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => setActiveView('overview')}
              className="text-sm text-brand-muted hover:text-brand-light transition-colors flex items-center gap-1"
            >
              <ChevronRight size={14} className="rotate-180" />
              Back to Overview
            </button>
          </div>
          <div className="card bg-slate-800/50">
            {renderContent()}
          </div>
        </section>
      )}

      {/* Disclaimer */}
      <p className="text-xs text-brand-muted text-center">
        Financial analysis tools are for educational purposes only. Consult qualified professionals
        for actual financial, tax, and investment decisions.
      </p>
    </div>
  );
}
