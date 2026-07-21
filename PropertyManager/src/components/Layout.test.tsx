import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Mock threads for unread count
const mockThreads = [
  {
    id: 'thread-1',
    participants: [],
    subject: 'Test',
    lastMessage: 'Test message',
    lastMessageTime: Date.now(),
    unreadCount: 3,
    category: 'general',
  },
  {
    id: 'thread-2',
    participants: [],
    subject: 'Test 2',
    lastMessage: 'Test message 2',
    lastMessageTime: Date.now(),
    unreadCount: 2,
    category: 'maintenance',
  },
];

vi.mock('../lib/messages', () => ({
  getThreads: () => mockThreads,
}));

// Mock AI Assistant store
const mockToggleAssistant = vi.fn();
vi.mock('../stores/aiAssistantStore', () => ({
  useAIAssistantStore: () => ({
    toggleAssistant: mockToggleAssistant,
    isOpen: false,
  }),
}));

// Mock ThemeToggle component
vi.mock('./ThemeToggle', () => ({
  default: ({ variant }: { variant: string }) => (
    <button data-testid="theme-toggle" data-variant={variant}>
      Theme Toggle
    </button>
  ),
}));

// Mock AIAssistant component
vi.mock('./ai-assistant/AIAssistant', () => ({
  default: () => <div data-testid="ai-assistant">AI Assistant Panel</div>,
}));

// Create a mockable auth module
const mockLogout = vi.fn();
let currentMockUser: {
  uid: string;
  email: string;
  displayName: string;
  role: 'owner' | 'pm' | 'tenant';
} | null = null;

vi.mock('../contexts/AuthContext', () => ({
  useAuth: () => ({
    user: currentMockUser,
    logout: mockLogout,
  }),
}));

// Helper to create user mocks
const createMockUser = (role: 'owner' | 'pm' | 'tenant') => ({
  uid: `${role}-1`,
  email: `${role}@example.com`,
  displayName: role === 'owner' ? 'Shanie Holman' : role === 'pm' ? 'Dan Connolly' : 'Gregg Marshall',
  role,
});

describe('Layout', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.clear();
    currentMockUser = createMockUser('pm');
  });

  afterEach(() => {
    cleanup();
  });

  const renderLayout = async (children: React.ReactNode = <div>Test Content</div>) => {
    // Dynamically import Layout after setting up the mock
    const { default: Layout } = await import('./Layout');
    return render(
      <MemoryRouter>
        <Layout>{children}</Layout>
      </MemoryRouter>
    );
  };

  describe('Sidebar Badge Count', () => {
    it('should display correct unread count badge on Messages link', async () => {
      await renderLayout();
      // Total unread: 3 + 2 = 5
      const badges = screen.getAllByText('5');
      expect(badges.length).toBeGreaterThan(0);
    });

    it('should show unread badge in sidebar navigation', async () => {
      await renderLayout();
      // The Messages nav item should have the badge
      const messagesLinks = screen.getAllByRole('link', { name: /Messages/i });
      expect(messagesLinks.length).toBeGreaterThan(0);
      // At least one should contain the badge count
      const hasUnreadBadge = messagesLinks.some(link => link.textContent?.includes('5'));
      expect(hasUnreadBadge).toBe(true);
    });
  });

  describe('PM Role Layout', () => {
    it('should show PM-specific navigation items', async () => {
      await renderLayout();
      // PM has Dashboard link
      expect(screen.getAllByRole('link', { name: /Dashboard/i }).length).toBeGreaterThan(0);
      expect(screen.getAllByRole('link', { name: /Issues/i }).length).toBeGreaterThan(0);
    });

    it('should display user name and role', async () => {
      await renderLayout();
      // User name may appear multiple times (desktop + mobile)
      const nameElements = screen.getAllByText('Dan Connolly');
      expect(nameElements.length).toBeGreaterThan(0);
      // Role appears in lowercase
      const roleElements = screen.getAllByText('pm');
      expect(roleElements.length).toBeGreaterThan(0);
    });
  });

  describe('Sidebar Interactions', () => {
    it('should toggle sidebar collapse state', async () => {
      await renderLayout();
      // Find the collapse button
      const collapseButton = screen.getByRole('button', { name: /Collapse sidebar/i });
      fireEvent.click(collapseButton);

      // Should now show expand button
      expect(screen.getByRole('button', { name: /Expand sidebar/i })).toBeInTheDocument();
    });

    it('should persist sidebar collapsed state to localStorage', async () => {
      await renderLayout();
      const collapseButton = screen.getByRole('button', { name: /Collapse sidebar/i });
      fireEvent.click(collapseButton);

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'property-manager-sidebar-collapsed',
        'true'
      );
    });
  });

  describe('Logout Functionality', () => {
    it('should call logout when logout button is clicked', async () => {
      await renderLayout();
      const logoutButtons = screen.getAllByRole('button', { name: /Sign Out/i });
      fireEvent.click(logoutButtons[0]);
      expect(mockLogout).toHaveBeenCalled();
    });
  });

  describe('AI Assistant', () => {
    it('should render AI Assistant panel', async () => {
      await renderLayout();
      expect(screen.getByTestId('ai-assistant')).toBeInTheDocument();
    });

    it('should render AI Assistant toggle button', async () => {
      await renderLayout();
      const aiButtons = screen.getAllByRole('button', { name: /AI Assistant/i });
      expect(aiButtons.length).toBeGreaterThan(0);
    });
  });

  describe('Theme Toggle', () => {
    it('should render theme toggle component', async () => {
      await renderLayout();
      const toggles = screen.getAllByTestId('theme-toggle');
      expect(toggles.length).toBeGreaterThan(0);
    });
  });

  describe('Mobile Menu', () => {
    it('should show mobile menu button on small screens', async () => {
      await renderLayout();
      // Mobile header has a menu button
      const menuButton = screen.getByRole('button', { name: /Open menu/i });
      expect(menuButton).toBeInTheDocument();
    });

    it('should open mobile menu when hamburger is clicked', async () => {
      await renderLayout();
      const menuButton = screen.getByRole('button', { name: /Open menu/i });
      fireEvent.click(menuButton);

      // Close menu button should appear
      expect(screen.getByRole('button', { name: /Close menu/i })).toBeInTheDocument();
    });
  });

  describe('Children Rendering', () => {
    it('should render children content', async () => {
      await renderLayout(<div data-testid="test-child">Test Child Content</div>);
      expect(screen.getByTestId('test-child')).toBeInTheDocument();
    });
  });
});

