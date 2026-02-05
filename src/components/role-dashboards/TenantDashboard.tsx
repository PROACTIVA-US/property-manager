import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import {
  Home,
  CreditCard,
  Wrench,
  MessageSquare,
  FileText,
  Calendar,
  AlertCircle,
  ChevronRight,
  Bell
} from 'lucide-react';
import {
  getCurrentBalance,
  getOpenMaintenanceRequestsCount,
  getUnreadMessagesCount,
  getDaysUntilRentDue,
  getDaysUntilLeaseEnd,
  getLease,
  getMessages,
  formatCurrency,
  markMessageAsRead,
  type TenantMessage
} from '../../lib/tenant';
import PaymentHistory from '../PaymentHistory';
import LeaseDetails from '../LeaseDetails';
import MaintenanceRequest from '../MaintenanceRequest';

type TenantView = 'dashboard' | 'payments' | 'lease' | 'maintenance';
type ActiveCard = 'payments' | 'maintenance' | 'lease' | null;

export default function TenantDashboard() {
  const { user } = useAuth();
  const [currentView, setCurrentView] = useState<TenantView>('dashboard');
  const [activeCard, setActiveCard] = useState<ActiveCard>(null);
  const [messages, setMessages] = useState<TenantMessage[]>(getMessages());

  const balance = getCurrentBalance();
  const lease = getLease();
  const openRequests = getOpenMaintenanceRequestsCount();
  const unreadMessages = getUnreadMessagesCount();
  const daysUntilRent = getDaysUntilRentDue();
  const daysUntilLeaseEnd = getDaysUntilLeaseEnd();

  const handleCardClick = (card: ActiveCard) => {
    setActiveCard(activeCard === card ? null : card);
  };

  const handleMessageClick = (messageId: string) => {
    markMessageAsRead(messageId);
    setMessages(getMessages());
    console.log('Message clicked:', messageId);
  };

  // Render the appropriate view
  if (currentView === 'payments') {
    return <PaymentHistory onBack={() => setCurrentView('dashboard')} />;
  }

  if (currentView === 'lease') {
    return <LeaseDetails onBack={() => setCurrentView('dashboard')} />;
  }

  if (currentView === 'maintenance') {
    return <MaintenanceRequest onBack={() => setCurrentView('dashboard')} />;
  }

  // Main Dashboard View
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Welcome Header */}
      <div className="text-center py-6">
        <h1 className="text-3xl font-bold text-cc-text">Welcome Home, {user?.displayName || 'Gregg Marshall'}</h1>
        <p className="text-cc-muted mt-2 flex items-center justify-center gap-2">
          <Home size={16} />
          {lease.propertyAddress}, {lease.unitNumber}
        </p>
      </div>

      {/* Alerts */}
      {(daysUntilLeaseEnd <= 60 || balance.status === 'overdue') && (
        <div className="space-y-3">
          {balance.status === 'overdue' && (
            <div className="p-4 bg-red-500/20 border border-red-500/30 rounded-lg flex items-start gap-3">
              <AlertCircle className="text-red-400 flex-shrink-0" size={20} />
              <div>
                <p className="font-bold text-red-400">Rent Payment Overdue</p>
                <p className="text-sm text-cc-muted mt-1">
                  Your rent payment of {formatCurrency(balance.amount)} is past due. Please make a payment to avoid late fees.
                </p>
              </div>
            </div>
          )}
          {daysUntilLeaseEnd <= 60 && daysUntilLeaseEnd > 0 && (
            <div className="p-4 bg-yellow-500/20 border border-yellow-500/30 rounded-lg flex items-start gap-3">
              <Calendar className="text-yellow-400 flex-shrink-0" size={20} />
              <div>
                <p className="font-bold text-yellow-400">Lease Expiring Soon</p>
                <p className="text-sm text-cc-muted mt-1">
                  Your lease expires in {daysUntilLeaseEnd} days. View lease details to express renewal interest.
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Three Main Cards */}
      <div className="grid grid-cols-3 gap-4 items-start">
        {/* Payments Card */}
        <button
          onClick={() => handleCardClick('payments')}
          className={`card text-left cursor-pointer transition-all duration-1000 ease-in-out ${
            activeCard === 'payments'
              ? 'border-cc-accent ring-2 ring-cc-accent/20 bg-cc-accent/5 order-2'
              : activeCard
                ? 'opacity-60 hover:opacity-90 order-1'
                : 'hover:border-cc-accent/50'
          }`}
        >
          <div className={`flex items-center gap-3 ${activeCard && activeCard !== 'payments' ? '' : 'mb-3'}`}>
            <div className={`p-3 rounded-xl transition-all duration-300 ${
              activeCard === 'payments'
                ? 'bg-cc-accent/20 text-cc-accent'
                : balance.status === 'overdue'
                  ? 'bg-red-500/20 text-red-400'
                  : 'bg-green-500/20 text-green-400'
            }`}>
              <CreditCard size={24} />
            </div>
            <div>
              <h2 className="font-semibold text-cc-text">Payments</h2>
              {(!activeCard || activeCard === 'payments') && (
                <p className="text-sm text-cc-muted">Rent & payment history</p>
              )}
            </div>
          </div>

          {(!activeCard || activeCard === 'payments') && (
            <div className="space-y-2 animate-in fade-in duration-200">
              <div className={`flex items-center gap-2 ${balance.status === 'overdue' ? 'text-red-400' : 'text-green-400'}`}>
                <CreditCard size={16} />
                <span className="text-sm font-medium">{balance.status === 'paid' ? 'Current' : balance.status}</span>
              </div>
              <div className="flex items-center gap-2 text-cc-muted">
                <Calendar size={16} />
                <span className="text-sm">{daysUntilRent} days until due</span>
              </div>
            </div>
          )}
        </button>

        {/* Maintenance Card */}
        <button
          onClick={() => handleCardClick('maintenance')}
          className={`card text-left cursor-pointer transition-all duration-1000 ease-in-out ${
            activeCard === 'maintenance'
              ? 'border-cc-accent ring-2 ring-cc-accent/20 bg-cc-accent/5 order-2'
              : activeCard === 'payments'
                ? 'opacity-60 hover:opacity-90 order-1'
                : activeCard === 'lease'
                  ? 'opacity-60 hover:opacity-90 order-3'
                  : 'hover:border-cc-accent/50'
          }`}
        >
          <div className={`flex items-center gap-3 ${activeCard && activeCard !== 'maintenance' ? '' : 'mb-3'}`}>
            <div className={`p-3 rounded-xl transition-all duration-300 ${
              activeCard === 'maintenance'
                ? 'bg-cc-accent/20 text-cc-accent'
                : 'bg-slate-700/50 text-slate-400'
            }`}>
              <Wrench size={24} />
            </div>
            <div>
              <h2 className="font-semibold text-cc-text">Maintenance</h2>
              {(!activeCard || activeCard === 'maintenance') && (
                <p className="text-sm text-cc-muted">Request repairs</p>
              )}
            </div>
          </div>

          {(!activeCard || activeCard === 'maintenance') && (
            <div className="space-y-2 animate-in fade-in duration-200">
              <div className={`flex items-center gap-2 ${openRequests > 0 ? 'text-cc-accent' : 'text-green-400'}`}>
                <Wrench size={16} />
                <span className="text-sm font-medium">{openRequests > 0 ? `${openRequests} open` : 'No open requests'}</span>
              </div>
              <div className="flex items-center gap-2 text-cc-muted">
                <ChevronRight size={16} />
                <span className="text-sm">Submit new request</span>
              </div>
            </div>
          )}
        </button>

        {/* Lease Card */}
        <button
          onClick={() => handleCardClick('lease')}
          className={`card text-left cursor-pointer transition-all duration-1000 ease-in-out ${
            activeCard === 'lease'
              ? 'border-cc-accent ring-2 ring-cc-accent/20 bg-cc-accent/5 order-2'
              : activeCard
                ? 'opacity-60 hover:opacity-90 order-3'
                : 'hover:border-cc-accent/50'
          }`}
        >
          <div className={`flex items-center gap-3 ${activeCard && activeCard !== 'lease' ? '' : 'mb-3'}`}>
            <div className={`p-3 rounded-xl transition-all duration-300 ${
              activeCard === 'lease'
                ? 'bg-cc-accent/20 text-cc-accent'
                : 'bg-purple-500/20 text-purple-400'
            }`}>
              <FileText size={24} />
            </div>
            <div>
              <h2 className="font-semibold text-cc-text">Lease</h2>
              {(!activeCard || activeCard === 'lease') && (
                <p className="text-sm text-cc-muted">Documents & details</p>
              )}
            </div>
          </div>

          {(!activeCard || activeCard === 'lease') && (
            <div className="space-y-2 animate-in fade-in duration-200">
              <div className={`flex items-center gap-2 ${daysUntilLeaseEnd <= 60 ? 'text-yellow-400' : 'text-green-400'}`}>
                <Calendar size={16} />
                <span className="text-sm font-medium">{daysUntilLeaseEnd} days left</span>
              </div>
              <div className="flex items-center gap-2 text-cc-muted">
                <FileText size={16} />
                <span className="text-sm">{formatCurrency(lease.monthlyRent)}/month</span>
              </div>
            </div>
          )}
        </button>
      </div>

      {/* Expanded Content */}
      {activeCard === 'payments' && (
        <div className="animate-in fade-in slide-in-from-top-2 duration-300">
          <div className={`card ${
            balance.status === 'overdue'
              ? 'bg-gradient-to-br from-red-900/40 to-cc-surface border-red-500/30'
              : 'bg-gradient-to-br from-green-900/40 to-cc-surface border-green-500/30'
          }`}>
            <div className="flex justify-between items-start mb-6">
              <div>
                <p className="text-cc-muted text-sm font-medium uppercase tracking-wider">Next Payment Due</p>
                <h2 className="text-4xl font-bold text-cc-text mt-1">{formatCurrency(balance.amount)}</h2>
                <p className="text-cc-muted mt-2 text-sm">
                  {daysUntilRent > 0 ? `Due in ${daysUntilRent} days` : daysUntilRent === 0 ? 'Due today' : `${Math.abs(daysUntilRent)} days overdue`}
                </p>
              </div>
              <span className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide ${
                balance.status === 'overdue'
                  ? 'bg-red-500/20 text-red-400'
                  : balance.status === 'pending'
                  ? 'bg-yellow-500/20 text-yellow-400'
                  : 'bg-green-500/20 text-green-400'
              }`}>
                {balance.status === 'paid' ? 'Current' : balance.status}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setCurrentView('payments')}
                className={`py-3 rounded-lg font-bold shadow-lg transition-all flex items-center justify-center gap-2 ${
                  balance.status === 'overdue'
                    ? 'bg-red-600 hover:bg-red-700 text-white shadow-red-900/50'
                    : 'bg-green-600 hover:bg-green-700 text-white shadow-green-900/50'
                }`}
              >
                {balance.status === 'overdue' ? 'Pay Now' : 'Pay Rent'}
                <ChevronRight size={20} />
              </button>
              <button
                onClick={() => setCurrentView('payments')}
                className="btn-secondary py-3"
              >
                View History
              </button>
            </div>
          </div>
        </div>
      )}

      {activeCard === 'maintenance' && (
        <div className="animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="card">
            <h3 className="text-lg font-bold text-cc-accent mb-4">Maintenance Requests</h3>
            <p className="text-cc-muted mb-4">Report leaks, appliance issues, HVAC problems, and more.</p>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setCurrentView('maintenance')}
                className="btn-primary py-3 flex items-center justify-center gap-2"
              >
                <Wrench size={18} />
                New Request
              </button>
              <button
                onClick={() => setCurrentView('maintenance')}
                className="btn-secondary py-3"
              >
                View Open ({openRequests})
              </button>
            </div>
          </div>
        </div>
      )}

      {activeCard === 'lease' && (
        <div className="animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="card">
            <h3 className="text-lg font-bold text-cc-accent mb-4">Lease Information</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
              <div>
                <p className="text-cc-muted">Address</p>
                <p className="text-cc-text font-medium">{lease.propertyAddress}</p>
              </div>
              <div>
                <p className="text-cc-muted">Unit</p>
                <p className="text-cc-text font-medium">{lease.unitNumber}</p>
              </div>
              <div>
                <p className="text-cc-muted">Monthly Rent</p>
                <p className="text-cc-text font-medium">{formatCurrency(lease.monthlyRent)}</p>
              </div>
              <div>
                <p className="text-cc-muted">Lease Ends</p>
                <p className={`font-medium ${daysUntilLeaseEnd <= 60 ? 'text-yellow-400' : 'text-cc-text'}`}>
                  {new Date(lease.endDate).toLocaleDateString()}
                </p>
              </div>
            </div>
            <button
              onClick={() => setCurrentView('lease')}
              className="btn-secondary w-full py-3"
            >
              View Full Lease Details
            </button>
          </div>
        </div>
      )}

      {/* Messages from Property Manager */}
      <div className="card">
        <h3 className="text-lg font-bold text-cc-text mb-4 flex items-center gap-2">
          <Bell size={20} className="text-cc-accent" />
          Messages from Property Manager
          {unreadMessages > 0 && (
            <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full ml-2">
              {unreadMessages} unread
            </span>
          )}
        </h3>
        <div className="space-y-3">
          {messages.slice(0, 3).map((message) => (
            <div
              key={message.id}
              onClick={() => handleMessageClick(message.id)}
              className={`p-4 rounded-lg border cursor-pointer transition-all hover:border-cc-border ${
                message.read
                  ? 'bg-cc-bg/30 border-cc-border/50'
                  : 'bg-cc-bg/50 border-blue-500/30'
              }`}
            >
              <div className="flex gap-3">
                <div className={`w-1 rounded-full ${message.read ? 'bg-cc-border' : 'bg-cc-accent'}`}></div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className={`text-sm font-medium ${message.read ? 'text-cc-text' : 'text-cc-text'}`}>
                      {message.subject}
                    </p>
                    {!message.read && (
                      <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full">New</span>
                    )}
                  </div>
                  <p className="text-xs text-cc-muted mt-1 truncate">{message.preview}</p>
                  <p className="text-[10px] text-slate-500 mt-2">
                    From: {message.from} - {message.date}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
