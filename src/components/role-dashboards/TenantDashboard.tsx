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

export default function TenantDashboard() {
  const { user } = useAuth();
  const [currentView, setCurrentView] = useState<TenantView>('dashboard');
  const [messages, setMessages] = useState<TenantMessage[]>(getMessages());

  const balance = getCurrentBalance();
  const lease = getLease();
  const openRequests = getOpenMaintenanceRequestsCount();
  const unreadMessages = getUnreadMessagesCount();
  const daysUntilRent = getDaysUntilRentDue();
  const daysUntilLeaseEnd = getDaysUntilLeaseEnd();

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
        <h1 className="text-3xl font-bold text-brand-light">Welcome Home, {user?.displayName || 'Gregg Marshall'}</h1>
        <p className="text-brand-muted mt-2 flex items-center justify-center gap-2">
          <Home size={16} />
          {lease.propertyAddress}, {lease.unitNumber}
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card p-4 text-center">
          <div className={`text-3xl font-bold ${daysUntilRent <= 5 ? 'text-yellow-400' : 'text-brand-light'}`}>
            {daysUntilRent}
          </div>
          <p className="text-xs text-brand-muted uppercase tracking-wider mt-1">Days Until Rent</p>
        </div>
        <div className="card p-4 text-center">
          <div className={`text-3xl font-bold ${openRequests > 0 ? 'text-brand-orange' : 'text-green-400'}`}>
            {openRequests}
          </div>
          <p className="text-xs text-brand-muted uppercase tracking-wider mt-1">Open Requests</p>
        </div>
        <div className="card p-4 text-center">
          <div className={`text-3xl font-bold ${unreadMessages > 0 ? 'text-blue-400' : 'text-brand-light'}`}>
            {unreadMessages}
          </div>
          <p className="text-xs text-brand-muted uppercase tracking-wider mt-1">Unread Messages</p>
        </div>
        <div className="card p-4 text-center">
          <div className={`text-3xl font-bold ${daysUntilLeaseEnd <= 60 ? 'text-yellow-400' : 'text-brand-light'}`}>
            {daysUntilLeaseEnd}
          </div>
          <p className="text-xs text-brand-muted uppercase tracking-wider mt-1">Lease Days Left</p>
        </div>
      </div>

      {/* Alerts */}
      {(daysUntilLeaseEnd <= 60 || balance.status === 'overdue') && (
        <div className="space-y-3">
          {balance.status === 'overdue' && (
            <div className="p-4 bg-red-500/20 border border-red-500/30 rounded-lg flex items-start gap-3">
              <AlertCircle className="text-red-400 flex-shrink-0" size={20} />
              <div>
                <p className="font-bold text-red-400">Rent Payment Overdue</p>
                <p className="text-sm text-brand-muted mt-1">
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
                <p className="text-sm text-brand-muted mt-1">
                  Your lease expires in {daysUntilLeaseEnd} days. View lease details to express renewal interest.
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Main Actions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Rent Status Card */}
        <div
          onClick={() => setCurrentView('payments')}
          className={`card cursor-pointer transition-all hover:scale-[1.02] ${
            balance.status === 'overdue'
              ? 'bg-gradient-to-br from-red-900/40 to-brand-navy border-red-500/30'
              : 'bg-gradient-to-br from-green-900/40 to-brand-navy border-green-500/30'
          }`}
        >
          <div className="flex justify-between items-start mb-6">
            <div className={`p-3 rounded-xl ${
              balance.status === 'overdue' ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'
            }`}>
              <CreditCard size={32} />
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
          <div>
            <p className="text-brand-muted text-sm font-medium uppercase tracking-wider">Next Payment Due</p>
            <h2 className="text-4xl font-bold text-brand-light mt-1">{formatCurrency(balance.amount)}</h2>
            <p className="text-brand-muted mt-2 text-sm">
              {daysUntilRent > 0 ? `Due in ${daysUntilRent} days` : daysUntilRent === 0 ? 'Due today' : `${Math.abs(daysUntilRent)} days overdue`}
            </p>
          </div>
          <button className={`w-full mt-6 py-3 rounded-lg font-bold shadow-lg transition-all flex items-center justify-center gap-2 ${
            balance.status === 'overdue'
              ? 'bg-red-600 hover:bg-red-700 text-white shadow-red-900/50'
              : 'bg-green-600 hover:bg-green-700 text-white shadow-green-900/50'
          }`}>
            {balance.status === 'overdue' ? 'Pay Now' : 'Pay Rent'}
            <ChevronRight size={20} />
          </button>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 gap-4">
          <div
            onClick={() => setCurrentView('maintenance')}
            className="card hover:bg-brand-navy/60 transition-colors cursor-pointer group"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-brand-orange/20 rounded-lg text-brand-orange group-hover:scale-110 transition-transform">
                <Wrench size={24} />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-brand-light flex items-center gap-2">
                  Request Maintenance
                  {openRequests > 0 && (
                    <span className="text-xs bg-brand-orange/20 text-brand-orange px-2 py-0.5 rounded-full">
                      {openRequests} open
                    </span>
                  )}
                </h3>
                <p className="text-xs text-brand-muted">Report leaks, appliance issues, etc.</p>
              </div>
              <span className="text-brand-muted group-hover:text-brand-light transition-colors">
                <ChevronRight size={20} />
              </span>
            </div>
          </div>

          <div
            onClick={() => console.log('Contact manager clicked')}
            className="card hover:bg-brand-navy/60 transition-colors cursor-pointer group"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-500/20 rounded-lg text-blue-400 group-hover:scale-110 transition-transform">
                <MessageSquare size={24} />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-brand-light flex items-center gap-2">
                  Contact Manager
                  {unreadMessages > 0 && (
                    <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full">
                      {unreadMessages} new
                    </span>
                  )}
                </h3>
                <p className="text-xs text-brand-muted">Questions about lease, parking, etc.</p>
              </div>
              <span className="text-brand-muted group-hover:text-brand-light transition-colors">
                <ChevronRight size={20} />
              </span>
            </div>
          </div>

          <div
            onClick={() => setCurrentView('lease')}
            className="card hover:bg-brand-navy/60 transition-colors cursor-pointer group"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-500/20 rounded-lg text-purple-400 group-hover:scale-110 transition-transform">
                <FileText size={24} />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-brand-light flex items-center gap-2">
                  View Lease Details
                  {daysUntilLeaseEnd <= 60 && daysUntilLeaseEnd > 0 && (
                    <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded-full">
                      Expiring soon
                    </span>
                  )}
                </h3>
                <p className="text-xs text-brand-muted">Documents, rules, and renewal info</p>
              </div>
              <span className="text-brand-muted group-hover:text-brand-light transition-colors">
                <ChevronRight size={20} />
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Messages from Property Manager */}
      <div className="card">
        <h3 className="text-lg font-bold text-brand-light mb-4 flex items-center gap-2">
          <Bell size={20} className="text-brand-orange" />
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
              className={`p-4 rounded-lg border cursor-pointer transition-all hover:border-slate-600 ${
                message.read
                  ? 'bg-brand-dark/30 border-slate-700/50'
                  : 'bg-brand-dark/50 border-blue-500/30'
              }`}
            >
              <div className="flex gap-3">
                <div className={`w-1 rounded-full ${message.read ? 'bg-slate-600' : 'bg-brand-orange'}`}></div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className={`text-sm font-medium ${message.read ? 'text-brand-light' : 'text-brand-light'}`}>
                      {message.subject}
                    </p>
                    {!message.read && (
                      <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full">New</span>
                    )}
                  </div>
                  <p className="text-xs text-brand-muted mt-1 truncate">{message.preview}</p>
                  <p className="text-[10px] text-slate-500 mt-2">
                    From: {message.from} - {message.date}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Property Info Footer */}
      <div className="card bg-brand-dark/30">
        <h4 className="text-sm font-bold text-brand-muted uppercase tracking-wider mb-3">Property Information</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <p className="text-brand-muted">Address</p>
            <p className="text-brand-light font-medium">{lease.propertyAddress}</p>
          </div>
          <div>
            <p className="text-brand-muted">Unit</p>
            <p className="text-brand-light font-medium">{lease.unitNumber}</p>
          </div>
          <div>
            <p className="text-brand-muted">Monthly Rent</p>
            <p className="text-brand-light font-medium">{formatCurrency(lease.monthlyRent)}</p>
          </div>
          <div>
            <p className="text-brand-muted">Lease Ends</p>
            <p className="text-brand-light font-medium">{new Date(lease.endDate).toLocaleDateString()}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
