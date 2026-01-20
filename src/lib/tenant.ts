// Tenant-related types and data management

export type PaymentStatus = 'paid' | 'pending' | 'overdue' | 'processing';

export interface Payment {
  id: string;
  date: string;
  amount: number;
  status: PaymentStatus;
  method?: string;
  confirmationNumber?: string;
}

export interface Lease {
  id: string;
  propertyAddress: string;
  unitNumber: string;
  startDate: string;
  endDate: string;
  monthlyRent: number;
  securityDeposit: number;
  terms: string[];
  documentUrl?: string;
  renewalEligible: boolean;
  renewalInterestExpressed?: boolean;
}

export type MaintenanceCategory = 'plumbing' | 'electrical' | 'hvac' | 'appliance' | 'structural' | 'pest' | 'other';
export type MaintenanceUrgency = 'low' | 'medium' | 'high' | 'emergency';
export type MaintenanceStatus = 'submitted' | 'in_progress' | 'scheduled' | 'completed' | 'cancelled';

export interface MaintenanceRequest {
  id: string;
  category: MaintenanceCategory;
  urgency: MaintenanceUrgency;
  title: string;
  description: string;
  photoUrl?: string;
  status: MaintenanceStatus;
  submittedDate: string;
  scheduledDate?: string;
  completedDate?: string;
  notes?: string;
}

export interface TenantMessage {
  id: string;
  from: string;
  subject: string;
  preview: string;
  date: string;
  read: boolean;
}

// Local storage keys
const STORAGE_KEYS = {
  PAYMENTS: 'tenant_payments',
  LEASE: 'tenant_lease',
  MAINTENANCE_REQUESTS: 'tenant_maintenance_requests',
  MESSAGES: 'tenant_messages',
} as const;

// Mock data for Gregg Marshall
const MOCK_PAYMENTS: Payment[] = [
  { id: 'pay-001', date: '2025-06-01', amount: 2400, status: 'paid', method: 'Bank Transfer', confirmationNumber: 'TXN-2025-0601' },
  { id: 'pay-002', date: '2025-05-01', amount: 2400, status: 'paid', method: 'Bank Transfer', confirmationNumber: 'TXN-2025-0501' },
  { id: 'pay-003', date: '2025-04-01', amount: 2400, status: 'paid', method: 'Credit Card', confirmationNumber: 'TXN-2025-0401' },
  { id: 'pay-004', date: '2025-03-01', amount: 2400, status: 'paid', method: 'Bank Transfer', confirmationNumber: 'TXN-2025-0301' },
  { id: 'pay-005', date: '2025-02-01', amount: 2400, status: 'paid', method: 'Bank Transfer', confirmationNumber: 'TXN-2025-0201' },
  { id: 'pay-006', date: '2025-01-01', amount: 2400, status: 'paid', method: 'Bank Transfer', confirmationNumber: 'TXN-2025-0101' },
];

const MOCK_LEASE: Lease = {
  id: 'lease-001',
  propertyAddress: '1234 Property Lane',
  unitNumber: 'Apt 4B',
  startDate: '2024-07-01',
  endDate: '2025-06-30',
  monthlyRent: 2400,
  securityDeposit: 4800,
  terms: [
    'No smoking on premises',
    'Pets allowed with $500 deposit (max 2 pets)',
    'Quiet hours: 10 PM - 8 AM',
    'Tenant responsible for utilities (electric, gas, internet)',
    'Garbage and water included in rent',
    'Parking space #42 assigned to unit',
    '30-day notice required for non-renewal',
    'Renters insurance required (min $100k liability)',
  ],
  documentUrl: '#lease-document',
  renewalEligible: true,
  renewalInterestExpressed: false,
};

const MOCK_MAINTENANCE_REQUESTS: MaintenanceRequest[] = [
  {
    id: 'maint-001',
    category: 'hvac',
    urgency: 'medium',
    title: 'AC not cooling properly',
    description: 'The air conditioning unit is running but not cooling the apartment below 78 degrees even when set to 72.',
    status: 'scheduled',
    submittedDate: '2025-06-15',
    scheduledDate: '2025-06-20',
  },
  {
    id: 'maint-002',
    category: 'plumbing',
    urgency: 'low',
    title: 'Slow drain in bathroom sink',
    description: 'The bathroom sink drains slowly, takes about 30 seconds to empty.',
    status: 'completed',
    submittedDate: '2025-05-10',
    completedDate: '2025-05-12',
    notes: 'Cleared drain blockage. Please avoid letting hair go down the drain.',
  },
];

const MOCK_MESSAGES: TenantMessage[] = [
  {
    id: 'msg-001',
    from: 'Property Management',
    subject: 'HVAC Filter Change',
    preview: 'Maintenance will be entering on Tuesday between 10am-2pm to change filters.',
    date: '2025-06-17',
    read: true,
  },
  {
    id: 'msg-002',
    from: 'Property Management',
    subject: 'Community Pool Opening',
    preview: 'The community pool is now open for the summer season. Hours are 8am-9pm daily.',
    date: '2025-06-01',
    read: true,
  },
  {
    id: 'msg-003',
    from: 'Property Management',
    subject: 'Lease Renewal Reminder',
    preview: 'Your lease expires on June 30th. Please let us know if you wish to renew.',
    date: '2025-05-15',
    read: false,
  },
];

