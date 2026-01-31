import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { handleOAuthCallback } from '../lib/auth-google';
import { useAuth } from '../contexts/AuthContext';

type CallbackState = 'processing' | 'success' | 'error' | 'role-selection';

export default function AuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { loginWithGoogle } = useAuth();
  const [state, setState] = useState<CallbackState>('processing');
  const [error, setError] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string>('');

  useEffect(() => {
    const processCallback = async () => {
      const code = searchParams.get('code');
      const stateParam = searchParams.get('state');
      const errorParam = searchParams.get('error');

      // Check for OAuth errors
      if (errorParam) {
        setError('Google sign-in was cancelled or failed: ' + errorParam);
        setState('error');
        return;
      }

      // Validate required parameters
      if (!code || !stateParam) {
        setError('Invalid callback parameters. Please try signing in again.');
        setState('error');
        return;
      }

      try {
        // Exchange code for user info
        const userInfo = await handleOAuthCallback(code, stateParam);
        setUserEmail(userInfo.email);
        
        // For demo, show role selection
        // In production, you might look up the user in a database
        setState('role-selection');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to complete sign-in');
        setState('error');
      }
    };

    processCallback();
  }, [searchParams]);

  const handleRoleSelect = async (role: 'owner' | 'pm' | 'tenant') => {
    setState('processing');
    
    try {
      // Get user info from session (stored during callback)
      const userInfo = {
        id: 'google-user',
        email: userEmail,
        verified_email: true,
        name: userEmail.split('@')[0],
        given_name: userEmail.split('@')[0],
        family_name: '',
        picture: '',
      };

      await loginWithGoogle(userInfo, role);
      setState('success');
      
      // Redirect to dashboard after brief success message
      setTimeout(() => navigate('/'), 1000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to complete login');
      setState('error');
    }
  };

  const handleRetry = () => {
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        {/* Processing State */}
        {state === 'processing' && (
          <div className="text-center">
            <Loader2 className="h-12 w-12 text-indigo-400 animate-spin mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-white mb-2">
              Completing sign-in...
            </h2>
            <p className="text-slate-400">
              Please wait while we verify your credentials.
            </p>
          </div>
        )}

        {/* Success State */}
        {state === 'success' && (
          <div className="text-center">
            <div className="bg-green-500/20 p-4 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
              <CheckCircle className="h-12 w-12 text-green-400" />
            </div>
            <h2 className="text-xl font-semibold text-white mb-2">
              Welcome!
            </h2>
            <p className="text-slate-400">
              Redirecting to dashboard...
            </p>
          </div>
        )}

        {/* Error State */}
        {state === 'error' && (
          <div className="text-center">
            <div className="bg-red-500/20 p-4 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
              <AlertCircle className="h-12 w-12 text-red-400" />
            </div>
            <h2 className="text-xl font-semibold text-white mb-2">
              Sign-in Failed
            </h2>
            <p className="text-red-300 mb-6">
              {error}
            </p>
            <button
              onClick={handleRetry}
              className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-indigo-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Role Selection State */}
        {state === 'role-selection' && (
          <div className="bg-slate-800 rounded-xl p-6">
            <div className="text-center mb-6">
              <h2 className="text-xl font-semibold text-white mb-2">
                Welcome, {userEmail}!
              </h2>
              <p className="text-slate-400 text-sm">
                Select your role to continue. An admin can change this later.
              </p>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => handleRoleSelect('owner')}
                className="w-full bg-slate-700 hover:bg-slate-600 text-white p-4 rounded-lg text-left transition-colors"
              >
                <div className="font-medium">Property Owner</div>
                <div className="text-sm text-slate-400">I own property and want to manage it</div>
              </button>

              <button
                onClick={() => handleRoleSelect('pm')}
                className="w-full bg-slate-700 hover:bg-slate-600 text-white p-4 rounded-lg text-left transition-colors"
              >
                <div className="font-medium">Property Manager</div>
                <div className="text-sm text-slate-400">I manage properties for owners</div>
              </button>

              <button
                onClick={() => handleRoleSelect('tenant')}
                className="w-full bg-slate-700 hover:bg-slate-600 text-white p-4 rounded-lg text-left transition-colors"
              >
                <div className="font-medium">Tenant</div>
                <div className="text-sm text-slate-400">I rent a property</div>
              </button>
            </div>

            <p className="text-xs text-slate-500 text-center mt-4">
              This is a demo app. In production, roles would be assigned by an administrator.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
