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
  TrendingUp,
  TrendingDown,
  Clock,
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
import { getThreads, getUnreadCount } from '../../lib/messages';
import { getLease, getPayments, getDaysUntilLeaseEnd, getCurrentBalance, type Payment } from '../../lib/tenant';

type ActiveCard = 'property' | 'financials' | 'tenant' | null;
type TenantModal = 'messages' | 'lease' | 'payment' | null;

export default function OwnerDashboard() {
  const [activeCard, setActiveCard] = useState<ActiveCard>(null);
  const [tenantModal, setTenantModal] = useState<TenantModal>(null);

  // Load data
  const settings = loadSettings();
  const simpleCashFlow = calculateSimpleCashFlow();
  const issues = getIssues();
  const escalatedIssues = getEscalatedIssues();
  const projects = getProjects();
  const threads = getThreads();
  const unreadMessages = getUnreadCount();
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
  const monthlyExpenses = 300; // TODO: Make dynamic based on actual utilities costs
  const totalOutgoing = monthlyMortgage + monthlyExpenses;

  const netCashFlow = totalIncoming - totalOutgoing;
  const isOccupied = !!settings.tenant.name;

  const handleCardClick = (card: ActiveCard) => {
    setActiveCard(activeCard === card ? null : card);
  };

  // Property Management Detail View
  const renderPropertyDetails = () => (
    <div className="mt-6 animate-in fade-in slide-in-from-top-2 duration-300">
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
    </div>
  );

  // Financials Detail View
  const renderFinancialDetails = () => (
    <div className="mt-6 animate-in fade-in slide-in-from-top-2 duration-300">
      <div className="card">
        <h3 className="text-lg font-bold text-cc-text mb-4">Monthly Cash Flow Breakdown</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Income Section */}
          <div>
            <h4 className="text-sm font-medium text-green-400 uppercase tracking-wide mb-3 flex items-center gap-2">
              <TrendingUp size={16} />
              Incoming
            </h4>
            <div className="space-y-2">
              <div className="flex justify-between items-center px-3 py-2 border border-cc-border/50 rounded-lg">
                <span className="text-cc-text">Rent</span>
                <span className="font-semibold text-green-400">+{formatCurrency(monthlyRent, 0)}</span>
              </div>
              {monthlyUtilitiesIncome > 0 && (
                <div className="flex justify-between items-center px-3 py-2 border border-cc-border/50 rounded-lg">
                  <span className="text-cc-text">Utilities</span>
                  <span className="font-semibold text-green-400">+{formatCurrency(monthlyUtilitiesIncome, 0)}</span>
                </div>
              )}
              <div className="flex justify-between items-center px-3 py-2 bg-green-500/10 border border-green-500/30 rounded-lg">
                <span className="font-medium text-cc-text">Total Incoming</span>
                <span className="font-bold text-green-400">{formatCurrency(totalIncoming, 0)}</span>
              </div>
            </div>
          </div>

          {/* Expenses Section */}
          <div>
            <h4 className="text-sm font-medium text-red-400 uppercase tracking-wide mb-3 flex items-center gap-2">
              <TrendingDown size={16} />
              Outgoing
            </h4>
            <div className="space-y-2">
              <button className="w-full flex justify-between items-center px-3 py-2 border border-cc-border/50 rounded-lg hover:border-blue-400/50 hover:bg-blue-500/5 active:bg-cc-border/30 transition-all group">
                <span className="text-blue-400 inline-flex items-center group-hover:translate-x-0.5 transition-transform">Mortgage<span className="leading-none ml-0.5">&rsaquo;&rsaquo;</span></span>
                <span className="font-semibold text-red-400">-{formatCurrency(monthlyMortgage, 0)}</span>
              </button>
              <button className="w-full flex justify-between items-center px-3 py-2 border border-cc-border/50 rounded-lg hover:border-blue-400/50 hover:bg-blue-500/5 active:bg-cc-border/30 transition-all group">
                <span className="text-blue-400 inline-flex items-center group-hover:translate-x-0.5 transition-transform">Expenses<span className="leading-none ml-0.5">&rsaquo;&rsaquo;</span></span>
                <span className="font-semibold text-red-400">-{formatCurrency(monthlyExpenses, 0)}</span>
              </button>
              <div className="flex justify-between items-center px-3 py-2 bg-red-500/10 border border-red-500/30 rounded-lg">
                <span className="font-medium text-cc-text">Total Outgoing</span>
                <span className="font-bold text-red-400">{formatCurrency(totalOutgoing, 0)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Net Income */}
        <div className="mt-6 pt-4 border-t border-cc-border">
          <div className="flex justify-between items-center p-4 bg-cc-bg rounded-xl">
            <div>
              <span className="text-lg font-bold text-cc-text">Net Income</span>
              <p className="text-sm text-cc-muted">Annual: {formatCurrency(netCashFlow * 12, 0)}</p>
            </div>
            <span className={`text-2xl font-bold ${netCashFlow >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {netCashFlow >= 0 ? '+' : ''}{formatCurrency(netCashFlow, 0)}
            </span>
          </div>
        </div>

        <Link to="/financials" className="btn-secondary w-full mt-4 text-center block">
          View Detailed Analysis
        </Link>
      </div>
    </div>
  );

  // Tenant Detail View
  const renderTenantDetails = () => (
    <div className="mt-6 animate-in fade-in slide-in-from-top-2 duration-300">
      {/* Tenant Info Header */}
      <div className="card mb-4">
        <div className="flex items-start gap-4">
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

      {/* Three Main Cards */}
      <div className="grid grid-cols-3 gap-4 items-start">
        {/* Property Management Card */}
        <button
          onClick={() => handleCardClick('property')}
          className={`card text-left cursor-pointer transition-all duration-1000 ease-in-out ${
            activeCard === 'property'
              ? 'border-cc-accent ring-2 ring-cc-accent/20 bg-cc-accent/5 order-2'
              : activeCard
                ? 'opacity-60 hover:opacity-90 order-1'
                : 'hover:border-cc-accent/50'
          }`}
        >
          <div className={`flex items-center gap-3 ${activeCard && activeCard !== 'property' ? '' : 'mb-3'}`}>
            <div className={`p-3 rounded-xl transition-all duration-300 ${
              activeCard === 'property'
                ? 'bg-cc-accent/20 text-cc-accent'
                : 'bg-slate-700/50 text-slate-400'
            }`}>
              <Building2 size={24} />
            </div>
            <div>
              <h2 className="font-semibold text-cc-text">Property Management</h2>
              {(!activeCard || activeCard === 'property') && (
                <p className="text-sm text-cc-muted">Issues, projects & comms</p>
              )}
            </div>
          </div>

          {(!activeCard || activeCard === 'property') && (
            <div className="space-y-2 animate-in fade-in duration-200">
              {openIssues.length > 0 ? (
                <div className="flex items-center gap-2 text-orange-400">
                  <AlertTriangle size={16} />
                  <span className="text-sm font-medium">{openIssues.length} open issue{openIssues.length > 1 ? 's' : ''}</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-green-400">
                  <CheckCircle2 size={16} />
                  <span className="text-sm font-medium">No open issues</span>
                </div>
              )}
              {activeProjects.length > 0 && (
                <div className="flex items-center gap-2 text-purple-400">
                  <FolderKanban size={16} />
                  <span className="text-sm">{activeProjects.length} active project{activeProjects.length > 1 ? 's' : ''}</span>
                </div>
              )}
            </div>
          )}
        </button>

        {/* Financial Info Card */}
        <button
          onClick={() => handleCardClick('financials')}
          className={`card text-left cursor-pointer transition-all duration-1000 ease-in-out ${
            activeCard === 'financials'
              ? 'border-cc-accent ring-2 ring-cc-accent/20 bg-cc-accent/5 order-2'
              : activeCard === 'property'
                ? 'opacity-60 hover:opacity-90 order-1'
                : activeCard === 'tenant'
                  ? 'opacity-60 hover:opacity-90 order-3'
                  : 'hover:border-cc-accent/50'
          }`}
        >
          <div className={`flex items-center gap-3 ${activeCard && activeCard !== 'financials' ? '' : 'mb-3'}`}>
            <div className={`p-3 rounded-xl transition-all duration-300 ${
              activeCard === 'financials'
                ? 'bg-cc-accent/20 text-cc-accent'
                : 'bg-slate-700/50 text-slate-400'
            }`}>
              <DollarSign size={24} />
            </div>
            <div>
              <h2 className="font-semibold text-cc-text">Financial Info</h2>
              {(!activeCard || activeCard === 'financials') && (
                <p className="text-sm text-cc-muted">Monthly cash flow</p>
              )}
            </div>
          </div>

          {(!activeCard || activeCard === 'financials') && (
            <div className="space-y-2 text-sm animate-in fade-in duration-200">
              <div className="flex justify-between items-center">
                <span className="text-cc-muted">Incoming <span className="text-xs">(Rent + Utilities)</span></span>
                <span className="text-green-400">{formatCurrency(totalIncoming, 0)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-cc-muted">Outgoing <span className="text-xs">(Mortgage + Expenses)</span></span>
                <span className="text-red-400">{formatCurrency(totalOutgoing, 0)}</span>
              </div>
              <div className="pt-2 border-t border-cc-border/50 flex justify-between items-center">
                <span className="font-medium text-cc-text">Net Income</span>
                <span className={`font-bold ${netCashFlow >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {formatCurrency(netCashFlow, 0)}
                </span>
              </div>
            </div>
          )}
        </button>

        {/* Tenant Card */}
        <button
          onClick={() => handleCardClick('tenant')}
          className={`card text-left cursor-pointer transition-all duration-1000 ease-in-out ${
            activeCard === 'tenant'
              ? 'border-cc-accent ring-2 ring-cc-accent/20 bg-cc-accent/5 order-2'
              : activeCard
                ? 'opacity-60 hover:opacity-90 order-3'
                : 'hover:border-cc-accent/50'
          }`}
        >
          <div className={`flex items-center gap-3 ${activeCard && activeCard !== 'tenant' ? '' : 'mb-3'}`}>
            <div className={`p-3 rounded-xl transition-all duration-300 ${
              activeCard === 'tenant'
                ? 'bg-cc-accent/20 text-cc-accent'
                : 'bg-slate-700/50 text-slate-400'
            }`}>
              <Users size={24} />
            </div>
            <div>
              <h2 className="font-semibold text-cc-text">Tenant</h2>
              {(!activeCard || activeCard === 'tenant') && (
                <p className="text-sm text-cc-muted">Lease & payments</p>
              )}
            </div>
          </div>

          {(!activeCard || activeCard === 'tenant') && (
            <div className="space-y-2 animate-in fade-in duration-200">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${isOccupied ? 'bg-green-400' : 'bg-red-400'}`} />
                <span className={`text-sm font-medium ${isOccupied ? 'text-green-400' : 'text-red-400'}`}>
                  {isOccupied ? 'Occupied' : 'Vacant'}
                </span>
              </div>
              {isOccupied && (
                <>
                  <p className="text-sm text-cc-text truncate">{settings.tenant.name}</p>
                  <div className="flex items-center gap-2 text-cc-muted">
                    <Clock size={14} />
                    <span className="text-sm">
                      {daysUntilLeaseEnd > 0 ? `${daysUntilLeaseEnd} days left` : 'Lease expired'}
                    </span>
                  </div>
                </>
              )}
            </div>
          )}
        </button>
      </div>

      {/* Detail Section */}
      {activeCard === 'property' && renderPropertyDetails()}
      {activeCard === 'financials' && renderFinancialDetails()}
      {activeCard === 'tenant' && renderTenantDetails()}

      {/* Tenant Modals */}
      {tenantModal === 'messages' && renderMessagesModal()}
      {tenantModal === 'lease' && renderLeaseModal()}
      {tenantModal === 'payment' && renderPaymentModal()}
    </div>
  );
}
