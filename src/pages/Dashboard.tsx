import { useAuth, type UserRole } from '../contexts/AuthContext';
import { WelcomeHub } from '../components/welcome/WelcomeHub';
import OwnerDashboard from '../components/role-dashboards/OwnerDashboard';
import PMDashboard from '../components/role-dashboards/PMDashboard';
import TenantDashboard from '../components/role-dashboards/TenantDashboard';
import { LayoutDashboard } from 'lucide-react';

export default function Dashboard() {
  const { user, login } = useAuth();

  const renderDashboard = () => {
    if (!user?.role) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
          <LayoutDashboard size={48} className="text-cc-muted mb-4" />
          <h2 className="text-xl font-bold text-cc-text">No Role Selected</h2>
          <p className="text-cc-muted max-w-md mt-2">
            Please contact support or use the debug menu to select a role.
          </p>
        </div>
      );
    }

    // Render role-specific dashboards
    switch (user.role) {
      case 'owner':
        return <OwnerDashboard />;
      case 'pm':
        return <PMDashboard />;
      case 'tenant':
        return <TenantDashboard />;
      default:
        return <WelcomeHub />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Debug Role Switcher - Visible only when toggled or in dev */}
      <div className="flex justify-end mb-4">
        <div className="flex items-center gap-2">
           <label className="text-xs text-cc-muted uppercase font-bold tracking-wider">Dev Mode:</label>
           <div className="flex bg-cc-bg rounded-lg p-1 border border-cc-border">
             {(['owner', 'pm', 'tenant'] as UserRole[]).map((r) => (
               <button
                 key={r}
                 onClick={() => login(r)}
                 className={`px-3 py-1 text-xs rounded-md transition-all ${
                   user?.role === r 
                     ? 'bg-cc-accent text-white shadow-lg' 
                     : 'text-cc-muted hover:text-cc-text hover:bg-white/5'
                 }`}
               >
                 {r?.toUpperCase()}
               </button>
             ))}
           </div>
        </div>
      </div>

      {renderDashboard()}
    </div>
  );
}