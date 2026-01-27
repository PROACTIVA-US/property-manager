import { useState } from 'react';
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
  ChevronDown,
  ChevronRight,
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

type SectionId = 'property' | 'rental' | 'tax' | 'projections';

export default function Financials() {
  const [settings, setSettings] = useState(loadSettings());
  const [importMessage, setImportMessage] = useState('');
  const [expandedSections, setExpandedSections] = useState<Set<SectionId>>(new Set());

  const toggleSection = (id: SectionId) => {
    setExpandedSections(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleDataSaved = () => {
    setSettings(loadSettings());
  };

  // Import/Export handlers
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
    event.target.value = '';
  };

  const ImportExportButtons = ({ section }: { section: string }) => (
    <div className="flex items-center gap-2">
      <button
        onClick={(e) => { e.stopPropagation(); handleExport(section); }}
        className="btn-secondary flex items-center gap-2 text-xs"
        title="Export settings"
      >
        <Download size={14} />
        Export
      </button>
      <label className="btn-secondary flex items-center gap-2 text-xs cursor-pointer" onClick={(e) => e.stopPropagation()}>
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

  const sections: { id: SectionId; label: string; icon: React.ElementType; description: string }[] = [
    { id: 'property', label: 'Property & Mortgage', icon: Building2, description: 'Property details and mortgage information' },
    { id: 'rental', label: 'Rental Income & Expenses', icon: Home, description: 'Rental income, operating expenses, and cash flow analysis' },
    { id: 'tax', label: 'Tax Planning', icon: FileText, description: 'Tax information and analysis tools' },
    { id: 'projections', label: 'Projections', icon: TrendingUp, description: 'Keep vs sell analysis and mortgage payoff calculator' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-brand-light">Financial Analysis Suite</h1>
        <p className="text-brand-muted mt-1">
          Manage your property finances and analyze investment performance
        </p>
      </div>

      {/* Import status message */}
      {importMessage && (
        <div className={`p-3 rounded-lg text-sm ${importMessage.includes('success') ? 'bg-green-500/10 border border-green-500/30 text-green-400' : 'bg-red-500/10 border border-red-500/30 text-red-400'}`}>
          {importMessage}
        </div>
      )}

      {/* Overview - always visible, most important first */}
      <div className="card bg-slate-800/50 p-6">
        <FinancialsOverview />
      </div>

      {/* Expandable sections - progressive disclosure */}
      {sections.map((section) => {
        const isExpanded = expandedSections.has(section.id);
        const Icon = section.icon as React.ElementType<{ size?: number; className?: string }>;

        return (
          <div key={section.id} className="card bg-slate-800/50 overflow-hidden">
            <button
              onClick={() => toggleSection(section.id)}
              className="w-full flex items-center justify-between p-5 text-left hover:bg-slate-700/30 transition-colors"
              aria-expanded={isExpanded}
            >
              <div className="flex items-center gap-3">
                <Icon size={20} className="text-brand-orange" />
                <div>
                  <h2 className="text-lg font-semibold text-brand-light">{section.label}</h2>
                  <p className="text-sm text-brand-muted">{section.description}</p>
                </div>
              </div>
              {isExpanded ? (
                <ChevronDown size={20} className="text-brand-muted" />
              ) : (
                <ChevronRight size={20} className="text-brand-muted" />
              )}
            </button>

            {isExpanded && (
              <div className="border-t border-slate-700/50 p-6">
                {section.id === 'property' && (
                  <div className="space-y-6">
                    <div className="flex justify-end">
                      <ImportExportButtons section="property-mortgage" />
                    </div>
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
                )}

                {section.id === 'rental' && (
                  <div className="space-y-6">
                    <div className="flex justify-end">
                      <ImportExportButtons section="rental" />
                    </div>
                    <RentalIncomeForm
                      initialData={settings.rentalIncome}
                      mortgageData={settings.mortgage}
                      onSave={handleDataSaved}
                    />
                    <div className="border-t border-slate-700 pt-6">
                      <h3 className="text-lg font-medium text-brand-light mb-4">Cash Flow Analysis</h3>
                      <FinancialComparison
                        initialProperty={property}
                        initialPersonal={personal}
                      />
                    </div>
                  </div>
                )}

                {section.id === 'tax' && (
                  <div className="space-y-6">
                    <div className="flex justify-end">
                      <ImportExportButtons section="tax" />
                    </div>
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
                )}

                {section.id === 'projections' && (
                  <div className="space-y-8">
                    <div>
                      <h3 className="text-lg font-medium text-brand-light mb-4 flex items-center gap-2">
                        <Scale className="text-brand-orange" size={18} />
                        Keep vs Sell Analysis
                      </h3>
                      <KeepVsSell
                        initialProperty={property}
                        initialTaxInputs={taxInputs}
                      />
                    </div>
                    <div className="border-t border-slate-700 pt-6">
                      <h3 className="text-lg font-medium text-brand-light mb-4 flex items-center gap-2">
                        <Calculator className="text-brand-orange" size={18} />
                        Mortgage Payoff Calculator
                      </h3>
                      <MortgageCalculator />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}

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
