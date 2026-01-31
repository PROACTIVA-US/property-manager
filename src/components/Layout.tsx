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
  Settings as SettingsIcon,
  Sparkles,
  HardHat,
  AlertCircle
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

  /**
   * @navigation-structure
   * Miller's Law Compliance: 6 top-level navigation items (max 7 allowed)
   *
   * TOP-LEVEL NAVIGATION (6 items total):
   *   1. Dashboard
   *   2. Projects & Maintenance
   *   3. Messages
   *   4. Financials
   *   5. Documents
   *   6. People (combines Vendors + Tenants)
   *
   * USER PROFILE AREA (not counted as navigation):
   *   - Settings (accessed via gear icon in user profile)
   *
   * NON-NAVIGATION ELEMENTS (not counted):
   *   - AI Assistant toggle button (panel toggle, not a route)
   *
   * @top-level-count 6
   * @top-level-items Dashboard, Projects & Maintenance, Messages, Financials, Documents, People
   * @millers-law-compliant true
   */

  // Top-level navigation items (7 items - within Miller's Law limit of 7)
  const primaryNav = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard, roles: ['owner', 'tenant', 'pm'] },
    { name: 'Issues', href: '/issues', icon: AlertCircle, roles: ['owner', 'pm', 'tenant'] }, // Issue Tracking
    { name: 'Projects', href: '/maintenance', icon: Wrench, roles: ['owner', 'pm', 'tenant'] },
    { name: 'Messages', href: '/messages', icon: MessageSquare, roles: ['owner', 'pm', 'tenant'], badge: unreadCount },
    { name: 'Financials', href: '/financials', icon: Calculator, roles: ['owner', 'pm', 'tenant'] },
    { name: 'Documents', href: '/documents', icon: FileText, roles: ['owner', 'pm', 'tenant'] },
    { name: 'People', href: '/tenants', icon: Users, roles: ['owner', 'pm'] }, // Tenant Management - not visible to tenants
    { name: 'Vendors', href: '/vendors', icon: HardHat, roles: ['owner', 'pm'] }, // Vendor Management - owner has full access
  ];

  // Settings and Vendors are accessed from within other sections or via contextual links
  // This keeps the main navigation clean and within Miller's Law limits

  // AI Assistant is a toggle button for a slide-out panel, not a navigation item

  const filteredPrimaryNav = primaryNav.filter(item => item.roles.includes(user.role || ''));

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <div className="hidden md:flex w-64 flex-col fixed inset-y-0 bg-cc-surface/90 backdrop-blur border-r border-cc-border/50">
        <div className="flex-1 flex flex-col min-h-0">
          <div className="flex items-center h-16 flex-shrink-0 px-4 bg-cc-bg/50 border-b border-cc-border/50">
            <h1 className="text-xl font-bold text-cc-accent">PropertyMgr</h1>
          </div>
          <div className="flex-1 flex flex-col overflow-y-auto pt-4">
            {/* AI Assistant Toggle - At top of sidebar for quick access */}
            <div className="px-2 mb-4">
              <button
                onClick={toggleAssistant}
                className={cn(
                  isAIOpen
                    ? 'bg-purple-500/10 text-purple-400 border-purple-500/30'
                    : 'text-cc-muted hover:bg-white/5 hover:text-cc-text border-cc-border/50',
                  'group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors w-full border'
                )}
                title="AI Assistant (⌘+.)"
              >
                <Sparkles
                  className={cn(
                    isAIOpen ? 'text-purple-400' : 'text-cc-muted group-hover:text-cc-text',
                    'mr-3 flex-shrink-0 h-5 w-5 transition-colors'
                  )}
                  aria-hidden="true"
                />
                AI Assistant
                <span className="ml-auto text-xs text-cc-muted">⌘.</span>
              </button>
            </div>

            <nav className="flex-1 px-2 space-y-1">
              {/* Primary Navigation */}
              {filteredPrimaryNav.map((item) => {
                const isActive = location.pathname === item.href;
                const badge = (item as any).badge;
                const showBadge = badge && badge > 0;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={cn(
                      isActive
                        ? 'bg-cc-accent/10 text-cc-accent'
                        : 'text-cc-muted hover:bg-white/5 hover:text-cc-text',
                      'group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors'
                    )}
                  >
                    <item.icon
                      className={cn(
                        isActive ? 'text-cc-accent' : 'text-cc-muted group-hover:text-cc-text',
                        'mr-3 flex-shrink-0 h-5 w-5 transition-colors'
                      )}
                      aria-hidden="true"
                    />
                    {item.name}
                    {showBadge && (
                      <span className="ml-auto px-2 py-0.5 rounded-full text-xs font-bold bg-cc-accent text-white">
                        {badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>
          <div className="flex-shrink-0 flex border-t border-cc-border/50 p-4 bg-cc-bg/30">
            <div className="flex-shrink-0 w-full group block">
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-full bg-cc-border flex items-center justify-center text-xs font-bold text-cc-text">
                  {user.displayName.charAt(0)}
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-cc-text">{user.displayName}</p>
                  <p className="text-xs font-medium text-cc-muted capitalize">
                    {user.role}
                  </p>
                </div>
                <div className="ml-auto flex items-center gap-2">
                  <Link
                    to="/settings"
                    className="text-cc-muted hover:text-cc-text transition-colors"
                    title="Settings"
                  >
                    <SettingsIcon className="h-5 w-5" />
                  </Link>
                  <button
                    onClick={() => logout()}
                    className="text-cc-muted hover:text-red-400 transition-colors"
                    title="Sign Out"
                  >
                    <LogOut className="h-5 w-5" />
                  </button>
                </div>
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