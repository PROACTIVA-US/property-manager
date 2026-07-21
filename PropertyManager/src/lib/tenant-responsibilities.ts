/**
 * Tenant Responsibilities System
 * Manages tenant maintenance responsibilities from lease + PM additions
 */

export type ResponsibilityFrequency =
  | 'daily'
  | 'weekly'
  | 'monthly'
  | 'quarterly'
  | 'annually'
  | 'seasonal'
  | 'as_needed';

export type ResponsibilityCategory =
  | 'safety'
  | 'cleaning'
  | 'exterior'
  | 'interior'
  | 'utilities'
  | 'hvac'
  | 'appliances'
  | 'other';

export type ApprovalStatus = 'pending' | 'approved' | 'rejected';

export interface TenantResponsibility {
  id: string;
  description: string;
  frequency: ResponsibilityFrequency;
  category: ResponsibilityCategory;
  source: 'lease_parsed' | 'pm_added' | 'manual';

  // For PM-added items
  addedBy?: string;
  addedAt?: string;
  pmNotes?: string;

  // Tenant approval (required for PM-added items)
  tenantApprovalStatus?: ApprovalStatus;
  tenantApprovedAt?: string;
  tenantRejectionReason?: string;

  // Tracking
  isActive: boolean;
  createdAt: string;

  // Completion history
  lastCompletedAt?: string;
  completionHistory: CompletionRecord[];

  // Reminders
  reminderEnabled: boolean;
  reminderDaysBefore?: number;
}

export interface CompletionRecord {
  id: string;
  completedAt: string;
  completedBy: string;
  notes?: string;
  photoUrl?: string; // Optional photo proof
}

export interface ResponsibilityApprovalRequest {
  id: string;
  responsibilityId: string;
  requestedBy: string; // PM name
  requestedAt: string;
  status: ApprovalStatus;
  respondedAt?: string;
  responseNotes?: string;
}

// Storage keys
const RESPONSIBILITIES_KEY = 'pm_tenant_responsibilities';
const APPROVAL_REQUESTS_KEY = 'pm_responsibility_approval_requests';

// ============ Core Functions ============

export function getAllResponsibilities(): TenantResponsibility[] {
  const data = localStorage.getItem(RESPONSIBILITIES_KEY);
  const responsibilities: TenantResponsibility[] = data ? JSON.parse(data) : getDefaultResponsibilities();

  // Sort by category, then frequency
  return responsibilities.sort((a, b) => {
    if (a.category !== b.category) {
      return a.category.localeCompare(b.category);
    }
    return frequencyOrder(a.frequency) - frequencyOrder(b.frequency);
  });
}

export function saveResponsibilities(responsibilities: TenantResponsibility[]): void {
  localStorage.setItem(RESPONSIBILITIES_KEY, JSON.stringify(responsibilities));
}

export function getActiveResponsibilities(): TenantResponsibility[] {
  return getAllResponsibilities().filter(r => r.isActive);
}

export function getResponsibilitiesByCategory(category: ResponsibilityCategory): TenantResponsibility[] {
  return getAllResponsibilities().filter(r => r.category === category && r.isActive);
}

export function getPendingApprovals(): TenantResponsibility[] {
  return getAllResponsibilities().filter(
    r => r.source === 'pm_added' && r.tenantApprovalStatus === 'pending'
  );
}

export function getDueResponsibilities(): TenantResponsibility[] {
  const now = Date.now();
  return getActiveResponsibilities().filter(r => {
    if (!r.lastCompletedAt) return true; // Never completed

    const lastCompleted = new Date(r.lastCompletedAt).getTime();
    const dueTime = getDueTime(lastCompleted, r.frequency);

    return now >= dueTime;
  });
}

/**
 * Create a new responsibility
 */
export function createResponsibility(
  responsibility: Omit<TenantResponsibility, 'id' | 'createdAt' | 'completionHistory' | 'isActive'>
): TenantResponsibility {
  const responsibilities = getAllResponsibilities();

  const newResponsibility: TenantResponsibility = {
    ...responsibility,
    id: generateId(),
    createdAt: new Date().toISOString(),
    completionHistory: [],
    isActive: true,
    reminderEnabled: true,
  };

  responsibilities.push(newResponsibility);
  saveResponsibilities(responsibilities);

  return newResponsibility;
}

/**
 * PM adds a new responsibility (requires tenant approval)
 */
