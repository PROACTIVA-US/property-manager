import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  DollarSign,
  FileText,
  Scale,
  Calculator,
  TrendingUp,
  Building2,
  Home,
  Info,
  Download,
  Upload,
  LayoutDashboard,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import FinancialsOverview from '../components/financials/FinancialsOverview';
import MortgageCalculator from '../components/MortgageCalculator';
import FinancialComparison from '../components/FinancialComparison';
import TaxAnalysis from '../components/TaxAnalysis';
import KeepVsSell from '../components/KeepVsSell';
import FinancialAccessDenied from '../components/FinancialAccessDenied';
import {
  loadSettings,
  exportSettings,
  importSettings,
} from '../lib/settings';
import {
  getPropertyFinancials,
  getPersonalExpenses,
  getTaxInputs,
} from '../lib/financials';
import { getAccessibleTabs, type FinancialTab } from '../lib/financialAccess';

type TabId = 'overview' | 'property' | 'rental' | 'tax' | 'projections';

interface Tab {
  id: TabId;
  label: string;
  icon: React.ElementType;
  description: string;
}

const tabs: Tab[] = [
  {
    id: 'overview',
    label: 'Overview',
    icon: LayoutDashboard,
    description: 'Income vs expenses snapshot and key metrics',
  },
  {
    id: 'property',
    label: 'Property & Mortgage',
    icon: Building2,
    description: 'Property details and mortgage information',
  },
  {
    id: 'rental',
    label: 'Rental Income',
    icon: Home,
    description: 'Rental income and operating expenses',
  },
  {
    id: 'tax',
    label: 'Tax Planning',
    icon: FileText,
    description: 'Tax information and analysis tools',
  },
  {
    id: 'projections',
    label: 'Projections',
    icon: TrendingUp,
    description: 'Keep vs sell analysis and mortgage payoff calculator',
  },
];

