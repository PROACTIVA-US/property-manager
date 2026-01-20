import { useParams, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import PaymentHistory from '../components/PaymentHistory';
import LeaseDetails from '../components/LeaseDetails';
import MaintenanceRequest from '../components/MaintenanceRequest';

type TenantSection = 'payments' | 'lease' | 'maintenance';

export default function TenantPortal() {
  const { section } = useParams<{ section: TenantSection }>();
  const { user } = useAuth();

  // Only allow tenants to access this portal
  if (user?.role !== 'tenant') {
    return <Navigate to="/" />;
  }

  const renderSection = () => {
    switch (section) {
      case 'payments':
        return <PaymentHistory onBack={() => window.history.back()} />;
      case 'lease':
        return <LeaseDetails onBack={() => window.history.back()} />;
      case 'maintenance':
        return <MaintenanceRequest onBack={() => window.history.back()} />;
      default:
        return <Navigate to="/" />;
    }
  };

  return renderSection();
}
