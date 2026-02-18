import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { cn } from '../lib/utils';

export default function PortalHeader() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Don't render on login or callback pages, or when not authenticated
  if (!user || location.pathname === '/login' || location.pathname === '/auth/callback') {
    return null;
  }

  const isTeach = location.pathname === '/teach';

  return (
    <header className="fixed top-0 left-0 right-0 h-12 z-[60] bg-cc-surface border-b border-cc-border/50 flex items-center justify-between px-4">
      {/* Left: brand */}
      <Link to="/" className="text-lg font-bold text-cc-accent hover:text-cc-accent/80 transition-colors">
        wildvine
      </Link>

      {/* Center: pill toggle */}
      <div className="flex items-center bg-cc-bg rounded-full p-0.5 border border-cc-border/50">
        <button
          onClick={() => navigate('/home')}
          className={cn(
            'px-4 py-1 text-sm font-medium rounded-full transition-colors',
            !isTeach
              ? 'bg-cc-accent text-white'
              : 'text-cc-muted hover:text-cc-text'
          )}
        >
          House
        </button>
        <button
          onClick={() => navigate('/teach')}
          className={cn(
            'px-4 py-1 text-sm font-medium rounded-full transition-colors',
            isTeach
              ? 'bg-emerald-500 text-white'
              : 'text-cc-muted hover:text-cc-text'
          )}
        >
          Teach
        </button>
      </div>

      {/* Right: avatar + logout */}
      <div className="flex items-center gap-2">
        {user.photoURL ? (
          <img
            src={user.photoURL}
            alt={user.displayName}
            className="w-7 h-7 rounded-full"
          />
        ) : (
          <div className="w-7 h-7 rounded-full bg-cc-border flex items-center justify-center text-xs font-bold text-cc-text">
            {user.displayName?.charAt(0) || '?'}
          </div>
        )}
        <button
          onClick={() => logout()}
          className="p-1.5 text-cc-muted hover:text-red-400 transition-colors"
          title="Sign Out"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    </header>
  );
}
