import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

type CallbackState = 'processing' | 'success' | 'error';

export default function AuthCallback() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [state, setState] = useState<CallbackState>('processing');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Supabase automatically handles the OAuth callback
        // We just need to check if there's an error in the URL hash
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const errorParam = hashParams.get('error');
        const errorDescription = hashParams.get('error_description');

        if (errorParam) {
          setError(errorDescription || errorParam);
          setState('error');
          return;
        }

        // Check for error in query params (some OAuth flows use query params)
        const queryParams = new URLSearchParams(window.location.search);
        const queryError = queryParams.get('error');
        const queryErrorDescription = queryParams.get('error_description');

        if (queryError) {
          setError(queryErrorDescription || queryError);
          setState('error');
          return;
        }

        // Get the session - Supabase should have processed the callback
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError) {
          setError(sessionError.message);
          setState('error');
          return;
        }

        if (session) {
          setState('success');
          // Wait briefly to show success state, then redirect
          setTimeout(() => navigate('/dashboard'), 1500);
        } else {
          // No session yet, wait for auth state change
          // The AuthContext listener will handle it
          setState('processing');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to complete sign-in');
        setState('error');
      }
    };

    handleCallback();
  }, [navigate]);

  // If user becomes available (from auth state change), redirect
  useEffect(() => {
    if (user && state === 'processing') {
      setState('success');
      setTimeout(() => navigate('/dashboard'), 1500);
    }
  }, [user, state, navigate]);

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
      </div>
    </div>
  );
}
