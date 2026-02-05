import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import MaintenanceChecklist from '../MaintenanceChecklist';
import VendorDirectory from '../VendorDirectory';
import PMAlertBar from '../dashboard-alerts/PMAlertBar';
import IssuesByPriority from '../dashboard-widgets/IssuesByPriority';
import { AlertTriangle, Calendar, Loader2, MessageSquare, Star, Wrench, Users, Truck } from 'lucide-react';
import { getVendors } from '../../lib/vendors';
import { getThreads, getInspections, getAverageSatisfaction, type Thread, type Inspection } from '../../lib/messages';

type ActiveCard = 'issues' | 'communication' | 'vendors' | null;

export default function PMDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const vendors = getVendors();
  const activeVendors = vendors.filter(v => v.status !== 'inactive').length;

  const [activeCard, setActiveCard] = useState<ActiveCard>(null);
  const [threads, setThreads] = useState<Thread[]>([]);
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [satisfaction, setSatisfaction] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setThreads(getThreads());
    setInspections(getInspections().filter(i => i.status === 'pending'));
    setSatisfaction(getAverageSatisfaction());
    setLoading(false);
  }, []);

  const unreadCount = threads.reduce((acc, t) => acc + t.unreadCount, 0);

  const handleCardClick = (card: ActiveCard) => {
    setActiveCard(activeCard === card ? null : card);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="animate-spin text-cc-muted" size={24} />
        <span className="ml-2 text-cc-muted text-sm">Loading dashboard...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-cc-text">
            Property Manager Dashboard
          </h1>
          <p className="text-cc-muted">Welcome back, {user?.displayName}</p>
        </div>
        <Link to="/messages?tab=activity" className="btn-primary flex items-center gap-2">
          <Calendar size={18} />
          Schedule Inspection
        </Link>
      </div>

      {/* Alert Bar for High Priority Issues */}
      <PMAlertBar onViewIssues={() => navigate('/issues')} />

      {/* Three Main Cards */}
      <div className="grid grid-cols-3 gap-4 items-start">
        {/* Issues & Tasks Card */}
        <button
          onClick={() => handleCardClick('issues')}
          className={`card text-left cursor-pointer transition-all duration-1000 ease-in-out ${
            activeCard === 'issues'
              ? 'border-cc-accent ring-2 ring-cc-accent/20 bg-cc-accent/5 order-2'
              : activeCard
                ? 'opacity-60 hover:opacity-90 order-1'
                : 'hover:border-cc-accent/50'
          }`}
        >
          <div className={`flex items-center gap-3 ${activeCard && activeCard !== 'issues' ? '' : 'mb-3'}`}>
            <div className={`p-3 rounded-xl transition-all duration-300 ${
              activeCard === 'issues'
                ? 'bg-cc-accent/20 text-cc-accent'
                : 'bg-slate-700/50 text-slate-400'
            }`}>
              <Wrench size={24} />
            </div>
            <div>
              <h2 className="font-semibold text-cc-text">Issues & Tasks</h2>
              {(!activeCard || activeCard === 'issues') && (
                <p className="text-sm text-cc-muted">Maintenance & checklist</p>
              )}
            </div>
          </div>

          {(!activeCard || activeCard === 'issues') && (
            <div className="space-y-2 animate-in fade-in duration-200">
              <div className="flex items-center gap-2 text-orange-400">
                <AlertTriangle size={16} />
                <span className="text-sm font-medium">1 active issue</span>
              </div>
              <div className="flex items-center gap-2 text-green-400">
                <Calendar size={16} />
                <span className="text-sm">{inspections.length} pending inspections</span>
              </div>
            </div>
          )}
        </button>

        {/* Communication Card */}
        <button
          onClick={() => handleCardClick('communication')}
          className={`card text-left cursor-pointer transition-all duration-1000 ease-in-out ${
            activeCard === 'communication'
              ? 'border-cc-accent ring-2 ring-cc-accent/20 bg-cc-accent/5 order-2'
              : activeCard === 'issues'
                ? 'opacity-60 hover:opacity-90 order-1'
                : activeCard === 'vendors'
                  ? 'opacity-60 hover:opacity-90 order-3'
                  : 'hover:border-cc-accent/50'
          }`}
        >
          <div className={`flex items-center gap-3 ${activeCard && activeCard !== 'communication' ? '' : 'mb-3'}`}>
            <div className={`p-3 rounded-xl transition-all duration-300 ${
              activeCard === 'communication'
                ? 'bg-cc-accent/20 text-cc-accent'
                : 'bg-slate-700/50 text-slate-400'
            }`}>
              <MessageSquare size={24} />
            </div>
            <div>
              <h2 className="font-semibold text-cc-text">Communication</h2>
              {(!activeCard || activeCard === 'communication') && (
                <p className="text-sm text-cc-muted">Messages & tenant</p>
              )}
            </div>
          </div>

          {(!activeCard || activeCard === 'communication') && (
            <div className="space-y-2 animate-in fade-in duration-200">
              <div className={`flex items-center gap-2 ${unreadCount > 0 ? 'text-blue-400' : 'text-green-400'}`}>
                <MessageSquare size={16} />
                <span className="text-sm font-medium">{unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'}</span>
              </div>
              <div className="flex items-center gap-2 text-yellow-400">
                <Star size={16} />
                <span className="text-sm">{satisfaction > 0 ? `${satisfaction.toFixed(1)} rating` : 'No ratings yet'}</span>
              </div>
            </div>
          )}
        </button>

        {/* Vendors Card */}
        <button
          onClick={() => handleCardClick('vendors')}
          className={`card text-left cursor-pointer transition-all duration-1000 ease-in-out ${
            activeCard === 'vendors'
              ? 'border-cc-accent ring-2 ring-cc-accent/20 bg-cc-accent/5 order-2'
              : activeCard
                ? 'opacity-60 hover:opacity-90 order-3'
                : 'hover:border-cc-accent/50'
          }`}
        >
          <div className={`flex items-center gap-3 ${activeCard && activeCard !== 'vendors' ? '' : 'mb-3'}`}>
            <div className={`p-3 rounded-xl transition-all duration-300 ${
              activeCard === 'vendors'
                ? 'bg-cc-accent/20 text-cc-accent'
                : 'bg-slate-700/50 text-slate-400'
            }`}>
              <Truck size={24} />
            </div>
            <div>
              <h2 className="font-semibold text-cc-text">Vendors</h2>
              {(!activeCard || activeCard === 'vendors') && (
                <p className="text-sm text-cc-muted">Service providers</p>
              )}
            </div>
          </div>

          {(!activeCard || activeCard === 'vendors') && (
            <div className="space-y-2 animate-in fade-in duration-200">
              <div className="flex items-center gap-2 text-green-400">
                <Truck size={16} />
                <span className="text-sm font-medium">{activeVendors} active vendors</span>
              </div>
              <div className="flex items-center gap-2 text-cc-muted">
                <Users size={16} />
                <span className="text-sm">{vendors.length} total in directory</span>
              </div>
            </div>
          )}
        </button>
      </div>

      {/* Expanded Content */}
      {activeCard === 'issues' && (
        <div className="animate-in fade-in slide-in-from-top-2 duration-300 space-y-6">
          <IssuesByPriority onPriorityClick={(priority) => navigate(`/issues?priority=${priority}`)} />
          <MaintenanceChecklist />
        </div>
      )}

      {activeCard === 'communication' && (
        <div className="animate-in fade-in slide-in-from-top-2 duration-300 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="card">
              <h3 className="text-lg font-bold text-cc-accent mb-4">Current Tenant</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3 pb-3 border-b border-cc-border/50">
                  <div className="w-10 h-10 rounded-full bg-cc-border flex items-center justify-center text-cc-text font-bold">GM</div>
                  <div>
                    <p className="font-medium text-cc-text">Gregg Marshall</p>
                    <p className="text-xs text-cc-muted">Lease ends: Aug 2026</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <button className="btn-secondary text-xs">Email</button>
                  <Link to="/messages" className="btn-secondary text-xs text-center">Message</Link>
                </div>
              </div>
            </div>

            <div className="card">
              <h3 className="text-lg font-bold text-cc-accent mb-4">Quick Stats</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-blue-500/10 rounded-lg">
                  <p className="text-2xl font-bold text-blue-400">{unreadCount}</p>
                  <p className="text-xs text-cc-muted">Unread Messages</p>
                </div>
                <div className="p-3 bg-yellow-500/10 rounded-lg">
                  <div className="flex items-center gap-2">
                    <p className="text-2xl font-bold text-yellow-400">{satisfaction > 0 ? satisfaction.toFixed(1) : '--'}</p>
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          size={10}
                          className={star <= Math.round(satisfaction) ? 'text-yellow-400 fill-yellow-400' : 'text-cc-border'}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-cc-muted">Satisfaction</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeCard === 'vendors' && (
        <div className="animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-cc-accent">Vendor Directory</h3>
              <Link to="/vendors" className="text-xs text-cc-muted hover:text-cc-text">
                Manage ({activeVendors} active)
              </Link>
            </div>
            <VendorDirectory compact />
          </div>
        </div>
      )}
    </div>
  );
}
