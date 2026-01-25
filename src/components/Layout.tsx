import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Calculator,
  Wrench,
  MessageSquare,
  FileText,
  LogOut,
  Users,
  HardHat,
  Settings as SettingsIcon,
  Sparkles
} from 'lucide-react';
import { cn } from '../lib/utils';
import { getThreads, getNotifications } from '../lib/messages';
import AIAssistant from './ai-assistant/AIAssistant';
import { useAIAssistantStore } from '../stores/aiAssistantStore';

export default function Layout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [unreadCount, setUnreadCount] = useState(0);
  const { toggleAssistant, isOpen: isAIOpen } = useAIAssistantStore();

  // Keyboard shortcut for AI Assistant (Cmd+. or Ctrl+.)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === '.') {
        e.preventDefault();
        toggleAssistant();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleAssistant]);

  // Refresh unread counts periodically
  useEffect(() => {
    const updateCounts = () => {
      const threads = getThreads();
      const notifications = getNotifications();
      const threadUnread = threads.reduce((acc, t) => acc + t.unreadCount, 0);
      const notifUnread = notifications.filter(n => !n.read).length;
      setUnreadCount(threadUnread + notifUnread);
    };

    updateCounts();
    const interval = setInterval(updateCounts, 5000);
    return () => clearInterval(interval);
  }, []);

  if (!user) return <>{children}</>;

  // Navigation order: Maintenance & Notifications at top, Financials toward bottom
  const navigation = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard, roles: ['owner', 'tenant', 'pm'] },
    { name: 'Maintenance', href: '/maintenance', icon: Wrench, roles: ['owner', 'pm', 'tenant'] },
    { name: 'Messages', href: '/messages', icon: MessageSquare, roles: ['owner', 'pm', 'tenant'], badge: unreadCount },
    { name: 'Documents', href: '/documents', icon: FileText, roles: ['owner', 'pm', 'tenant'] },
    { name: 'Vendors', href: '/vendors', icon: HardHat, roles: ['pm'] }, // PM-only
    { name: 'Tenants', href: '/tenants', icon: Users, roles: ['pm'] }, // PM-only
    { name: 'Financials', href: '/financials', icon: Calculator, roles: ['owner'] },
    { name: 'Settings', href: '/settings', icon: SettingsIcon, roles: ['owner', 'pm'] },
  ];

  const filteredNav = navigation.filter(item => item.roles.includes(user.role || ''));

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <div className="hidden md:flex w-64 flex-col fixed inset-y-0 bg-brand-navy/90 backdrop-blur border-r border-slate-700/50">
        <div className="flex-1 flex flex-col min-h-0">
          <div className="flex items-center h-16 flex-shrink-0 px-4 bg-brand-dark/50 border-b border-slate-700/50">
            <h1 className="text-xl font-bold text-brand-orange">PropertyMgr</h1>
          </div>
          <div className="flex-1 flex flex-col overflow-y-auto pt-4">
            <nav className="flex-1 px-2 space-y-1">
              {filteredNav.map((item) => {
                const isActive = location.pathname === item.href;
                const badge = (item as any).badge;
                const showBadge = badge && badge > 0;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={cn(
                      isActive
                        ? 'bg-brand-orange/10 text-brand-orange'
                        : 'text-brand-muted hover:bg-white/5 hover:text-brand-light',
                      'group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors'
                    )}
                  >
                    <item.icon
                      className={cn(
                        isActive ? 'text-brand-orange' : 'text-brand-muted group-hover:text-brand-light',
                        'mr-3 flex-shrink-0 h-5 w-5 transition-colors'
                      )}
                      aria-hidden="true"
                    />
                    {item.name}
                    {showBadge && (
                      <span className="ml-auto px-2 py-0.5 rounded-full text-xs font-bold bg-brand-orange text-white">
                        {badge}
                      </span>
                    )}
                  </Link>
                );
              })}

              {/* AI Assistant Toggle */}
              <button
                onClick={toggleAssistant}
                className={cn(
                  isAIOpen
                    ? 'bg-purple-500/10 text-purple-400'
                    : 'text-brand-muted hover:bg-white/5 hover:text-brand-light',
                  'group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors w-full mt-4 border-t border-slate-700/50 pt-4'
                )}
                title="AI Assistant (⌘+.)"
              >
                <Sparkles
                  className={cn(
                    isAIOpen ? 'text-purple-400' : 'text-brand-muted group-hover:text-brand-light',
                    'mr-3 flex-shrink-0 h-5 w-5 transition-colors'
                  )}
                  aria-hidden="true"
                />
                AI Assistant
                <span className="ml-auto text-xs text-brand-muted">⌘.</span>
              </button>
            </nav>
          </div>
          <div className="flex-shrink-0 flex border-t border-slate-700/50 p-4 bg-brand-dark/30">
            <div className="flex-shrink-0 w-full group block">
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-brand-light">
                  {user.displayName.charAt(0)}
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-brand-light">{user.displayName}</p>
                  <p className="text-xs font-medium text-brand-muted capitalize">
                    {user.role}
                  </p>
                </div>
                <button 
                  onClick={() => logout()}
                  className="ml-auto text-brand-muted hover:text-red-400 transition-colors"
                  title="Sign Out"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="md:ml-64 flex flex-col flex-1">
        <main className="flex-1">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              {children}
            </div>
          </div>
        </main>
      </div>

      {/* AI Assistant Panel */}
      <AIAssistant />
    </div>
  );
}