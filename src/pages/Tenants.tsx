import { useState } from 'react';
import { Users, Mail, Phone, Calendar, DollarSign, Wrench, MessageSquare } from 'lucide-react';
import { loadSettings } from '../lib/settings';
import { getPayments, getLease, getMaintenanceRequests } from '../lib/tenant';
import type { Payment, MaintenanceRequest } from '../lib/tenant';

type TabId = 'overview' | 'payments' | 'maintenance' | 'lease';

interface Tab {
  id: TabId;
  label: string;
  icon: typeof Users;
}

const tabs: Tab[] = [
  { id: 'overview', label: 'Overview', icon: Users },
  { id: 'payments', label: 'Payments', icon: DollarSign },
  { id: 'maintenance', label: 'Maintenance', icon: Wrench },
  { id: 'lease', label: 'Lease Details', icon: Calendar },
];

export default function Tenants() {
  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const settings = loadSettings();
  const tenant = settings.tenant;
  const payments = getPayments();
  const lease = getLease();
  const maintenanceRequests = getMaintenanceRequests();

  const daysUntilLeaseEnd = Math.ceil(
    (new Date(tenant.leaseEndDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  );

  const getStatusColor = (status: Payment['status']) => {
    switch (status) {
      case 'paid': return 'text-green-400';
      case 'pending': return 'text-yellow-400';
      case 'overdue': return 'text-red-400';
      case 'processing': return 'text-blue-400';
      default: return 'text-brand-muted';
    }
  };

  const getMaintenanceStatusColor = (status: MaintenanceRequest['status']) => {
    switch (status) {
      case 'completed': return 'bg-green-500/20 text-green-400';
      case 'in_progress': return 'bg-blue-500/20 text-blue-400';
      case 'scheduled': return 'bg-purple-500/20 text-purple-400';
      case 'submitted': return 'bg-yellow-500/20 text-yellow-400';
      case 'cancelled': return 'bg-slate-500/20 text-slate-400';
      default: return 'bg-slate-500/20 text-slate-400';
    }
  };

  const getUrgencyColor = (urgency: MaintenanceRequest['urgency']) => {
    switch (urgency) {
      case 'emergency': return 'text-red-400';
      case 'high': return 'text-orange-400';
      case 'medium': return 'text-yellow-400';
      case 'low': return 'text-green-400';
      default: return 'text-brand-muted';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 bg-brand-orange/20 rounded-lg">
          <Users className="text-brand-orange" size={28} />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-brand-light">Tenant Management</h1>
          <p className="text-brand-muted mt-1">
            View and manage current tenant information
          </p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card p-4">
          <div className="text-sm text-brand-muted mb-1">Current Tenant</div>
          <div className="text-xl font-bold text-brand-light">{tenant.name}</div>
        </div>
        <div className="card p-4">
          <div className="text-sm text-brand-muted mb-1">Monthly Rent</div>
          <div className="text-xl font-bold text-brand-light">
            ${tenant.monthlyRent.toLocaleString()}
          </div>
        </div>
        <div className="card p-4">
          <div className="text-sm text-brand-muted mb-1">Lease Expires</div>
          <div className="text-xl font-bold text-brand-light">
            {daysUntilLeaseEnd > 0 ? `${daysUntilLeaseEnd} days` : 'Expired'}
          </div>
        </div>
        <div className="card p-4">
          <div className="text-sm text-brand-muted mb-1">Security Deposit</div>
          <div className="text-xl font-bold text-brand-light">
            ${tenant.securityDeposit.toLocaleString()}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-700">
        <div className="flex flex-wrap gap-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-3 text-sm font-medium transition-colors relative flex items-center gap-2 ${
                activeTab === tab.id
                  ? 'text-brand-orange'
                  : 'text-brand-muted hover:text-brand-light'
              }`}
            >
              <tab.icon size={16} />
              {tab.label}
              {activeTab === tab.id && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-orange" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="card p-6">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-brand-light mb-4">Tenant Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-4 bg-brand-navy/30 rounded-lg">
                  <Users className="text-brand-orange" size={20} />
                  <div>
                    <div className="text-sm text-brand-muted">Name</div>
                    <div className="text-brand-light font-medium">{tenant.name}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-brand-navy/30 rounded-lg">
                  <Mail className="text-brand-orange" size={20} />
                  <div>
                    <div className="text-sm text-brand-muted">Email</div>
                    <div className="text-brand-light font-medium">{tenant.email}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-brand-navy/30 rounded-lg">
                  <Phone className="text-brand-orange" size={20} />
                  <div>
                    <div className="text-sm text-brand-muted">Phone</div>
                    <div className="text-brand-light font-medium">{tenant.phone}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-brand-navy/30 rounded-lg">
                  <Calendar className="text-brand-orange" size={20} />
                  <div>
                    <div className="text-sm text-brand-muted">Move-In Date</div>
                    <div className="text-brand-light font-medium">
                      {tenant.moveInDate ? new Date(tenant.moveInDate).toLocaleDateString() : 'N/A'}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {tenant.emergencyContact && (
              <div>
                <h3 className="text-lg font-bold text-brand-light mb-3">Emergency Contact</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 p-4 bg-brand-navy/30 rounded-lg">
                    <Users className="text-brand-orange" size={20} />
                    <div>
                      <div className="text-sm text-brand-muted">Name</div>
                      <div className="text-brand-light font-medium">{tenant.emergencyContact}</div>
                    </div>
                  </div>
                  {tenant.emergencyContactPhone && (
                    <div className="flex items-center gap-3 p-4 bg-brand-navy/30 rounded-lg">
                      <Phone className="text-brand-orange" size={20} />
                      <div>
                        <div className="text-sm text-brand-muted">Phone</div>
                        <div className="text-brand-light font-medium">{tenant.emergencyContactPhone}</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div>
              <h3 className="text-lg font-bold text-brand-light mb-3">Quick Actions</h3>
              <div className="flex flex-wrap gap-3">
                <button className="btn-secondary flex items-center gap-2">
                  <MessageSquare size={16} />
                  Send Message
                </button>
                <button className="btn-secondary flex items-center gap-2">
                  <Calendar size={16} />
                  Schedule Inspection
                </button>
                <button className="btn-secondary flex items-center gap-2">
                  <Wrench size={16} />
                  View Maintenance Requests
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'payments' && (
          <div>
            <h2 className="text-xl font-bold text-brand-light mb-4">Payment History</h2>
            <div className="space-y-3">
              {payments.map((payment) => (
                <div
                  key={payment.id}
                  className="flex items-center justify-between p-4 bg-brand-navy/30 rounded-lg"
                >
                  <div className="flex items-center gap-4">
                    <DollarSign className="text-brand-orange" size={20} />
                    <div>
                      <div className="text-brand-light font-medium">
                        ${payment.amount.toLocaleString()}
                      </div>
                      <div className="text-sm text-brand-muted">
                        {new Date(payment.date).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`font-medium capitalize ${getStatusColor(payment.status)}`}>
                      {payment.status}
                    </div>
                    {payment.method && (
                      <div className="text-sm text-brand-muted">{payment.method}</div>
                    )}
                    {payment.confirmationNumber && (
                      <div className="text-xs text-brand-muted">{payment.confirmationNumber}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'maintenance' && (
          <div>
            <h2 className="text-xl font-bold text-brand-light mb-4">Maintenance Requests</h2>
            <div className="space-y-3">
              {maintenanceRequests.map((request) => (
                <div
                  key={request.id}
                  className="p-4 bg-brand-navy/30 rounded-lg"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="text-brand-light font-medium">{request.title}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-sm text-brand-muted capitalize">{request.category}</span>
                        <span className="text-brand-muted">•</span>
                        <span className={`text-sm capitalize ${getUrgencyColor(request.urgency)}`}>
                          {request.urgency}
                        </span>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${getMaintenanceStatusColor(request.status)}`}>
                      {request.status.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="text-sm text-brand-muted mb-2">{request.description}</p>
                  <div className="flex items-center gap-4 text-xs text-brand-muted">
                    <span>Submitted: {new Date(request.submittedDate).toLocaleDateString()}</span>
                    {request.scheduledDate && (
                      <span>Scheduled: {new Date(request.scheduledDate).toLocaleDateString()}</span>
                    )}
                    {request.completedDate && (
                      <span>Completed: {new Date(request.completedDate).toLocaleDateString()}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'lease' && (
          <div>
            <h2 className="text-xl font-bold text-brand-light mb-4">Lease Details</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-brand-navy/30 rounded-lg">
                  <div className="text-sm text-brand-muted mb-1">Property</div>
                  <div className="text-brand-light font-medium">{lease.propertyAddress}</div>
                  <div className="text-sm text-brand-muted">{lease.unitNumber}</div>
                </div>
                <div className="p-4 bg-brand-navy/30 rounded-lg">
                  <div className="text-sm text-brand-muted mb-1">Lease Term</div>
                  <div className="text-brand-light font-medium">
                    {new Date(lease.startDate).toLocaleDateString()} - {new Date(lease.endDate).toLocaleDateString()}
                  </div>
                </div>
                <div className="p-4 bg-brand-navy/30 rounded-lg">
                  <div className="text-sm text-brand-muted mb-1">Monthly Rent</div>
                  <div className="text-brand-light font-medium text-xl">
                    ${lease.monthlyRent.toLocaleString()}
                  </div>
                </div>
                <div className="p-4 bg-brand-navy/30 rounded-lg">
                  <div className="text-sm text-brand-muted mb-1">Security Deposit</div>
                  <div className="text-brand-light font-medium text-xl">
                    ${lease.securityDeposit.toLocaleString()}
                  </div>
                </div>
              </div>

              <div className="p-4 bg-brand-navy/30 rounded-lg">
                <h3 className="text-brand-light font-medium mb-3">Lease Terms</h3>
                <ul className="space-y-2">
                  {lease.terms.map((term, index) => (
                    <li key={index} className="text-sm text-brand-muted flex items-start gap-2">
                      <span className="text-brand-orange mt-1">•</span>
                      <span>{term}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {lease.renewalEligible && (
                <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                  <h3 className="text-green-400 font-medium mb-2">Renewal Status</h3>
                  <p className="text-sm text-brand-muted">
                    This lease is eligible for renewal.
                    {lease.renewalInterestExpressed
                      ? ' Tenant has expressed interest in renewing.'
                      : ' Tenant has not yet indicated renewal interest.'}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
