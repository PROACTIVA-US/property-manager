import { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Download, Upload, RotateCcw } from 'lucide-react';
import { loadSettings, exportSettings, importSettings, resetSettings, SettingsData } from '../lib/settings';
import PropertyForm from '../components/settings/PropertyForm';
import MortgageForm from '../components/settings/MortgageForm';
import RentalIncomeForm from '../components/settings/RentalIncomeForm';
import TaxInfoForm from '../components/settings/TaxInfoForm';
import TenantForm from '../components/settings/TenantForm';

type TabId = 'property' | 'mortgage' | 'rental' | 'tax' | 'tenant';

interface Tab {
  id: TabId;
  label: string;
  description: string;
}

const tabs: Tab[] = [
  { id: 'property', label: 'Property', description: 'Property details and value' },
  { id: 'mortgage', label: 'Mortgage', description: 'Loan information' },
  { id: 'rental', label: 'Rental Income', description: 'Income and expenses' },
  { id: 'tax', label: 'Tax Info', description: 'Tax planning data' },
  { id: 'tenant', label: 'Tenant', description: 'Current tenant details' },
];

export default function Settings() {
  const [activeTab, setActiveTab] = useState<TabId>('property');
  const [settings, setSettings] = useState<SettingsData>(loadSettings());
  const [importMessage, setImportMessage] = useState('');

  useEffect(() => {
    // Reload settings when tab changes (in case updated elsewhere)
    setSettings(loadSettings());
  }, [activeTab]);

  const handleExport = () => {
    const jsonData = exportSettings();
    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `property-manager-settings-${new Date().toISOString().split('T')[0]}.json`;
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
        setImportMessage('✓ Settings imported successfully!');
        setTimeout(() => setImportMessage(''), 3000);
      } catch (error) {
        setImportMessage('✗ Failed to import. Invalid file format.');
        setTimeout(() => setImportMessage(''), 3000);
      }
    };
    reader.readAsText(file);
  };

  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset all settings to defaults? This cannot be undone.')) {
      const defaults = resetSettings();
      setSettings(defaults);
      alert('Settings have been reset to defaults.');
    }
  };

  const handleDataSaved = () => {
    // Reload settings after any form saves
    setSettings(loadSettings());
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-brand-orange/20 rounded-lg">
            <SettingsIcon className="text-brand-orange" size={28} />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-brand-light">Settings & Data Management</h1>
            <p className="text-brand-muted mt-1">
              Configure your property, mortgage, and financial information
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleExport}
            className="btn-secondary flex items-center gap-2 text-sm"
            title="Export all settings as JSON"
          >
            <Download size={16} />
            Export
          </button>
          <label className="btn-secondary flex items-center gap-2 text-sm cursor-pointer">
            <Upload size={16} />
            Import
            <input
              type="file"
              accept=".json"
              onChange={handleImport}
              className="hidden"
            />
          </label>
          <button
            onClick={handleReset}
            className="btn-secondary flex items-center gap-2 text-sm text-red-400 hover:text-red-300"
            title="Reset to default values"
          >
            <RotateCcw size={16} />
            Reset
          </button>
        </div>
      </div>

      {/* Import Message */}
      {importMessage && (
        <div className={`p-4 rounded-lg ${importMessage.startsWith('✓') ? 'bg-green-500/10 border border-green-500/30 text-green-400' : 'bg-red-500/10 border border-red-500/30 text-red-400'}`}>
          {importMessage}
        </div>
      )}

      {/* Last Updated */}
      <div className="text-xs text-brand-muted">
        Last updated: {new Date(settings.lastUpdated).toLocaleString()}
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-700">
        <div className="flex flex-wrap gap-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-3 text-sm font-medium transition-colors relative ${
                activeTab === tab.id
                  ? 'text-brand-orange'
                  : 'text-brand-muted hover:text-brand-light'
              }`}
            >
              <div>
                <div>{tab.label}</div>
                <div className="text-xs opacity-75">{tab.description}</div>
              </div>
              {activeTab === tab.id && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-orange" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="card p-6">
        {activeTab === 'property' && (
          <PropertyForm initialData={settings.property} onSave={handleDataSaved} />
        )}
        {activeTab === 'mortgage' && (
          <MortgageForm initialData={settings.mortgage} onSave={handleDataSaved} />
        )}
        {activeTab === 'rental' && (
          <RentalIncomeForm
            initialData={settings.rentalIncome}
            mortgageData={settings.mortgage}
            onSave={handleDataSaved}
          />
        )}
        {activeTab === 'tax' && (
          <TaxInfoForm initialData={settings.taxInfo} onSave={handleDataSaved} />
        )}
        {activeTab === 'tenant' && (
          <TenantForm initialData={settings.tenant} onSave={handleDataSaved} />
        )}
      </div>

      {/* Info Footer */}
      <div className="card bg-brand-navy/30 p-4">
        <h4 className="text-sm font-bold text-brand-light mb-2">💡 Tips</h4>
        <ul className="text-sm text-brand-muted space-y-1">
          <li>• All data is saved locally in your browser</li>
          <li>• Export your settings regularly as a backup</li>
          <li>• Use the Import feature to restore from a backup or transfer to another device</li>
          <li>• Financial calculations throughout the app will use this data</li>
        </ul>
      </div>
    </div>
  );
}
