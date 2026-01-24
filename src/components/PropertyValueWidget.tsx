import { useState, useEffect } from 'react';
import { TrendingUp, RefreshCw, ExternalLink, AlertCircle } from 'lucide-react';
import { loadSettings, updateProperty } from '../lib/settings';
import {
  loadZillowEstimate,
  saveZillowEstimate,
  formatZillowEstimate,
  isEstimateFresh,
  type ZillowEstimate,
} from '../lib/zillow';

export default function PropertyValueWidget() {
  const [estimate, setEstimate] = useState<ZillowEstimate | null>(null);
  const [manualValue, setManualValue] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    // Load saved estimate on mount
    const savedEstimate = loadZillowEstimate();
    setEstimate(savedEstimate);
  }, []);

  const handleManualUpdate = () => {
    const value = parseFloat(manualValue.replace(/[^0-9.]/g, ''));

    if (isNaN(value) || value <= 0) {
      setMessage('Please enter a valid amount');
      return;
    }

    const settings = loadSettings();

    const newEstimate: ZillowEstimate = {
      address: settings.property.address,
      zestimate: value,
      lastUpdated: new Date().toISOString(),
    };

    // Save to Zillow storage
    saveZillowEstimate(newEstimate);
    setEstimate(newEstimate);

    // Update property market value
    updateProperty({ currentMarketValue: value });

    setMessage('✓ Property value updated successfully!');
    setManualValue('');
    setTimeout(() => setMessage(''), 3000);
  };

  const handleOpenZillow = () => {
    const settings = loadSettings();
    const address = encodeURIComponent(settings.property.address);
    window.open(`https://www.zillow.com/how-much-is-my-home-worth/?address=${address}`, '_blank');
  };

  const handleApplyToProperty = () => {
    if (!estimate) return;

    setIsUpdating(true);
    updateProperty({ currentMarketValue: estimate.zestimate });
    setMessage('✓ Applied to property market value!');
    setTimeout(() => {
      setMessage('');
      setIsUpdating(false);
    }, 2000);
  };

  const isFresh = isEstimateFresh(estimate);
  const settings = loadSettings();

  return (
    <div className="card bg-gradient-to-br from-brand-navy to-slate-800">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-500/20 rounded-lg text-blue-400">
            <TrendingUp size={24} />
          </div>
          <div>
            <h3 className="font-semibold text-brand-light">Property Value</h3>
            <p className="text-xs text-brand-muted">Zillow Zestimate</p>
          </div>
        </div>
        <button
          onClick={handleOpenZillow}
          className="p-2 hover:bg-slate-700 rounded-lg text-brand-muted hover:text-brand-orange transition-all"
          title="Open Zillow"
        >
          <ExternalLink size={16} />
        </button>
      </div>

      {estimate ? (
        <>
          <div className="mb-4">
            <p className="text-3xl font-bold text-brand-light mb-1">
              {formatZillowEstimate(estimate)}
            </p>
            <p className="text-xs text-brand-muted">
              Last updated: {new Date(estimate.lastUpdated).toLocaleDateString()}
              {!isFresh && (
                <span className="ml-2 text-yellow-400 flex items-center gap-1 mt-1">
                  <AlertCircle size={12} />
                  Over 30 days old
                </span>
              )}
            </p>
          </div>

          {estimate.zestimate !== settings.property.currentMarketValue && (
            <button
              onClick={handleApplyToProperty}
              disabled={isUpdating}
              className="btn-secondary w-full text-sm mb-3 disabled:opacity-50"
            >
              <RefreshCw size={14} />
              {isUpdating ? 'Applying...' : 'Apply to Property Value'}
            </button>
          )}
        </>
      ) : (
        <div className="mb-4">
          <p className="text-sm text-brand-muted mb-2">No estimate available yet</p>
        </div>
      )}

      {/* Manual Update Form */}
      <div className="pt-4 border-t border-slate-700">
        <label className="block text-xs font-medium text-brand-light mb-2">
          Update Manually
        </label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-muted">$</span>
            <input
              type="text"
              value={manualValue}
              onChange={(e) => setManualValue(e.target.value)}
              placeholder="1,089,100"
              className="w-full pl-8 pr-4 py-2 bg-brand-dark border border-slate-700 rounded-lg text-brand-light text-sm focus:outline-none focus:border-brand-orange"
            />
          </div>
          <button
            onClick={handleManualUpdate}
            className="btn-primary text-sm px-4 whitespace-nowrap"
          >
            Update
          </button>
        </div>
        {message && (
          <p
            className={`text-xs mt-2 ${
              message.startsWith('✓') ? 'text-green-400' : 'text-red-400'
            }`}
          >
            {message}
          </p>
        )}
      </div>

      {/* Instructions */}
      <div className="mt-4 pt-4 border-t border-slate-700">
        <p className="text-xs text-brand-muted">
          💡 Click the external link icon to get the latest Zestimate from Zillow, then enter it above.
        </p>
      </div>
    </div>
  );
}
