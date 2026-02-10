import { useState } from 'react';
import { FileText, Calendar, DollarSign, AlertCircle, CheckCircle, Users, Clock, Edit2 } from 'lucide-react';
import { getLease, formatCurrency, getDaysUntilLeaseEnd, updateLeaseRenewalInterest, type Lease } from '../lib/tenant';
import { loadSettings } from '../lib/settings';

export default function Leases() {
  const [lease, setLease] = useState<Lease>(getLease());
  const settings = loadSettings();
  const daysUntilEnd = getDaysUntilLeaseEnd();

  const handleRenewalInterest = (interested: boolean) => {
    const updated = updateLeaseRenewalInterest(interested);
    setLease(updated);
  };

  const getLeaseStatus = () => {
    if (daysUntilEnd <= 0) return { label: 'Expired', color: 'text-red-400', bg: 'bg-red-500/20' };
    if (daysUntilEnd <= 30) return { label: 'Expiring Soon', color: 'text-yellow-400', bg: 'bg-yellow-500/20' };
    if (daysUntilEnd <= 90) return { label: 'Renewal Window', color: 'text-blue-400', bg: 'bg-blue-500/20' };
    return { label: 'Active', color: 'text-green-400', bg: 'bg-green-500/20' };
  };

  const status = getLeaseStatus();
  const leaseProgress = Math.max(0, Math.min(100,
    ((new Date().getTime() - new Date(lease.startDate).getTime()) /
    (new Date(lease.endDate).getTime() - new Date(lease.startDate).getTime())) * 100
  ));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-cc-text">Property Leases</h1>
        <p className="text-cc-muted">Manage active leases and renewals</p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle size={16} className="text-green-400" />
            <p className="text-xs text-cc-muted uppercase">Active Leases</p>
          </div>
          <p className="text-2xl font-bold text-cc-text">1</p>
        </div>
        <div className="card">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle size={16} className="text-yellow-400" />
            <p className="text-xs text-cc-muted uppercase">Expiring Soon</p>
          </div>
          <p className="text-2xl font-bold text-yellow-400">{daysUntilEnd <= 90 ? 1 : 0}</p>
        </div>
        <div className="card">
          <div className="flex items-center gap-2 mb-2">
            <Clock size={16} className="text-cc-accent" />
            <p className="text-xs text-cc-muted uppercase">Days Remaining</p>
          </div>
          <p className={`text-2xl font-bold ${daysUntilEnd <= 30 ? 'text-yellow-400' : 'text-cc-text'}`}>
            {Math.max(0, daysUntilEnd)}
          </p>
        </div>
      </div>

      {/* Main Lease Card */}
      <div className="card">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-cc-accent/20 rounded-lg text-cc-accent">
              <FileText size={28} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-cc-text">Current Lease Agreement</h2>
              <p className="text-sm text-cc-muted">{settings.property?.address || lease.propertyAddress}</p>
            </div>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${status.bg} ${status.color}`}>
            {status.label}
          </span>
        </div>

        {/* Lease Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between text-xs text-cc-muted mb-2">
            <span>Start: {new Date(lease.startDate).toLocaleDateString()}</span>
            <span>End: {new Date(lease.endDate).toLocaleDateString()}</span>
          </div>
          <div className="h-2 bg-cc-border rounded-full overflow-hidden">
            <div
              className="h-full bg-cc-accent transition-all"
              style={{ width: `${leaseProgress}%` }}
            />
          </div>
          <p className="text-xs text-cc-muted text-center mt-2">
            {Math.round(leaseProgress)}% complete
          </p>
        </div>

        {/* Tenant & Financial Info */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Tenant Section */}
          <div className="space-y-4">
            <h3 className="font-semibold text-cc-text flex items-center gap-2">
              <Users size={16} className="text-cc-accent" />
              Tenant Information
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-cc-border/50">
                <span className="text-cc-muted text-sm">Name</span>
                <span className="text-cc-text font-medium">{settings.tenant?.name || 'Gregg Marshall'}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-cc-border/50">
                <span className="text-cc-muted text-sm">Email</span>
                <span className="text-cc-text font-medium">{settings.tenant?.email || 'gregg@email.com'}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-cc-border/50">
                <span className="text-cc-muted text-sm">Phone</span>
                <span className="text-cc-text font-medium">{settings.tenant?.phone || '(555) 123-4567'}</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-cc-muted text-sm">Move-in Date</span>
                <span className="text-cc-text font-medium">
                  {new Date(settings.tenant?.moveInDate || lease.startDate).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          {/* Financial Section */}
          <div className="space-y-4">
            <h3 className="font-semibold text-cc-text flex items-center gap-2">
              <DollarSign size={16} className="text-cc-accent" />
              Financial Terms
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-cc-border/50">
                <span className="text-cc-muted text-sm">Monthly Rent</span>
                <span className="text-green-400 font-bold">{formatCurrency(lease.monthlyRent)}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-cc-border/50">
                <span className="text-cc-muted text-sm">Utilities</span>
                <span className="text-cc-text font-medium">
                  {lease.utilitiesPaidByOwner ? `${formatCurrency(lease.monthlyUtilities)} (reimburse)` : 'Tenant pays direct'}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-cc-border/50">
                <span className="text-cc-muted text-sm">Security Deposit</span>
                <span className="text-cc-text font-medium">{formatCurrency(lease.securityDeposit)}</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-cc-muted text-sm">Annual Value</span>
                <span className="text-cc-text font-bold">{formatCurrency(lease.monthlyRent * 12)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Lease Terms */}
        <div className="mt-6 pt-6 border-t border-cc-border">
          <h3 className="font-semibold text-cc-text mb-4">Lease Terms</h3>
          <ul className="space-y-2">
            {lease.terms.map((term, index) => (
              <li key={index} className="flex items-start gap-2 text-sm">
                <CheckCircle size={14} className="text-green-400 mt-0.5 shrink-0" />
                <span className="text-cc-muted">{term}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Renewal Section */}
        {lease.renewalEligible && daysUntilEnd <= 120 && (
          <div className="mt-6 pt-6 border-t border-cc-border">
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Calendar size={20} className="text-blue-400 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-semibold text-blue-400">Lease Renewal</h4>
                  <p className="text-sm text-cc-muted mt-1">
                    This lease is eligible for renewal. The tenant has {daysUntilEnd} days remaining.
                  </p>
                  <div className="mt-3">
                    {lease.renewalInterestExpressed === undefined ? (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleRenewalInterest(true)}
                          className="btn-primary text-sm"
                        >
                          Mark Interested in Renewal
                        </button>
                        <button
                          onClick={() => handleRenewalInterest(false)}
                          className="btn-secondary text-sm"
                        >
                          Not Renewing
                        </button>
                      </div>
                    ) : (
                      <p className={`text-sm font-medium ${lease.renewalInterestExpressed ? 'text-green-400' : 'text-yellow-400'}`}>
                        {lease.renewalInterestExpressed
                          ? '✓ Tenant has expressed interest in renewal'
                          : '✗ Tenant does not plan to renew'
                        }
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="mt-6 pt-6 border-t border-cc-border flex gap-3">
          <button className="btn-secondary flex items-center gap-2">
            <FileText size={16} />
            View Document
          </button>
          <button className="btn-secondary flex items-center gap-2">
            <Edit2 size={16} />
            Edit Lease
          </button>
        </div>
      </div>
    </div>
  );
}
