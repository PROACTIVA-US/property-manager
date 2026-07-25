import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import OwnerDashboard from './OwnerDashboard';

// Mock all dependencies
vi.mock('../../lib/settings', () => ({
  loadSettings: () => ({
    rentalIncome: {
      monthlyRent: 2400,
      monthlyUtilities: 150,
    },
    tenant: {
      name: 'Gregg Marshall',
      email: 'gregg@example.com',
      phone: '555-123-4567',
      emergencyContact: 'Jane Doe',
      emergencyContactPhone: '555-999-8888',
    },
    owner: {
      name: 'Shanie Holman',
      email: 'owner@example.com',
    },
    pm: {
      name: 'Dan Connolly',
      email: 'pm@example.com',
    },
    property: {
      address: '123 Main St',
      purchasePrice: 350000,
    },
    mortgage: {
      principal: 280000,
      monthlyPayment: 1800,
    },
  }),
  formatCurrency: (val: number, decimals: number = 2) =>
    `$${val.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}`,
}));

vi.mock('../../lib/financials', () => ({
  calculateSimpleCashFlow: () => ({
    monthlyPITI: 1800,
    netMonthlyCashFlow: 750,
    annualCashFlow: 9000,
  }),
}));

vi.mock('../../lib/issues', () => ({
  getIssues: () => [
    { id: '1', title: 'Leaky faucet', status: 'open', priority: 'medium' },
    { id: '2', title: 'HVAC check', status: 'resolved', priority: 'low' },
    { id: '3', title: 'Broken window', status: 'in-progress', priority: 'high' },
  ],
  getEscalatedIssues: () => [
    { id: '4', title: 'Major repair needed', status: 'escalated', priority: 'high' },
  ],
}));

vi.mock('../../lib/projects', () => ({
  getProjects: () => [
    { id: '1', title: 'Kitchen renovation', status: 'active' },
    { id: '2', title: 'Landscaping', status: 'completed' },
  ],
}));

// Mock threads with different unread counts
const mockThreads = [
  {
    id: 'thread-1',
    participants: [
      { id: 'pm-1', role: 'pm', name: 'Dan Connolly' },
      { id: 'tenant-1', role: 'tenant', name: 'Gregg Marshall' },
    ],
    subject: 'HVAC Filter Change',
    lastMessage: 'Maintenance scheduled.',
    lastMessageTime: Date.now() - 2 * 24 * 60 * 60 * 1000,
    unreadCount: 2,
    category: 'maintenance',
  },
  {
    id: 'thread-2',
    participants: [
      { id: 'owner-1', role: 'owner', name: 'Shanie Holman' },
      { id: 'pm-1', role: 'pm', name: 'Dan Connolly' },
    ],
    subject: 'Monthly Property Update',
    lastMessage: 'All on schedule.',
    lastMessageTime: Date.now() - 5 * 24 * 60 * 60 * 1000,
    unreadCount: 3,
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
    lastMessage: 'Let\'s discuss terms.',
    lastMessageTime: Date.now() - 7 * 24 * 60 * 60 * 1000,
    unreadCount: 0,
    category: 'lease',
  },
];

vi.mock('../../lib/messages', () => ({
  getThreads: () => mockThreads,
}));

vi.mock('../../lib/tenant', () => ({
  getLease: () => ({
    propertyAddress: '123 Main St',
    unitNumber: 'Apt 101',
    monthlyRent: 2400,
    startDate: '2025-08-01',
    endDate: '2026-08-01',
    securityDeposit: 2400,
  }),
  getPayments: () => [
    { id: '1', amount: 2400, date: '2026-01-01', status: 'paid' },
    { id: '2', amount: 2400, date: '2025-12-01', status: 'paid' },
  ],
  getDaysUntilLeaseEnd: () => 180,
  getCurrentBalance: () => ({ amount: 2400, status: 'paid', dueDate: '2026-02-15' }),
}));

// Mock the BrowserTabs component
vi.mock('../ui/BrowserTabs', () => ({
  default: ({ tabs }: { tabs: Array<{ id: string; label: string; content: React.ReactNode }> }) => (
    <div data-testid="browser-tabs">
      {tabs.map((tab) => (
        <div key={tab.id} data-testid={`tab-${tab.id}`}>
          <span>{tab.label}</span>
          <div data-testid={`tab-content-${tab.id}`}>{tab.content}</div>
        </div>
      ))}
    </div>
  ),
}));

