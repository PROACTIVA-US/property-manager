import { TrendingUp } from 'lucide-react';
import { loadSettings, formatCurrency } from '../../lib/settings';

interface PortfolioValueKPIProps {
  onDrillDown?: () => void;
}

export default function PortfolioValueKPI({ onDrillDown }: PortfolioValueKPIProps) {
  const settings = loadSettings();
  const value = settings.property?.currentMarketValue || 0;
  const purchasePrice = settings.property?.purchasePrice || 0;
  const appreciation = value - purchasePrice;
  const appreciationPercent = purchasePrice > 0 ? ((appreciation / purchasePrice) * 100).toFixed(1) : '0';

  return (
    <button
      onClick={onDrillDown}
      className="card text-left cursor-pointer hover:border-cc-accent/50 transition-all w-full"
    >
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 rounded-lg bg-blue-500/20 text-blue-400">
          <TrendingUp size={20} />
        </div>
        <span className="text-sm text-cc-muted">Portfolio Value</span>
      </div>
      <p className="text-2xl font-bold text-cc-text">
        {formatCurrency(value, 0)}
      </p>
      <p className="text-xs text-cc-muted mt-1">
        <span className="text-green-400">+{appreciationPercent}%</span> since purchase
      </p>
    </button>
  );
}
