import { Lock, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function FinancialAccessDenied() {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-6">
      <div className="max-w-md text-center space-y-6">
        <div className="flex justify-center">
          <div className="p-4 bg-red-500/20 border border-red-500/30 rounded-full">
            <Lock className="w-8 h-8 text-red-400" />
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-cc-text">Access Restricted</h1>
          <p className="text-cc-muted">
            Financial analysis tools are not available for {user?.role} users.
          </p>
        </div>

        <button
          onClick={() => navigate('/home')}
          className="btn-primary flex items-center justify-center gap-2 mx-auto"
        >
          <ArrowLeft size={16} />
          Return to Dashboard
        </button>
      </div>
    </div>
  );
}
