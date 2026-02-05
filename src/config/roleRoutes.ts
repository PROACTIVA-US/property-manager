import type { UserRole } from '../contexts/AuthContext';

/**
 * Role-Based Route Configuration
 *
 * Defines navigation and route access for each user role:
 * - Owner: 5 nav items (investment-focused, escalations only)
 * - PM: 8 nav items (full operational toolkit)
 * - Tenant: 4 nav items (rent, maintenance, lease, messages)
 */

export interface RouteConfig {
  path: string;
  allowedRoles: Array<'owner' | 'pm' | 'tenant'>;
  label?: string;
}

/**
 * Owner Navigation (5 items)
 * Focus: Investment performance, financial analysis, escalations only
 */
export const OWNER_NAV = [
  { path: '/', label: 'Dashboard' },
  { path: '/financials', label: 'Financials' },
  { path: '/properties', label: 'Properties' },
  { path: '/documents', label: 'Documents' },
  { path: '/messages', label: 'Messages' },
];

/**
 * PM Navigation (8 items)
 * Focus: Full operational toolkit, issue management, tenant relations
 */
export const PM_NAV = [
  { path: '/', label: 'Dashboard' },
  { path: '/issues', label: 'Issues' },
  { path: '/tenants', label: 'Tenants' },
  { path: '/inspections', label: 'Inspections' },
  { path: '/rent', label: 'Rent' },
  { path: '/vendors', label: 'Vendors' },
  { path: '/leases', label: 'Leases' },
  { path: '/expenses', label: 'Expenses' },
];

/**
 * Tenant Navigation (4 items)
 * Focus: Rent, maintenance, lease - personal data only
 */
export const TENANT_NAV = [
  { path: '/', label: 'Home' },
  { path: '/payments', label: 'Payments' },
  { path: '/maintenance', label: 'Maintenance' },
  { path: '/lease', label: 'Lease' },
];

/**
 * Route access permissions by role
 */
export const ROUTE_PERMISSIONS: Record<string, Array<'owner' | 'pm' | 'tenant'>> = {
  // Shared routes - all authenticated users
  '/': ['owner', 'pm', 'tenant'],
  '/messages': ['owner', 'pm', 'tenant'],
  '/settings': ['owner', 'pm', 'tenant'],

  // Owner-only routes
  '/financials': ['owner'],
  '/properties': ['owner'],

  // Owner and PM routes
  '/documents': ['owner', 'pm'],
  '/accounts': ['owner', 'pm'],

  // PM-only routes
  '/issues': ['pm'],
  '/tenants': ['pm'],
  '/vendors': ['pm'],
  '/inspections': ['pm'],
  '/rent': ['pm'],
  '/leases': ['pm'],
  '/expenses': ['pm'],
  '/maintenance': ['pm', 'tenant'],
  '/responsibilities': ['pm', 'owner'],

  // Tenant-only routes
  '/payments': ['tenant'],
  '/lease': ['tenant'],
  '/tenant': ['tenant'],
};

/**
 * Routes that should redirect users away if they don't have access
 */
export const RESTRICTED_ROUTES: Record<string, string[]> = {
  // Routes tenant cannot access
  tenant: [
    '/financials',
    '/properties',
    '/projects',
    '/vendors',
    '/tenants',
    '/accounts',
    '/inspections',
    '/rent',
    '/leases',
    '/expenses',
    '/issues',
  ],
  // Routes PM cannot access
  pm: [
    '/financials',
    '/properties',
  ],
  // Routes owner cannot access (operational routes)
  owner: [
    '/issues',
    '/inspections',
    '/rent',
    '/leases',
    '/payments',
    '/lease',
  ],
};

/**
 * Get navigation items for a specific role
 */
export function getNavByRole(role: UserRole) {
  switch (role) {
    case 'owner':
      return OWNER_NAV;
    case 'pm':
      return PM_NAV;
    case 'tenant':
      return TENANT_NAV;
    default:
      return [];
  }
}

/**
 * Check if a user role can access a specific route
 */
export function canAccessRoute(userRole: UserRole, path: string): boolean {
  if (!userRole) return false;

  // Check exact match first
  const permissions = ROUTE_PERMISSIONS[path];
  if (permissions) {
    return permissions.includes(userRole);
  }

  // Check if path starts with any restricted route
  const restricted = RESTRICTED_ROUTES[userRole] || [];
  for (const restrictedPath of restricted) {
    if (path.startsWith(restrictedPath)) {
      return false;
    }
  }

  // Default: allow authenticated users
  return true;
}

/**
 * Get the fallback/redirect path for unauthorized access
 */
export function getFallbackPath(_userRole: UserRole): string {
  // All roles redirect to dashboard for now
  // Could be customized per role if needed
  return '/';
}

/**
 * Check if a route is restricted for a specific role
 */
export function isRestrictedRoute(userRole: UserRole, path: string): boolean {
  if (!userRole) return true;

  const restricted = RESTRICTED_ROUTES[userRole] || [];
  return restricted.some(restrictedPath => path.startsWith(restrictedPath));
}
