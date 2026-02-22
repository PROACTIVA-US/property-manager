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
  AlertCircle,
  Menu,
  X,
  PanelLeftClose,
  PanelLeft,
  CreditCard,
  Building2,
  ClipboardCheck,
  Home,
  Receipt,
  ChevronLeft,
  Shield,
} from 'lucide-react';
import { cn } from '../lib/utils';
import { getThreads } from '../lib/messages';
import AIAssistant from './ai-assistant/AIAssistant';
import ThemeToggle from './ThemeToggle';
import { useAIAssistantStore } from '../stores/aiAssistantStore';
import type { LucideIcon } from 'lucide-react';

interface NavItem {
  name: string;
  href: string;
  icon: LucideIcon;
  badge?: number;
}

const SIDEBAR_COLLAPSED_KEY = 'property-manager-sidebar-collapsed';

// Mobile menu state is keyed by pathname to auto-close on navigation
function useMobileMenuState(pathname: string) {
  // Store state with pathname as key - reset to false on pathname change
  const [menuState, setMenuState] = useState<{ pathname: string; isOpen: boolean }>({
    pathname,
    isOpen: false
  });

  // If pathname changed, menu should be closed
  const isOpen = menuState.pathname === pathname ? menuState.isOpen : false;

  const setIsOpen = (open: boolean) => {
    setMenuState({ pathname, isOpen: open });
  };

  return [isOpen, setIsOpen] as const;
}

