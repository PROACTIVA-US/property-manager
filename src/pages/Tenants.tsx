import { useState } from 'react';
import { Users, Mail, Phone, Calendar, DollarSign, Wrench, MessageSquare, Pencil, X, Download, Upload, ChevronDown, ChevronRight } from 'lucide-react';
import { loadSettings, exportSettings, importSettings } from '../lib/settings';
import { getPayments, getLease, getMaintenanceRequests } from '../lib/tenant';
import type { Payment, MaintenanceRequest } from '../lib/tenant';
import TenantForm from '../components/settings/TenantForm';
import { formatCurrency } from '../lib/financials';

type SectionId = 'payments' | 'maintenance' | 'lease';

export default function Tenants() {
  const [settings, setSettings] = useState(loadSettings());
  const [showEditModal, setShowEditModal] = useState(false);
  const [importMessage, setImportMessage] = useState('');
  const [expandedSections, setExpandedSections] = useState<Set<SectionId>>(new Set());
  const tenant = settings.tenant;
  const payments = getPayments();
  const lease = getLease();
  const maintenanceRequests = getMaintenanceRequests();

  const daysUntilLeaseEnd = Math.ceil(
    (new Date(tenant.leaseEndDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  );

  const handleDataSaved = () => {
    setSettings(loadSettings());
    setShowEditModal(false);
  };

  const handleExport = () => {
    const jsonData = exportSettings();
    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `tenant-data-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const jsonString = e.target?.result as string;
        const imported = importSettings(jsonString);
        setSettings(imported);
        setImportMessage('Tenant data imported successfully!');
        setTimeout(() => setImportMessage(''), 3000);
      } catch (error) {
        setImportMessage('Failed to import. Invalid file format.');
        setTimeout(() => setImportMessage(''), 3000);
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  };

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

  const toggleSection = (id: SectionId) => {
    setExpandedSections(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const getUrgencyColor = (urgency: MaintenanceRequest['urgency']) => {
    switch (urgency) {
      case 'emergency': return 'text-red-400';
      case 'high': return 'text-orange-400';
      case 'medium': return 'text-yellow-400';
      case 'low': return 'text-blue-400';
      default: return 'text-brand-muted';
    }
  };

  return (
    <div className="space-y-6">
      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60" onClick={() => setShowEditModal(false)} />
          <div className="relative bg-slate-800 rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-slate-800 border-b border-slate-700 p-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-brand-light">Edit Tenant Details</h2>
              <button
                onClick={() => setShowEditModal(false)}
                className="p-1 hover:bg-slate-700 rounded transition-colors"
              >
                <X size={20} className="text-brand-muted" />
              </button>
            </div>
            <div className="p-6">
              <TenantForm initialData={tenant} onSave={handleDataSaved} />
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
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

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowEditModal(true)}
            className="btn-primary flex items-center gap-2 text-sm"
          >
            <Pencil size={14} />
            Edit Details
          </button>
          <button
            onClick={handleExport}
            className="btn-secondary flex items-center gap-2 text-sm"
          >
            <Download size={14} />
            Export
          </button>
          <label className="btn-secondary flex items-center gap-2 text-sm cursor-pointer">
            <Upload size={14} />
            Import
            <input
              type="file"
              accept=".json"
              onChange={handleImport}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* Import Message */}
      {importMessage && (
        <div className={`p-3 rounded-lg text-sm ${importMessage.includes('success') ? 'bg-green-500/10 border border-green-500/30 text-green-400' : 'bg-red-500/10 border border-red-500/30 text-red-400'}`}>
          {importMessage}
        </div>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card p-4">
          <div className="text-sm text-brand-muted mb-1">Current Tenant</div>
          <div className="text-xl font-bold text-brand-light">{tenant.name}</div>
        </div>
        <div className="card p-4">
          <div className="text-sm text-brand-muted mb-1">Monthly Rent</div>
          <div className="text-xl font-bold text-brand-light">
            {formatCurrency(tenant.monthlyRent)}
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
            {formatCurrency(tenant.securityDeposit)}
          </div>
        </div>
      </div>

      {/* Tenant Information - always visible */}
      <div className="card p-6 space-y-6">
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
            <button className="btn-secondary flex items-center gap-2" onClick={() => toggleSection('maintenance')}>
              <Wrench size={16} />
              View Maintenance Requests
            </button>
          </div>
        </div>
      </div>

      {/* Expandable Sections */}
      {/* Payments Section */}
      <div className="card bg-slate-800/50 overflow-hidden">
        <button
          onClick={() => toggleSection('payments')}
          className="w-full flex items-center justify-between p-5 text-left hover:bg-slate-700/30 transition-colors"
          aria-expanded={expandedSections.has('payments')}
        >
          <div className="flex items-center gap-3">
            <DollarSign size={20} className="text-brand-orange" />
            <div>
              <h2 className="text-lg font-semibold text-brand-light">Payment History</h2>
              <p className="text-sm text-brand-muted">{payments.length} payments recorded</p>
            </div>
          </div>
          {expandedSections.has('payments') ? (
            <ChevronDown size={20} className="text-brand-muted" />
          ) : (
            <ChevronRight size={20} className="text-brand-muted" />
          )}
        </button>
        {expandedSections.has('payments') && (
          <div className="border-t border-slate-700/50 p-6">
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
                        {formatCurrency(payment.amount)}
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
      </div>

      {/* Maintenance Section */}
      <div className="card bg-slate-800/50 overflow-hidden">
        <button
          onClick={() => toggleSection('maintenance')}
          className="w-full flex items-center justify-between p-5 text-left hover:bg-slate-700/30 transition-colors"
          aria-expanded={expandedSections.has('maintenance')}
        >
          <div className="flex items-center gap-3">
            <Wrench size={20} className="text-brand-orange" />
            <div>
              <h2 className="text-lg font-semibold text-brand-light">Maintenance Requests</h2>
              <p className="text-sm text-brand-muted">{maintenanceRequests.length} requests</p>
            </div>
          </div>
          {expandedSections.has('maintenance') ? (
            <ChevronDown size={20} className="text-brand-muted" />
          ) : (
            <ChevronRight size={20} className="text-brand-muted" />
          )}
        </button>
        {expandedSections.has('maintenance') && (
          <div className="border-t border-slate-700/50 p-6">
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
      </div>

      {/* Lease Details Section */}
      <div className="card bg-slate-800/50 overflow-hidden">
        <button
          onClick={() => toggleSection('lease')}
          className="w-full flex items-center justify-between p-5 text-left hover:bg-slate-700/30 transition-colors"
          aria-expanded={expandedSections.has('lease')}
        >
          <div className="flex items-center gap-3">
            <Calendar size={20} className="text-brand-orange" />
            <div>
              <h2 className="text-lg font-semibold text-brand-light">Lease Details</h2>
              <p className="text-sm text-brand-muted">
                {daysUntilLeaseEnd > 0 ? `${daysUntilLeaseEnd} days remaining` : 'Lease expired'}
              </p>
            </div>
          </div>
          {expandedSections.has('lease') ? (
            <ChevronDown size={20} className="text-brand-muted" />
          ) : (
            <ChevronRight size={20} className="text-brand-muted" />
          )}
        </button>
        {expandedSections.has('lease') && (
          <div className="border-t border-slate-700/50 p-6">
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
                    {formatCurrency(lease.monthlyRent)}
                  </div>
                </div>
                <div className="p-4 bg-brand-navy/30 rounded-lg">
                  <div className="text-sm text-brand-muted mb-1">Security Deposit</div>
                  <div className="text-brand-light font-medium text-xl">
                    {formatCurrency(lease.securityDeposit)}
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
