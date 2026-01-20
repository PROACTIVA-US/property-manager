import { useAuth } from '../../contexts/AuthContext';
import { Home, CreditCard, Wrench, MessageSquare } from 'lucide-react';

export default function TenantDashboard() {
  const { user } = useAuth();

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

          <div className="card hover:bg-brand-navy/60 transition-colors cursor-pointer group">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-500/20 rounded-lg text-blue-400 group-hover:scale-110 transition-transform">
                <MessageSquare size={24} />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-brand-light">Contact Manager</h3>
                <p className="text-xs text-brand-muted">Questions about lease, parking, etc.</p>
              </div>
              <span className="text-brand-muted group-hover:text-brand-light transition-colors">&rarr;</span>
            </div>
          </div>
          
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
        <h3 className="text-lg font-bold text-brand-light mb-4">Messages from Property Manager</h3>
        <div className="p-4 bg-brand-dark/50 rounded-lg border border-slate-700">
           <div className="flex gap-3">
             <div className="w-1 h-full bg-brand-orange rounded-full"></div>
             <div>
               <p className="text-sm text-brand-light font-medium">HVAC Filter Change</p>
               <p className="text-xs text-brand-muted mt-1">
                 Maintenance will be entering on Tuesday between 10am-2pm to change filters.
               </p>
               <p className="text-[10px] text-slate-500 mt-2">Received: 2 days ago</p>
             </div>
           </div>
        </div>
      </div>
    </div>
  );
}