export default function Layout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [unreadCount, setUnreadCount] = useState(0);
  const { toggleAssistant, isOpen: isAIOpen } = useAIAssistantStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useMobileMenuState(location.pathname);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    const stored = localStorage.getItem(SIDEBAR_COLLAPSED_KEY);
    return stored === 'true';
  });

  // Persist sidebar collapsed state
  useEffect(() => {
    localStorage.setItem(SIDEBAR_COLLAPSED_KEY, String(isSidebarCollapsed));
  }, [isSidebarCollapsed]);

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
      const unreadCount = threads.reduce((acc, t) => acc + t.unreadCount, 0);
      setUnreadCount(unreadCount);
    };

    updateCounts();
    const interval = setInterval(updateCounts, 5000);
    return () => clearInterval(interval);
  }, []);

  if (!user) return <>{children}</>;

  // Owner gets a sidebar-free layout - the 3-card dashboard IS the navigation
  if (user?.role === 'owner') {
    const firstName = user.displayName?.split(' ')[0] || 'there';
    const isHomePage = location.pathname === '/home';

    // Get page title based on current path
    const getPageTitle = () => {
      const pathMap: Record<string, string> = {
        '/financials': 'Financials',
        '/properties': 'Properties',
        '/documents': 'Documents',
        '/messages': 'Messages',
        '/settings': 'Settings',
        '/issues': 'Issues',
        '/projects': 'Projects',
      };
      return pathMap[location.pathname] || '';
    };

    return (
      <div className="min-h-screen bg-cc-bg">
        {/* Simple header for owner */}
        <header className="h-14 border-b border-cc-border/50 bg-cc-surface flex items-center justify-between px-4 sm:px-6 sticky top-0 z-50">
          <div className="flex items-center gap-3">
            {!isHomePage && (
              <button
                onClick={() => window.history.back()}
                className="p-2 text-cc-muted hover:text-cc-text hover:bg-cc-border rounded-lg transition-colors"
                title="Go back"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
            )}
            <Link to="/home" className="text-xl font-bold text-cc-accent hover:text-cc-accent/80 transition-colors">
              Hi {firstName}!
            </Link>
            {!isHomePage && (
              <span className="text-cc-muted">/</span>
            )}
            {!isHomePage && (
              <span className="text-lg font-medium text-cc-text">{getPageTitle()}</span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle variant="button" />
            <Link
              to="/settings"
              className="p-2 text-cc-muted hover:text-cc-text hover:bg-cc-border rounded-lg transition-colors"
              title="Settings"
            >
              <SettingsIcon className="h-5 w-5" />
            </Link>
            <button
              onClick={() => logout()}
              className="p-2 text-cc-muted hover:text-red-400 hover:bg-cc-border rounded-lg transition-colors"
              title="Sign Out"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </header>
        <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
          {children}
        </main>
      </div>
    );
  }

  /**
   * @navigation-structure
   * Role-Based Navigation per UX Audit:
   *
   * OWNER (5 items): Dashboard, Financials, Properties, Documents, Messages
   *   - Investment-focused, no operational noise
   *   - Only sees escalated issues via Dashboard alerts
   *
   * PM (8 items): Dashboard, Issues, Tenants, Inspections, Rent, Vendors, Leases, Expenses
   *   - Full operational toolkit
   *   - No access to Tax/Keep-vs-Sell analysis
   *
   * TENANT (4 items): Home, Payments, Maintenance, Lease
   *   - Minimal, personal-data only
   *   - No Financials, no Projects access
   */

  // Get role-specific navigation
  const getPrimaryNavByRole = (userRole: string | null): NavItem[] => {
    switch (userRole) {
      // OWNER: 5 items (Dashboard, Financials, Properties, Documents, Messages)
      case 'owner':
        return [
          { name: 'Dashboard', href: '/home', icon: LayoutDashboard },
          { name: 'Financials', href: '/financials', icon: Calculator },
          { name: 'Properties', href: '/properties', icon: Building2 },
          { name: 'Documents', href: '/documents', icon: FileText },
          { name: 'Messages', href: '/messages', icon: MessageSquare, badge: unreadCount },
        ];

      // PM: 8 items (Dashboard, Issues, Tenants, Inspections, Rent, Vendors, Leases, Expenses)
      case 'pm':
        return [
          { name: 'Dashboard', href: '/home', icon: LayoutDashboard },
          { name: 'Issues', href: '/issues', icon: AlertCircle },
          { name: 'Tenants', href: '/tenants', icon: Users },
          { name: 'Inspections', href: '/inspections', icon: ClipboardCheck },
          { name: 'Rent', href: '/rent', icon: CreditCard },
          { name: 'Vendors', href: '/vendors', icon: HardHat },
          { name: 'Leases', href: '/leases', icon: FileText },
          { name: 'Expenses', href: '/expenses', icon: Receipt },
          { name: 'Messages', href: '/messages', icon: MessageSquare, badge: unreadCount },
        ];

      // TENANT: 4 items (Home, Payments, Maintenance, Lease)
      case 'tenant':
        return [
          { name: 'Home', href: '/home', icon: Home },
          { name: 'Payments', href: '/payments', icon: CreditCard },
          { name: 'Maintenance', href: '/maintenance', icon: Wrench },
          { name: 'Lease', href: '/lease', icon: FileText },
          { name: 'Messages', href: '/messages', icon: MessageSquare, badge: unreadCount },
        ];

      // ADMIN: 2 items (Dashboard, Users)
      case 'admin':
        return [
          { name: 'Dashboard', href: '/home', icon: LayoutDashboard },
          { name: 'Users', href: '/admin', icon: Shield },
        ];

      default:
        return [];
    }
  };

  // No filtering needed - each role gets their specific nav items
  const filteredPrimaryNav = getPrimaryNavByRole(user?.role || null);

  const sidebarWidth = isSidebarCollapsed ? 'w-16' : 'w-64';
  const mainMargin = isSidebarCollapsed ? 'md:ml-16' : 'md:ml-64';

  return (
    <div className="min-h-screen flex">
      {/* Mobile header */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-14 bg-cc-surface border-b border-cc-border/50 flex items-center justify-between px-4 z-40">
        <button
          onClick={() => setIsMobileMenuOpen(true)}
          className="p-2 text-cc-muted hover:text-cc-text hover:bg-cc-border rounded-lg transition-colors"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>
        <h1 className="text-lg font-bold text-cc-accent">PropertyMgr</h1>
        <div className="flex items-center gap-2">
          <ThemeToggle variant="button" />
        </div>
      </div>

      {/* Mobile menu overlay */}
      {isMobileMenuOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Mobile sidebar */}
      <div
        className={cn(
          'md:hidden fixed top-0 bottom-0 left-0 w-64 bg-cc-surface border-r border-cc-border/50 z-50 transform transition-transform duration-200 ease-in-out',
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex-1 flex flex-col min-h-0 h-full">
          <div className="flex items-center justify-between h-14 flex-shrink-0 px-4 bg-cc-bg/50 border-b border-cc-border/50">
            <h1 className="text-xl font-bold text-cc-accent">PropertyMgr</h1>
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-2 text-cc-muted hover:text-cc-text hover:bg-cc-border rounded-lg transition-colors"
              aria-label="Close menu"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="flex-1 flex flex-col overflow-y-auto pt-4">
            {/* AI Assistant Toggle */}
            <div className="px-2 mb-4">
              <button
                onClick={() => {
                  toggleAssistant();
                  setIsMobileMenuOpen(false);
                }}
                className={cn(
                  isAIOpen
                    ? 'bg-purple-500/10 text-purple-400 border-purple-500/30'
                    : 'text-cc-muted hover:bg-white/5 hover:text-cc-text border-cc-border/50',
                  'group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors w-full border'
                )}
                title="AI Assistant"
              >
                <Sparkles
                  className={cn(
                    isAIOpen ? 'text-purple-400' : 'text-cc-muted group-hover:text-cc-text',
                    'mr-3 flex-shrink-0 h-5 w-5 transition-colors'
                  )}
                  aria-hidden="true"
                />
                AI Assistant
              </button>
            </div>

            <nav className="flex-1 px-2 space-y-1">
              {filteredPrimaryNav.map((item) => {
                const isActive = location.pathname === item.href;
                const badge = item.badge;
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
                  <p className="text-xs font-medium text-cc-muted capitalize">{user.role}</p>
                </div>
                <div className="ml-auto flex items-center gap-2">
                  <Link to="/settings" className="text-cc-muted hover:text-cc-text transition-colors" title="Settings">
                    <SettingsIcon className="h-5 w-5" />
                  </Link>
                  <button onClick={() => logout()} className="text-cc-muted hover:text-red-400 transition-colors" title="Sign Out">
                    <LogOut className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop Sidebar */}
      <div
        className={cn(
          'hidden md:flex flex-col fixed top-0 bottom-0 bg-cc-surface border-r border-cc-border/50 transition-all duration-200 ease-in-out z-30',
          sidebarWidth
        )}
      >
        <div className="flex-1 flex flex-col min-h-0">
          <div className={cn(
            'flex items-center h-16 flex-shrink-0 bg-cc-bg/50 border-b border-cc-border/50',
            isSidebarCollapsed ? 'justify-center px-2' : 'justify-between px-4'
          )}>
            {!isSidebarCollapsed && (
              <h1 className="text-xl font-bold text-cc-accent">PropertyMgr</h1>
            )}
            <button
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className="p-2 text-cc-muted hover:text-cc-text hover:bg-cc-border rounded-lg transition-colors"
              aria-label={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              title={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {isSidebarCollapsed ? (
                <PanelLeft className="h-5 w-5" />
              ) : (
                <PanelLeftClose className="h-5 w-5" />
              )}
            </button>
          </div>
          <div className="flex-1 flex flex-col overflow-y-auto pt-4">
            {/* AI Assistant Toggle - At top of sidebar for quick access */}
            <div className={cn('mb-4', isSidebarCollapsed ? 'px-1' : 'px-2')}>
              <button
                onClick={toggleAssistant}
                className={cn(
                  isAIOpen
                    ? 'bg-purple-500/10 text-purple-400 border-purple-500/30'
                    : 'text-cc-muted hover:bg-white/5 hover:text-cc-text border-cc-border/50',
                  'group flex items-center text-sm font-medium rounded-lg transition-colors w-full border',
                  isSidebarCollapsed ? 'justify-center p-2.5' : 'px-3 py-2.5'
                )}
                title="AI Assistant (⌘+.)"
              >
                <Sparkles
                  className={cn(
                    isAIOpen ? 'text-purple-400' : 'text-cc-muted group-hover:text-cc-text',
                    'flex-shrink-0 h-5 w-5 transition-colors',
                    !isSidebarCollapsed && 'mr-3'
                  )}
                  aria-hidden="true"
                />
                {!isSidebarCollapsed && (
                  <>
                    AI Assistant
                    <span className="ml-auto text-xs text-cc-muted">⌘.</span>
                  </>
                )}
              </button>
            </div>

            <nav className={cn('flex-1 space-y-1', isSidebarCollapsed ? 'px-1' : 'px-2')}>
              {/* Primary Navigation */}
              {filteredPrimaryNav.map((item) => {
                const isActive = location.pathname === item.href;
                const badge = item.badge;
                const showBadge = badge && badge > 0;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={cn(
                      isActive
                        ? 'bg-cc-accent/10 text-cc-accent'
                        : 'text-cc-muted hover:bg-white/5 hover:text-cc-text',
                      'group flex items-center text-sm font-medium rounded-md transition-colors',
                      isSidebarCollapsed ? 'justify-center p-2' : 'px-2 py-2'
                    )}
                    title={isSidebarCollapsed ? item.name : undefined}
                  >
                    <item.icon
                      className={cn(
                        isActive ? 'text-cc-accent' : 'text-cc-muted group-hover:text-cc-text',
                        'flex-shrink-0 h-5 w-5 transition-colors',
                        !isSidebarCollapsed && 'mr-3'
                      )}
                      aria-hidden="true"
                    />
                    {!isSidebarCollapsed && (
                      <>
                        {item.name}
                        {showBadge && (
                          <span className="ml-auto px-2 py-0.5 rounded-full text-xs font-bold bg-cc-accent text-white">
                            {badge}
                          </span>
                        )}
                      </>
                    )}
                    {isSidebarCollapsed && showBadge && (
                      <span className="absolute top-0 right-0 w-2 h-2 bg-cc-accent rounded-full" />
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>
          <div className={cn(
            'flex-shrink-0 border-t border-cc-border/50 bg-cc-bg/30',
            isSidebarCollapsed ? 'p-2' : 'p-4'
          )}>
            <div className="flex-shrink-0 w-full group block">
              <div className={cn('flex items-center', isSidebarCollapsed && 'flex-col gap-2')}>
                <div className="w-8 h-8 rounded-full bg-cc-border flex items-center justify-center text-xs font-bold text-cc-text">
                  {user.displayName.charAt(0)}
                </div>
                {!isSidebarCollapsed && (
                  <>
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
                      <ThemeToggle variant="button" />
                      <button
                        onClick={() => logout()}
                        className="text-cc-muted hover:text-red-400 transition-colors"
                        title="Sign Out"
                      >
                        <LogOut className="h-5 w-5" />
                      </button>
                    </div>
                  </>
                )}
                {isSidebarCollapsed && (
                  <div className="flex flex-col gap-2">
                    <Link
                      to="/settings"
                      className="p-1.5 text-cc-muted hover:text-cc-text hover:bg-cc-border rounded transition-colors"
                      title="Settings"
                    >
                      <SettingsIcon className="h-4 w-4" />
                    </Link>
                    <ThemeToggle variant="button" />
                    <button
                      onClick={() => logout()}
                      className="p-1.5 text-cc-muted hover:text-red-400 hover:bg-cc-border rounded transition-colors"
                      title="Sign Out"
                    >
                      <LogOut className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className={cn('flex flex-col flex-1 transition-all duration-200 ease-in-out pt-14 md:pt-0', mainMargin)}>
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