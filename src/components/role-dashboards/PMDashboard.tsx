import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import MaintenanceChecklist from '../MaintenanceChecklist';
import VendorDirectory from '../VendorDirectory';
import PMAlertBar from '../dashboard-alerts/PMAlertBar';
import IssuesByPriority from '../dashboard-widgets/IssuesByPriority';
import { AlertTriangle, Calendar, Loader2, MessageSquare, Star } from 'lucide-react';
import { getVendors } from '../../lib/vendors';
import { getThreads, getInspections, getAverageSatisfaction, type Thread, type Inspection } from '../../lib/messages';

export default function PMDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const vendors = getVendors();
  const activeVendors = vendors.filter(v => v.status !== 'inactive').length;

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

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left Column - Main Tasks */}
        <div className="xl:col-span-2 space-y-6">

          {/* Quick Stats Row */}
          <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
            <div className="card bg-gradient-to-br from-cc-surface to-blue-900/50 p-4">
              <div className="flex items-center gap-2 sm:gap-3 mb-2">
                <div className="p-1.5 sm:p-2 bg-cc-accent/20 rounded-lg text-cc-accent">
                  <AlertTriangle size={18} className="sm:w-5 sm:h-5" />
                </div>
                <h3 className="font-semibold text-cc-text text-sm sm:text-base truncate">Active Issues</h3>
              </div>
              <p className="text-xl sm:text-2xl font-bold text-cc-text">1</p>
              <p className="text-xs text-cc-muted mt-1 truncate">HVAC Maintenance Required</p>
            </div>

            <Link to="/messages" className="card hover:bg-cc-surface/70 transition-colors p-4">
              <div className="flex items-center gap-2 sm:gap-3 mb-2">
                <div className="p-1.5 sm:p-2 bg-blue-500/20 rounded-lg text-blue-400">
                  <MessageSquare size={18} className="sm:w-5 sm:h-5" />
                </div>
                <h3 className="font-semibold text-cc-text text-sm sm:text-base truncate">Messages</h3>
              </div>
              <p className="text-xl sm:text-2xl font-bold text-cc-text">{unreadCount}</p>
              <p className="text-xs text-cc-muted mt-1 truncate">
                {unreadCount > 0 ? 'Unread messages' : 'All caught up'}
              </p>
            </Link>

            <Link to="/messages?tab=activity" className="card hover:bg-cc-surface/70 transition-colors p-4">
              <div className="flex items-center gap-2 sm:gap-3 mb-2">
                <div className="p-1.5 sm:p-2 bg-green-500/20 rounded-lg text-green-400">
                  <Calendar size={18} className="sm:w-5 sm:h-5" />
                </div>
                <h3 className="font-semibold text-cc-text text-sm sm:text-base truncate">Inspections</h3>
              </div>
              <p className="text-xl sm:text-2xl font-bold text-cc-text">{inspections.length}</p>
              <p className="text-xs text-cc-muted mt-1 truncate">
                {inspections.length > 0 ? 'Pending inspections' : 'None scheduled'}
              </p>
            </Link>

            <Link to="/messages?tab=activity" className="card hover:bg-cc-surface/70 transition-colors p-4">
              <div className="flex items-center gap-2 sm:gap-3 mb-2">
                <div className="p-1.5 sm:p-2 bg-yellow-500/20 rounded-lg text-yellow-400">
                  <Star size={18} className="sm:w-5 sm:h-5" />
                </div>
                <h3 className="font-semibold text-cc-text text-sm sm:text-base truncate">Satisfaction</h3>
              </div>
              <div className="flex items-center gap-2">
                <p className="text-xl sm:text-2xl font-bold text-cc-text">{satisfaction > 0 ? satisfaction.toFixed(1) : '--'}</p>
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      size={12}
                      className={star <= Math.round(satisfaction) ? 'text-yellow-400 fill-yellow-400' : 'text-cc-border'}
                    />
                  ))}
                </div>
              </div>
              <p className="text-xs text-cc-muted mt-1">Tenant rating</p>
            </Link>
          </div>

          <MaintenanceChecklist />
        </div>

        {/* Right Column - Vendor & Tenant Info */}
        <div className="space-y-6">
          {/* Issues by Priority */}
          <IssuesByPriority onPriorityClick={(priority) => navigate(`/issues?priority=${priority}`)} />

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
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-cc-accent">Vendor Directory</h3>
              <Link to="/vendors" className="text-xs text-cc-muted hover:text-cc-text">
                Manage ({activeVendors} active)
              </Link>
            </div>
            <VendorDirectory compact />
          </div>
        </div>
      </div>
    </div>
  );
}
