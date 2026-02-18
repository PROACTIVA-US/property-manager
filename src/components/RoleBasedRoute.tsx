import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { canAccessRoute, getFallbackPath } from '../config/roleRoutes';

interface RoleBasedRouteProps {
  children: React.ReactNode;
  allowedRoles?: Array<'owner' | 'pm' | 'tenant'>;
  fallbackPath?: string;
}

/**
 * RoleBasedRoute Component
 *
 * Enforces role-based access control for protected routes.
 * Works in conjunction with ProtectedRoute (which handles authentication).
 *
 * Usage:
 * <Route path="/financials" element={
 *   <ProtectedRoute>
 *     <RoleBasedRoute allowedRoles={['owner']}>
 *       <Financials />
 *     </RoleBasedRoute>
 *   </ProtectedRoute>
 * } />
 *
 * Or use the path-based permission check:
 * <RoleBasedRoute>
 *   <Financials />
 * </RoleBasedRoute>
 */
export default function RoleBasedRoute({
  children,
  allowedRoles,
  fallbackPath,
}: RoleBasedRouteProps) {
  const { user } = useAuth();
  const location = useLocation();

  // If no user (shouldn't happen if wrapped in ProtectedRoute), redirect to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // If specific roles are provided, check against them
  if (allowedRoles && allowedRoles.length > 0) {
    if (!allowedRoles.includes(user.role as 'owner' | 'pm' | 'tenant')) {
      console.warn(
        `[RoleBasedRoute] Access denied: ${user.role} tried to access route restricted to ${allowedRoles.join(', ')}`
      );
      return <Navigate to={fallbackPath || getFallbackPath(user.role)} replace />;
    }
  }

  // If using path-based permissions (no allowedRoles specified)
  // This allows using RoleBasedRoute without explicitly listing roles
  if (!allowedRoles) {
    const currentPath = location.pathname;
    if (!canAccessRoute(user.role, currentPath)) {
      console.warn(
        `[RoleBasedRoute] Access denied: ${user.role} cannot access ${currentPath}`
      );
      return <Navigate to={fallbackPath || getFallbackPath(user.role)} replace />;
    }
  }

  return <>{children}</>;
}

/**
 * Hook to check if current user can access a route
 * Useful for conditional rendering in components
 */
// eslint-disable-next-line react-refresh/only-export-components
export function useCanAccess(path: string): boolean {
  const { user } = useAuth();
  if (!user) return false;
  return canAccessRoute(user.role, path);
}

/**
 * Hook to check if current user has a specific role
 */
// eslint-disable-next-line react-refresh/only-export-components
export function useHasRole(roles: Array<'owner' | 'pm' | 'tenant'>): boolean {
  const { user } = useAuth();
  if (!user || !user.role) return false;
  return roles.includes(user.role as 'owner' | 'pm' | 'tenant');
}
