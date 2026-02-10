import { useState } from 'react';
import { useAuth, type UserRole } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Home, Users, Wrench, Loader2 } from 'lucide-react';
import { isGoogleOAuthConfigured, initiateGoogleLogin } from '../lib/auth-google';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (role: UserRole) => {
    await login(role);
    navigate('/');
  };

  const handleGoogleLogin = async () => {
    setError(null);
    setIsGoogleLoading(true);
    
    try {
      await initiateGoogleLogin();
      // User will be redirected to Google
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to initiate Google login');
      setIsGoogleLoading(false);
    }
  };

  const googleConfigured = isGoogleOAuthConfigured();

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
            Property Manager
          </h2>
          <p className="mt-2 text-center text-sm text-slate-400">
            Sign in to manage your properties
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Google Sign-In Button */}
        <div className="mt-8">
          <button
            onClick={handleGoogleLogin}
            disabled={isGoogleLoading || !googleConfigured}
            className="w-full flex items-center justify-center gap-3 bg-white text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
          >
            {isGoogleLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
            )}
            <span>
              {isGoogleLoading ? 'Redirecting...' : 'Sign in with Google'}
            </span>
          </button>
          
          {!googleConfigured && (
            <p className="mt-2 text-center text-xs text-slate-500">
              Google OAuth not configured. Using demo mode.
            </p>
          )}
        </div>

        {/* Divider */}
        <div className="relative mt-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-700"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-slate-900 text-slate-400">
              Or continue with demo account
            </span>
          </div>
        </div>

        {/* Demo Role Selection */}
        <div className="grid grid-cols-1 gap-4 mt-6">
          <p className="text-center text-xs text-slate-500 mb-2">
            Select a role to explore the app with sample data
          </p>
          
          <button
            onClick={() => handleLogin('owner')}
            className="relative group bg-cc-surface p-6 focus:ring-2 focus:ring-inset focus:ring-indigo-400 rounded-lg hover:bg-cc-border transition-colors"
          >
            <div className="flex items-center space-x-4">
              <div className="bg-indigo-400 p-3 rounded-full">
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
            className="relative group bg-cc-surface p-6 focus:ring-2 focus:ring-inset focus:ring-indigo-400 rounded-lg hover:bg-cc-border transition-colors"
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
            className="relative group bg-cc-surface p-6 focus:ring-2 focus:ring-inset focus:ring-indigo-400 rounded-lg hover:bg-cc-border transition-colors"
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
