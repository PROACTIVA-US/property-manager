import { useState } from 'react';
import { useAuth, type UserRole } from '../contexts/AuthContext';
import { X, Loader2 } from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const { signInWithEmail, signUpWithEmail, signInWithGoogle, loading } = useAuth();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [role, setRole] = useState<UserRole>('tenant');
  const [error, setError] = useState<string | null>(null);
  const [signUpSuccess, setSignUpSuccess] = useState(false);

  if (!isOpen) return null;

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setDisplayName('');
    setRole('tenant');
    setError(null);
    setSignUpSuccess(false);
  };

  const switchMode = (newMode: 'signin' | 'signup') => {
    resetForm();
    setMode(newMode);
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const { error } = await signInWithEmail(email, password);
    if (error) {
      setError(error.message);
    } else {
      onClose();
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const { error } = await signUpWithEmail(email, password, displayName, role);
    if (error) {
      setError(error.message);
    } else {
      setSignUpSuccess(true);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    const { error } = await signInWithGoogle();
    if (error) {
      setError(error.message);
    } else {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-cc-surface border border-cc-border rounded-2xl p-8 w-full max-w-sm mx-4 shadow-2xl">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 text-cc-muted hover:text-cc-text transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        <h2 className="text-xl font-bold text-cc-text mb-2">
          {mode === 'signin' ? 'Welcome back' : 'Create account'}
        </h2>
        <p className="text-sm text-cc-muted mb-6">
          {mode === 'signin'
            ? 'Sign in to manage your properties'
            : 'Sign up for a new account'}
        </p>

        {error && (
          <div className="bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded-lg text-sm mb-4">
            {error}
          </div>
        )}

        {signUpSuccess ? (
          <div className="bg-green-900/50 border border-green-500 text-green-200 px-4 py-3 rounded-lg text-sm mb-4">
            Check your email for a confirmation link to complete sign-up.
          </div>
        ) : (
          <form onSubmit={mode === 'signin' ? handleSignIn : handleSignUp} className="space-y-4">
            {mode === 'signup' && (
              <div>
                <label className="block text-sm font-medium text-cc-text mb-1">Display Name</label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-cc-bg border border-cc-border rounded-lg text-cc-text placeholder-cc-muted focus:outline-none focus:ring-2 focus:ring-cc-accent focus:border-transparent"
                  placeholder="Your name"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-cc-text mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-3 py-2 bg-cc-bg border border-cc-border rounded-lg text-cc-text placeholder-cc-muted focus:outline-none focus:ring-2 focus:ring-cc-accent focus:border-transparent"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-cc-text mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full px-3 py-2 bg-cc-bg border border-cc-border rounded-lg text-cc-text placeholder-cc-muted focus:outline-none focus:ring-2 focus:ring-cc-accent focus:border-transparent"
                placeholder="••••••••"
              />
            </div>

            {mode === 'signup' && (
              <div>
                <label className="block text-sm font-medium text-cc-text mb-1">Role</label>
                <select
                  value={role || 'tenant'}
                  onChange={(e) => setRole(e.target.value as UserRole)}
                  className="w-full px-3 py-2 bg-cc-bg border border-cc-border rounded-lg text-cc-text focus:outline-none focus:ring-2 focus:ring-cc-accent focus:border-transparent"
                >
                  <option value="tenant">Tenant</option>
                  <option value="owner">Owner</option>
                  <option value="pm">Property Manager</option>
                </select>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-cc-accent text-white px-6 py-3 rounded-lg font-medium hover:bg-cc-accent/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading && <Loader2 className="h-5 w-5 animate-spin" />}
              {mode === 'signin' ? 'Sign In' : 'Sign Up'}
            </button>
          </form>
        )}

        {!signUpSuccess && (
          <>
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-cc-border"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-cc-surface text-cc-muted">Or continue with</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-white text-gray-900 border border-gray-300 px-6 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
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
              Google
            </button>
          </>
        )}

        <div className="mt-4 text-center text-sm text-cc-muted">
          {mode === 'signin' ? (
            <>
              Don't have an account?{' '}
              <button
                onClick={() => switchMode('signup')}
                className="text-cc-accent hover:underline"
              >
                Sign up
              </button>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <button
                onClick={() => switchMode('signin')}
                className="text-cc-accent hover:underline"
              >
                Sign in
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
