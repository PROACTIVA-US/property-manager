import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Home, CreditCard, Wrench, MessageSquare, Star, Calendar } from 'lucide-react';
import { getThreads, getInspections, getAverageSatisfaction, formatRelativeTime, type Thread, type Inspection } from '../../lib/messages';

export default function TenantDashboard() {
  const { user } = useAuth();
  const [threads, setThreads] = useState<Thread[]>([]);
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [satisfaction, setSatisfaction] = useState(0);

  useEffect(() => {
    setThreads(getThreads());
    setInspections(getInspections().filter(i => i.status === 'pending'));
    setSatisfaction(getAverageSatisfaction());
  }, []);

  const recentThread = threads[0];
  const unreadCount = threads.reduce((acc, t) => acc + t.unreadCount, 0);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="text-center py-6">
        <h1 className="text-3xl font-bold text-brand-light">Welcome Home, {user?.displayName}</h1>
        <p className="text-brand-muted mt-2">1234 Property Lane, Apt 4B</p>
      </div>

      {/* Main Actions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Rent Status Card */}
        <div className="card bg-gradient-to-br from-green-900/40 to-brand-navy border-green-500/30">
          <div className="flex justify-between items-start mb-6">
            <div className="p-3 bg-green-500/20 rounded-xl text-green-400">
              <CreditCard size={32} />
            </div>
            <span className="bg-green-500/20 text-green-400 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
              Current
            </span>
          </div>
          <div>
            <p className="text-brand-muted text-sm font-medium uppercase tracking-wider">Next Payment Due</p>
            <h2 className="text-4xl font-bold text-brand-light mt-1">$2,400</h2>
            <p className="text-brand-muted mt-2 text-sm">Due Date: July 1st, 2025</p>
          </div>
          <button className="w-full mt-6 bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-bold shadow-lg shadow-green-900/50 transition-all">
            Pay Rent Now
          </button>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 gap-4">
          <div className="card hover:bg-brand-navy/60 transition-colors cursor-pointer group">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-brand-orange/20 rounded-lg text-brand-orange group-hover:scale-110 transition-transform">
                <Wrench size={24} />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-brand-light">Request Maintenance</h3>
                <p className="text-xs text-brand-muted">Report leaks, appliance issues, etc.</p>
              </div>
              <span className="text-brand-muted group-hover:text-brand-light transition-colors">&rarr;</span>
            </div>
          </div>

          <Link to="/messages" className="card hover:bg-brand-navy/60 transition-colors cursor-pointer group">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-500/20 rounded-lg text-blue-400 group-hover:scale-110 transition-transform">
                <MessageSquare size={24} />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-brand-light">Contact Manager</h3>
                <p className="text-xs text-brand-muted">Questions about lease, parking, etc.</p>
              </div>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-brand-orange text-white">
                  {unreadCount}
                </span>
              )}
              <span className="text-brand-muted group-hover:text-brand-light transition-colors">&rarr;</span>
            </div>
          </Link>

          <Link to="/messages?tab=inspections" className="card hover:bg-brand-navy/60 transition-colors cursor-pointer group">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-500/20 rounded-lg text-green-400 group-hover:scale-110 transition-transform">
                <Calendar size={24} />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-brand-light">Upcoming Inspections</h3>
                <p className="text-xs text-brand-muted">
                  {inspections.length > 0
                    ? `${inspections.length} pending inspection${inspections.length !== 1 ? 's' : ''}`
                    : 'No scheduled inspections'}
                </p>
              </div>
              {inspections.length > 0 && (
                <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-green-500/20 text-green-400">
                  {inspections.length}
                </span>
              )}
              <span className="text-brand-muted group-hover:text-brand-light transition-colors">&rarr;</span>
            </div>
          </Link>

          <div className="card hover:bg-brand-navy/60 transition-colors cursor-pointer group">
             <div className="flex items-center gap-4">
               <div className="p-3 bg-purple-500/20 rounded-lg text-purple-400 group-hover:scale-110 transition-transform">
                 <Home size={24} />
               </div>
               <div className="flex-1">
                 <h3 className="font-bold text-brand-light">View Lease Details</h3>
                 <p className="text-xs text-brand-muted">Documents, rules, and renewal info</p>
               </div>
               <span className="text-brand-muted group-hover:text-brand-light transition-colors">&rarr;</span>
             </div>
           </div>
        </div>
      </div>

      {/* Announcements / Messages */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-brand-light">Messages from Property Manager</h3>
          <Link to="/messages" className="text-sm text-brand-orange hover:underline">
            View All
          </Link>
        </div>
        {recentThread ? (
          <Link to={`/messages?thread=${recentThread.id}`} className="block p-4 bg-brand-dark/50 rounded-lg border border-slate-700 hover:bg-brand-dark/70 transition-colors">
            <div className="flex gap-3">
              <div className="w-1 h-full bg-brand-orange rounded-full"></div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm text-brand-light font-medium">{recentThread.subject}</p>
                  {recentThread.unreadCount > 0 && (
                    <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-brand-orange text-white">
                      {recentThread.unreadCount}
                    </span>
                  )}
                </div>
                <p className="text-xs text-brand-muted mt-1 line-clamp-2">
                  {recentThread.lastMessage}
                </p>
                <p className="text-[10px] text-slate-500 mt-2">
                  {formatRelativeTime(recentThread.lastMessageTime)}
                </p>
              </div>
            </div>
          </Link>
        ) : (
          <div className="p-4 bg-brand-dark/50 rounded-lg border border-slate-700 text-center text-brand-muted">
            No messages yet
          </div>
        )}
      </div>

      {/* Satisfaction Widget */}
      <Link to="/messages?tab=satisfaction" className="card hover:bg-brand-navy/60 transition-colors block">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-yellow-500/20 rounded-lg text-yellow-400">
            <Star size={24} />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-brand-light">Your Satisfaction</h3>
            <div className="flex items-center gap-2 mt-1">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    size={14}
                    className={star <= Math.round(satisfaction) ? 'text-yellow-400 fill-yellow-400' : 'text-slate-600'}
                  />
                ))}
              </div>
              <span className="text-sm text-brand-muted">
                {satisfaction > 0 ? `${satisfaction.toFixed(1)} average` : 'No feedback yet'}
              </span>
            </div>
          </div>
          <span className="text-brand-muted">&rarr;</span>
        </div>
      </Link>
    </div>
  );
}
