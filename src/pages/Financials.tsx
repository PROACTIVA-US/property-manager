import { useState } from 'react';
import {
  DollarSign,
  FileText,
  Scale,
  Calculator,
  TrendingUp,
  Building2,
  Info,
} from 'lucide-react';
import MortgageCalculator from '../components/MortgageCalculator';
import FinancialComparison from '../components/FinancialComparison';
import TaxAnalysis from '../components/TaxAnalysis';
import KeepVsSell from '../components/KeepVsSell';
import {
  DEFAULT_PROPERTY_FINANCIALS,
  DEFAULT_PERSONAL_EXPENSES,
  DEFAULT_TAX_INPUTS,
  calculateCashFlow,
  formatCurrency,
} from '../lib/financials';

type TabId = 'comparison' | 'tax' | 'keepvssell' | 'mortgage';

interface Tab {
  id: TabId;
  label: string;
  icon: React.ElementType;
  description: string;
}

const tabs: Tab[] = [
  {
    id: 'comparison',
    label: 'Cash Flow Analysis',
    icon: DollarSign,
    description: 'Compare rental income against your personal living expenses',
  },
  {
    id: 'tax',
    label: 'Tax Estimates',
    icon: FileText,
    description: 'Estimated capital gains, depreciation recapture, and mitigation strategies',
  },
  {
    id: 'keepvssell',
    label: 'Keep vs Sell',
    icon: Scale,
    description: 'Compare long-term wealth building: keep the property or sell and invest',
  },
  {
    id: 'mortgage',
    label: 'Mortgage Payoff',
    icon: Calculator,
    description: 'Visualize how extra payments can accelerate your loan payoff',
  },
];

export default function Financials() {
  const [activeTab, setActiveTab] = useState<TabId>('comparison');

  // Calculate quick stats
  const cashFlow = calculateCashFlow(DEFAULT_PROPERTY_FINANCIALS);
  const monthlyCashFlow = cashFlow.cashFlowBeforeTax / 12;
  const equity = DEFAULT_PROPERTY_FINANCIALS.currentMarketValue - DEFAULT_PROPERTY_FINANCIALS.mortgageBalance;

  const renderContent = () => {
    switch (activeTab) {
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

  const activeTabData = tabs.find(t => t.id === activeTab);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-brand-light">Financial Analysis Suite</h1>
        <p className="text-brand-muted mt-1">
          Comprehensive tools to analyze your rental property investment
        </p>
      </div>

      {/* Quick Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card !p-4 flex items-center gap-3">
          <div className="p-2 bg-blue-500/20 rounded-lg text-blue-400">
            <Building2 size={20} />
          </div>
          <div>
            <p className="text-[10px] text-brand-muted uppercase">Market Value</p>
            <p className="text-lg font-bold text-brand-light">
              {formatCurrency(DEFAULT_PROPERTY_FINANCIALS.currentMarketValue)}
            </p>
          </div>
        </div>
        <div className="card !p-4 flex items-center gap-3">
          <div className="p-2 bg-purple-500/20 rounded-lg text-purple-400">
            <TrendingUp size={20} />
          </div>
          <div>
            <p className="text-[10px] text-brand-muted uppercase">Equity</p>
            <p className="text-lg font-bold text-brand-light">{formatCurrency(equity)}</p>
          </div>
        </div>
        <div className="card !p-4 flex items-center gap-3">
          <div className={`p-2 rounded-lg ${monthlyCashFlow >= 0 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
            <DollarSign size={20} />
          </div>
          <div>
            <p className="text-[10px] text-brand-muted uppercase">Cash Flow</p>
            <p className={`text-lg font-bold ${monthlyCashFlow >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {formatCurrency(monthlyCashFlow)}/mo
            </p>
          </div>
        </div>
        <div className="card !p-4 flex items-center gap-3">
          <div className="p-2 bg-brand-orange/20 rounded-lg text-brand-orange">
            <Calculator size={20} />
          </div>
          <div>
            <p className="text-[10px] text-brand-muted uppercase">Cap Rate</p>
            <p className="text-lg font-bold text-brand-light">{cashFlow.capRate.toFixed(1)}%</p>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-slate-700/50">
        <nav className="flex gap-1 overflow-x-auto pb-px" aria-label="Financial analysis tabs">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                  isActive
                    ? 'border-brand-orange text-brand-orange'
                    : 'border-transparent text-brand-muted hover:text-brand-light hover:border-slate-600'
                }`}
                aria-current={isActive ? 'page' : undefined}
              >
                <Icon size={16} />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Description */}
      {activeTabData && (
        <div className="flex items-center gap-2 text-sm text-brand-muted">
          <Info size={14} />
          {activeTabData.description}
        </div>
      )}

      {/* Tab Content */}
      <div className="card bg-slate-800/50">
        {renderContent()}
      </div>

      {/* Educational Disclaimer */}
      <div className="card bg-gradient-to-r from-brand-navy/50 to-slate-800/50 border-l-4 border-brand-orange">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-brand-orange shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="text-brand-light font-medium mb-1">Educational Tool Disclaimer</p>
            <p className="text-brand-muted">
              All calculations, projections, and analysis provided in this suite are for
              <strong className="text-brand-light"> educational and informational purposes only</strong>.
              They are based on simplified models and assumptions that may not reflect your actual situation.
              This tool does not constitute financial, tax, legal, or investment advice.
              Always consult with qualified professionals (CPA, financial advisor, attorney)
              before making any financial decisions related to your property.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
