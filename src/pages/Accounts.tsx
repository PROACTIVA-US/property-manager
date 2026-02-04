import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Building2,
  Receipt,
  Shield,
  Zap,
  ExternalLink,
  Edit2,
  Save,
  X,
  Plus,
  Trash2,
  Flame,
  Droplets,
  Trash,
  Wifi,
  Tv,
  HelpCircle,
  BarChart3,
  ChevronDown,
  ChevronUp,
  type LucideIcon,
} from 'lucide-react';
import UtilityTracking from '../components/UtilityTracking';
import {
  loadSettings,
  saveSettings,
  formatCurrency,
  type AccountInfo,
  type UtilityProvider,
  type PropertyAccounts,
} from '../lib/settings';

const UTILITY_ICONS: Record<string, LucideIcon> = {
  electric: Zap,
  gas: Flame,
  water: Droplets,
  trash: Trash,
  internet: Wifi,
  cable: Tv,
  other: HelpCircle,
};

const UTILITY_LABELS: Record<string, string> = {
  electric: 'Electric',
  gas: 'Gas',
  water: 'Water',
  trash: 'Trash/Garbage',
  internet: 'Internet',
  cable: 'Cable/TV',
  other: 'Other',
};

interface AccountCardProps {
  id: string;
  title: string;
  icon: LucideIcon;
  iconColor: string;
  account: AccountInfo;
  monthlyAmount?: number;
  onSave: (account: AccountInfo) => void;
}

