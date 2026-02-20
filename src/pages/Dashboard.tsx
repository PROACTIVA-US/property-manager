import { useAuth } from '../contexts/AuthContext';
import { WelcomeHub } from '../components/welcome/WelcomeHub';
import OwnerDashboard from '../components/role-dashboards/OwnerDashboard';
import PMDashboard from '../components/role-dashboards/PMDashboard';
import TenantDashboard from '../components/role-dashboards/TenantDashboard';
import { LayoutDashboard } from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuth();

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
      {renderDashboard()}
    </div>
  );
}