// Separate describe block for owner role tests that need isolation
describe('Layout - Owner Role', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.clear();
    currentMockUser = createMockUser('owner');
  });

  afterEach(() => {
    cleanup();
  });

  const renderOwnerLayout = async () => {
    const { default: Layout } = await import('./Layout');
    return render(
      <MemoryRouter>
        <Layout><div>Test Content</div></Layout>
      </MemoryRouter>
    );
  };

  it('should render simplified header for owner', async () => {
    await renderOwnerLayout();
    // Owner gets "Hi {firstName}!" greeting
    expect(screen.getByText(/Hi Shanie!/i)).toBeInTheDocument();
  });

  it('should show settings link for owner', async () => {
    await renderOwnerLayout();
    const settingsLinks = screen.getAllByRole('link', { name: /Settings/i });
    expect(settingsLinks.length).toBeGreaterThan(0);
  });
});

// Separate describe block for null user tests
describe('Layout - No User', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.clear();
    currentMockUser = null;
  });

  afterEach(() => {
    cleanup();
  });

  const renderNoUserLayout = async () => {
    const { default: Layout } = await import('./Layout');
    return render(
      <MemoryRouter>
        <Layout><div data-testid="child-content">Child Content</div></Layout>
      </MemoryRouter>
    );
  };

  it('should render children only when no user is logged in', async () => {
    await renderNoUserLayout();
    expect(screen.getByTestId('child-content')).toBeInTheDocument();
    // No sidebar branding when logged out
    expect(screen.queryByText('PropertyMgr')).not.toBeInTheDocument();
  });
});

// Separate describe block for tenant role
describe('Layout - Tenant Role', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.clear();
    currentMockUser = createMockUser('tenant');
  });

  afterEach(() => {
    cleanup();
  });

  const renderTenantLayout = async () => {
    const { default: Layout } = await import('./Layout');
    return render(
      <MemoryRouter>
        <Layout><div>Test Content</div></Layout>
      </MemoryRouter>
    );
  };

  it('should show tenant-specific navigation items', async () => {
    await renderTenantLayout();
    // Tenant has Home link
    expect(screen.getAllByRole('link', { name: /Home/i }).length).toBeGreaterThan(0);
    expect(screen.getAllByRole('link', { name: /Payments/i }).length).toBeGreaterThan(0);
    expect(screen.getAllByRole('link', { name: /Maintenance/i }).length).toBeGreaterThan(0);
  });

  it('should NOT show PM-only navigation items', async () => {
    await renderTenantLayout();
    // Tenant should not see Issues link
    expect(screen.queryByRole('link', { name: /^Issues$/i })).not.toBeInTheDocument();
    // Tenant should not see Vendors link
    expect(screen.queryByRole('link', { name: /^Vendors$/i })).not.toBeInTheDocument();
  });
});
