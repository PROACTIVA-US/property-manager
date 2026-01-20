import { useAuth, type UserRole } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Home, Users, Wrench } from 'lucide-react';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (role: UserRole) => {
    await login(role);
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
            Property Manager
          </h2>
          <p className="mt-2 text-center text-sm text-slate-400">
            Select your role to simulate login
          </p>
        </div>
        <div className="grid grid-cols-1 gap-4 mt-8">
          <button
            onClick={() => handleLogin('owner')}
            className="relative group bg-slate-800 p-6 focus:ring-2 focus:ring-inset focus:ring-orange-500 rounded-lg hover:bg-slate-700 transition-colors"
          >
            <div className="flex items-center space-x-4">
              <div className="bg-orange-500 p-3 rounded-full">
                <Home className="h-6 w-6 text-white" />
              </div>
              <div className="text-left">
                <h3 className="text-lg font-medium text-white">Owner</h3>
                <p className="text-sm text-slate-400">Manage financials and assets</p>
              </div>
            </div>
          </button>

          <button
            onClick={() => handleLogin('pm')}
            className="relative group bg-slate-800 p-6 focus:ring-2 focus:ring-inset focus:ring-orange-500 rounded-lg hover:bg-slate-700 transition-colors"
          >
            <div className="flex items-center space-x-4">
              <div className="bg-blue-500 p-3 rounded-full">
                <Wrench className="h-6 w-6 text-white" />
              </div>
              <div className="text-left">
                <h3 className="text-lg font-medium text-white">Property Manager</h3>
                <p className="text-sm text-slate-400">Handle maintenance and tasks</p>
              </div>
            </div>
          </button>

          <button
            onClick={() => handleLogin('tenant')}
            className="relative group bg-slate-800 p-6 focus:ring-2 focus:ring-inset focus:ring-orange-500 rounded-lg hover:bg-slate-700 transition-colors"
          >
            <div className="flex items-center space-x-4">
              <div className="bg-green-500 p-3 rounded-full">
                <Users className="h-6 w-6 text-white" />
              </div>
              <div className="text-left">
                <h3 className="text-lg font-medium text-white">Tenant</h3>
                <p className="text-sm text-slate-400">Pay rent and request repairs</p>
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}