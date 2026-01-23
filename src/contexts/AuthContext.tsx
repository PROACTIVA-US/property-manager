import { createContext, useContext, useState, type ReactNode, useEffect } from 'react';
import { loadSettings } from '../lib/settings';

export type UserRole = 'owner' | 'tenant' | 'pm' | null;

interface User {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (role: UserRole) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate checking local storage for auth
    const storedRole = localStorage.getItem('mockUserRole') as UserRole;
    if (storedRole) {
      // Get real data from settings
      const settings = loadSettings();

      const displayNames: Record<string, string> = {
        tenant: settings.tenant.name,
        owner: settings.owner.name,
        pm: settings.pm.name,
      };

      const emails: Record<string, string> = {
        tenant: settings.tenant.email,
        owner: settings.owner.email,
        pm: settings.pm.email,
      };

      setUser({
        uid: '123',
        email: emails[storedRole] || `${storedRole}@example.com`,
        displayName: displayNames[storedRole] || `${storedRole.charAt(0).toUpperCase() + storedRole.slice(1)}`,
        role: storedRole
      });
    }
    setLoading(false);
  }, []);

  const login = async (role: UserRole) => {
    // Simulate API call
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));

    if (role) {
      // Get real data from settings
      const settings = loadSettings();

      const displayNames: Record<string, string> = {
        tenant: settings.tenant.name,
        owner: settings.owner.name,
        pm: settings.pm.name,
      };

      const emails: Record<string, string> = {
        tenant: settings.tenant.email,
        owner: settings.owner.email,
        pm: settings.pm.email,
      };

      setUser({
        uid: '123',
        email: emails[role] || `${role}@example.com`,
        displayName: displayNames[role] || `${role.charAt(0).toUpperCase() + role.slice(1)}`,
        role: role
      });
      localStorage.setItem('mockUserRole', role);
    }
    setLoading(false);
  };

  const logout = async () => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    setUser(null);
    localStorage.removeItem('mockUserRole');
    setLoading(false);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}