export function pmAddResponsibility(
  description: string,
  frequency: ResponsibilityFrequency,
  category: ResponsibilityCategory,
  pmName: string,
  pmNotes?: string
): TenantResponsibility {
  const responsibility = createResponsibility({
    description,
    frequency,
    category,
    source: 'pm_added',
    addedBy: pmName,
    addedAt: new Date().toISOString(),
    pmNotes,
    tenantApprovalStatus: 'pending',
    reminderEnabled: false, // Don't enable until approved
  });

  // Create approval request
  createApprovalRequest(responsibility.id, pmName);

  return responsibility;
}

/**
 * Tenant approves or rejects a PM-added responsibility
 */
export function tenantRespondToResponsibility(
  responsibilityId: string,
  approved: boolean,
  responseNotes?: string
): void {
  const responsibilities = getAllResponsibilities();
  const responsibility = responsibilities.find(r => r.id === responsibilityId);

  if (!responsibility || responsibility.source !== 'pm_added') {
    throw new Error('Responsibility not found or not PM-added');
  }

  responsibility.tenantApprovalStatus = approved ? 'approved' : 'rejected';
  responsibility.tenantApprovedAt = new Date().toISOString();
  responsibility.tenantRejectionReason = approved ? undefined : responseNotes;

  if (approved) {
    responsibility.reminderEnabled = true;
  } else {
    responsibility.isActive = false; // Deactivate rejected items
  }

  saveResponsibilities(responsibilities);

  // Update approval request
  updateApprovalRequest(responsibilityId, approved ? 'approved' : 'rejected', responseNotes);
}

/**
 * Mark a responsibility as completed
 */
export function completeResponsibility(
  responsibilityId: string,
  completedBy: string,
  notes?: string,
  photoUrl?: string
): void {
  const responsibilities = getAllResponsibilities();
  const responsibility = responsibilities.find(r => r.id === responsibilityId);

  if (!responsibility) {
    throw new Error('Responsibility not found');
  }

  const completionRecord: CompletionRecord = {
    id: generateId(),
    completedAt: new Date().toISOString(),
    completedBy,
    notes,
    photoUrl,
  };

  responsibility.completionHistory.unshift(completionRecord);
  responsibility.lastCompletedAt = completionRecord.completedAt;

  saveResponsibilities(responsibilities);
}

/**
 * Update a responsibility
 */
export function updateResponsibility(
  responsibilityId: string,
  updates: Partial<TenantResponsibility>
): void {
  const responsibilities = getAllResponsibilities();
  const index = responsibilities.findIndex(r => r.id === responsibilityId);

  if (index !== -1) {
    responsibilities[index] = { ...responsibilities[index], ...updates };
    saveResponsibilities(responsibilities);
  }
}

/**
 * Delete a responsibility
 */
export function deleteResponsibility(responsibilityId: string): void {
  const responsibilities = getAllResponsibilities();
  const filtered = responsibilities.filter(r => r.id !== responsibilityId);
  saveResponsibilities(filtered);
}

// ============ Approval Request Functions ============

function createApprovalRequest(responsibilityId: string, requestedBy: string): void {
  const requests = getApprovalRequests();

  const request: ResponsibilityApprovalRequest = {
    id: generateId(),
    responsibilityId,
    requestedBy,
    requestedAt: new Date().toISOString(),
    status: 'pending',
  };

  requests.push(request);
  saveApprovalRequests(requests);
}

function updateApprovalRequest(
  responsibilityId: string,
  status: ApprovalStatus,
  responseNotes?: string
): void {
  const requests = getApprovalRequests();
  const request = requests.find(r => r.responsibilityId === responsibilityId);

  if (request) {
    request.status = status;
    request.respondedAt = new Date().toISOString();
    request.responseNotes = responseNotes;
    saveApprovalRequests(requests);
  }
}

function getApprovalRequests(): ResponsibilityApprovalRequest[] {
  const data = localStorage.getItem(APPROVAL_REQUESTS_KEY);
  return data ? JSON.parse(data) : [];
}

function saveApprovalRequests(requests: ResponsibilityApprovalRequest[]): void {
  localStorage.setItem(APPROVAL_REQUESTS_KEY, JSON.stringify(requests));
}

export function getPendingApprovalRequests(): ResponsibilityApprovalRequest[] {
  return getApprovalRequests().filter(r => r.status === 'pending');
}

