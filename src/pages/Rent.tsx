import { useState, useMemo } from 'react';
import { CreditCard, TrendingUp, AlertTriangle, CheckCircle, DollarSign, Calendar } from 'lucide-react';
import PaymentHistory from '../components/PaymentHistory';
import { getPayments, getLease, formatCurrency, type PaymentStatus } from '../lib/tenant';
import { loadSettings } from '../lib/settings';

export default function Rent() {
  const [activeTab, setActiveTab] = useState<'overview' | 'history'>('overview');

  const payments = getPayments();
  const lease = getLease();
  const settings = loadSettings();

  // Calculate collection stats
  const collectionStats = useMemo(() => {
    const currentMonth = new Date().toISOString().slice(0, 7);
    const currentMonthPayment = payments.find(p => p.date.startsWith(currentMonth));

    const totalDue = settings.rentalIncome?.monthlyRent || lease.monthlyRent || 3000;
    const collected = currentMonthPayment?.status === 'paid' ? totalDue : 0;
    const overdue = currentMonthPayment?.status === 'overdue' ? totalDue : 0;
    const pending = !currentMonthPayment || currentMonthPayment.status === 'pending' ? totalDue : 0;
    const rate = collected > 0 ? 100 : 0;

    return { totalDue, collected, overdue, pending, rate };
  }, [payments, lease, settings]);

  // Calculate YTD stats
  const ytdStats = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const yearPayments = payments.filter(p =>
      p.date.startsWith(String(currentYear)) && p.status === 'paid'
    );
    const totalCollected = yearPayments.reduce((sum, p) => sum + p.amount, 0);
    const monthsElapsed = new Date().getMonth() + 1;
    const expectedTotal = (settings.rentalIncome?.monthlyRent || lease.monthlyRent) * monthsElapsed;

    return {
      totalCollected,
      expectedTotal,
      collectionRate: expectedTotal > 0 ? Math.round((totalCollected / expectedTotal) * 100) : 0,
      paymentsCount: yearPayments.length,
    };
  }, [payments, lease, settings]);

  // Group payments by month for trend display
  const recentMonths = useMemo(() => {
    const months: { month: string; amount: number; status: PaymentStatus }[] = [];
    const now = new Date();

    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = date.toISOString().slice(0, 7);
      const payment = payments.find(p => p.date.startsWith(monthKey));

      months.push({
        month: date.toLocaleDateString('en-US', { month: 'short' }),
        amount: payment?.amount || 0,
        status: payment?.status || 'pending',
      });
    }

    return months;
  }, [payments]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-cc-text">Rent Collection</h1>
        <p className="text-cc-muted">Track payments, delinquencies, and trends</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-cc-border/50 pb-2">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 text-sm rounded-lg transition-colors ${
            activeTab === 'overview'
              ? 'bg-cc-accent text-white'
              : 'text-cc-muted hover:text-cc-text'
          }`}
        >
          Overview
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`px-4 py-2 text-sm rounded-lg transition-colors ${
            activeTab === 'history'
              ? 'bg-cc-accent text-white'
              : 'text-cc-muted hover:text-cc-text'
          }`}
        >
          Payment History
        </button>
      </div>

      {activeTab === 'overview' ? (
        <>
          {/* Current Month Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="card">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign size={16} className="text-cc-muted" />
                <p className="text-xs text-cc-muted uppercase">Monthly Rent</p>
              </div>
              <p className="text-2xl font-bold text-cc-text">
                {formatCurrency(collectionStats.totalDue)}
              </p>
            </div>
            <div className="card">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle size={16} className="text-green-400" />
                <p className="text-xs text-cc-muted uppercase">Collected</p>
              </div>
              <p className="text-2xl font-bold text-green-400">
                {formatCurrency(collectionStats.collected)}
              </p>
            </div>
            <div className="card">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle size={16} className="text-red-400" />
                <p className="text-xs text-cc-muted uppercase">Overdue</p>
              </div>
              <p className="text-2xl font-bold text-red-400">
                {formatCurrency(collectionStats.overdue)}
              </p>
            </div>
            <div className="card">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp size={16} className="text-cc-accent" />
                <p className="text-xs text-cc-muted uppercase">Collection Rate</p>
              </div>
              <p className="text-2xl font-bold text-cc-text">{collectionStats.rate}%</p>
            </div>
          </div>

          {/* YTD Summary */}
          <div className="card">
            <h2 className="font-semibold text-cc-text mb-4 flex items-center gap-2">
              <Calendar size={18} className="text-cc-accent" />
              Year-to-Date Summary
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-xs text-cc-muted uppercase mb-1">Total Collected</p>
                <p className="text-lg font-bold text-green-400">
                  {formatCurrency(ytdStats.totalCollected)}
                </p>
              </div>
              <div>
                <p className="text-xs text-cc-muted uppercase mb-1">Expected YTD</p>
                <p className="text-lg font-bold text-cc-text">
                  {formatCurrency(ytdStats.expectedTotal)}
                </p>
              </div>
              <div>
                <p className="text-xs text-cc-muted uppercase mb-1">Collection Rate</p>
                <p className={`text-lg font-bold ${ytdStats.collectionRate >= 95 ? 'text-green-400' : ytdStats.collectionRate >= 80 ? 'text-yellow-400' : 'text-red-400'}`}>
                  {ytdStats.collectionRate}%
                </p>
              </div>
              <div>
                <p className="text-xs text-cc-muted uppercase mb-1">Payments Made</p>
                <p className="text-lg font-bold text-cc-text">{ytdStats.paymentsCount}</p>
              </div>
            </div>
          </div>

          {/* Payment Trend */}
          <div className="card">
            <h2 className="font-semibold text-cc-text mb-4">6-Month Payment Trend</h2>
            <div className="flex items-end gap-2 h-32">
              {recentMonths.map((month, i) => {
                const maxAmount = Math.max(...recentMonths.map(m => m.amount), collectionStats.totalDue);
                const height = month.amount > 0 ? (month.amount / maxAmount) * 100 : 5;

                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-2">
                    <div
                      className={`w-full rounded-t transition-all ${
                        month.status === 'paid'
                          ? 'bg-green-500'
                          : month.status === 'overdue'
                          ? 'bg-red-500'
                          : 'bg-cc-border'
                      }`}
                      style={{ height: `${height}%` }}
                    />
                    <span className="text-xs text-cc-muted">{month.month}</span>
                  </div>
                );
              })}
            </div>
            <div className="flex items-center gap-4 mt-4 text-xs text-cc-muted">
              <span className="flex items-center gap-1">
                <div className="w-3 h-3 rounded bg-green-500" /> Paid
              </span>
              <span className="flex items-center gap-1">
                <div className="w-3 h-3 rounded bg-red-500" /> Overdue
              </span>
              <span className="flex items-center gap-1">
                <div className="w-3 h-3 rounded bg-cc-border" /> Pending
              </span>
            </div>
          </div>

          {/* Tenant Info */}
          <div className="card">
            <h2 className="font-semibold text-cc-text mb-4 flex items-center gap-2">
              <CreditCard size={18} className="text-cc-accent" />
              Tenant Payment Info
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-cc-muted uppercase mb-1">Tenant</p>
                <p className="text-sm font-medium text-cc-text">{settings.tenant?.name || 'Gregg Marshall'}</p>
              </div>
              <div>
                <p className="text-xs text-cc-muted uppercase mb-1">Monthly Rent</p>
                <p className="text-sm font-medium text-cc-text">{formatCurrency(lease.monthlyRent)}</p>
              </div>
              <div>
                <p className="text-xs text-cc-muted uppercase mb-1">Lease End</p>
                <p className="text-sm font-medium text-cc-text">
                  {new Date(lease.endDate).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-xs text-cc-muted uppercase mb-1">Security Deposit</p>
                <p className="text-sm font-medium text-cc-text">{formatCurrency(lease.securityDeposit)}</p>
              </div>
            </div>
          </div>
        </>
      ) : (
        <PaymentHistory />
      )}
    </div>
  );
}
