import { useState } from 'react';
import { useAuth, type UserRole } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Home, Users, Wrench, Loader2, Mail, Lock, User, ChevronDown } from 'lucide-react';

type AuthMode = 'signin' | 'signup';

export default function LoginPage() {
  const { signInWithEmail, signUpWithEmail, signInWithGoogle, loginAsDemo, loading } = useAuth();
  const navigate = useNavigate();

  const [authMode, setAuthMode] = useState<AuthMode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [role, setRole] = useState<UserRole>('tenant');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDemoOptions, setShowDemoOptions] = useState(false);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      if (authMode === 'signin') {
        const { error } = await signInWithEmail(email, password);
        if (error) {
          setError(error.message);
        } else {
          navigate('/home');
        }
      } else {
        if (!displayName.trim()) {
          setError('Please enter your name');
          setIsSubmitting(false);
          return;
        }
        const { error } = await signUpWithEmail(email, password, displayName, role);
        if (error) {
          setError(error.message);
        } else {
          // Show success message for email confirmation
          setError(null);
          alert('Check your email for a confirmation link!');
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError(null);
    const { error } = await signInWithGoogle();
    if (error) {
      setError(error.message);
    }
    // User will be redirected to Google
  };

  const handleDemoLogin = (demoRole: UserRole) => {
    loginAsDemo(demoRole);
    navigate('/home');
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
            Property Manager
          </h2>
          <p className="mt-2 text-center text-sm text-slate-400">
            {authMode === 'signin' ? 'Sign in to manage your properties' : 'Create your account'}
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Email/Password Form */}
        <form onSubmit={handleEmailAuth} className="mt-8 space-y-4">
          {authMode === 'signup' && (
            <div>
              <label htmlFor="displayName" className="sr-only">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  id="displayName"
                  name="displayName"
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-slate-600 rounded-lg bg-slate-800 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Full Name"
                />
              </div>
            </div>
          )}

          <div>
            <label htmlFor="email" className="sr-only">
              Email address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-slate-400" />
              </div>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full pl-10 pr-3 py-3 border border-slate-600 rounded-lg bg-slate-800 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Email address"
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="sr-only">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-slate-400" />
              </div>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete={authMode === 'signin' ? 'current-password' : 'new-password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full pl-10 pr-3 py-3 border border-slate-600 rounded-lg bg-slate-800 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Password"
                minLength={6}
              />
            </div>
          </div>

          {authMode === 'signup' && (
            <div>
              <label htmlFor="role" className="block text-sm font-medium text-slate-400 mb-1">
                I am a...
              </label>
              <select
                id="role"
                value={role || 'tenant'}
                onChange={(e) => setRole(e.target.value as UserRole)}
                className="block w-full px-3 py-3 border border-slate-600 rounded-lg bg-slate-800 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="tenant">Tenant</option>
                <option value="owner">Property Owner</option>
                <option value="pm">Property Manager</option>
              </select>
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting || loading}
            className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {(isSubmitting || loading) && <Loader2 className="h-5 w-5 animate-spin" />}
            {authMode === 'signin' ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        {/* Toggle Auth Mode */}
        <div className="text-center">
          <button
            type="button"
            onClick={() => {
              setAuthMode(authMode === 'signin' ? 'signup' : 'signin');
              setError(null);
            }}
            className="text-indigo-400 hover:text-indigo-300 text-sm"
          >
            {authMode === 'signin'
              ? "Don't have an account? Sign up"
              : 'Already have an account? Sign in'}
          </button>
        </div>

        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-700"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-slate-900 text-slate-400">Or continue with</span>
          </div>
        </div>

        {/* Google Sign-In Button */}
        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 bg-white text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
        >
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
          <span>Sign in with Google</span>
        </button>

        {/* Demo Mode Section */}
        <div className="mt-8">
          <button
            type="button"
            onClick={() => setShowDemoOptions(!showDemoOptions)}
            className="w-full flex items-center justify-center gap-2 text-slate-400 hover:text-slate-300 text-sm py-2"
          >
            <span>Try demo mode</span>
            <ChevronDown
              className={`h-4 w-4 transition-transform ${showDemoOptions ? 'rotate-180' : ''}`}
            />
          </button>

          {showDemoOptions && (
            <div className="mt-4 space-y-3">
              <p className="text-center text-xs text-slate-500 mb-2">
                Explore the app with sample data (no account required)
              </p>

              <button
                onClick={() => handleDemoLogin('owner')}
                className="w-full relative group bg-cc-surface p-4 focus:ring-2 focus:ring-inset focus:ring-indigo-400 rounded-lg hover:bg-cc-border transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div className="bg-indigo-400 p-2 rounded-full">
                    <Home className="h-5 w-5 text-white" />
                  </div>
                  <div className="text-left">
                    <h3 className="text-sm font-medium text-white">Owner Demo</h3>
                    <p className="text-xs text-slate-400">Manage financials and assets</p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => handleDemoLogin('pm')}
                className="w-full relative group bg-cc-surface p-4 focus:ring-2 focus:ring-inset focus:ring-indigo-400 rounded-lg hover:bg-cc-border transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div className="bg-blue-500 p-2 rounded-full">
                    <Wrench className="h-5 w-5 text-white" />
                  </div>
                  <div className="text-left">
                    <h3 className="text-sm font-medium text-white">Property Manager Demo</h3>
                    <p className="text-xs text-slate-400">Handle maintenance and tasks</p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => handleDemoLogin('tenant')}
                className="w-full relative group bg-cc-surface p-4 focus:ring-2 focus:ring-inset focus:ring-indigo-400 rounded-lg hover:bg-cc-border transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div className="bg-green-500 p-2 rounded-full">
                    <Users className="h-5 w-5 text-white" />
                  </div>
                  <div className="text-left">
                    <h3 className="text-sm font-medium text-white">Tenant Demo</h3>
                    <p className="text-xs text-slate-400">Pay rent and request repairs</p>
                  </div>
                </div>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
