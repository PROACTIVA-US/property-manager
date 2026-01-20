import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import MaintenanceChecklist from '../MaintenanceChecklist';
import { AlertTriangle, Calendar, MessageSquare, Star } from 'lucide-react';
import { getThreads, getInspections, getAverageSatisfaction, type Thread, type Inspection } from '../../lib/messages';

export default function PMDashboard() {
  const { user } = useAuth();
  const [threads, setThreads] = useState<Thread[]>([]);
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [satisfaction, setSatisfaction] = useState(0);

  useEffect(() => {
    setThreads(getThreads());
    setInspections(getInspections().filter(i => i.status === 'pending'));
    setSatisfaction(getAverageSatisfaction());
  }, []);

  const unreadCount = threads.reduce((acc, t) => acc + t.unreadCount, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-brand-light">
            Property Manager Dashboard
          </h1>
          <p className="text-brand-muted">Welcome back, {user?.displayName}</p>
        </div>
        <Link to="/messages?tab=inspections" className="btn-primary flex items-center gap-2">
          <Calendar size={18} />
          Schedule Inspection
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Main Tasks */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Quick Stats Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="card bg-gradient-to-br from-brand-navy to-blue-900/50">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-brand-orange/20 rounded-lg text-brand-orange">
                  <AlertTriangle size={20} />
                </div>
                <h3 className="font-semibold text-brand-light">Active Issues</h3>
              </div>
              <p className="text-2xl font-bold text-brand-light">1</p>
              <p className="text-xs text-brand-muted mt-1">HVAC Maintenance Required</p>
            </div>

            <Link to="/messages" className="card hover:bg-brand-navy/70 transition-colors">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-blue-500/20 rounded-lg text-blue-400">
                  <MessageSquare size={20} />
                </div>
                <h3 className="font-semibold text-brand-light">Messages</h3>
              </div>
              <p className="text-2xl font-bold text-brand-light">{unreadCount}</p>
              <p className="text-xs text-brand-muted mt-1">
                {unreadCount > 0 ? 'Unread messages' : 'All caught up'}
              </p>
            </Link>

            <Link to="/messages?tab=inspections" className="card hover:bg-brand-navy/70 transition-colors">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-green-500/20 rounded-lg text-green-400">
                  <Calendar size={20} />
                </div>
                <h3 className="font-semibold text-brand-light">Inspections</h3>
              </div>
              <p className="text-2xl font-bold text-brand-light">{inspections.length}</p>
              <p className="text-xs text-brand-muted mt-1">
                {inspections.length > 0 ? 'Pending inspections' : 'None scheduled'}
              </p>
            </Link>

            <Link to="/messages?tab=satisfaction" className="card hover:bg-brand-navy/70 transition-colors">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-yellow-500/20 rounded-lg text-yellow-400">
                  <Star size={20} />
                </div>
                <h3 className="font-semibold text-brand-light">Satisfaction</h3>
              </div>
              <div className="flex items-center gap-2">
                <p className="text-2xl font-bold text-brand-light">{satisfaction > 0 ? satisfaction.toFixed(1) : '--'}</p>
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      size={12}
                      className={star <= Math.round(satisfaction) ? 'text-yellow-400 fill-yellow-400' : 'text-slate-600'}
                    />
                  ))}
                </div>
              </div>
              <p className="text-xs text-brand-muted mt-1">Tenant rating</p>
            </Link>
          </div>

          <MaintenanceChecklist />
        </div>

        {/* Right Column - Vendor & Tenant Info */}
        <div className="space-y-6">
          <div className="card">
            <h3 className="text-lg font-bold text-brand-orange mb-4">Current Tenant</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3 pb-3 border-b border-slate-700/50">
                <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-brand-light font-bold">GM</div>
                <div>
                  <p className="font-medium text-brand-light">Gregg Marshall</p>
                  <p className="text-xs text-brand-muted">Lease ends: Aug 2026</p>
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
              <h3 className="text-lg font-bold text-brand-orange">Vendor Directory</h3>
              <button className="text-xs text-brand-muted hover:text-brand-light">Manage</button>
            </div>
            <div className="space-y-3">
              {[
                { name: 'Smith Plumbing', role: 'Plumber', status: 'Available' },
                { name: 'Green Gardens', role: 'Landscaper', status: 'Scheduled' },
                { name: 'Volt Electric', role: 'Electrician', status: 'Available' },
              ].map((vendor, i) => (
                <div key={i} className="flex items-center justify-between p-2 rounded hover:bg-brand-dark/50 transition-colors">
                  <div>
                    <p className="text-sm font-medium text-brand-light">{vendor.name}</p>
                    <p className="text-xs text-brand-muted">{vendor.role}</p>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                    vendor.status === 'Available' ? 'bg-green-500/20 text-green-400' : 'bg-blue-500/20 text-blue-400'
                  }`}>
                    {vendor.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
