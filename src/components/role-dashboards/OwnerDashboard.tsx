import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import MortgageCalculator from '../MortgageCalculator';
import FinancialComparison from '../FinancialComparison';
import TaxAnalysis from '../TaxAnalysis';
import KeepVsSell from '../KeepVsSell';
import PropertyValueWidget from '../PropertyValueWidget';
import UtilityTracking from '../UtilityTracking';
import OwnerEscalationWidget from '../issues/OwnerEscalationWidget';
import IssueDetailModal from '../issues/IssueDetailModal';
import PortfolioValueKPI from '../dashboard-kpis/PortfolioValueKPI';
import OccupancyRateKPI from '../dashboard-kpis/OccupancyRateKPI';
import { getEscalatedIssues, getIssueById } from '../../lib/issues';
import type { Issue } from '../../types/issues.types';
import {
  DollarSign,
  TrendingUp,
  Calculator,
  Scale,
  FileText,
  ChevronRight,
  Sparkles,
  Pencil,
  X,
  Zap,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  getPropertyFinancials,
  getPersonalExpenses,
  getTaxInputs,
  calculateSimpleCashFlow,
  formatCurrency,
} from '../../lib/financials';
import { loadSettings, checkUtilityOverages, getPendingUtilityBillsCount } from '../../lib/settings';

type AnalysisView = 'overview' | 'comparison' | 'tax' | 'keepvssell' | 'mortgage' | 'utilities';
type DetailModal = 'cashflow' | 'equity' | 'property' | null;