function AccountCard({ id, title, icon: Icon, iconColor, account, monthlyAmount, onSave }: AccountCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<AccountInfo>(account);

  const handleSave = () => {
    onSave(formData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setFormData(account);
    setIsEditing(false);
  };

  return (
    <div id={id} className="card scroll-mt-24">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${iconColor}`}>
            <Icon size={24} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-cc-text">{title}</h3>
            {monthlyAmount !== undefined && (
              <p className="text-sm text-cc-muted">{formatCurrency(monthlyAmount)}/month</p>
            )}
          </div>
        </div>
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="p-2 hover:bg-cc-surface rounded-lg transition-colors"
          >
            <Edit2 size={18} className="text-cc-muted" />
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              className="p-2 bg-green-500/20 hover:bg-green-500/30 rounded-lg transition-colors"
            >
              <Save size={18} className="text-green-400" />
            </button>
            <button
              onClick={handleCancel}
              className="p-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg transition-colors"
            >
              <X size={18} className="text-red-400" />
            </button>
          </div>
        )}
      </div>

      {isEditing ? (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-cc-text mb-1">Provider Name</label>
              <input
                type="text"
                value={formData.providerName}
                onChange={(e) => setFormData({ ...formData, providerName: e.target.value })}
                className="w-full px-3 py-2 bg-cc-bg border border-cc-border rounded-lg text-cc-text focus:outline-none focus:border-cc-accent"
                placeholder="Enter provider name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-cc-text mb-1">Account Number</label>
              <input
                type="text"
                value={formData.accountNumber || ''}
                onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                className="w-full px-3 py-2 bg-cc-bg border border-cc-border rounded-lg text-cc-text focus:outline-none focus:border-cc-accent"
                placeholder="Enter account number"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-cc-text mb-1">Portal URL</label>
              <input
                type="url"
                value={formData.portalUrl || ''}
                onChange={(e) => setFormData({ ...formData, portalUrl: e.target.value })}
                className="w-full px-3 py-2 bg-cc-bg border border-cc-border rounded-lg text-cc-text focus:outline-none focus:border-cc-accent"
                placeholder="https://..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-cc-text mb-1">Login Email</label>
              <input
                type="email"
                value={formData.loginEmail || ''}
                onChange={(e) => setFormData({ ...formData, loginEmail: e.target.value })}
                className="w-full px-3 py-2 bg-cc-bg border border-cc-border rounded-lg text-cc-text focus:outline-none focus:border-cc-accent"
                placeholder="email@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-cc-text mb-1">Phone</label>
              <input
                type="tel"
                value={formData.phone || ''}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 bg-cc-bg border border-cc-border rounded-lg text-cc-text focus:outline-none focus:border-cc-accent"
                placeholder="(555) 123-4567"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-cc-text mb-1">Notes</label>
            <textarea
              value={formData.notes || ''}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-3 py-2 bg-cc-bg border border-cc-border rounded-lg text-cc-text focus:outline-none focus:border-cc-accent"
              placeholder="Additional notes..."
              rows={2}
            />
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {account.providerName ? (
            <>
              <div className="flex items-center justify-between py-2 border-b border-cc-border/30">
                <span className="text-sm text-cc-muted">Provider</span>
                <span className="text-sm font-medium text-cc-text">{account.providerName}</span>
              </div>
              {account.accountNumber && (
                <div className="flex items-center justify-between py-2 border-b border-cc-border/30">
                  <span className="text-sm text-cc-muted">Account #</span>
                  <span className="text-sm font-medium text-cc-text">{account.accountNumber}</span>
                </div>
              )}
              {account.portalUrl && (
                <div className="flex items-center justify-between py-2 border-b border-cc-border/30">
                  <span className="text-sm text-cc-muted">Portal</span>
                  <a
                    href={account.portalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-sm font-medium text-cc-accent hover:underline"
                  >
                    Open Portal <ExternalLink size={14} />
                  </a>
                </div>
              )}
              {account.loginEmail && (
                <div className="flex items-center justify-between py-2 border-b border-cc-border/30">
                  <span className="text-sm text-cc-muted">Login Email</span>
                  <span className="text-sm font-medium text-cc-text">{account.loginEmail}</span>
                </div>
              )}
              {account.phone && (
                <div className="flex items-center justify-between py-2 border-b border-cc-border/30">
                  <span className="text-sm text-cc-muted">Phone</span>
                  <a href={`tel:${account.phone}`} className="text-sm font-medium text-cc-accent hover:underline">
                    {account.phone}
                  </a>
                </div>
              )}
              {account.notes && (
                <div className="pt-2">
                  <span className="text-sm text-cc-muted">Notes:</span>
                  <p className="text-sm text-cc-text mt-1">{account.notes}</p>
                </div>
              )}
            </>
          ) : (
            <p className="text-sm text-cc-muted text-center py-4">
              No account information added yet. Click edit to add details.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export default function Accounts() {
  const [searchParams] = useSearchParams();
  const [settings, setSettings] = useState(loadSettings());
  const [editingUtility, setEditingUtility] = useState<number | null>(null);
  const [showAddUtility, setShowAddUtility] = useState(false);
  const [showUtilityTracking, setShowUtilityTracking] = useState(false);
  const [newUtility, setNewUtility] = useState<Partial<UtilityProvider>>({
    type: 'other',
    providerName: '',
    monthlyEstimate: 0,
  });

  // Scroll to section based on URL parameter
  useEffect(() => {
    const section = searchParams.get('section');
    if (section) {
      const element = document.getElementById(section);
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
      }
    }
  }, [searchParams]);

  const handleSaveAccount = (type: keyof Omit<PropertyAccounts, 'utilities'>, account: AccountInfo) => {
    const updated = {
      ...settings,
      propertyAccounts: {
        ...settings.propertyAccounts,
        [type]: account,
      },
    };
    setSettings(updated);
    saveSettings(updated);
  };

  const handleSaveUtility = (index: number, utility: UtilityProvider) => {
    const updatedUtilities = [...settings.propertyAccounts.utilities];
    updatedUtilities[index] = utility;
    const updated = {
      ...settings,
      propertyAccounts: {
        ...settings.propertyAccounts,
        utilities: updatedUtilities,
      },
    };
    setSettings(updated);
    saveSettings(updated);
    setEditingUtility(null);
  };

  const handleDeleteUtility = (index: number) => {
    const updatedUtilities = settings.propertyAccounts.utilities.filter((_, i) => i !== index);
    const updated = {
      ...settings,
      propertyAccounts: {
        ...settings.propertyAccounts,
        utilities: updatedUtilities,
      },
    };
    setSettings(updated);
    saveSettings(updated);
  };

  const handleAddUtility = () => {
    if (!newUtility.providerName) return;
    const updatedUtilities = [
      ...settings.propertyAccounts.utilities,
      {
        type: newUtility.type || 'other',
        providerName: newUtility.providerName || '',
        monthlyEstimate: newUtility.monthlyEstimate || 0,
        portalUrl: newUtility.portalUrl || '',
        accountNumber: newUtility.accountNumber || '',
        loginEmail: newUtility.loginEmail || '',
        phone: newUtility.phone || '',
        notes: newUtility.notes || '',
      } as UtilityProvider,
    ];
    const updated = {
      ...settings,
      propertyAccounts: {
        ...settings.propertyAccounts,
        utilities: updatedUtilities,
      },
    };
    setSettings(updated);
    saveSettings(updated);
    setShowAddUtility(false);
    setNewUtility({ type: 'other', providerName: '', monthlyEstimate: 0 });
  };

  const totalUtilities = settings.propertyAccounts.utilities.reduce((sum, u) => sum + u.monthlyEstimate, 0);

  return (
    <div className="min-h-screen bg-cc-bg p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-cc-text">Property Accounts</h1>
          <p className="text-cc-muted mt-1">
            Manage your property-related accounts, provider links, and payment information
          </p>
        </div>

        {/* Quick Links */}
        <div className="flex flex-wrap gap-2">
          <a href="#mortgage" className="px-3 py-1.5 bg-blue-500/20 text-blue-400 rounded-lg text-sm hover:bg-blue-500/30 transition-colors">
            Mortgage
          </a>
          <a href="#property-tax" className="px-3 py-1.5 bg-green-500/20 text-green-400 rounded-lg text-sm hover:bg-green-500/30 transition-colors">
            Property Tax
          </a>
          <a href="#insurance" className="px-3 py-1.5 bg-purple-500/20 text-purple-400 rounded-lg text-sm hover:bg-purple-500/30 transition-colors">
            Insurance
          </a>
          <a href="#utilities" className="px-3 py-1.5 bg-yellow-500/20 text-yellow-400 rounded-lg text-sm hover:bg-yellow-500/30 transition-colors">
            Utilities
          </a>
        </div>

        {/* Mortgage Account */}
        <AccountCard
          id="mortgage"
          title="Mortgage"
          icon={Building2}
          iconColor="bg-blue-500/20 text-blue-400"
          account={settings.propertyAccounts.mortgage}
          monthlyAmount={settings.mortgage.totalMonthlyPayment}
          onSave={(account) => handleSaveAccount('mortgage', account)}
        />

        {/* Property Tax Account */}
        <AccountCard
          id="property-tax"
          title="Property Tax"
          icon={Receipt}
          iconColor="bg-green-500/20 text-green-400"
          account={settings.propertyAccounts.propertyTax}
          monthlyAmount={settings.rentalIncome.monthlyPropertyTax}
          onSave={(account) => handleSaveAccount('propertyTax', account)}
        />

        {/* Insurance Account */}
        <AccountCard
          id="insurance"
          title="Insurance"
          icon={Shield}
          iconColor="bg-purple-500/20 text-purple-400"
          account={settings.propertyAccounts.insurance}
          monthlyAmount={settings.rentalIncome.monthlyInsurance}
          onSave={(account) => handleSaveAccount('insurance', account)}
        />

        {/* Utilities Section */}
        <div id="utilities" className="card scroll-mt-24">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-yellow-500/20 text-yellow-400">
                <Zap size={24} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-cc-text">Utilities</h3>
                <p className="text-sm text-cc-muted">Total: {formatCurrency(totalUtilities)}/month</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowUtilityTracking(!showUtilityTracking)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                  showUtilityTracking
                    ? 'bg-blue-500/20 text-blue-400'
                    : 'bg-cc-surface hover:bg-cc-border text-cc-muted hover:text-cc-text'
                }`}
              >
                <BarChart3 size={18} />
                Track Bills
                {showUtilityTracking ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
              <button
                onClick={() => setShowAddUtility(true)}
                className="flex items-center gap-2 px-3 py-2 bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400 rounded-lg transition-colors"
              >
                <Plus size={18} />
                Add Utility
              </button>
            </div>
          </div>

          {/* Utility Bill Tracking Panel */}
          {showUtilityTracking && (
            <div className="mb-6 p-4 bg-blue-500/5 border border-blue-500/20 rounded-lg">
              <UtilityTracking onBack={() => setShowUtilityTracking(false)} />
            </div>
          )}

          {/* Add Utility Form */}
          {showAddUtility && (
            <div className="mb-6 p-4 bg-cc-surface/50 rounded-lg border border-cc-border">
              <h4 className="font-medium text-cc-text mb-4">Add New Utility</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-cc-text mb-1">Type</label>
                  <select
                    value={newUtility.type}
                    onChange={(e) => setNewUtility({ ...newUtility, type: e.target.value as UtilityProvider['type'] })}
                    className="w-full px-3 py-2 bg-cc-bg border border-cc-border rounded-lg text-cc-text focus:outline-none focus:border-cc-accent"
                  >
                    {Object.entries(UTILITY_LABELS).map(([value, label]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-cc-text mb-1">Provider Name</label>
                  <input
                    type="text"
                    value={newUtility.providerName || ''}
                    onChange={(e) => setNewUtility({ ...newUtility, providerName: e.target.value })}
                    className="w-full px-3 py-2 bg-cc-bg border border-cc-border rounded-lg text-cc-text focus:outline-none focus:border-cc-accent"
                    placeholder="Provider name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-cc-text mb-1">Monthly Estimate</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-cc-muted">$</span>
                    <input
                      type="number"
                      value={newUtility.monthlyEstimate || ''}
                      onChange={(e) => setNewUtility({ ...newUtility, monthlyEstimate: parseFloat(e.target.value) || 0 })}
                      className="w-full pl-7 pr-3 py-2 bg-cc-bg border border-cc-border rounded-lg text-cc-text focus:outline-none focus:border-cc-accent"
                      placeholder="0"
                    />
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleAddUtility}
                  className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-black font-medium rounded-lg transition-colors"
                >
                  Add Utility
                </button>
                <button
                  onClick={() => setShowAddUtility(false)}
                  className="px-4 py-2 bg-cc-surface hover:bg-cc-border text-cc-text rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Utility List */}
          <div className="space-y-4">
            {settings.propertyAccounts.utilities.map((utility, index) => {
              const Icon = UTILITY_ICONS[utility.type] || HelpCircle;
              const isEditing = editingUtility === index;

              return (
                <div key={index} className="p-4 bg-cc-surface/30 rounded-lg border border-cc-border/50">
                  {isEditing ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-cc-text mb-1">Type</label>
                          <select
                            value={utility.type}
                            onChange={(e) => {
                              const updated = { ...utility, type: e.target.value as UtilityProvider['type'] };
                              handleSaveUtility(index, updated);
                            }}
                            className="w-full px-3 py-2 bg-cc-bg border border-cc-border rounded-lg text-cc-text"
                          >
                            {Object.entries(UTILITY_LABELS).map(([value, label]) => (
                              <option key={value} value={value}>{label}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-cc-text mb-1">Provider</label>
                          <input
                            type="text"
                            defaultValue={utility.providerName}
                            onBlur={(e) => {
                              const updated = { ...utility, providerName: e.target.value };
                              handleSaveUtility(index, updated);
                            }}
                            className="w-full px-3 py-2 bg-cc-bg border border-cc-border rounded-lg text-cc-text"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-cc-text mb-1">Monthly Est.</label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-cc-muted">$</span>
                            <input
                              type="number"
                              defaultValue={utility.monthlyEstimate}
                              onBlur={(e) => {
                                const updated = { ...utility, monthlyEstimate: parseFloat(e.target.value) || 0 };
                                handleSaveUtility(index, updated);
                              }}
                              className="w-full pl-7 pr-3 py-2 bg-cc-bg border border-cc-border rounded-lg text-cc-text"
                            />
                          </div>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-cc-text mb-1">Portal URL</label>
                          <input
                            type="url"
                            defaultValue={utility.portalUrl || ''}
                            onBlur={(e) => {
                              const updated = { ...utility, portalUrl: e.target.value };
                              handleSaveUtility(index, updated);
                            }}
                            className="w-full px-3 py-2 bg-cc-bg border border-cc-border rounded-lg text-cc-text"
                            placeholder="https://..."
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-cc-text mb-1">Account #</label>
                          <input
                            type="text"
                            defaultValue={utility.accountNumber || ''}
                            onBlur={(e) => {
                              const updated = { ...utility, accountNumber: e.target.value };
                              handleSaveUtility(index, updated);
                            }}
                            className="w-full px-3 py-2 bg-cc-bg border border-cc-border rounded-lg text-cc-text"
                          />
                        </div>
                      </div>
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => setEditingUtility(null)}
                          className="px-3 py-1.5 bg-cc-surface hover:bg-cc-border text-cc-text rounded-lg text-sm transition-colors"
                        >
                          Done
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-yellow-500/10 rounded-lg">
                          <Icon size={20} className="text-yellow-400" />
                        </div>
                        <div>
                          <p className="font-medium text-cc-text">
                            {UTILITY_LABELS[utility.type]}: {utility.providerName || 'Not set'}
                          </p>
                          <p className="text-sm text-cc-muted">{formatCurrency(utility.monthlyEstimate)}/month</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {utility.portalUrl && (
                          <a
                            href={utility.portalUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 hover:bg-cc-surface rounded-lg transition-colors"
                            title="Open Portal"
                          >
                            <ExternalLink size={18} className="text-cc-accent" />
                          </a>
                        )}
                        <button
                          onClick={() => setEditingUtility(index)}
                          className="p-2 hover:bg-cc-surface rounded-lg transition-colors"
                        >
                          <Edit2 size={18} className="text-cc-muted" />
                        </button>
                        <button
                          onClick={() => handleDeleteUtility(index)}
                          className="p-2 hover:bg-red-500/20 rounded-lg transition-colors"
                        >
                          <Trash2 size={18} className="text-red-400" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            {settings.propertyAccounts.utilities.length === 0 && (
              <p className="text-center text-cc-muted py-8">
                No utilities added yet. Click "Add Utility" to get started.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
