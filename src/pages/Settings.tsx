import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Settings as SettingsIcon,
  User,
  Users,
  Palette,
  Shield,
  Info,
  Moon,
  Sun,
  Monitor,
  Database,
  Clock,
  Building2,
  DollarSign,
  Home,
  FileText,
} from 'lucide-react';
import type { SettingsData } from '../lib/settings';
import { useTheme } from '../contexts/ThemeContext';
import { loadSettings } from '../lib/settings';
import OwnerForm from '../components/settings/OwnerForm';
import PMForm from '../components/settings/PMForm';
import PropertyForm from '../components/settings/PropertyForm';
import MortgageForm from '../components/settings/MortgageForm';
import RentalIncomeForm from '../components/settings/RentalIncomeForm';
import TaxInfoForm from '../components/settings/TaxInfoForm';
import TenantForm from '../components/settings/TenantForm';

type TabId = 'account' | 'pm' | 'property' | 'mortgage' | 'rental' | 'tax' | 'tenant' | 'appearance' | 'security';

interface Tab {
  id: TabId;
  label: string;
  description: string;
  icon: React.ElementType;
  group: 'people' | 'property' | 'preferences';
}

const tabs: Tab[] = [
  { id: 'account', label: 'Account', description: 'Your contact and business information', icon: User, group: 'people' },
  { id: 'pm', label: 'Property Manager', description: 'Property manager contact details', icon: Users, group: 'people' },
  { id: 'tenant', label: 'Tenant', description: 'Current tenant contact and lease details', icon: Users, group: 'people' },
  { id: 'property', label: 'Property', description: 'Property address, value, and details', icon: Building2, group: 'property' },
  { id: 'mortgage', label: 'Mortgage', description: 'Mortgage and loan information', icon: DollarSign, group: 'property' },
  { id: 'rental', label: 'Rental Income', description: 'Rental income and operating expenses', icon: Home, group: 'property' },
  { id: 'tax', label: 'Tax Info', description: 'Tax planning information', icon: FileText, group: 'property' },
  { id: 'appearance', label: 'Appearance', description: 'Theme and display preferences', icon: Palette, group: 'preferences' },
  { id: 'security', label: 'Security & Data', description: 'Data storage and app information', icon: Shield, group: 'preferences' },
];