export default function OwnerDashboard() {
  const { user } = useAuth();
  const [activeView, setActiveView] = useState<AnalysisView>('overview');
  const [detailModal, setDetailModal] = useState<DetailModal>(null);
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);

  // Load live data from settings
  const settings = loadSettings();
  const propertyFinancials = getPropertyFinancials();
  const personalExpenses = getPersonalExpenses();
  const taxInputs = getTaxInputs();

  // Calculate simple cash flow: Rent - PITI - Utilities
  const simpleCashFlow = calculateSimpleCashFlow();
  const monthlyCashFlow = simpleCashFlow.monthlyNetCashFlow;

  // Calculate equity using live property values
  const equity = settings.property.currentMarketValue - settings.mortgage.principal;

  // Utility tracking data
  const utilityOverages = checkUtilityOverages();
  const pendingUtilityBills = getPendingUtilityBillsCount();

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
    {
      id: 'utilities' as const,
      title: 'Utility Tracking',
      description: 'Track actual utility costs',
      icon: Zap,
      color: 'bg-yellow-500/20 text-yellow-400',
      badge: utilityOverages.length > 0 ? utilityOverages.length : (pendingUtilityBills > 0 ? pendingUtilityBills : undefined),
      badgeColor: utilityOverages.length > 0 ? 'bg-red-500' : 'bg-yellow-500',
    },
  ];

  const renderContent = () => {
    switch (activeView) {
      case 'comparison':
        return (
          <FinancialComparison
            initialProperty={propertyFinancials}
            initialPersonal={personalExpenses}
          />
        );
      case 'tax':
        return (
          <TaxAnalysis
            initialProperty={propertyFinancials}
            initialTaxInputs={taxInputs}
          />
        );
      case 'keepvssell':
        return (
          <KeepVsSell
            initialProperty={propertyFinancials}
            initialTaxInputs={taxInputs}
          />
        );
      case 'mortgage':
        return <MortgageCalculator />;
      case 'utilities':
        return <UtilityTracking onBack={() => setActiveView('overview')} />;
      default:
        return null;
    }
  };

  const renderDetailModal = () => {
    if (!detailModal) return null;

    const modalContent = () => {
      switch (detailModal) {
        case 'cashflow':
          return (
            <>
              <h3 className="text-lg font-bold text-cc-accent mb-4">Net Cash Flow Breakdown</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-cc-border/50">
                  <span className="text-cc-text">Monthly Rental Income</span>
                  <span className="font-semibold text-green-400">+{formatCurrency(simpleCashFlow.monthlyRent)}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-cc-border/50">
                  <div>
                    <span className="text-cc-text">PITI Payment</span>
                    <p className="text-xs text-cc-muted">Principal + Interest + Tax + Insurance</p>
                  </div>
                  <span className="font-semibold text-red-400">-{formatCurrency(simpleCashFlow.monthlyPITI)}</span>
                </div>
                {simpleCashFlow.monthlyUtilities > 0 && (
                  <div className="flex justify-between items-center py-2 border-b border-cc-border/50">
                    <span className="text-cc-text">Utilities (Owner-Paid)</span>
                    <span className="font-semibold text-red-400">-{formatCurrency(simpleCashFlow.monthlyUtilities)}</span>
                  </div>
                )}
                <div className="flex justify-between items-center py-3 bg-cc-bg/50 rounded-lg px-3 mt-4">
                  <span className="font-bold text-cc-text">Net Monthly Cash Flow</span>
                  <span className={`font-bold text-lg ${monthlyCashFlow >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {monthlyCashFlow >= 0 ? '+' : ''}{formatCurrency(monthlyCashFlow)}
                  </span>
                </div>
              </div>
              <Link to="/settings?tab=rental" className="btn-secondary w-full mt-4 text-center block">
                Edit Rental Settings
              </Link>
            </>
          );
        case 'equity':
          return (
            <>
              <h3 className="text-lg font-bold text-cc-accent mb-4">Equity Breakdown</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-cc-border/50">
                  <span className="text-cc-text">Current Market Value</span>
                  <span className="font-semibold text-cc-text">{formatCurrency(settings.property.currentMarketValue)}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-cc-border/50">
                  <span className="text-cc-text">Remaining Mortgage Balance</span>
                  <span className="font-semibold text-red-400">-{formatCurrency(settings.mortgage.principal)}</span>
                </div>
                <div className="flex justify-between items-center py-3 bg-cc-bg/50 rounded-lg px-3 mt-4">
                  <span className="font-bold text-cc-text">Total Equity</span>
                  <span className="font-bold text-lg text-green-400">{formatCurrency(equity)}</span>
                </div>
                <div className="mt-4 pt-4 border-t border-cc-border/50 text-sm text-cc-muted">
                  <div className="flex justify-between">
                    <span>Original Purchase Price</span>
                    <span>{formatCurrency(settings.property.purchasePrice)}</span>
                  </div>
                  <div className="flex justify-between mt-1">
                    <span>Appreciation</span>
                    <span className="text-green-400">+{formatCurrency(settings.property.currentMarketValue - settings.property.purchasePrice)}</span>
                  </div>
                </div>
              </div>
              <Link to="/settings?tab=property" className="btn-secondary w-full mt-4 text-center block">
                Edit Property Value
              </Link>
            </>
          );
        case 'property':
          return (
            <>
              <h3 className="text-lg font-bold text-cc-accent mb-4">Property Details</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-cc-border/50">
                  <span className="text-cc-text">Address</span>
                  <span className="font-semibold text-cc-text text-right text-sm">{settings.property.address}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-cc-border/50">
                  <span className="text-cc-text">Current Value</span>
                  <span className="font-semibold text-cc-text">{formatCurrency(settings.property.currentMarketValue)}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-cc-border/50">
                  <span className="text-cc-text">Purchase Price</span>
                  <span className="font-semibold text-cc-text">{formatCurrency(settings.property.purchasePrice)}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-cc-border/50">
                  <span className="text-cc-text">Mortgage Balance</span>
                  <span className="font-semibold text-cc-text">{formatCurrency(settings.mortgage.principal)}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-cc-border/50">
                  <span className="text-cc-text">Monthly PITI</span>
                  <span className="font-semibold text-cc-text">{formatCurrency(settings.mortgage.totalMonthlyPayment)}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-cc-border/50">
                  <span className="text-cc-text">Monthly Rent</span>
                  <span className="font-semibold text-green-400">{formatCurrency(settings.rentalIncome.monthlyRent)}</span>
                </div>
              </div>
              <Link to="/settings" className="btn-secondary w-full mt-4 text-center block">
                Edit All Settings
              </Link>
            </>
          );
        default:
          return null;
      }
    };

    return (
      <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={() => setDetailModal(null)}>
        <div className="bg-cc-surface border border-cc-border rounded-xl p-6 w-full max-w-md shadow-2xl" onClick={e => e.stopPropagation()}>
          <div className="flex justify-end mb-2">
            <button onClick={() => setDetailModal(null)} className="text-cc-muted hover:text-cc-text transition-colors">
              <X size={20} />
            </button>
          </div>
          {modalContent()}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-cc-text">Owner Overview</h1>
          <p className="text-cc-muted mt-1">
            Financial health and property insights for {user?.displayName}
          </p>
        </div>
      </div>

      {/* Escalation Widget - Show if there are escalated issues */}
      {activeView === 'overview' && getEscalatedIssues().length > 0 && (
        <section>
          <OwnerEscalationWidget onIssueClick={(issue) => setSelectedIssue(issue)} />
        </section>
      )}

      {/* Overview Mode */}
      {activeView === 'overview' && (
        <>
          {/* Key Performance Indicators */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <PortfolioValueKPI onDrillDown={() => setDetailModal('property')} />
            <OccupancyRateKPI onViewLeases={() => {}} />
          </div>

          {/* High-level metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-2 gap-4 sm:gap-6">
            <button
              onClick={() => setDetailModal('cashflow')}
              className="card bg-gradient-to-br from-cc-surface to-slate-800 group relative text-left hover:border-cc-accent/50 transition-colors cursor-pointer"
            >
              <div
                className="absolute top-3 right-3 p-1.5 bg-cc-border/50 rounded-lg text-cc-muted hover:text-cc-accent hover:bg-cc-border transition-all opacity-0 group-hover:opacity-100"
                onClick={(e) => { e.stopPropagation(); }}
              >
                <Link to="/settings?tab=rental" title="Edit rental income and expenses">
                  <Pencil size={14} />
                </Link>
              </div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-green-500/20 rounded-lg text-green-400">
                  <DollarSign size={24} />
                </div>
                <h3 className="font-semibold text-cc-text">Net Cash Flow</h3>
              </div>
              <p className="text-3xl font-bold text-cc-text">
                {monthlyCashFlow >= 0 ? '+' : ''}{formatCurrency(monthlyCashFlow)}
                <span className="text-sm font-normal text-cc-muted">/mo</span>
              </p>
              <p className={`text-xs mt-2 flex items-center gap-1 ${monthlyCashFlow >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                <TrendingUp size={12} />
                Rent ({formatCurrency(simpleCashFlow.monthlyRent)}) - PITI ({formatCurrency(simpleCashFlow.monthlyPITI)})
              </p>
              <p className="text-xs text-cc-muted mt-1">Click for breakdown →</p>
            </button>

            <button
              onClick={() => setDetailModal('equity')}
              className="card group relative text-left hover:border-cc-accent/50 transition-colors cursor-pointer"
            >
              <div
                className="absolute top-3 right-3 p-1.5 bg-cc-border/50 rounded-lg text-cc-muted hover:text-cc-accent hover:bg-cc-border transition-all opacity-0 group-hover:opacity-100"
                onClick={(e) => { e.stopPropagation(); }}
              >
                <Link to="/settings?tab=property" title="Edit property value and mortgage">
                  <Pencil size={14} />
                </Link>
              </div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-blue-500/20 rounded-lg text-blue-400">
                  <TrendingUp size={24} />
                </div>
                <h3 className="font-semibold text-cc-text">Equity Built</h3>
              </div>
              <p className="text-3xl font-bold text-cc-text">{formatCurrency(equity)}</p>
              <p className="text-xs text-cc-muted mt-2">
                Value ({formatCurrency(settings.property.currentMarketValue)}) - Mortgage ({formatCurrency(settings.mortgage.principal)})
              </p>
              <p className="text-xs text-cc-muted mt-1">Click for breakdown →</p>
            </button>

          </div>

          {/* Property Value Widget */}
          <section className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <div className="xl:col-span-1">
              <PropertyValueWidget />
            </div>
            <div className="xl:col-span-2">
              <div className="card h-full">
                <h3 className="text-lg font-bold text-cc-text mb-2">Market Insights</h3>
                <p className="text-sm text-cc-muted mb-4">
                  Track your property's value over time and compare with recent market trends.
                </p>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-cc-muted">Purchase Price</span>
                    <span className="text-cc-text font-medium">
                      {formatCurrency(settings.property.purchasePrice)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-cc-muted">Current Value</span>
                    <span className="text-cc-text font-medium">
                      {formatCurrency(settings.property.currentMarketValue)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm pt-3 border-t border-cc-border">
                    <span className="text-cc-muted">Appreciation</span>
                    <span className="text-green-400 font-bold">
                      +{formatCurrency(settings.property.currentMarketValue - settings.property.purchasePrice)}
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
                <h2 className="text-xl font-bold text-cc-text">Financial Analysis Tools</h2>
                <span className="px-2 py-0.5 rounded text-[10px] bg-cc-accent/20 text-cc-accent font-medium uppercase tracking-wide flex items-center gap-1">
                  <Sparkles size={10} />
                  Interactive
                </span>
              </div>
              <Link
                to="/financials"
                className="text-sm text-cc-accent hover:text-indigo-300 transition-colors flex items-center gap-1"
              >
                View All
                <ChevronRight size={14} />
              </Link>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              {analysisTools.map((tool) => {
                const Icon = tool.icon;
                return (
                  <button
                    key={tool.id}
                    onClick={() => setActiveView(tool.id)}
                    className="card text-left hover:border-cc-accent/50 transition-all hover:scale-[1.02] group relative"
                  >
                    {'badge' in tool && tool.badge !== undefined && (
                      <span className={`absolute -top-2 -right-2 ${tool.badgeColor || 'bg-red-500'} text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center`}>
                        {tool.badge}
                      </span>
                    )}
                    <div className={`p-2 rounded-lg w-fit ${tool.color} mb-3`}>
                      <Icon size={20} />
                    </div>
                    <h3 className="font-semibold text-cc-text mb-1 group-hover:text-cc-accent transition-colors">
                      {tool.title}
                    </h3>
                    <p className="text-xs text-cc-muted">{tool.description}</p>
                  </button>
                );
              })}
            </div>
          </section>

          {/* Quick Cash Flow Summary */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <h2 className="text-xl font-bold text-cc-text">Quick Cash Flow Summary</h2>
              <span className="text-xs text-cc-muted">(Rent - PITI)</span>
            </div>
            <button
              onClick={() => setDetailModal('cashflow')}
              className="card w-full text-left hover:border-cc-accent/50 transition-colors cursor-pointer"
            >
              <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6">
                <div>
                  <p className="text-xs text-cc-muted uppercase mb-1">Rental Income</p>
                  <p className="text-base sm:text-lg font-semibold text-green-400">
                    +{formatCurrency(simpleCashFlow.monthlyRent)}/mo
                  </p>
                </div>
                <div>
                  <p className="text-xs text-cc-muted uppercase mb-1">PITI Payment</p>
                  <p className="text-base sm:text-lg font-semibold text-red-400">
                    -{formatCurrency(simpleCashFlow.monthlyPITI)}/mo
                  </p>
                </div>
                {simpleCashFlow.monthlyUtilities > 0 && (
                  <div>
                    <p className="text-xs text-cc-muted uppercase mb-1">Utilities</p>
                    <p className="text-base sm:text-lg font-semibold text-red-400">
                      -{formatCurrency(simpleCashFlow.monthlyUtilities)}/mo
                    </p>
                  </div>
                )}
                <div>
                  <p className="text-xs text-cc-muted uppercase mb-1">Net Cash Flow</p>
                  <p className={`text-base sm:text-lg font-bold ${monthlyCashFlow >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {monthlyCashFlow >= 0 ? '+' : ''}{formatCurrency(monthlyCashFlow)}/mo
                  </p>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-cc-border/50 flex flex-wrap gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-cc-muted">Annual Net:</span>
                  <span className={`font-medium ${simpleCashFlow.annualNetCashFlow >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {simpleCashFlow.annualNetCashFlow >= 0 ? '+' : ''}{formatCurrency(simpleCashFlow.annualNetCashFlow)}/yr
                  </span>
                </div>
                <span className="text-xs text-cc-muted ml-auto">Click for details →</span>
              </div>
            </button>
          </section>
        </>
      )}

      {/* Analysis View Mode */}
      {activeView !== 'overview' && (
        <section>
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => setActiveView('overview')}
              className="text-sm text-cc-muted hover:text-cc-text transition-colors flex items-center gap-1"
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
      <p className="text-xs text-cc-muted text-center">
        Financial analysis tools are for educational purposes only. Consult qualified professionals
        for actual financial, tax, and investment decisions.
      </p>

      {/* Detail Modals */}
      {renderDetailModal()}

      {/* Issue Detail Modal for Escalations */}
      {selectedIssue && (
        <IssueDetailModal
          issue={selectedIssue}
          onClose={() => setSelectedIssue(null)}
          onUpdated={() => {
            const updated = getIssueById(selectedIssue.id);
            setSelectedIssue(updated || null);
          }}
        />
      )}
    </div>
  );
}
