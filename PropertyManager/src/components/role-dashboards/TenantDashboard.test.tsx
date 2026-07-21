import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import TenantDashboard from './TenantDashboard';

// Mock the auth context
const mockUser = {
  uid: 'tenant-1',
  email: 'tenant@example.com',
  displayName: 'Gregg Marshall',
  role: 'tenant' as const,
};

vi.mock('../../contexts/AuthContext', () => ({
  useAuth: () => ({ user: mockUser }),
}));

// Mock tenant lib functions
vi.mock('../../lib/tenant', () => ({
  getCurrentBalance: () => ({ amount: 2400, status: 'pending', dueDate: '2026-02-15' }),
  getOpenMaintenanceRequestsCount: () => 2,
  getDaysUntilRentDue: () => 10,
  getDaysUntilLeaseEnd: () => 180,
  getLease: () => ({
    propertyAddress: '123 Main St',
    unitNumber: 'Apt 101',
    monthlyRent: 2400,
    startDate: '2025-08-01',
    endDate: '2026-08-01',
    securityDeposit: 2400,
  }),
  formatCurrency: (val: number) => `$${val.toLocaleString()}`,
}));

// Mock messages lib with threads that have tenant participants
const mockThreads = [
  {
    id: 'thread-1',
    participants: [
      { id: 'pm-1', role: 'pm', name: 'Dan Connolly' },
      { id: 'tenant-1', role: 'tenant', name: 'Gregg Marshall' },
    ],
    subject: 'HVAC Filter Change',
    lastMessage: 'Maintenance will be entering on Tuesday.',
    lastMessageTime: Date.now() - 2 * 24 * 60 * 60 * 1000,
    unreadCount: 1,
    category: 'maintenance',
  },
  {
    id: 'thread-2',
    participants: [
      { id: 'owner-1', role: 'owner', name: 'Shanie Holman' },
      { id: 'pm-1', role: 'pm', name: 'Dan Connolly' },
    ],
    subject: 'Monthly Property Update',
    lastMessage: 'All maintenance tasks are on schedule.',
    lastMessageTime: Date.now() - 5 * 24 * 60 * 60 * 1000,
    unreadCount: 0,
    category: 'general',
  },
  {
    id: 'thread-3',
    participants: [
      { id: 'owner-1', role: 'owner', name: 'Shanie Holman' },
      { id: 'pm-1', role: 'pm', name: 'Dan Connolly' },
      { id: 'tenant-1', role: 'tenant', name: 'Gregg Marshall' },
    ],
    subject: 'Lease Renewal',
    lastMessage: 'Let\'s discuss renewal terms.',
    lastMessageTime: Date.now() - 7 * 24 * 60 * 60 * 1000,
    unreadCount: 2,
    category: 'lease',
  },
];

vi.mock('../../lib/messages', () => ({
  getThreads: () => mockThreads,
  markMessagesAsRead: vi.fn(),
  formatRelativeTime: () => '2d ago',
}));

// Mock child components
vi.mock('../PaymentHistory', () => ({
  default: ({ onBack }: { onBack: () => void }) => (
    <div data-testid="payment-history">
      <button onClick={onBack}>Back</button>
    </div>
  ),
}));

vi.mock('../LeaseDetails', () => ({
  default: ({ onBack }: { onBack: () => void }) => (
    <div data-testid="lease-details">
      <button onClick={onBack}>Back</button>
    </div>
  ),
}));

vi.mock('../MaintenanceRequest', () => ({
  default: ({ onBack }: { onBack: () => void }) => (
    <div data-testid="maintenance-request">
      <button onClick={onBack}>Back</button>
    </div>
  ),
}));