export default function Settings() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') as TabId;
  const [activeTab, setActiveTab] = useState<TabId>(
    initialTab && tabs.find(t => t.id === initialTab) ? initialTab : 'account'
  );
  // Use lazy initialization for settings - no effect needed
  const [settings, setSettings] = useState<SettingsData>(() => loadSettings());
  const { theme, setTheme } = useTheme();

  const handleTabChange = (tabId: TabId) => {
    setActiveTab(tabId);
    setSearchParams({ tab: tabId });
  };

  const handleDataSaved = () => {
    setSettings(loadSettings());
  };

  const handleThemeChange = (newTheme: 'light' | 'dark' | 'system') => {
    setTheme(newTheme);
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getStorageSize = () => {
    const data = localStorage.getItem('propertyManager_settings_v1');
    return data ? formatBytes(new Blob([data]).size) : '0 Bytes';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 bg-cc-accent/20 rounded-lg">
          <SettingsIcon className="text-cc-accent" size={28} />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-cc-text">Settings</h1>
          <p className="text-cc-muted mt-1">
            Manage your account, appearance, and app preferences
          </p>
        </div>
      </div>

      {/* Tabs - grouped */}
      <div className="border-b border-cc-border">
        <div className="flex flex-wrap gap-1 items-center">
          {(['people', 'property', 'preferences'] as const).map((group, gi) => (
            <div key={group} className="flex items-center">
              {gi > 0 && <div className="w-px h-6 bg-cc-border mx-1" />}
              {tabs.filter(t => t.group === group).map((tab) => {
                const Icon = tab.icon as React.ElementType<{ size?: number }>;
                return (
                  <button
                    key={tab.id}
                    onClick={() => handleTabChange(tab.id)}
                    className={`px-3 py-3 text-sm font-medium transition-colors relative flex items-center gap-1.5 ${
                      activeTab === tab.id
                        ? 'text-cc-accent'
                        : 'text-cc-muted hover:text-cc-text'
                    }`}
                  >
                    <Icon size={14} />
                    <span>{tab.label}</span>
                    {activeTab === tab.id && (
                      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-cc-accent" />
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="card p-6">
        {activeTab === 'account' && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <User className="text-cc-accent" size={20} />
              <h2 className="text-lg font-bold text-cc-text">Account Information</h2>
            </div>
            <p className="text-sm text-cc-muted mb-6">
              Your contact details and business information
            </p>
            <OwnerForm initialData={settings.owner} onSave={handleDataSaved} />
          </div>
        )}

        {activeTab === 'pm' && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Users className="text-cc-accent" size={20} />
              <h2 className="text-lg font-bold text-cc-text">Property Manager</h2>
            </div>
            <p className="text-sm text-cc-muted mb-6">
              Contact details for your property manager (if applicable)
            </p>
            <PMForm initialData={settings.pm} onSave={handleDataSaved} />
          </div>
        )}

        {activeTab === 'tenant' && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Users className="text-cc-accent" size={20} />
              <h2 className="text-lg font-bold text-cc-text">Tenant Details</h2>
            </div>
            <p className="text-sm text-cc-muted mb-6">
              Current tenant contact information and lease details
            </p>
            <TenantForm initialData={settings.tenant} onSave={handleDataSaved} />
          </div>
        )}

        {activeTab === 'property' && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Building2 className="text-cc-accent" size={20} />
              <h2 className="text-lg font-bold text-cc-text">Property Information</h2>
            </div>
            <p className="text-sm text-cc-muted mb-6">
              Property address, value, and physical details
            </p>
            <PropertyForm initialData={settings.property} onSave={handleDataSaved} />
          </div>
        )}

        {activeTab === 'mortgage' && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <DollarSign className="text-cc-accent" size={20} />
              <h2 className="text-lg font-bold text-cc-text">Mortgage Details</h2>
            </div>
            <p className="text-sm text-cc-muted mb-6">
              Loan balance, interest rate, and payment information
            </p>
            <MortgageForm initialData={settings.mortgage} onSave={handleDataSaved} />
          </div>
        )}

        {activeTab === 'rental' && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Home className="text-cc-accent" size={20} />
              <h2 className="text-lg font-bold text-cc-text">Rental Income & Expenses</h2>
            </div>
            <p className="text-sm text-cc-muted mb-6">
              Monthly rent, operating costs, and reserve allocations
            </p>
            <RentalIncomeForm initialData={settings.rentalIncome} mortgageData={settings.mortgage} onSave={handleDataSaved} />
          </div>
        )}

        {activeTab === 'tax' && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <FileText className="text-cc-accent" size={20} />
              <h2 className="text-lg font-bold text-cc-text">Tax Information</h2>
            </div>
            <p className="text-sm text-cc-muted mb-6">
              Filing status, income, and property depreciation details
            </p>
            <TaxInfoForm initialData={settings.taxInfo} onSave={handleDataSaved} />
          </div>
        )}

        {activeTab === 'appearance' && (
          <div className="space-y-6">
            <div className="flex items-center gap-2 mb-4">
              <Palette className="text-cc-accent" size={20} />
              <h2 className="text-lg font-bold text-cc-text">Appearance</h2>
            </div>
            <p className="text-sm text-cc-muted mb-6">
              Customize the look and feel of your dashboard
            </p>

            {/* Theme Selection */}
            <div>
              <label className="block text-sm font-medium text-cc-text mb-3">Theme</label>
              <div className="grid grid-cols-3 gap-3">
                <button
                  onClick={() => handleThemeChange('dark')}
                  className={`p-4 rounded-lg border-2 transition-all flex flex-col items-center gap-2 ${
                    theme === 'dark'
                      ? 'border-cc-accent bg-cc-accent/10'
                      : 'border-cc-border hover:border-cc-border'
                  }`}
                >
                  <Moon className={theme === 'dark' ? 'text-cc-accent' : 'text-cc-muted'} size={24} />
                  <span className={`text-sm font-medium ${theme === 'dark' ? 'text-cc-accent' : 'text-cc-muted'}`}>
                    Dark
                  </span>
                </button>
                <button
                  onClick={() => handleThemeChange('light')}
                  className={`p-4 rounded-lg border-2 transition-all flex flex-col items-center gap-2 ${
                    theme === 'light'
                      ? 'border-cc-accent bg-cc-accent/10'
                      : 'border-cc-border hover:border-cc-border'
                  }`}
                >
                  <Sun className={theme === 'light' ? 'text-cc-accent' : 'text-cc-muted'} size={24} />
                  <span className={`text-sm font-medium ${theme === 'light' ? 'text-cc-accent' : 'text-cc-muted'}`}>
                    Light
                  </span>
                </button>
                <button
                  onClick={() => handleThemeChange('system')}
                  className={`p-4 rounded-lg border-2 transition-all flex flex-col items-center gap-2 ${
                    theme === 'system'
                      ? 'border-cc-accent bg-cc-accent/10'
                      : 'border-cc-border hover:border-cc-border'
                  }`}
                >
                  <Monitor className={theme === 'system' ? 'text-cc-accent' : 'text-cc-muted'} size={24} />
                  <span className={`text-sm font-medium ${theme === 'system' ? 'text-cc-accent' : 'text-cc-muted'}`}>
                    System
                  </span>
                </button>
              </div>
              <p className="text-xs text-cc-muted mt-2">
                Theme changes apply instantly across the app.
              </p>
            </div>
          </div>
        )}

        {activeTab === 'security' && (
          <div className="space-y-6">
            <div className="flex items-center gap-2 mb-4">
              <Shield className="text-cc-accent" size={20} />
              <h2 className="text-lg font-bold text-cc-text">Security & Data</h2>
            </div>
            <p className="text-sm text-cc-muted mb-6">
              Information about your data storage and app security
            </p>

            {/* Data Storage Info */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-cc-text flex items-center gap-2">
                <Database size={16} className="text-cc-accent" />
                Data Storage
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-cc-surface/30 rounded-lg p-4">
                  <div className="text-xs text-cc-muted uppercase mb-1">Storage Location</div>
                  <div className="text-cc-text font-medium">Local Browser Storage</div>
                  <p className="text-xs text-cc-muted mt-1">
                    All data is stored locally on your device
                  </p>
                </div>
                <div className="bg-cc-surface/30 rounded-lg p-4">
                  <div className="text-xs text-cc-muted uppercase mb-1">Storage Used</div>
                  <div className="text-cc-text font-medium">{getStorageSize()}</div>
                  <p className="text-xs text-cc-muted mt-1">
                    Settings and preferences data
                  </p>
                </div>
              </div>
            </div>

            {/* Last Updated */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-cc-text flex items-center gap-2">
                <Clock size={16} className="text-cc-accent" />
                Last Updated
              </h3>
              <div className="bg-cc-surface/30 rounded-lg p-4">
                <div className="text-cc-text font-medium">
                  {new Date(settings.lastUpdated).toLocaleString()}
                </div>
                <p className="text-xs text-cc-muted mt-1">
                  Last time any settings were modified
                </p>
              </div>
            </div>

            {/* Privacy Notice */}
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Info className="text-blue-400 shrink-0 mt-0.5" size={18} />
                <div>
                  <h4 className="text-sm font-medium text-blue-400 mb-1">Privacy Notice</h4>
                  <p className="text-sm text-cc-muted">
                    Your data never leaves your device. This app stores all information locally in your
                    browser and does not transmit any data to external servers. For data backup, use
                    the Export feature in the Financials section.
                  </p>
                </div>
              </div>
            </div>

            {/* Link to Financials for Import/Export */}
            <div className="bg-cc-surface/30 rounded-lg p-4">
              <h4 className="text-sm font-medium text-cc-text mb-2">Data Management</h4>
              <p className="text-sm text-cc-muted mb-3">
                To import or export your financial data, visit the Financials section where you can
                backup and restore your property, mortgage, and rental information.
              </p>
              <a
                href="/financials"
                className="text-cc-accent hover:underline text-sm font-medium"
              >
                Go to Financials &rarr;
              </a>
            </div>
          </div>
        )}
      </div>

      {/* Tips Footer */}
      <div className="card bg-cc-surface/30 p-4">
        <h4 className="text-sm font-bold text-cc-text mb-2 flex items-center gap-2">
          <Info size={14} className="text-cc-accent" />
          Tips
        </h4>
        <ul className="text-sm text-cc-muted space-y-1">
          <li>All data is saved locally in your browser</li>
          <li>All property, financial, and contact data can be managed from this page</li>
          <li>Changes are reflected across the Financials and Tenants pages automatically</li>
        </ul>
      </div>
    </div>
  );
}
