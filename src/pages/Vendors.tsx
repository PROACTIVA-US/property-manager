import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import VendorDirectory from '../components/VendorDirectory';

export default function VendorsPage() {
  const { user } = useAuth();

  // Only PM and Owner roles can access vendor directory
  if (user?.role !== 'pm' && user?.role !== 'owner') {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-brand-light">Vendor Management</h1>
        <p className="text-brand-muted mt-1">
          Manage your service providers and contractors
        </p>
      </div>

      <VendorDirectory />
    </div>
  );
}
