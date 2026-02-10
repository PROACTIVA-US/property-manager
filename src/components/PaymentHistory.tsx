import { useState } from 'react';
import {
  CreditCard,
  Check,
  Clock,
  AlertTriangle,
  Loader2,
  ChevronDown,
  ChevronUp,
  Receipt,
  ArrowLeft
} from 'lucide-react';
import {
  getPayments,
  getCurrentBalance,
  addPayment,
  formatCurrency,
  formatDate,
  formatShortDate,
  type Payment,
  type PaymentStatus
} from '../lib/tenant';

interface PaymentHistoryProps {
  onBack?: () => void;
  compact?: boolean;
}

export default function PaymentHistory({ onBack, compact = false }: PaymentHistoryProps) {
  const [payments, setPayments] = useState<Payment[]>(getPayments());
  const [showAll, setShowAll] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const balance = getCurrentBalance();
  const displayPayments = compact ? payments.slice(0, 3) : (showAll ? payments : payments.slice(0, 6));

  const getStatusIcon = (status: PaymentStatus) => {
    switch (status) {
      case 'paid':
        return <Check size={16} className="text-green-400" />;
      case 'pending':
        return <Clock size={16} className="text-indigo-300" />;
      case 'overdue':
        return <AlertTriangle size={16} className="text-red-400" />;
      case 'processing':
        return <Loader2 size={16} className="text-blue-400 animate-spin" />;
    }
  };

  const getStatusBadge = (status: PaymentStatus) => {
    const baseClasses = "text-xs font-bold px-2 py-0.5 rounded-full uppercase tracking-wide";
    switch (status) {
      case 'paid':
        return <span className={`${baseClasses} bg-green-500/20 text-green-400`}>Paid</span>;
      case 'pending':
        return <span className={`${baseClasses} bg-indigo-400/20 text-indigo-300`}>Pending</span>;
      case 'overdue':
        return <span className={`${baseClasses} bg-red-500/20 text-red-400`}>Overdue</span>;
      case 'processing':
        return <span className={`${baseClasses} bg-blue-500/20 text-blue-400`}>Processing</span>;
    }
  };

  const handlePayRent = async () => {
    setIsProcessing(true);

    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Generate confirmation number - crypto.randomUUID() is deterministic per-call
    const confirmationId = crypto.randomUUID().slice(0, 8).toUpperCase();
    const newPayment = addPayment({
      date: new Date().toISOString().slice(0, 10),
      amount: balance.amount,
      status: 'paid',
      method: 'Bank Transfer',
      confirmationNumber: `TXN-${confirmationId}`,
    });

    setPayments(getPayments());
    setIsProcessing(false);
    setShowConfirmation(true);

    // Auto-hide confirmation after 5 seconds
    setTimeout(() => setShowConfirmation(false), 5000);

    console.log('Payment processed:', newPayment);
  };

  if (compact) {
    return (
      <div className="space-y-3">
        <h4 className="text-sm font-bold text-cc-muted uppercase tracking-wider">Recent Payments</h4>
        {displayPayments.map((payment) => (
          <div key={payment.id} className="flex items-center justify-between py-2 border-b border-cc-border/50 last:border-0">
            <div className="flex items-center gap-3">
              {getStatusIcon(payment.status)}
              <span className="text-sm text-cc-text">{formatShortDate(payment.date)}</span>
            </div>
            <span className="text-sm font-medium text-cc-text">{formatCurrency(payment.amount)}</span>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      {onBack && (
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-cc-muted hover:text-cc-text transition-colors"
        >
          <ArrowLeft size={20} />
          <span>Back to Dashboard</span>
        </button>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-cc-text">Your Payments</h1>
          <p className="text-cc-muted mt-1">View payment history and make payments</p>
        </div>
      </div>

      {/* Payment Confirmation Toast */}
      {showConfirmation && (
        <div className="fixed top-4 right-4 bg-green-600 text-white px-6 py-4 rounded-lg shadow-xl flex items-center gap-3 animate-slide-in z-50">
          <Check size={24} />
          <div>
            <p className="font-bold">Payment Successful!</p>
            <p className="text-sm opacity-90">Your rent has been paid.</p>
          </div>
        </div>
      )}

      {/* Current Balance Card */}
      <div className={`card ${
        balance.status === 'paid' ? 'bg-gradient-to-br from-green-900/40 to-cc-surface border-green-500/30' :
        balance.status === 'overdue' ? 'bg-gradient-to-br from-red-900/40 to-cc-surface border-red-500/30' :
        'bg-gradient-to-br from-yellow-900/40 to-cc-surface border-yellow-500/30'
      }`}>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className={`p-3 rounded-xl ${
                balance.status === 'paid' ? 'bg-green-500/20 text-green-400' :
                balance.status === 'overdue' ? 'bg-red-500/20 text-red-400' :
                'bg-yellow-500/20 text-yellow-400'
              }`}>
                <CreditCard size={28} />
              </div>
              {getStatusBadge(balance.status)}
            </div>
            <p className="text-cc-muted text-sm font-medium uppercase tracking-wider">
              {balance.status === 'paid' ? 'Next Payment Due' : 'Current Balance Due'}
            </p>
            <h2 className="text-4xl font-bold text-cc-text mt-1">{formatCurrency(balance.amount)}</h2>
            <p className="text-cc-muted mt-2">Due: {formatDate(balance.dueDate)}</p>
          </div>

          <button
            onClick={handlePayRent}
            disabled={isProcessing || balance.status === 'paid'}
            className={`px-8 py-4 rounded-lg font-bold text-lg shadow-lg transition-all ${
              balance.status === 'paid'
                ? 'bg-cc-border text-slate-400 cursor-not-allowed'
                : isProcessing
                ? 'bg-blue-600 text-white cursor-wait'
                : 'bg-green-600 hover:bg-green-700 text-white shadow-green-900/50'
            }`}
          >
            {isProcessing ? (
              <span className="flex items-center gap-2">
                <Loader2 size={20} className="animate-spin" />
                Processing...
              </span>
            ) : balance.status === 'paid' ? (
              'Paid for This Month'
            ) : (
              'Pay Rent Now'
            )}
          </button>
        </div>
      </div>

      {/* Payment History */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-cc-text flex items-center gap-2">
            <Receipt size={20} className="text-cc-accent" />
            Payment History
          </h3>
        </div>

        <div className="space-y-3">
          {displayPayments.map((payment) => (
            <div
              key={payment.id}
              className="flex items-center justify-between p-4 bg-cc-bg/50 rounded-lg border border-cc-border/50 hover:border-cc-border transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className={`p-2 rounded-lg ${
                  payment.status === 'paid' ? 'bg-green-500/20' :
                  payment.status === 'overdue' ? 'bg-red-500/20' :
                  'bg-yellow-500/20'
                }`}>
                  {getStatusIcon(payment.status)}
                </div>
                <div>
                  <p className="font-medium text-cc-text">{formatDate(payment.date)}</p>
                  <p className="text-sm text-cc-muted">
                    {payment.method && `${payment.method} `}
                    {payment.confirmationNumber && `- ${payment.confirmationNumber}`}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-cc-text">{formatCurrency(payment.amount)}</p>
                {getStatusBadge(payment.status)}
              </div>
            </div>
          ))}
        </div>

        {payments.length > 6 && (
          <button
            onClick={() => setShowAll(!showAll)}
            className="w-full mt-4 flex items-center justify-center gap-2 py-3 text-cc-muted hover:text-cc-text transition-colors"
          >
            {showAll ? (
              <>
                <ChevronUp size={20} />
                Show Less
              </>
            ) : (
              <>
                <ChevronDown size={20} />
                Show All ({payments.length} payments)
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
