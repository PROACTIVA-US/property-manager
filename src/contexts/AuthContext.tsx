import { createContext, useContext, useState, type ReactNode } from 'react';
import { loadSettings } from '../lib/settings';
import { clearOAuthTokens, type GoogleUserInfo } from '../lib/auth-google';

export type UserRole = 'owner' | 'tenant' | 'pm' | null;

interface User {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  photoURL?: string;
  isOAuthUser?: boolean;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (role: UserRole) => Promise<void>;
  loginWithGoogle: (userInfo: GoogleUserInfo, role?: UserRole) => Promise<void>;
  logout: () => Promise<void>;
  setUserRole: (role: UserRole) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Storage keys
const MOCK_ROLE_KEY = 'mockUserRole';
const OAUTH_USER_KEY = 'oauthUser';

// Helper function to load initial user from storage
function loadInitialUser(): User | null {
  const oauthUserStr = localStorage.getItem(OAUTH_USER_KEY);
  const storedRole = localStorage.getItem(MOCK_ROLE_KEY) as UserRole;

  if (oauthUserStr) {
    // OAuth user session
    try {
      return JSON.parse(oauthUserStr) as User;
    } catch {
      localStorage.removeItem(OAUTH_USER_KEY);
      return null;
    }
  } else if (storedRole) {
    // Mock role-based session
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

    return {
      uid: '123',
      email: emails[storedRole] || storedRole + '@example.com',
      displayName: displayNames[storedRole] || storedRole.charAt(0).toUpperCase() + storedRole.slice(1),
      role: storedRole,
      isOAuthUser: false,
    };
  }
  return null;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  // Use lazy initialization instead of effect
  const [user, setUser] = useState<User | null>(() => loadInitialUser());
  const [loading, setLoading] = useState(false);

  // Mock role-based login (for demo purposes)
  const login = async (role: UserRole) => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));

    if (role) {
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

      const newUser: User = {
        uid: '123',
        email: emails[role] || role + '@example.com',
        displayName: displayNames[role] || role.charAt(0).toUpperCase() + role.slice(1),
        role: role,
        isOAuthUser: false,
      };

      setUser(newUser);
      localStorage.setItem(MOCK_ROLE_KEY, role);
      localStorage.removeItem(OAUTH_USER_KEY);
    }
    setLoading(false);
  };

  // Google OAuth login
  const loginWithGoogle = async (userInfo: GoogleUserInfo, role: UserRole = 'tenant') => {
    setLoading(true);
    
    const newUser: User = {
      uid: userInfo.id,
      email: userInfo.email,
      displayName: userInfo.name,
      role: role, // Default to tenant, admin can change later
      photoURL: userInfo.picture,
      isOAuthUser: true,
    };

    setUser(newUser);
    localStorage.setItem(OAUTH_USER_KEY, JSON.stringify(newUser));
    localStorage.removeItem(MOCK_ROLE_KEY);
    
    setLoading(false);
  };

  // Update user role (for admin to assign roles to OAuth users)
  const setUserRole = (role: UserRole) => {
    if (user) {
      const updatedUser = { ...user, role };
      setUser(updatedUser);
      
      if (user.isOAuthUser) {
        localStorage.setItem(OAUTH_USER_KEY, JSON.stringify(updatedUser));
      } else {
        if (role) localStorage.setItem(MOCK_ROLE_KEY, role);
      }
    }
  };

  const logout = async () => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    
    setUser(null);
    localStorage.removeItem(MOCK_ROLE_KEY);
    localStorage.removeItem(OAUTH_USER_KEY);
    clearOAuthTokens();
    
    setLoading(false);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, loginWithGoogle, logout, setUserRole }}>
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
