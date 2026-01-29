import { useState } from 'react';
import {
  FileText,
  Calendar,
  DollarSign,
  Home,
  Check,
  AlertCircle,
  ArrowLeft,
  Download,
  RefreshCw,
  Clock
} from 'lucide-react';
import {
  getLease,
  updateLeaseRenewalInterest,
  getDaysUntilLeaseEnd,
  formatCurrency,
  formatDate,
  type Lease
} from '../lib/tenant';

interface LeaseDetailsProps {
  onBack?: () => void;
}

export default function LeaseDetails({ onBack }: LeaseDetailsProps) {
  const [lease, setLease] = useState<Lease>(getLease());
  const [showRenewalConfirm, setShowRenewalConfirm] = useState(false);

  const daysUntilEnd = getDaysUntilLeaseEnd();
  const isExpiringSoon = daysUntilEnd <= 60 && daysUntilEnd > 0;
  const isExpired = daysUntilEnd <= 0;

  const handleRenewalInterest = (interested: boolean) => {
    const updatedLease = updateLeaseRenewalInterest(interested);
    setLease(updatedLease);
    setShowRenewalConfirm(true);
    setTimeout(() => setShowRenewalConfirm(false), 4000);
    console.log('Renewal interest expressed:', interested);
  };

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
          <h1 className="text-2xl font-bold text-cc-text">Lease Details</h1>
          <p className="text-cc-muted mt-1">View your lease information and documents</p>
        </div>
      </div>

      {/* Confirmation Toast */}
      {showRenewalConfirm && (
        <div className="fixed top-4 right-4 bg-green-600 text-white px-6 py-4 rounded-lg shadow-xl flex items-center gap-3 z-50">
          <Check size={24} />
          <div>
            <p className="font-bold">Interest Recorded!</p>
            <p className="text-sm opacity-90">Property management has been notified.</p>
          </div>
        </div>
      )}

      {/* Lease Status Banner */}
      {(isExpiringSoon || isExpired) && (
        <div className={`p-4 rounded-lg flex items-start gap-3 ${
          isExpired
            ? 'bg-red-500/20 border border-red-500/30'
            : 'bg-yellow-500/20 border border-yellow-500/30'
        }`}>
          <AlertCircle className={isExpired ? 'text-red-400' : 'text-yellow-400'} size={20} />
          <div>
            <p className={`font-bold ${isExpired ? 'text-red-400' : 'text-yellow-400'}`}>
              {isExpired ? 'Lease Has Expired' : 'Lease Expiring Soon'}
            </p>
            <p className="text-sm text-cc-muted mt-1">
              {isExpired
                ? 'Your lease has expired. Please contact property management about renewal or move-out procedures.'
                : `Your lease expires in ${daysUntilEnd} days. Consider expressing your renewal interest below.`
              }
            </p>
          </div>
        </div>
      )}

      {/* Property Info Card */}
      <div className="card">
        <div className="flex items-start gap-4 mb-6">
          <div className="p-3 bg-purple-500/20 rounded-xl text-purple-400">
            <Home size={28} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-cc-text">{lease.propertyAddress}</h2>
            <p className="text-cc-muted">{lease.unitNumber}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Lease Duration */}
          <div className="p-4 bg-cc-bg/50 rounded-lg border border-cc-border/50">
            <div className="flex items-center gap-2 text-cc-muted mb-2">
              <Calendar size={16} />
              <span className="text-xs font-bold uppercase tracking-wider">Lease Period</span>
            </div>
            <p className="text-cc-text font-medium">
              {formatDate(lease.startDate)} - {formatDate(lease.endDate)}
            </p>
            <p className="text-sm text-cc-muted mt-1">
              {daysUntilEnd > 0 ? `${daysUntilEnd} days remaining` : 'Lease has ended'}
            </p>
          </div>

          {/* Monthly Rent */}
          <div className="p-4 bg-cc-bg/50 rounded-lg border border-cc-border/50">
            <div className="flex items-center gap-2 text-cc-muted mb-2">
              <DollarSign size={16} />
              <span className="text-xs font-bold uppercase tracking-wider">Monthly Rent</span>
            </div>
            <p className="text-2xl font-bold text-cc-text">{formatCurrency(lease.monthlyRent)}</p>
            <p className="text-sm text-cc-muted mt-1">Due on the 1st of each month</p>
          </div>

          {/* Security Deposit */}
          <div className="p-4 bg-cc-bg/50 rounded-lg border border-cc-border/50">
            <div className="flex items-center gap-2 text-cc-muted mb-2">
              <DollarSign size={16} />
              <span className="text-xs font-bold uppercase tracking-wider">Security Deposit</span>
            </div>
            <p className="text-2xl font-bold text-cc-text">{formatCurrency(lease.securityDeposit)}</p>
            <p className="text-sm text-cc-muted mt-1">Held in escrow</p>
          </div>
        </div>
      </div>

      {/* Lease Terms */}
      <div className="card">
        <h3 className="text-lg font-bold text-cc-text mb-4 flex items-center gap-2">
          <FileText size={20} className="text-cc-accent" />
          Lease Terms & Rules
        </h3>
        <ul className="space-y-3">
          {lease.terms.map((term, index) => (
            <li key={index} className="flex items-start gap-3 p-3 bg-cc-bg/30 rounded-lg">
              <Check size={18} className="text-green-400 mt-0.5 flex-shrink-0" />
              <span className="text-cc-text">{term}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Lease Document */}
      <div className="card">
        <h3 className="text-lg font-bold text-cc-text mb-4 flex items-center gap-2">
          <FileText size={20} className="text-cc-accent" />
          Lease Document
        </h3>
        <div className="flex items-center justify-between p-4 bg-cc-bg/50 rounded-lg border border-cc-border/50">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-500/20 rounded-lg text-blue-400">
              <FileText size={24} />
            </div>
            <div>
              <p className="font-medium text-cc-text">Residential Lease Agreement</p>
              <p className="text-sm text-cc-muted">Signed {formatDate(lease.startDate)}</p>
            </div>
          </div>
          <button className="btn-secondary flex items-center gap-2">
            <Download size={18} />
            Download PDF
          </button>
        </div>
      </div>

      {/* Lease Renewal Section */}
      {lease.renewalEligible && (
        <div className="card bg-gradient-to-br from-purple-900/30 to-cc-surface border-purple-500/30">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-purple-500/20 rounded-xl text-purple-400">
              <RefreshCw size={28} />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-cc-text">Lease Renewal</h3>
              <p className="text-cc-muted mt-1">
                You are eligible for lease renewal. Express your interest below and property management will contact you with renewal terms.
              </p>

              {lease.renewalInterestExpressed ? (
                <div className="mt-4 p-4 bg-green-500/20 rounded-lg border border-green-500/30">
                  <div className="flex items-center gap-2 text-green-400">
                    <Check size={20} />
                    <span className="font-bold">Renewal Interest Recorded</span>
                  </div>
                  <p className="text-sm text-cc-muted mt-1">
                    Property management has been notified of your interest. They will contact you soon with renewal terms.
                  </p>
                  <button
                    onClick={() => handleRenewalInterest(false)}
                    className="mt-3 text-sm text-cc-muted hover:text-cc-text transition-colors"
                  >
                    Changed your mind? Click here to withdraw interest.
                  </button>
                </div>
              ) : (
                <div className="mt-4 flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => handleRenewalInterest(true)}
                    className="btn-primary flex items-center justify-center gap-2"
                  >
                    <RefreshCw size={18} />
                    I'm Interested in Renewing
                  </button>
                  <button
                    onClick={() => console.log('Not renewing - would show move-out info')}
                    className="btn-secondary flex items-center justify-center gap-2"
                  >
                    <Clock size={18} />
                    I'm Planning to Move Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