// ============ Helper Functions ============

function generateId(): string {
  return `resp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function frequencyOrder(frequency: ResponsibilityFrequency): number {
  const order: ResponsibilityFrequency[] = [
    'daily',
    'weekly',
    'monthly',
    'quarterly',
    'seasonal',
    'annually',
    'as_needed',
  ];
  return order.indexOf(frequency);
}

function getDueTime(lastCompleted: number, frequency: ResponsibilityFrequency): number {
  const day = 24 * 60 * 60 * 1000;

  const intervals: Record<ResponsibilityFrequency, number> = {
    daily: day,
    weekly: 7 * day,
    monthly: 30 * day,
    quarterly: 90 * day,
    seasonal: 90 * day, // Approximate
    annually: 365 * day,
    as_needed: Number.MAX_SAFE_INTEGER, // Never auto-due
  };

  return lastCompleted + intervals[frequency];
}

export function getFrequencyLabel(frequency: ResponsibilityFrequency): string {
  const labels: Record<ResponsibilityFrequency, string> = {
    daily: 'Daily',
    weekly: 'Weekly',
    monthly: 'Monthly',
    quarterly: 'Quarterly',
    seasonal: 'Seasonal',
    annually: 'Annually',
    as_needed: 'As Needed',
  };
  return labels[frequency];
}

export function getCategoryLabel(category: ResponsibilityCategory): string {
  const labels: Record<ResponsibilityCategory, string> = {
    safety: 'Safety',
    cleaning: 'Cleaning',
    exterior: 'Exterior',
    interior: 'Interior',
    utilities: 'Utilities',
    hvac: 'HVAC',
    appliances: 'Appliances',
    other: 'Other',
  };
  return labels[category];
}

export function getCategoryIcon(category: ResponsibilityCategory): string {
  const icons: Record<ResponsibilityCategory, string> = {
    safety: '🚨',
    cleaning: '🧹',
    exterior: '🏡',
    interior: '🏠',
    utilities: '💡',
    hvac: '❄️',
    appliances: '🔌',
    other: '📋',
  };
  return icons[category];
}

export function getDaysUntilDue(lastCompletedAt: string | undefined, frequency: ResponsibilityFrequency): number | null {
  if (frequency === 'as_needed') return null;
  if (!lastCompletedAt) return 0; // Overdue (never completed)

  const lastCompleted = new Date(lastCompletedAt).getTime();
  const dueTime = getDueTime(lastCompleted, frequency);
  const now = Date.now();

  const daysUntil = Math.floor((dueTime - now) / (24 * 60 * 60 * 1000));
  return daysUntil;
}

// ============ Default Responsibilities ============

function getDefaultResponsibilities(): TenantResponsibility[] {
  return [
    {
      id: 'resp_default_1',
      description: 'Test smoke detectors',
      frequency: 'monthly',
      category: 'safety',
      source: 'lease_parsed',
      isActive: true,
      createdAt: '2024-01-01T00:00:00.000Z',
      completionHistory: [],
      reminderEnabled: true,
    },
    {
      id: 'resp_default_2',
      description: 'Replace HVAC filter',
      frequency: 'quarterly',
      category: 'hvac',
      source: 'lease_parsed',
      isActive: true,
      createdAt: '2024-01-01T00:00:00.000Z',
      completionHistory: [],
      reminderEnabled: true,
    },
    {
      id: 'resp_default_3',
      description: 'Check carbon monoxide detector batteries',
      frequency: 'monthly',
      category: 'safety',
      source: 'lease_parsed',
      isActive: true,
      createdAt: '2024-01-01T00:00:00.000Z',
      completionHistory: [],
      reminderEnabled: true,
    },
    {
      id: 'resp_default_4',
      description: 'Clean dryer vent lint trap',
      frequency: 'weekly',
      category: 'appliances',
      source: 'lease_parsed',
      isActive: true,
      createdAt: '2024-01-01T00:00:00.000Z',
      completionHistory: [],
      reminderEnabled: true,
    },
    {
      id: 'resp_default_5',
      description: 'Report any leaks or water damage immediately',
      frequency: 'as_needed',
      category: 'interior',
      source: 'lease_parsed',
      isActive: true,
      createdAt: '2024-01-01T00:00:00.000Z',
      completionHistory: [],
      reminderEnabled: false,
    },
  ];
}