describe('TenantDashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderComponent = () => {
    return render(
      <MemoryRouter>
        <TenantDashboard />
      </MemoryRouter>
    );
  };

  describe('Thread Filtering', () => {
    it('should only display threads where tenant is a participant', () => {
      renderComponent();

      // Thread 1 has tenant participant - should show
      expect(screen.getByText('HVAC Filter Change')).toBeInTheDocument();

      // Thread 2 has no tenant participant - should NOT show
      expect(screen.queryByText('Monthly Property Update')).not.toBeInTheDocument();

      // Thread 3 has tenant participant - should show
      expect(screen.getByText('Lease Renewal')).toBeInTheDocument();
    });

    it('should calculate unread count from filtered threads only', () => {
      renderComponent();

      // Thread 1 has 1 unread, Thread 3 has 2 unread = 3 total
      // Thread 2 has 0 unread but shouldn't be included since tenant isn't a participant
      expect(screen.getByText('3 unread')).toBeInTheDocument();
    });
  });

  describe('Welcome Header', () => {
    it('should display welcome message with user name', () => {
      renderComponent();
      expect(screen.getByText(/Welcome Home, Gregg Marshall/)).toBeInTheDocument();
    });

    it('should display property address', () => {
      renderComponent();
      expect(screen.getByText(/123 Main St, Apt 101/)).toBeInTheDocument();
    });
  });

  describe('Main Dashboard Cards', () => {
    it('should display payments card', () => {
      renderComponent();
      expect(screen.getByRole('button', { name: /Payments/i })).toBeInTheDocument();
    });

    it('should display maintenance card', () => {
      renderComponent();
      expect(screen.getByRole('button', { name: /Maintenance/i })).toBeInTheDocument();
    });

    it('should display lease card', () => {
      renderComponent();
      expect(screen.getByRole('button', { name: /Lease/i })).toBeInTheDocument();
    });

    it('should show open maintenance request count', () => {
      renderComponent();
      expect(screen.getByText('2 open')).toBeInTheDocument();
    });

    it('should show days until lease ends', () => {
      renderComponent();
      expect(screen.getByText('180 days left')).toBeInTheDocument();
    });
  });

  describe('Card Interactions', () => {
    it('should expand payments card when clicked', () => {
      renderComponent();
      const paymentsCard = screen.getByRole('button', { name: /Payments/i });
      fireEvent.click(paymentsCard);

      expect(screen.getByText('Next Payment Due')).toBeInTheDocument();
    });

    it('should expand maintenance card when clicked', () => {
      renderComponent();
      const maintenanceCard = screen.getByRole('button', { name: /Maintenance/i });
      fireEvent.click(maintenanceCard);

      expect(screen.getByText('Maintenance Requests')).toBeInTheDocument();
    });

    it('should expand lease card when clicked', () => {
      renderComponent();
      const leaseCard = screen.getByRole('button', { name: /Lease/i });
      fireEvent.click(leaseCard);

      expect(screen.getByText('Lease Information')).toBeInTheDocument();
    });

    it('should collapse card when clicked again', () => {
      renderComponent();
      const paymentsCard = screen.getByRole('button', { name: /Payments/i });

      // Expand
      fireEvent.click(paymentsCard);
      expect(screen.getByText('Next Payment Due')).toBeInTheDocument();

      // Collapse
      fireEvent.click(paymentsCard);
      expect(screen.queryByText('Next Payment Due')).not.toBeInTheDocument();
    });
  });

  describe('Messages Section', () => {
    it('should display messages section header', () => {
      renderComponent();
      expect(screen.getByText('Messages')).toBeInTheDocument();
    });

    it('should display unread message badge', () => {
      renderComponent();
      expect(screen.getByText('3 unread')).toBeInTheDocument();
    });

    it('should display thread subjects from filtered threads', () => {
      renderComponent();
      expect(screen.getByText('HVAC Filter Change')).toBeInTheDocument();
      expect(screen.getByText('Lease Renewal')).toBeInTheDocument();
    });

    it('should not show threads where tenant is not a participant', () => {
      renderComponent();
      // Thread 2 only has owner and pm participants
      expect(screen.queryByText('Monthly Property Update')).not.toBeInTheDocument();
    });
  });
});
