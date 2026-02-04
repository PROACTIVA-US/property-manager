import { useState, useEffect, useMemo } from 'react';
import {
  Zap,
  Plus,
  AlertTriangle,
  Check,
  Clock,
  X,
  ChevronDown,
  ChevronUp,
  TrendingUp,
  TrendingDown,
  Minus,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import {
  addUtilityBill,
  updateUtilityBill,
  getUtilityBills,
  checkUtilityOverages,
  loadSettings,
  formatCurrency,
  type UtilityBill,
  type UtilityOverageAlert
} from '../lib/settings';
import { createUtilityOverageNotification } from '../lib/messages';

interface UtilityTrackingProps {
  onBack?: () => void;
}

export default function UtilityTracking({ onBack }: UtilityTrackingProps) {
  const [bills, setBills] = useState<UtilityBill[]>([]);
  const [overages, setOverages] = useState<UtilityOverageAlert[]>([]);
  const [statedAmount, setStatedAmount] = useState(0);
  const [showAddForm, setShowAddForm] = useState(false);
  const [expandedBill, setExpandedBill] = useState<string | null>(null);

  // Form state
  const [newBillMonth, setNewBillMonth] = useState(
    new Date().toISOString().slice(0, 7) // YYYY-MM
  );
  const [newBillAmount, setNewBillAmount] = useState('');
  const [newBillNotes, setNewBillNotes] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const settings = loadSettings();
    setBills(getUtilityBills());
    setOverages(checkUtilityOverages());
    setStatedAmount(settings.rentalIncome.monthlyUtilities);
  };

  const handleAddBill = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(newBillAmount);
    if (isNaN(amount) || amount <= 0) return;

    addUtilityBill({
      month: newBillMonth,
      amount,
      status: 'pending',
      notes: newBillNotes || undefined,
    });

    // Create notification if bill exceeds stated amount
    const settings = loadSettings();
    const threshold = settings.utilitiesTracking.overageThreshold || 0;
    if (amount > statedAmount + threshold) {
      createUtilityOverageNotification(newBillMonth, amount, statedAmount);
    }

    // Reset form
    setNewBillAmount('');
    setNewBillNotes('');
    setShowAddForm(false);
    loadData();
  };

  const handleMarkPaid = (billId: string) => {
    updateUtilityBill(billId, {
      status: 'paid',
      paidDate: new Date().toISOString().slice(0, 10),
    });
    loadData();
  };

  const getStatusIcon = (status: UtilityBill['status']) => {
    switch (status) {
      case 'paid':
        return <Check className="text-green-400" size={16} />;
      case 'pending':
        return <Clock className="text-yellow-400" size={16} />;
      case 'overdue':
        return <AlertTriangle className="text-red-400" size={16} />;
    }
  };

  const getStatusColor = (status: UtilityBill['status']) => {
    switch (status) {
      case 'paid':
        return 'bg-green-500/20 text-green-400';
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-400';
      case 'overdue':
        return 'bg-red-500/20 text-red-400';
    }
  };

  const formatMonth = (month: string) => {
    const [year, monthNum] = month.split('-');
    const date = new Date(parseInt(year), parseInt(monthNum) - 1);
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  const formatMonthShort = (month: string) => {
    const [year, monthNum] = month.split('-');
    const date = new Date(parseInt(year), parseInt(monthNum) - 1);
    return date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
  };

  // Prepare chart data - sort bills by month and calculate trends
  const chartData = useMemo(() => {
    if (bills.length === 0) return [];

    // Sort bills by month ascending
    const sortedBills = [...bills].sort((a, b) => a.month.localeCompare(b.month));

    return sortedBills.map(bill => ({
      month: bill.month,
      monthLabel: formatMonthShort(bill.month),
      amount: bill.amount,
      stated: statedAmount,
      overage: Math.max(0, bill.amount - statedAmount),
    }));
  }, [bills, statedAmount]);

  // Calculate trend
  const trend = useMemo(() => {
    if (bills.length < 2) return { direction: 'flat' as const, percentage: 0 };

    const sortedBills = [...bills].sort((a, b) => a.month.localeCompare(b.month));
    const recent = sortedBills.slice(-3);
    const older = sortedBills.slice(0, -3);

    if (older.length === 0) return { direction: 'flat' as const, percentage: 0 };

    const recentAvg = recent.reduce((sum, b) => sum + b.amount, 0) / recent.length;
    const olderAvg = older.reduce((sum, b) => sum + b.amount, 0) / older.length;

    const change = ((recentAvg - olderAvg) / olderAvg) * 100;

    return {
      direction: change > 5 ? 'up' as const : change < -5 ? 'down' as const : 'flat' as const,
      percentage: Math.abs(change),
    };
  }, [bills]);

  const TrendIcon = trend.direction === 'up' ? TrendingUp : trend.direction === 'down' ? TrendingDown : Minus;
  const trendColor = trend.direction === 'up' ? 'text-red-400' : trend.direction === 'down' ? 'text-green-400' : 'text-cc-muted';

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              onClick={onBack}
              className="p-2 hover:bg-cc-surface rounded-lg transition-colors"
            >
              <X size={20} className="text-cc-muted" />
            </button>
          )}
          <div className="p-2 bg-yellow-500/20 rounded-lg">
            <Zap className="text-yellow-400" size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-cc-text">Utility Bill Tracking</h2>
            <p className="text-sm text-cc-muted">
              Track actual utility costs vs stated amount ({formatCurrency(statedAmount)}/mo)
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={18} />
          Add Bill
        </button>
      </div>

      {/* Overage Alerts */}
      {overages.length > 0 && (
        <div className="p-4 bg-red-500/20 border border-red-500/30 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertTriangle className="text-red-400 flex-shrink-0 mt-0.5" size={20} />
            <div>
              <h3 className="font-bold text-red-400">Utility Overage Alert</h3>
              <p className="text-sm text-cc-muted mt-1">
                {overages.length} bill(s) exceed the stated utility amount. Consider adjusting the monthly utility amount or discussing with the tenant.
              </p>
              <div className="mt-3 space-y-2">
                {overages.map(overage => (
                  <div key={overage.bill.id} className="text-sm">
                    <span className="text-cc-text">{formatMonth(overage.bill.month)}:</span>
                    <span className="text-red-400 ml-2">
                      {formatCurrency(overage.bill.amount)} (overage: +{formatCurrency(overage.overage)})
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Historical Trend Chart */}
      {chartData.length >= 2 && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-cc-text">Utility Cost Trend</h3>
            <div className={`flex items-center gap-2 ${trendColor}`}>
              <TrendIcon size={18} />
              <span className="text-sm font-medium">
                {trend.direction === 'flat'
                  ? 'Stable'
                  : `${trend.direction === 'up' ? 'Up' : 'Down'} ${trend.percentage.toFixed(1)}%`}
              </span>
            </div>
          </div>
          <div className="h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#eab308" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#eab308" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis
                  dataKey="monthLabel"
                  stroke="#94a3b8"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#94a3b8"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(val) => `$${val}`}
                />
                <Tooltip
                  formatter={(value: number, name: string) => [formatCurrency(value), name === 'amount' ? 'Actual' : name]}
                  labelFormatter={(label) => `Month: ${label}`}
                  contentStyle={{
                    backgroundColor: '#1a1a2e',
                    borderRadius: '8px',
                    border: '1px solid #334155',
                    color: '#fff',
                  }}
                />
                <ReferenceLine
                  y={statedAmount}
                  stroke="#22c55e"
                  strokeDasharray="5 5"
                  label={{
                    value: `Stated: ${formatCurrency(statedAmount)}`,
                    position: 'right',
                    fill: '#22c55e',
                    fontSize: 11,
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="amount"
                  stroke="#eab308"
                  strokeWidth={2}
                  fill="url(#colorAmount)"
                  name="Actual"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <p className="text-xs text-cc-muted mt-2 text-center">
            Green dashed line shows the stated utility amount ({formatCurrency(statedAmount)}/mo)
          </p>
        </div>
      )}

      {/* Add Bill Form */}
      {showAddForm && (
        <form onSubmit={handleAddBill} className="card space-y-4">
          <h3 className="font-bold text-cc-text">Add Utility Bill</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-cc-text mb-2">
                Month
              </label>
              <input
                type="month"
                value={newBillMonth}
                onChange={(e) => setNewBillMonth(e.target.value)}
                className="w-full px-4 py-2 bg-cc-bg border border-cc-border rounded-lg text-cc-text focus:outline-none focus:border-cc-accent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-cc-text mb-2">
                Amount
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-cc-muted">$</span>
                <input
                  type="number"
                  value={newBillAmount}
                  onChange={(e) => setNewBillAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full pl-8 pr-4 py-2 bg-cc-bg border border-cc-border rounded-lg text-cc-text focus:outline-none focus:border-cc-accent"
                  required
                  min="0"
                  step="0.01"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-cc-text mb-2">
                Notes (optional)
              </label>
              <input
                type="text"
                value={newBillNotes}
                onChange={(e) => setNewBillNotes(e.target.value)}
                placeholder="e.g., Higher due to heat wave"
                className="w-full px-4 py-2 bg-cc-bg border border-cc-border rounded-lg text-cc-text focus:outline-none focus:border-cc-accent"
              />
            </div>
          </div>
          <div className="flex gap-3">
            <button type="submit" className="btn-primary">
              Add Bill
            </button>
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="btn-secondary"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Bills List */}
      <div className="card">
        <h3 className="font-bold text-cc-text mb-4">Utility Bills</h3>
        {bills.length === 0 ? (
          <p className="text-cc-muted text-center py-8">
            No utility bills recorded yet. Click "Add Bill" to start tracking.
          </p>
        ) : (
          <div className="space-y-3">
            {bills.map((bill) => {
              const isOverage = bill.amount > statedAmount;
              const isExpanded = expandedBill === bill.id;

              return (
                <div
                  key={bill.id}
                  className={`border rounded-lg overflow-hidden ${
                    isOverage ? 'border-yellow-500/30' : 'border-cc-border/50'
                  }`}
                >
                  <div
                    onClick={() => setExpandedBill(isExpanded ? null : bill.id)}
                    className="flex items-center justify-between p-4 cursor-pointer hover:bg-cc-surface/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-lg ${getStatusColor(bill.status)}`}>
                        {getStatusIcon(bill.status)}
                      </div>
                      <div>
                        <p className="font-medium text-cc-text">{formatMonth(bill.month)}</p>
                        <p className="text-xs text-cc-muted capitalize">{bill.status}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className={`font-bold ${isOverage ? 'text-yellow-400' : 'text-cc-text'}`}>
                          {formatCurrency(bill.amount)}
                        </p>
                        {isOverage && (
                          <p className="text-xs text-yellow-400">
                            +{formatCurrency(bill.amount - statedAmount)} over
                          </p>
                        )}
                      </div>
                      {isExpanded ? (
                        <ChevronUp size={20} className="text-cc-muted" />
                      ) : (
                        <ChevronDown size={20} className="text-cc-muted" />
                      )}
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="px-4 pb-4 pt-2 border-t border-cc-border/50 bg-cc-bg/30">
                      <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                        <div>
                          <p className="text-cc-muted">Stated Amount</p>
                          <p className="text-cc-text">{formatCurrency(statedAmount)}</p>
                        </div>
                        <div>
                          <p className="text-cc-muted">Difference</p>
                          <p className={bill.amount > statedAmount ? 'text-yellow-400' : 'text-green-400'}>
                            {bill.amount > statedAmount ? '+' : ''}{formatCurrency(bill.amount - statedAmount)}
                          </p>
                        </div>
                        {bill.paidDate && (
                          <div>
                            <p className="text-cc-muted">Paid Date</p>
                            <p className="text-cc-text">
                              {new Date(bill.paidDate).toLocaleDateString()}
                            </p>
                          </div>
                        )}
                        {bill.notes && (
                          <div className="col-span-2">
                            <p className="text-cc-muted">Notes</p>
                            <p className="text-cc-text">{bill.notes}</p>
                          </div>
                        )}
                      </div>
                      {bill.status !== 'paid' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMarkPaid(bill.id);
                          }}
                          className="btn-secondary text-sm flex items-center gap-2"
                        >
                          <Check size={16} />
                          Mark as Paid
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Summary */}
      <div className="card bg-cc-bg/30">
        <h4 className="text-sm font-bold text-cc-muted uppercase tracking-wider mb-3">Summary</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <p className="text-cc-muted">Stated Monthly</p>
            <p className="text-cc-text font-medium">{formatCurrency(statedAmount)}</p>
          </div>
          <div>
            <p className="text-cc-muted">Avg Actual</p>
            <p className="text-cc-text font-medium">
              {bills.length > 0
                ? formatCurrency(bills.reduce((sum, b) => sum + b.amount, 0) / bills.length)
                : '-'}
            </p>
          </div>
          <div>
            <p className="text-cc-muted">Total Bills</p>
            <p className="text-cc-text font-medium">{bills.length}</p>
          </div>
          <div>
            <p className="text-cc-muted">Unpaid</p>
            <p className={`font-medium ${bills.filter(b => b.status !== 'paid').length > 0 ? 'text-yellow-400' : 'text-green-400'}`}>
              {bills.filter(b => b.status !== 'paid').length}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
