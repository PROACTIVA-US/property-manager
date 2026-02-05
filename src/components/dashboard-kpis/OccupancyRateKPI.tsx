import { Home } from 'lucide-react';

interface OccupancyRateKPIProps {
  onViewLeases?: () => void;
}

export default function OccupancyRateKPI({ onViewLeases }: OccupancyRateKPIProps) {
  // For MVP: hardcoded single property - always occupied if tenant exists
  const occupied = 1;
  const total = 1;
  const rate = Math.round((occupied / total) * 100);

  return (
    <button
      onClick={onViewLeases}
      className="card text-left cursor-pointer hover:border-cc-accent/50 transition-all w-full"
    >
      <div className="flex items-center gap-3 mb-2">
        <div className={`p-2 rounded-lg ${rate >= 100 ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
          <Home size={20} />
        </div>
        <span className="text-sm text-cc-muted">Occupancy Rate</span>
      </div>
      <p className="text-2xl font-bold text-cc-text">{rate}%</p>
      <p className="text-xs text-cc-muted mt-1">{occupied}/{total} units occupied</p>
    </button>
  );
}
