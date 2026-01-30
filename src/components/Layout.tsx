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
  Sparkles,
  ChevronDown,
  ChevronRight,
  FolderOpen
} from 'lucide-react';
import { cn } from '../lib/utils';
import { getThreads, getNotifications } from '../lib/messages';
import AIAssistant from './ai-assistant/AIAssistant';
import { useAIAssistantStore } from '../stores/aiAssistantStore';

export default function Layout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [unreadCount, setUnreadCount] = useState(0);
  const [managementOpen, setManagementOpen] = useState(false);
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
   * Miller's Law Compliance: 6 top-level items (max 7 allowed)
   *
   * @top-level-count 6
   * @top-level-items Dashboard, Maintenance, Messages, Management, Settings, AI Assistant
   * @grouped-items Management: [Financials, Documents, Vendors, Tenants]
   */

  // Top-level navigation items (3 items)
  const primaryNav = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard, roles: ['owner', 'tenant', 'pm'] },
    { name: 'Maintenance', href: '/maintenance', icon: Wrench, roles: ['owner', 'pm'] },
    { name: 'Messages', href: '/messages', icon: MessageSquare, roles: ['owner', 'pm', 'tenant'], badge: unreadCount },
  ];

  // Collapsible "Management" group - nested items (NOT top-level)
  // Note: 'owner' has READ ONLY access to tenant satisfaction tracking, lease digital signing, and estimate comparison
  const managementNav = [
    { name: 'Financials', href: '/financials', icon: Calculator, roles: ['owner', 'pm', 'tenant'], group: 'Management' },
    { name: 'Documents', href: '/documents', icon: FileText, roles: ['owner', 'pm', 'tenant'], group: 'Management' },
    { name: 'Vendors', href: '/vendors', icon: HardHat, roles: ['owner', 'pm'], group: 'Management' },
    { name: 'Tenants', href: '/tenants', icon: Users, roles: ['owner', 'pm', 'tenant'], group: 'Management' },
  ];

  // Secondary navigation (1 top-level item)
  const secondaryNav = [
    { name: 'Settings', href: '/settings', icon: SettingsIcon, roles: ['owner', 'pm', 'tenant'] },
  ];

  // AI Assistant button (6th top-level item, rendered separately below)

  const filteredPrimaryNav = primaryNav.filter(item => item.roles.includes(user.role || ''));
  const filteredManagementNav = managementNav.filter(item => item.roles.includes(user.role || ''));
  const filteredSecondaryNav = secondaryNav.filter(item => item.roles.includes(user.role || ''));

  // Auto-expand management section if current page is in it
  const isManagementActive = filteredManagementNav.some(item => location.pathname === item.href);

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <div className="hidden md:flex w-64 flex-col fixed inset-y-0 bg-cc-surface/90 backdrop-blur border-r border-cc-border/50">
        <div className="flex-1 flex flex-col min-h-0">
          <div className="flex items-center h-16 flex-shrink-0 px-4 bg-cc-bg/50 border-b border-cc-border/50">
            <h1 className="text-xl font-bold text-cc-accent">PropertyMgr</h1>
          </div>
          <div className="flex-1 flex flex-col overflow-y-auto pt-4">
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

              {/* Management Group (Collapsible) - Only show if user has access to any items */}
              {filteredManagementNav.length > 0 && (
                <div className="pt-2">
                  <button
                    onClick={() => setManagementOpen(!managementOpen)}
                    className={cn(
                      isManagementActive
                        ? 'bg-cc-accent/10 text-cc-accent'
                        : 'text-cc-muted hover:bg-white/5 hover:text-cc-text',
                      'group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors w-full'
                    )}
                  >
                    <FolderOpen
                      className={cn(
                        isManagementActive ? 'text-cc-accent' : 'text-cc-muted group-hover:text-cc-text',
                        'mr-3 flex-shrink-0 h-5 w-5 transition-colors'
                      )}
                      aria-hidden="true"
                    />
                    Management
                    {(managementOpen || isManagementActive) ? (
                      <ChevronDown className="ml-auto h-4 w-4" />
                    ) : (
                      <ChevronRight className="ml-auto h-4 w-4" />
                    )}
                  </button>
                  {(managementOpen || isManagementActive) && (
                    <div className="ml-4 mt-1 space-y-1">
                      {filteredManagementNav.map((item) => {
                        const isActive = location.pathname === item.href;
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
                                'mr-3 flex-shrink-0 h-4 w-4 transition-colors'
                              )}
                              aria-hidden="true"
                            />
                            {item.name}
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* Secondary Navigation */}
              {filteredSecondaryNav.length > 0 && (
                <div className="pt-2 border-t border-cc-border/30 mt-2">
                  {filteredSecondaryNav.map((item) => {
                    const isActive = location.pathname === item.href;
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
                      </Link>
                    );
                  })}
                </div>
              )}

              {/* AI Assistant Toggle */}
              <button
                onClick={toggleAssistant}
                className={cn(
                  isAIOpen
                    ? 'bg-purple-500/10 text-purple-400'
                    : 'text-cc-muted hover:bg-white/5 hover:text-cc-text',
                  'group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors w-full mt-4 border-t border-cc-border/50 pt-4'
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
                <button 
                  onClick={() => logout()}
                  className="ml-auto text-cc-muted hover:text-red-400 transition-colors"
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