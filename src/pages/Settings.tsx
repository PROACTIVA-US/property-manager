import { useState, useEffect } from 'react';
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
} from 'lucide-react';
import type { SettingsData } from '../lib/settings';
import { loadSettings } from '../lib/settings';
import OwnerForm from '../components/settings/OwnerForm';
import PMForm from '../components/settings/PMForm';

type TabId = 'account' | 'pm' | 'appearance' | 'security';

interface Tab {
  id: TabId;
  label: string;
  description: string;
  icon: React.ElementType;
}

const tabs: Tab[] = [
  { id: 'account', label: 'Account', description: 'Your contact and business information', icon: User },
  { id: 'pm', label: 'Property Manager', description: 'Property manager contact details', icon: Users },
  { id: 'appearance', label: 'Appearance', description: 'Theme and display preferences', icon: Palette },
  { id: 'security', label: 'Security & Data', description: 'Data storage and app information', icon: Shield },
];

type Theme = 'dark' | 'light' | 'system';

export default function Settings() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') as TabId;
  const [activeTab, setActiveTab] = useState<TabId>(
    initialTab && tabs.find(t => t.id === initialTab) ? initialTab : 'account'
  );
  const [settings, setSettings] = useState<SettingsData>(loadSettings());
  const [theme, setTheme] = useState<Theme>(() => {
    return (localStorage.getItem('propertyManager_theme') as Theme) || 'dark';
  });

  useEffect(() => {
    setSettings(loadSettings());
  }, [activeTab]);

  const handleTabChange = (tabId: TabId) => {
    setActiveTab(tabId);
    setSearchParams({ tab: tabId });
  };

  const handleDataSaved = () => {
    setSettings(loadSettings());
  };

  const handleThemeChange = (newTheme: Theme) => {
    setTheme(newTheme);
    localStorage.setItem('propertyManager_theme', newTheme);
    // In a full implementation, this would update the document class
    // document.documentElement.classList.toggle('dark', newTheme === 'dark');
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
        <div className="p-2 bg-brand-orange/20 rounded-lg">
          <SettingsIcon className="text-brand-orange" size={28} />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-brand-light">Settings</h1>
          <p className="text-brand-muted mt-1">
            Manage your account, appearance, and app preferences
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-700">
        <div className="flex flex-wrap gap-1">
          {tabs.map((tab) => {
            const Icon = tab.icon as React.ElementType<{ size?: number }>;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`px-4 py-3 text-sm font-medium transition-colors relative flex items-center gap-2 ${
                  activeTab === tab.id
                    ? 'text-brand-orange'
                    : 'text-brand-muted hover:text-brand-light'
                }`}
              >
                <Icon size={16} />
                <div className="text-left">
                  <div>{tab.label}</div>
                </div>
                {activeTab === tab.id && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-orange" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div className="card p-6">
        {activeTab === 'account' && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <User className="text-brand-orange" size={20} />
              <h2 className="text-lg font-bold text-brand-light">Account Information</h2>
            </div>
            <p className="text-sm text-brand-muted mb-6">
              Your contact details and business information
            </p>
            <OwnerForm initialData={settings.owner} onSave={handleDataSaved} />
          </div>
        )}

        {activeTab === 'pm' && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Users className="text-brand-orange" size={20} />
              <h2 className="text-lg font-bold text-brand-light">Property Manager</h2>
            </div>
            <p className="text-sm text-brand-muted mb-6">
              Contact details for your property manager (if applicable)
            </p>
            <PMForm initialData={settings.pm} onSave={handleDataSaved} />
          </div>
        )}

        {activeTab === 'appearance' && (
          <div className="space-y-6">
            <div className="flex items-center gap-2 mb-4">
              <Palette className="text-brand-orange" size={20} />
              <h2 className="text-lg font-bold text-brand-light">Appearance</h2>
            </div>
            <p className="text-sm text-brand-muted mb-6">
              Customize the look and feel of your dashboard
            </p>

            {/* Theme Selection */}
            <div>
              <label className="block text-sm font-medium text-brand-light mb-3">Theme</label>
              <div className="grid grid-cols-3 gap-3">
                <button
                  onClick={() => handleThemeChange('dark')}
                  className={`p-4 rounded-lg border-2 transition-all flex flex-col items-center gap-2 ${
                    theme === 'dark'
                      ? 'border-brand-orange bg-brand-orange/10'
                      : 'border-slate-700 hover:border-slate-600'
                  }`}
                >
                  <Moon className={theme === 'dark' ? 'text-brand-orange' : 'text-brand-muted'} size={24} />
                  <span className={`text-sm font-medium ${theme === 'dark' ? 'text-brand-orange' : 'text-brand-muted'}`}>
                    Dark
                  </span>
                </button>
                <button
                  onClick={() => handleThemeChange('light')}
                  className={`p-4 rounded-lg border-2 transition-all flex flex-col items-center gap-2 ${
                    theme === 'light'
                      ? 'border-brand-orange bg-brand-orange/10'
                      : 'border-slate-700 hover:border-slate-600'
                  }`}
                >
                  <Sun className={theme === 'light' ? 'text-brand-orange' : 'text-brand-muted'} size={24} />
                  <span className={`text-sm font-medium ${theme === 'light' ? 'text-brand-orange' : 'text-brand-muted'}`}>
                    Light
                  </span>
                </button>
                <button
                  onClick={() => handleThemeChange('system')}
                  className={`p-4 rounded-lg border-2 transition-all flex flex-col items-center gap-2 ${
                    theme === 'system'
                      ? 'border-brand-orange bg-brand-orange/10'
                      : 'border-slate-700 hover:border-slate-600'
                  }`}
                >
                  <Monitor className={theme === 'system' ? 'text-brand-orange' : 'text-brand-muted'} size={24} />
                  <span className={`text-sm font-medium ${theme === 'system' ? 'text-brand-orange' : 'text-brand-muted'}`}>
                    System
                  </span>
                </button>
              </div>
              <p className="text-xs text-brand-muted mt-2">
                Note: Light theme is coming soon. Currently optimized for dark mode.
              </p>
            </div>
          </div>
        )}

        {activeTab === 'security' && (
          <div className="space-y-6">
            <div className="flex items-center gap-2 mb-4">
              <Shield className="text-brand-orange" size={20} />
              <h2 className="text-lg font-bold text-brand-light">Security & Data</h2>
            </div>
            <p className="text-sm text-brand-muted mb-6">
              Information about your data storage and app security
            </p>

            {/* Data Storage Info */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-brand-light flex items-center gap-2">
                <Database size={16} className="text-brand-orange" />
                Data Storage
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-brand-navy/30 rounded-lg p-4">
                  <div className="text-xs text-brand-muted uppercase mb-1">Storage Location</div>
                  <div className="text-brand-light font-medium">Local Browser Storage</div>
                  <p className="text-xs text-brand-muted mt-1">
                    All data is stored locally on your device
                  </p>
                </div>
                <div className="bg-brand-navy/30 rounded-lg p-4">
                  <div className="text-xs text-brand-muted uppercase mb-1">Storage Used</div>
                  <div className="text-brand-light font-medium">{getStorageSize()}</div>
                  <p className="text-xs text-brand-muted mt-1">
                    Settings and preferences data
                  </p>
                </div>
              </div>
            </div>

            {/* Last Updated */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-brand-light flex items-center gap-2">
                <Clock size={16} className="text-brand-orange" />
                Last Updated
              </h3>
              <div className="bg-brand-navy/30 rounded-lg p-4">
                <div className="text-brand-light font-medium">
                  {new Date(settings.lastUpdated).toLocaleString()}
                </div>
                <p className="text-xs text-brand-muted mt-1">
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
                  <p className="text-sm text-brand-muted">
                    Your data never leaves your device. This app stores all information locally in your
                    browser and does not transmit any data to external servers. For data backup, use
                    the Export feature in the Financials section.
                  </p>
                </div>
              </div>
            </div>

            {/* Link to Financials for Import/Export */}
            <div className="bg-brand-navy/30 rounded-lg p-4">
              <h4 className="text-sm font-medium text-brand-light mb-2">Data Management</h4>
              <p className="text-sm text-brand-muted mb-3">
                To import or export your financial data, visit the Financials section where you can
                backup and restore your property, mortgage, and rental information.
              </p>
              <a
                href="/financials?tab=property"
                className="text-brand-orange hover:underline text-sm font-medium"
              >
                Go to Financials &rarr;
              </a>
            </div>
          </div>
        )}
      </div>

      {/* Tips Footer */}
      <div className="card bg-brand-navy/30 p-4">
        <h4 className="text-sm font-bold text-brand-light mb-2 flex items-center gap-2">
          <Info size={14} className="text-brand-orange" />
          Tips
        </h4>
        <ul className="text-sm text-brand-muted space-y-1">
          <li>All data is saved locally in your browser</li>
          <li>Financial data can be managed in the Financials section</li>
          <li>Tenant information can be edited from the Tenants page</li>
        </ul>
      </div>
    </div>
  );
}