export default function Financials() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  // Get accessible tabs based on user role
  const accessibleTabs = getAccessibleTabs(user?.role || null);
  const filteredTabs = tabs.filter(tab => accessibleTabs.includes(tab.id as FinancialTab));

  // Redirect tenants - they have no access
  if (user?.role === 'tenant') {
    return <FinancialAccessDenied />;
  }

  const initialTab = searchParams.get('tab') as TabId;
  const defaultTab = filteredTabs.length > 0 ? filteredTabs[0].id : 'overview';
  const [activeTab, setActiveTab] = useState<TabId>(
    initialTab && filteredTabs.find(t => t.id === initialTab) ? initialTab : defaultTab
  );
  const [settings, setSettings] = useState(loadSettings());
  const [importMessage, setImportMessage] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    keepvssell: true,
    mortgage: false,
  });

  // Reload settings when tab changes
  useEffect(() => {
    setSettings(loadSettings());
  }, [activeTab]);

  // Update URL when tab changes
  const handleTabChange = (tabId: TabId) => {
    setActiveTab(tabId);
    setSearchParams({ tab: tabId });
  };

  // Import/Export handlers for each section
  const handleExport = (section: string) => {
    const jsonData = exportSettings();
    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `property-manager-${section}-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const jsonString = e.target?.result as string;
        const imported = importSettings(jsonString);
        setSettings(imported);
        setImportMessage('Settings imported successfully!');
        setTimeout(() => setImportMessage(''), 3000);
      } catch (error) {
        setImportMessage('Failed to import. Invalid file format.');
        setTimeout(() => setImportMessage(''), 3000);
      } finally {
        setIsImporting(false);
      }
    };
    reader.readAsText(file);
    // Reset input
    event.target.value = '';
  };

  const ImportExportButtons = ({ section }: { section: string }) => (
    <div className="flex items-center gap-2 mb-4">
      <button
        onClick={() => handleExport(section)}
        className="btn-secondary flex items-center gap-2 text-xs"
        title="Export settings"
      >
        <Download size={14} />
        Export
      </button>
      <label className={`btn-secondary flex items-center gap-2 text-xs cursor-pointer ${isImporting ? 'opacity-50 pointer-events-none' : ''}`}>
        <Upload size={14} className={isImporting ? 'animate-spin' : ''} />
        {isImporting ? 'Importing...' : 'Import'}
        <input
          type="file"
          accept=".json"
          onChange={handleImport}
          className="hidden"
          disabled={isImporting}
        />
      </label>
    </div>
  );

  // Get live financial data
  const property = getPropertyFinancials();
  const personal = getPersonalExpenses();
  const taxInputs = getTaxInputs();

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return <FinancialsOverview />;

      case 'property':
        return (
          <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-cc-text">Property & Mortgage Details</h2>
              <ImportExportButtons section="property-mortgage" />
            </div>

            {importMessage && (
              <div className={`p-3 rounded-lg text-sm ${importMessage.includes('success') ? 'bg-green-500/10 border border-green-500/30 text-green-400' : 'bg-red-500/10 border border-red-500/30 text-red-400'}`}>
                {importMessage}
              </div>
            )}

            <div className="space-y-6">
              {/* Property Summary */}
              <div>
                <h3 className="text-lg font-medium text-cc-text mb-4 flex items-center gap-2">
                  <Building2 className="text-cc-accent" size={18} />
                  Property Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-cc-surface/30 rounded-lg p-4">
                    <div className="text-xs text-cc-muted uppercase mb-1">Address</div>
                    <div className="text-cc-text font-medium">{settings.property.address || 'Not set'}</div>
                  </div>
                  <div className="bg-cc-surface/30 rounded-lg p-4">
                    <div className="text-xs text-cc-muted uppercase mb-1">Current Market Value</div>
                    <div className="text-cc-text font-medium">{settings.property.currentMarketValue ? `$${settings.property.currentMarketValue.toLocaleString()}` : 'Not set'}</div>
                  </div>
                </div>
                <Link to="/settings?tab=property" className="inline-flex items-center gap-1 text-cc-accent hover:underline text-sm font-medium mt-3">
                  Edit Property Details &rarr;
                </Link>
              </div>

              <div className="border-t border-cc-border pt-6">
                <h3 className="text-lg font-medium text-cc-text mb-4 flex items-center gap-2">
                  <DollarSign className="text-cc-accent" size={18} />
                  Mortgage Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-cc-surface/30 rounded-lg p-4">
                    <div className="text-xs text-cc-muted uppercase mb-1">Principal</div>
                    <div className="text-cc-text font-medium">{settings.mortgage.principal ? `$${settings.mortgage.principal.toLocaleString()}` : 'Not set'}</div>
                  </div>
                  <div className="bg-cc-surface/30 rounded-lg p-4">
                    <div className="text-xs text-cc-muted uppercase mb-1">Interest Rate</div>
                    <div className="text-cc-text font-medium">{settings.mortgage.interestRate ? `${settings.mortgage.interestRate}%` : 'Not set'}</div>
                  </div>
                </div>
                <Link to="/settings?tab=mortgage" className="inline-flex items-center gap-1 text-cc-accent hover:underline text-sm font-medium mt-3">
                  Edit Mortgage Details &rarr;
                </Link>
              </div>
            </div>
          </div>
        );

      case 'rental':
        return (
          <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-cc-text">Rental Income & Expenses</h2>
              <ImportExportButtons section="rental" />
            </div>

            {importMessage && (
              <div className={`p-3 rounded-lg text-sm ${importMessage.includes('success') ? 'bg-green-500/10 border border-green-500/30 text-green-400' : 'bg-red-500/10 border border-red-500/30 text-red-400'}`}>
                {importMessage}
              </div>
            )}

            {/* Rental Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-cc-surface/30 rounded-lg p-4">
                <div className="text-xs text-cc-muted uppercase mb-1">Monthly Rent</div>
                <div className="text-cc-text font-medium">{settings.rentalIncome.monthlyRent ? `$${settings.rentalIncome.monthlyRent.toLocaleString()}` : 'Not set'}</div>
              </div>
              <div className="bg-cc-surface/30 rounded-lg p-4">
                <div className="text-xs text-cc-muted uppercase mb-1">Monthly Property Tax</div>
                <div className="text-cc-text font-medium">{settings.rentalIncome.monthlyPropertyTax ? `$${settings.rentalIncome.monthlyPropertyTax.toLocaleString()}/mo` : 'Not set'}</div>
              </div>
              <div className="bg-cc-surface/30 rounded-lg p-4">
                <div className="text-xs text-cc-muted uppercase mb-1">Monthly Insurance</div>
                <div className="text-cc-text font-medium">{settings.rentalIncome.monthlyInsurance ? `$${settings.rentalIncome.monthlyInsurance.toLocaleString()}/mo` : 'Not set'}</div>
              </div>
            </div>
            <Link to="/settings?tab=rental" className="inline-flex items-center gap-1 text-cc-accent hover:underline text-sm font-medium">
              Edit Rental Details &rarr;
            </Link>

            {/* Cash Flow Analysis */}
            <div className="border-t border-cc-border pt-6">
              <h3 className="text-lg font-medium text-cc-text mb-4">Cash Flow Analysis</h3>
              <FinancialComparison
                initialProperty={property}
                initialPersonal={personal}
              />
            </div>
          </div>
        );

      case 'tax':
        return (
          <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-cc-text">Tax Planning</h2>
              <ImportExportButtons section="tax" />
            </div>

            {importMessage && (
              <div className={`p-3 rounded-lg text-sm ${importMessage.includes('success') ? 'bg-green-500/10 border border-green-500/30 text-green-400' : 'bg-red-500/10 border border-red-500/30 text-red-400'}`}>
                {importMessage}
              </div>
            )}

            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-cc-text mb-4 flex items-center gap-2">
                  <FileText className="text-cc-accent" size={18} />
                  Tax Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-cc-surface/30 rounded-lg p-4">
                    <div className="text-xs text-cc-muted uppercase mb-1">Filing Status</div>
                    <div className="text-cc-text font-medium capitalize">{settings.taxInfo.filingStatus || 'Not set'}</div>
                  </div>
                  <div className="bg-cc-surface/30 rounded-lg p-4">
                    <div className="text-xs text-cc-muted uppercase mb-1">Annual Income</div>
                    <div className="text-cc-text font-medium">{settings.taxInfo.annualIncome ? `$${settings.taxInfo.annualIncome.toLocaleString()}` : 'Not set'}</div>
                  </div>
                </div>
                <Link to="/settings?tab=tax" className="inline-flex items-center gap-1 text-cc-accent hover:underline text-sm font-medium mt-3">
                  Edit Tax Information &rarr;
                </Link>
              </div>

              <div className="border-t border-cc-border pt-6">
                <h3 className="text-lg font-medium text-cc-text mb-4">Tax Analysis & Estimates</h3>
                <TaxAnalysis
                  initialProperty={property}
                  initialTaxInputs={taxInputs}
                />
              </div>
            </div>
          </div>
        );

      case 'projections':
        return (
          <div className="p-6 space-y-6">
            <div>
              <h2 className="text-xl font-bold text-cc-text">Financial Projections</h2>
              <p className="text-sm text-cc-muted mt-1">
                Long-term analysis tools to help with investment decisions
              </p>
            </div>

            {/* Keep vs Sell - Expandable Section */}
            <div className="border border-cc-border rounded-lg overflow-hidden">
              <button
                onClick={() => setExpandedSections(prev => ({ ...prev, keepvssell: !prev.keepvssell }))}
                className="w-full flex items-center justify-between px-4 py-3 bg-cc-border/50 hover:bg-cc-border transition-colors"
              >
                <span className="flex items-center gap-2 text-sm font-medium text-cc-text">
                  <Scale size={16} className="text-cc-accent" />
                  Keep vs Sell Analysis
                </span>
                {expandedSections.keepvssell ? (
                  <ChevronDown size={16} className="text-cc-muted" />
                ) : (
                  <ChevronRight size={16} className="text-cc-muted" />
                )}
              </button>
              {expandedSections.keepvssell && (
                <div className="p-4">
                  <KeepVsSell
                    initialProperty={property}
                    initialTaxInputs={taxInputs}
                  />
                </div>
              )}
            </div>

            {/* Mortgage Payoff - Expandable Section */}
            <div className="border border-cc-border rounded-lg overflow-hidden">
              <button
                onClick={() => setExpandedSections(prev => ({ ...prev, mortgage: !prev.mortgage }))}
                className="w-full flex items-center justify-between px-4 py-3 bg-cc-border/50 hover:bg-cc-border transition-colors"
              >
                <span className="flex items-center gap-2 text-sm font-medium text-cc-text">
                  <Calculator size={16} className="text-cc-accent" />
                  Mortgage Payoff Calculator
                </span>
                {expandedSections.mortgage ? (
                  <ChevronDown size={16} className="text-cc-muted" />
                ) : (
                  <ChevronRight size={16} className="text-cc-muted" />
                )}
              </button>
              {expandedSections.mortgage && (
                <div className="p-4">
                  <MortgageCalculator />
                </div>
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const activeTabData = filteredTabs.find(t => t.id === activeTab);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-cc-text">Financial Analysis Suite</h1>
        <p className="text-cc-muted mt-1">
          {user?.role === 'pm'
            ? 'View rental income and cash flow analysis'
            : 'Manage your property finances and analyze investment performance'}
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-cc-border/50">
        <nav className="flex gap-1 overflow-x-auto pb-px" aria-label="Financial analysis tabs">
          {filteredTabs.map((tab) => {
            const Icon = tab.icon as React.ElementType<{ size?: number }>;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                  isActive
                    ? 'border-cc-accent text-cc-accent'
                    : 'border-transparent text-cc-muted hover:text-cc-text hover:border-cc-border'
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
        <div className="flex items-center gap-2 text-sm text-cc-muted">
          <Info size={14} />
          {activeTabData.description}
        </div>
      )}

      {/* Tab Content */}
      <div className="card bg-slate-800/50">
        {renderContent()}
      </div>

      {/* Educational Disclaimer */}
      <div className="card bg-gradient-to-r from-cc-surface/50 to-slate-800/50 border-l-4 border-cc-accent">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-cc-accent shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="text-cc-text font-medium mb-1">Educational Tool Disclaimer</p>
            <p className="text-cc-muted">
              All calculations, projections, and analysis provided in this suite are for
              <strong className="text-cc-text"> educational and informational purposes only</strong>.
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
