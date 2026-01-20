import { useAuth } from '../../contexts/AuthContext';
import MaintenanceChecklist from '../MaintenanceChecklist';
import VendorDirectory from '../VendorDirectory';
import { Users, Phone, AlertTriangle, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getVendors } from '../../lib/vendors';

export default function PMDashboard() {
  const { user } = useAuth();
  const vendors = getVendors();
  const activeVendors = vendors.filter(v => v.status !== 'inactive').length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-brand-light">
            Property Manager Dashboard
          </h1>
          <p className="text-brand-muted">Welcome back, {user?.displayName}</p>
        </div>
        <button className="btn-primary flex items-center gap-2">
          <Calendar size={18} />
          Schedule Inspection
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Main Tasks */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Quick Stats Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
            
            <div className="card">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-green-500/20 rounded-lg text-green-400">
                  <Users size={20} />
                </div>
                <h3 className="font-semibold text-brand-light">Tenant Status</h3>
              </div>
              <p className="text-2xl font-bold text-brand-light">Good</p>
              <p className="text-xs text-brand-muted mt-1">Rent Paid on Time</p>
            </div>

            <Link to="/vendors" className="card block hover:border-brand-orange/50 transition-colors">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-purple-500/20 rounded-lg text-purple-400">
                  <Phone size={20} />
                </div>
                <h3 className="font-semibold text-brand-light">Vendors</h3>
              </div>
              <p className="text-2xl font-bold text-brand-light">{activeVendors}</p>
              <p className="text-xs text-brand-muted mt-1">Active Contracts</p>
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
                <button className="btn-secondary text-xs">Message</button>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-brand-orange">Vendor Directory</h3>
              <Link to="/vendors" className="text-xs text-brand-muted hover:text-brand-light">
                Manage
              </Link>
            </div>
            <VendorDirectory compact />
          </div>
        </div>
      </div>
    </div>
  );
}
