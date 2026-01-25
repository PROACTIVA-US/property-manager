import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
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
} from 'lucide-react';
import FinancialsOverview from '../components/financials/FinancialsOverview';
import MortgageCalculator from '../components/MortgageCalculator';
import FinancialComparison from '../components/FinancialComparison';
import TaxAnalysis from '../components/TaxAnalysis';
import KeepVsSell from '../components/KeepVsSell';
import PropertyForm from '../components/settings/PropertyForm';
import MortgageForm from '../components/settings/MortgageForm';
import RentalIncomeForm from '../components/settings/RentalIncomeForm';
import TaxInfoForm from '../components/settings/TaxInfoForm';
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
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') as TabId;
  const [activeTab, setActiveTab] = useState<TabId>(
    initialTab && tabs.find(t => t.id === initialTab) ? initialTab : 'overview'
  );
  const [settings, setSettings] = useState(loadSettings());
  const [importMessage, setImportMessage] = useState('');
  const [projectionsSubTab, setProjectionsSubTab] = useState<'keepvssell' | 'mortgage'>('keepvssell');

  // Reload settings when tab changes
  useEffect(() => {
    setSettings(loadSettings());
  }, [activeTab]);

  // Update URL when tab changes
  const handleTabChange = (tabId: TabId) => {
    setActiveTab(tabId);
    setSearchParams({ tab: tabId });
  };

  const handleDataSaved = () => {
    setSettings(loadSettings());
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
      <label className="btn-secondary flex items-center gap-2 text-xs cursor-pointer">
        <Upload size={14} />
        Import
        <input
          type="file"
          accept=".json"
          onChange={handleImport}
          className="hidden"
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
              <h2 className="text-xl font-bold text-brand-light">Property & Mortgage Details</h2>
              <ImportExportButtons section="property-mortgage" />
            </div>

            {importMessage && (
              <div className={`p-3 rounded-lg text-sm ${importMessage.includes('success') ? 'bg-green-500/10 border border-green-500/30 text-green-400' : 'bg-red-500/10 border border-red-500/30 text-red-400'}`}>
                {importMessage}
              </div>
            )}

            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-brand-light mb-4 flex items-center gap-2">
                  <Building2 className="text-brand-orange" size={18} />
                  Property Information
                </h3>
                <PropertyForm initialData={settings.property} onSave={handleDataSaved} />
              </div>

              <div className="border-t border-slate-700 pt-6">
                <h3 className="text-lg font-medium text-brand-light mb-4 flex items-center gap-2">
                  <DollarSign className="text-brand-orange" size={18} />
                  Mortgage Details
                </h3>
                <MortgageForm initialData={settings.mortgage} onSave={handleDataSaved} />
              </div>
            </div>
          </div>
        );

      case 'rental':
        return (
          <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-brand-light">Rental Income & Expenses</h2>
              <ImportExportButtons section="rental" />
            </div>

            {importMessage && (
              <div className={`p-3 rounded-lg text-sm ${importMessage.includes('success') ? 'bg-green-500/10 border border-green-500/30 text-green-400' : 'bg-red-500/10 border border-red-500/30 text-red-400'}`}>
                {importMessage}
              </div>
            )}

            <RentalIncomeForm
              initialData={settings.rentalIncome}
              mortgageData={settings.mortgage}
              onSave={handleDataSaved}
            />

            {/* Cash Flow Analysis */}
            <div className="border-t border-slate-700 pt-6">
              <h3 className="text-lg font-medium text-brand-light mb-4">Cash Flow Analysis</h3>
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
              <h2 className="text-xl font-bold text-brand-light">Tax Planning</h2>
              <ImportExportButtons section="tax" />
            </div>

            {importMessage && (
              <div className={`p-3 rounded-lg text-sm ${importMessage.includes('success') ? 'bg-green-500/10 border border-green-500/30 text-green-400' : 'bg-red-500/10 border border-red-500/30 text-red-400'}`}>
                {importMessage}
              </div>
            )}

            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-brand-light mb-4 flex items-center gap-2">
                  <FileText className="text-brand-orange" size={18} />
                  Tax Information
                </h3>
                <TaxInfoForm initialData={settings.taxInfo} onSave={handleDataSaved} />
              </div>

              <div className="border-t border-slate-700 pt-6">
                <h3 className="text-lg font-medium text-brand-light mb-4">Tax Analysis & Estimates</h3>
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
              <h2 className="text-xl font-bold text-brand-light">Financial Projections</h2>
              <p className="text-sm text-brand-muted mt-1">
                Long-term analysis tools to help with investment decisions
              </p>
            </div>

            {/* Sub-tabs for projections */}
            <div className="flex gap-2 border-b border-slate-700 pb-2">
              <button
                onClick={() => setProjectionsSubTab('keepvssell')}
                className={`px-4 py-2 text-sm font-medium rounded-t transition-colors ${
                  projectionsSubTab === 'keepvssell'
                    ? 'bg-slate-700 text-brand-light'
                    : 'text-brand-muted hover:text-brand-light'
                }`}
              >
                <Scale size={16} className="inline mr-2" />
                Keep vs Sell
              </button>
              <button
                onClick={() => setProjectionsSubTab('mortgage')}
                className={`px-4 py-2 text-sm font-medium rounded-t transition-colors ${
                  projectionsSubTab === 'mortgage'
                    ? 'bg-slate-700 text-brand-light'
                    : 'text-brand-muted hover:text-brand-light'
                }`}
              >
                <Calculator size={16} className="inline mr-2" />
                Mortgage Payoff
              </button>
            </div>

            {projectionsSubTab === 'keepvssell' ? (
              <KeepVsSell
                initialProperty={property}
                initialTaxInputs={taxInputs}
              />
            ) : (
              <MortgageCalculator />
            )}
          </div>
        );

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
          Manage your property finances and analyze investment performance
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-slate-700/50">
        <nav className="flex gap-1 overflow-x-auto pb-px" aria-label="Financial analysis tabs">
          {tabs.map((tab) => {
            const Icon = tab.icon as React.ElementType<{ size?: number }>;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
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
