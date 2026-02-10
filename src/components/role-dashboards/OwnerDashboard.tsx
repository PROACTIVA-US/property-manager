import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Building2,
  DollarSign,
  Users,
  AlertTriangle,
  MessageSquare,
  Wrench,
  FolderKanban,
  FileText,
  CreditCard,
  X,
  ChevronRight,
  CheckCircle2,
  User,
  Phone,
  Mail,
} from 'lucide-react';
import { loadSettings, formatCurrency } from '../../lib/settings';
import { calculateSimpleCashFlow } from '../../lib/financials';
import { getIssues, getEscalatedIssues } from '../../lib/issues';
import { getProjects } from '../../lib/projects';
import { getThreads } from '../../lib/messages';
import { getLease, getPayments, getDaysUntilLeaseEnd, getCurrentBalance, type Payment } from '../../lib/tenant';
import BrowserTabs, { type Tab } from '../ui/BrowserTabs';
import Financials from '../../pages/Financials';

type TenantModal = 'messages' | 'lease' | 'payment' | null;

// Tab colors
const TAB_COLORS = {
  property: '#6366f1', // Indigo
  financials: '#22c55e', // Green
  tenant: '#f97316', // Orange
};

export default function OwnerDashboard() {
  const [tenantModal, setTenantModal] = useState<TenantModal>(null);

  // Load data
  const settings = loadSettings();
  const simpleCashFlow = calculateSimpleCashFlow();
  const issues = getIssues();
  const escalatedIssues = getEscalatedIssues();
  const projects = getProjects();
  const threads = getThreads();
  const unreadMessages = threads.reduce((acc, t) => acc + t.unreadCount, 0);
  const lease = getLease();
  const payments = getPayments();
  const daysUntilLeaseEnd = getDaysUntilLeaseEnd();
  const currentBalance = getCurrentBalance();

  // Calculate summaries
  const openIssues = issues.filter(i => !['resolved', 'closed'].includes(i.status));
  const activeProjects = projects.filter(p => !['completed', 'cancelled'].includes(p.status));

  // Financial calculations
  const monthlyRent = settings.rentalIncome.monthlyRent;
  const monthlyUtilitiesIncome = settings.rentalIncome.monthlyUtilities;
  const totalIncoming = monthlyRent + monthlyUtilitiesIncome;

  const monthlyMortgage = simpleCashFlow.monthlyPITI;
  const monthlyExpenses = 300;
  const totalOutgoing = monthlyMortgage + monthlyExpenses;

  const netCashFlow = totalIncoming - totalOutgoing;
  const isOccupied = !!settings.tenant.name;

  // Property Management Detail View
  const renderPropertyDetails = () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Messages Card */}
      <Link
        to="/messages"
        className="card hover:border-cc-accent/50 transition-all group cursor-pointer"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-blue-500/20 rounded-xl text-blue-400">
            <MessageSquare size={24} />
          </div>
          <div>
            <h3 className="font-semibold text-cc-text group-hover:text-cc-accent transition-colors">Messages</h3>
            <p className="text-sm text-cc-muted">Communication hub</p>
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-cc-muted text-sm">Total Threads</span>
            <span className="font-semibold text-cc-text">{threads.length}</span>
          </div>
          {unreadMessages > 0 && (
            <div className="flex justify-between items-center">
              <span className="text-cc-muted text-sm">Unread</span>
              <span className="font-semibold text-blue-400">{unreadMessages}</span>
            </div>
          )}
        </div>
        <div className="mt-4 pt-3 border-t border-cc-border/50 flex items-center justify-between text-sm text-cc-muted">
          <span>View all messages</span>
          <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
        </div>
      </Link>

      {/* Maintenance Card */}
      <Link
        to="/issues"
        className="card hover:border-cc-accent/50 transition-all group cursor-pointer"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-orange-500/20 rounded-xl text-orange-400">
            <Wrench size={24} />
          </div>
          <div>
            <h3 className="font-semibold text-cc-text group-hover:text-cc-accent transition-colors">Maintenance</h3>
            <p className="text-sm text-cc-muted">Issues & repairs</p>
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-cc-muted text-sm">Open Issues</span>
            <span className={`font-semibold ${openIssues.length > 0 ? 'text-orange-400' : 'text-green-400'}`}>
              {openIssues.length}
            </span>
          </div>
          {escalatedIssues.length > 0 && (
            <div className="flex justify-between items-center">
              <span className="text-cc-muted text-sm">Escalated</span>
              <span className="font-semibold text-red-400">{escalatedIssues.length}</span>
            </div>
          )}
        </div>
        <div className="mt-4 pt-3 border-t border-cc-border/50 flex items-center justify-between text-sm text-cc-muted">
          <span>Manage issues</span>
          <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
        </div>
      </Link>

      {/* Projects Card */}
      <Link
        to="/projects"
        className="card hover:border-cc-accent/50 transition-all group cursor-pointer"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-purple-500/20 rounded-xl text-purple-400">
            <FolderKanban size={24} />
          </div>
          <div>
            <h3 className="font-semibold text-cc-text group-hover:text-cc-accent transition-colors">Projects</h3>
            <p className="text-sm text-cc-muted">Improvements & upgrades</p>
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-cc-muted text-sm">Active Projects</span>
            <span className="font-semibold text-cc-text">{activeProjects.length}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-cc-muted text-sm">Total</span>
            <span className="font-semibold text-cc-muted">{projects.length}</span>
          </div>
        </div>
        <div className="mt-4 pt-3 border-t border-cc-border/50 flex items-center justify-between text-sm text-cc-muted">
          <span>View projects</span>
          <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
        </div>
      </Link>
    </div>
  );

  // Financials Detail View - render the full Financials page
  const renderFinancialDetails = () => <Financials />;

  // Tenant Detail View
  const renderTenantDetails = () => (
    <div>
      {/* Tenant Info Header */}
      <div className="flex items-start gap-4 mb-6 pb-4 border-b border-cc-border">
        <div className="p-3 bg-cc-accent/20 rounded-xl text-cc-accent">
          <User size={32} />
        </div>
        <div className="flex-1">
          <h3 className="text-xl font-bold text-cc-text">{settings.tenant.name}</h3>
          <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
            <div className="flex items-center gap-2 text-cc-muted">
              <Mail size={14} />
              <span>{settings.tenant.email}</span>
            </div>
            <div className="flex items-center gap-2 text-cc-muted">
              <Phone size={14} />
              <span>{settings.tenant.phone}</span>
            </div>
            {settings.tenant.emergencyContact && (
              <div className="flex items-center gap-2 text-cc-muted sm:col-span-2">
                <AlertTriangle size={14} />
                <span>Emergency: {settings.tenant.emergencyContact} ({settings.tenant.emergencyContactPhone})</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Messages Card */}
        <button
          onClick={() => setTenantModal('messages')}
          className="card hover:border-cc-accent/50 transition-all group cursor-pointer text-left"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-blue-500/20 rounded-lg text-blue-400">
              <MessageSquare size={20} />
            </div>
            <h4 className="font-semibold text-cc-text group-hover:text-cc-accent transition-colors">Messages</h4>
          </div>
          <p className="text-sm text-cc-muted mb-3">Communication with tenant</p>
          <div className="flex items-center justify-between text-sm">
            <span className="text-cc-muted">Click for details</span>
            <ChevronRight size={16} className="text-cc-muted group-hover:translate-x-1 transition-transform" />
          </div>
        </button>

        {/* Lease Card */}
        <button
          onClick={() => setTenantModal('lease')}
          className="card hover:border-cc-accent/50 transition-all group cursor-pointer text-left"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-purple-500/20 rounded-lg text-purple-400">
              <FileText size={20} />
            </div>
            <h4 className="font-semibold text-cc-text group-hover:text-cc-accent transition-colors">Lease</h4>
          </div>
          <p className="text-sm text-cc-muted mb-3">
            {daysUntilLeaseEnd > 0 ? `${daysUntilLeaseEnd} days remaining` : 'Lease expired'}
          </p>
          <div className="flex items-center justify-between text-sm">
            <span className="text-cc-muted">Click for details</span>
            <ChevronRight size={16} className="text-cc-muted group-hover:translate-x-1 transition-transform" />
          </div>
        </button>

        {/* Payment Status Card */}
        <button
          onClick={() => setTenantModal('payment')}
          className="card hover:border-cc-accent/50 transition-all group cursor-pointer text-left"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className={`p-2 rounded-lg ${currentBalance.status === 'paid' ? 'bg-green-500/20 text-green-400' : currentBalance.status === 'overdue' ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
              <CreditCard size={20} />
            </div>
            <h4 className="font-semibold text-cc-text group-hover:text-cc-accent transition-colors">Payment Status</h4>
          </div>
          <p className={`text-sm mb-3 ${currentBalance.status === 'paid' ? 'text-green-400' : currentBalance.status === 'overdue' ? 'text-red-400' : 'text-yellow-400'}`}>
            {currentBalance.status === 'paid' ? 'Current month paid' : currentBalance.status === 'overdue' ? 'Payment overdue' : 'Payment pending'}
          </p>
          <div className="flex items-center justify-between text-sm">
            <span className="text-cc-muted">Click for details</span>
            <ChevronRight size={16} className="text-cc-muted group-hover:translate-x-1 transition-transform" />
          </div>
        </button>
      </div>
    </div>
  );

  // Tenant Messages Modal
  const renderMessagesModal = () => (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={() => setTenantModal(null)}>
      <div className="bg-cc-surface border border-cc-border rounded-xl p-6 w-full max-w-lg shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-cc-text flex items-center gap-2">
            <MessageSquare size={20} className="text-blue-400" />
            Tenant Messages
          </h3>
          <button onClick={() => setTenantModal(null)} className="text-cc-muted hover:text-cc-text transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-3 max-h-64 overflow-y-auto">
          {threads.filter(t => t.participants.some(p => p.role === 'tenant')).length > 0 ? (
            threads.filter(t => t.participants.some(p => p.role === 'tenant')).slice(0, 5).map(thread => (
              <div key={thread.id} className="p-3 bg-cc-bg rounded-lg">
                <p className="font-medium text-cc-text text-sm">{thread.subject}</p>
                <p className="text-xs text-cc-muted mt-1 truncate">{thread.lastMessage}</p>
              </div>
            ))
          ) : (
            <p className="text-cc-muted text-center py-4">No messages with tenant</p>
          )}
        </div>

        <Link to="/messages" className="btn-primary w-full mt-4 text-center block">
          Go to Messages
        </Link>
      </div>
    </div>
  );

  // Lease Modal
  const renderLeaseModal = () => (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={() => setTenantModal(null)}>
      <div className="bg-cc-surface border border-cc-border rounded-xl p-6 w-full max-w-lg shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-cc-text flex items-center gap-2">
            <FileText size={20} className="text-purple-400" />
            Lease Details
          </h3>
          <button onClick={() => setTenantModal(null)} className="text-cc-muted hover:text-cc-text transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between items-center py-2 border-b border-cc-border/50">
            <span className="text-cc-muted">Property</span>
            <span className="text-cc-text text-sm text-right">{lease.propertyAddress}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-cc-border/50">
            <span className="text-cc-muted">Start Date</span>
            <span className="text-cc-text">{new Date(lease.startDate).toLocaleDateString()}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-cc-border/50">
            <span className="text-cc-muted">End Date</span>
            <span className="text-cc-text">{new Date(lease.endDate).toLocaleDateString()}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-cc-border/50">
            <span className="text-cc-muted">Monthly Rent</span>
            <span className="text-green-400 font-semibold">{formatCurrency(lease.monthlyRent, 0)}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-cc-border/50">
            <span className="text-cc-muted">Security Deposit</span>
            <span className="text-cc-text">{formatCurrency(lease.securityDeposit, 0)}</span>
          </div>
          <div className="flex justify-between items-center py-2">
            <span className="text-cc-muted">Time Remaining</span>
            <span className={`font-semibold ${daysUntilLeaseEnd > 60 ? 'text-green-400' : daysUntilLeaseEnd > 30 ? 'text-yellow-400' : 'text-red-400'}`}>
              {daysUntilLeaseEnd > 0 ? `${daysUntilLeaseEnd} days` : 'Expired'}
            </span>
          </div>
        </div>

        <Link to="/documents" className="btn-secondary w-full mt-4 text-center block">
          View Lease Document
        </Link>
      </div>
    </div>
  );

  // Payment Modal
  const renderPaymentModal = () => {
    const recentPayments = payments.slice(0, 5);

    return (
      <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={() => setTenantModal(null)}>
        <div className="bg-cc-surface border border-cc-border rounded-xl p-6 w-full max-w-lg shadow-2xl" onClick={e => e.stopPropagation()}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-cc-text flex items-center gap-2">
              <CreditCard size={20} className="text-green-400" />
              Payment History
            </h3>
            <button onClick={() => setTenantModal(null)} className="text-cc-muted hover:text-cc-text transition-colors">
              <X size={20} />
            </button>
          </div>

          {/* Current Status */}
          <div className={`p-4 rounded-lg mb-4 ${currentBalance.status === 'paid' ? 'bg-green-500/10 border border-green-500/30' : currentBalance.status === 'overdue' ? 'bg-red-500/10 border border-red-500/30' : 'bg-yellow-500/10 border border-yellow-500/30'}`}>
            <div className="flex justify-between items-center">
              <span className="text-cc-text font-medium">Current Status</span>
              <span className={`font-bold capitalize ${currentBalance.status === 'paid' ? 'text-green-400' : currentBalance.status === 'overdue' ? 'text-red-400' : 'text-yellow-400'}`}>
                {currentBalance.status}
              </span>
            </div>
            {currentBalance.status !== 'paid' && (
              <p className="text-sm text-cc-muted mt-1">
                {formatCurrency(currentBalance.amount, 0)} due {new Date(currentBalance.dueDate).toLocaleDateString()}
              </p>
            )}
          </div>

          {/* Recent Payments */}
          <h4 className="text-sm font-medium text-cc-muted uppercase mb-3">Recent Payments</h4>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {recentPayments.map((payment: Payment) => (
              <div key={payment.id} className="flex justify-between items-center p-3 bg-cc-bg rounded-lg">
                <div>
                  <p className="text-cc-text font-medium">{formatCurrency(payment.amount, 0)}</p>
                  <p className="text-xs text-cc-muted">{new Date(payment.date).toLocaleDateString()}</p>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-green-400" />
                  <span className="text-sm text-green-400">Paid</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // Build tabs configuration
  const tabs: Tab[] = [
    {
      id: 'property',
      label: 'Property Management',
      subtitle: 'Issues, projects & comms',
      icon: <Building2 size={20} />,
      color: TAB_COLORS.property,
      summary: (
        <span>
          <span className="font-semibold text-cc-text">Status:</span>
          <span className="ml-1">
            <span className="text-blue-400">{unreadMessages}</span>
            <span className="text-cc-muted"> new message{unreadMessages !== 1 ? 's' : ''}, </span>
            <span className="text-blue-400">{openIssues.length}</span>
            <span className="text-cc-muted"> open issue{openIssues.length !== 1 ? 's' : ''}</span>
          </span>
        </span>
      ),
      content: renderPropertyDetails(),
    },
    {
      id: 'financials',
      label: 'Financial Info',
      subtitle: 'Monthly cash flow',
      icon: <DollarSign size={20} />,
      color: TAB_COLORS.financials,
      summary: (
        <span>
          <span className="font-semibold text-cc-text">Net Income:</span>
          <span className="ml-1" style={{ color: netCashFlow >= 0 ? '#22c55e' : '#ef4444' }}>
            {formatCurrency(netCashFlow, 0)}/mo
          </span>
        </span>
      ),
      content: renderFinancialDetails(),
    },
    {
      id: 'tenant',
      label: 'Occupancy',
      subtitle: 'Status & tenant info',
      icon: <Users size={20} />,
      color: TAB_COLORS.tenant,
      summary: isOccupied ? (
        <span>
          <span className="font-semibold text-cc-text">Occupied:</span>
          <span className="ml-1" style={{ color: TAB_COLORS.tenant }}>{settings.tenant.name}</span>
        </span>
      ) : (
        <span>
          <span className="font-semibold text-cc-text">Status:</span>
          <span className="ml-1" style={{ color: '#ef4444' }}>Vacant</span>
        </span>
      ),
      content: renderTenantDetails(),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Escalation Alert */}
      {escalatedIssues.length > 0 && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <AlertTriangle className="text-red-400" size={24} />
            <div>
              <p className="font-semibold text-red-400">
                {escalatedIssues.length} Issue{escalatedIssues.length > 1 ? 's' : ''} Require Your Attention
              </p>
              <p className="text-sm text-cc-muted">Escalated issues need owner approval</p>
            </div>
            <Link to="/issues?filter=escalated" className="ml-auto btn-secondary text-sm">
              View Issues
            </Link>
          </div>
        </div>
      )}

      {/* Browser Tabs */}
      <BrowserTabs tabs={tabs} />

      {/* Tenant Modals */}
      {tenantModal === 'messages' && renderMessagesModal()}
      {tenantModal === 'lease' && renderLeaseModal()}
      {tenantModal === 'payment' && renderPaymentModal()}
    </div>
  );
}