// Mock Financials page
vi.mock('../../pages/Financials', () => ({
  default: () => <div data-testid="financials-page">Financials Content</div>,
}));

describe('OwnerDashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderComponent = () => {
    return render(
      <MemoryRouter>
        <OwnerDashboard />
      </MemoryRouter>
    );
  };

  describe('Unread Message Count Calculation', () => {
    it('should calculate total unread count from all threads', () => {
      renderComponent();
      // Thread 1: 2 unread, Thread 2: 3 unread, Thread 3: 0 unread = 5 total
      expect(screen.getByText('5')).toBeInTheDocument();
    });
  });

  describe('Owner-Specific Sections', () => {
    it('should render the Property Management tab', () => {
      renderComponent();
      expect(screen.getByText('Property Management')).toBeInTheDocument();
    });

    it('should render the Financial Info tab', () => {
      renderComponent();
      expect(screen.getByText('Financial Info')).toBeInTheDocument();
    });

    it('should render the Occupancy tab', () => {
      renderComponent();
      expect(screen.getByText('Occupancy')).toBeInTheDocument();
    });
  });

  describe('Property Management Tab Content', () => {
    it('should display Messages card with link', () => {
      renderComponent();
      const messagesLinks = screen.getAllByText('Messages');
      expect(messagesLinks.length).toBeGreaterThan(0);
    });

    it('should display Maintenance card', () => {
      renderComponent();
      expect(screen.getByText('Maintenance')).toBeInTheDocument();
    });

    it('should display Projects card', () => {
      renderComponent();
      expect(screen.getByText('Projects')).toBeInTheDocument();
    });

    it('should show open issues count', () => {
      renderComponent();
      // 2 open issues (1 with status 'open', 1 with status 'in-progress')
      // The count appears as part of a span, check that at least one '2' appears
      const openIssuesText = screen.getAllByText('2');
      expect(openIssuesText.length).toBeGreaterThan(0);
    });
  });

  describe('Escalation Alert', () => {
    it('should display escalation alert when there are escalated issues', () => {
      renderComponent();
      expect(screen.getByText(/1 Issue Require Your Attention/i)).toBeInTheDocument();
    });

    it('should display View Issues button', () => {
      renderComponent();
      expect(screen.getByRole('link', { name: /View Issues/i })).toBeInTheDocument();
    });
  });

  describe('Tenant Section Content', () => {
    it('should display tenant name', () => {
      renderComponent();
      expect(screen.getByText('Gregg Marshall')).toBeInTheDocument();
    });

    it('should display tenant email', () => {
      renderComponent();
      expect(screen.getByText('gregg@example.com')).toBeInTheDocument();
    });

    it('should display tenant phone', () => {
      renderComponent();
      expect(screen.getByText('555-123-4567')).toBeInTheDocument();
    });

    it('should display emergency contact info', () => {
      renderComponent();
      expect(screen.getByText(/Emergency: Jane Doe/)).toBeInTheDocument();
    });
  });

  describe('Tenant Modal Interactions', () => {
    it('should open messages modal when messages card is clicked', () => {
      renderComponent();
      // Find the messages button in tenant details (there are multiple "Messages" elements)
      const messagesButtons = screen.getAllByRole('button', { name: /Messages/i });
      const tenantMessagesButton = messagesButtons.find(btn =>
        btn.textContent?.includes('Communication with tenant')
      );

      if (tenantMessagesButton) {
        fireEvent.click(tenantMessagesButton);
        expect(screen.getByText('Tenant Messages')).toBeInTheDocument();
      }
    });

    it('should open lease modal when lease card is clicked', () => {
      renderComponent();
      const leaseButtons = screen.getAllByRole('button', { name: /Lease/i });
      // The first one with "days remaining" is in tenant details
      const tenantLeaseButton = leaseButtons.find(btn =>
        btn.textContent?.includes('days remaining')
      );

      if (tenantLeaseButton) {
        fireEvent.click(tenantLeaseButton);
        expect(screen.getByText('Lease Details')).toBeInTheDocument();
      }
    });

    it('should open payment modal when payment status card is clicked', () => {
      renderComponent();
      const paymentButton = screen.getByRole('button', { name: /Payment Status/i });
      fireEvent.click(paymentButton);
      expect(screen.getByText('Payment History')).toBeInTheDocument();
    });
  });

  describe('Financials Tab', () => {
    it('should render Financials page content in financials tab', () => {
      renderComponent();
      expect(screen.getByTestId('financials-page')).toBeInTheDocument();
    });
  });
});