// Initialize localStorage with mock data if empty
function initializeStorage() {
  if (!localStorage.getItem(STORAGE_KEYS.PAYMENTS)) {
    localStorage.setItem(STORAGE_KEYS.PAYMENTS, JSON.stringify(MOCK_PAYMENTS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.LEASE)) {
    localStorage.setItem(STORAGE_KEYS.LEASE, JSON.stringify(MOCK_LEASE));
  }
  if (!localStorage.getItem(STORAGE_KEYS.MAINTENANCE_REQUESTS)) {
    localStorage.setItem(STORAGE_KEYS.MAINTENANCE_REQUESTS, JSON.stringify(MOCK_MAINTENANCE_REQUESTS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.MESSAGES)) {
    localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(MOCK_MESSAGES));
  }
}

// Payment functions
export function getPayments(): Payment[] {
  initializeStorage();
  const data = localStorage.getItem(STORAGE_KEYS.PAYMENTS);
  return data ? JSON.parse(data) : [];
}

export function addPayment(payment: Omit<Payment, 'id'>): Payment {
  const payments = getPayments();
  const newPayment: Payment = {
    ...payment,
    id: `pay-${Date.now()}`,
  };
  payments.unshift(newPayment);
  localStorage.setItem(STORAGE_KEYS.PAYMENTS, JSON.stringify(payments));
  return newPayment;
}

export function getCurrentBalance(): { amount: number; dueDate: string; status: PaymentStatus } {
  const payments = getPayments();
  const lease = getLease();

  // Check if current month is paid
  const now = new Date();
  const currentMonth = now.toISOString().slice(0, 7); // YYYY-MM
  const currentMonthPayment = payments.find(p => p.date.startsWith(currentMonth));

  if (currentMonthPayment?.status === 'paid') {
    // Next payment is next month
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    return {
      amount: lease.monthlyRent,
      dueDate: nextMonth.toISOString().slice(0, 10),
      status: 'pending',
    };
  }

  // Current month not paid
  const dueDate = new Date(now.getFullYear(), now.getMonth(), 1);
  const isOverdue = now.getDate() > 5; // Overdue after 5th

  return {
    amount: lease.monthlyRent,
    dueDate: dueDate.toISOString().slice(0, 10),
    status: isOverdue ? 'overdue' : 'pending',
  };
}

// Lease functions
export function getLease(): Lease {
  initializeStorage();
  const data = localStorage.getItem(STORAGE_KEYS.LEASE);
  return data ? JSON.parse(data) : MOCK_LEASE;
}

export function updateLeaseRenewalInterest(interested: boolean): Lease {
  const lease = getLease();
  lease.renewalInterestExpressed = interested;
  localStorage.setItem(STORAGE_KEYS.LEASE, JSON.stringify(lease));
  return lease;
}

// Maintenance request functions
export function getMaintenanceRequests(): MaintenanceRequest[] {
  initializeStorage();
  const data = localStorage.getItem(STORAGE_KEYS.MAINTENANCE_REQUESTS);
  return data ? JSON.parse(data) : [];
}

export function addMaintenanceRequest(request: Omit<MaintenanceRequest, 'id' | 'status' | 'submittedDate'>): MaintenanceRequest {
  const requests = getMaintenanceRequests();
  const newRequest: MaintenanceRequest = {
    ...request,
    id: `maint-${Date.now()}`,
    status: 'submitted',
    submittedDate: new Date().toISOString().slice(0, 10),
  };
  requests.unshift(newRequest);
  localStorage.setItem(STORAGE_KEYS.MAINTENANCE_REQUESTS, JSON.stringify(requests));
  return newRequest;
}

export function getOpenMaintenanceRequestsCount(): number {
  const requests = getMaintenanceRequests();
  return requests.filter(r => r.status !== 'completed' && r.status !== 'cancelled').length;
}

// Message functions
export function getMessages(): TenantMessage[] {
  initializeStorage();
  const data = localStorage.getItem(STORAGE_KEYS.MESSAGES);
  return data ? JSON.parse(data) : [];
}

export function markMessageAsRead(messageId: string): void {
  const messages = getMessages();
  const message = messages.find(m => m.id === messageId);
  if (message) {
    message.read = true;
    localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(messages));
  }
}

export function getUnreadMessagesCount(): number {
  const messages = getMessages();
  return messages.filter(m => !m.read).length;
}

// Utility functions
export function getDaysUntilRentDue(): number {
  const balance = getCurrentBalance();
  const dueDate = new Date(balance.dueDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  dueDate.setHours(0, 0, 0, 0);

  const diffTime = dueDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

export function getDaysUntilLeaseEnd(): number {
  const lease = getLease();
  const endDate = new Date(lease.endDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  endDate.setHours(0, 0, 0, 0);

  const diffTime = endDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function formatShortDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

// Reset to mock data (useful for testing)
export function resetTenantData(): void {
  localStorage.setItem(STORAGE_KEYS.PAYMENTS, JSON.stringify(MOCK_PAYMENTS));
  localStorage.setItem(STORAGE_KEYS.LEASE, JSON.stringify(MOCK_LEASE));
  localStorage.setItem(STORAGE_KEYS.MAINTENANCE_REQUESTS, JSON.stringify(MOCK_MAINTENANCE_REQUESTS));
  localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(MOCK_MESSAGES));
}

// Category and urgency display helpers
export const CATEGORY_LABELS: Record<MaintenanceCategory, string> = {
  plumbing: 'Plumbing',
  electrical: 'Electrical',
  hvac: 'HVAC / Climate',
  appliance: 'Appliance',
  structural: 'Structural',
  pest: 'Pest Control',
  other: 'Other',
};

export const URGENCY_LABELS: Record<MaintenanceUrgency, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  emergency: 'Emergency',
};

export const STATUS_LABELS: Record<MaintenanceStatus, string> = {
  submitted: 'Submitted',
  in_progress: 'In Progress',
  scheduled: 'Scheduled',
  completed: 'Completed',
  cancelled: 'Cancelled',
};
