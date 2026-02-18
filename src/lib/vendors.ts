// Vendor Management - Data Types and Storage Helpers

export type VendorStatus = 'available' | 'scheduled' | 'inactive';

export type VendorSpecialty =
  | 'plumber'
  | 'electrician'
  | 'landscaper'
  | 'hvac'
  | 'general_contractor'
  | 'painter'
  | 'roofing'
  | 'appliance_repair'
  | 'cleaning'
  | 'pest_control'
  | 'other';

export const SPECIALTY_LABELS: Record<VendorSpecialty, string> = {
  plumber: 'Plumber',
  electrician: 'Electrician',
  landscaper: 'Landscaper',
  hvac: 'HVAC Technician',
  general_contractor: 'General Contractor',
  painter: 'Painter',
  roofing: 'Roofing',
  appliance_repair: 'Appliance Repair',
  cleaning: 'Cleaning Service',
  pest_control: 'Pest Control',
  other: 'Other',
};

export const STATUS_LABELS: Record<VendorStatus, string> = {
  available: 'Available',
  scheduled: 'Scheduled',
  inactive: 'Inactive',
};

export type ResponseTime = 'same_day' | 'next_day' | '2_3_days' | 'week_plus';

export const RESPONSE_TIME_LABELS: Record<ResponseTime, string> = {
  same_day: 'Same Day',
  next_day: 'Next Day',
  '2_3_days': '2-3 Days',
  week_plus: 'Week+',
};

export interface Estimate {
  id: string;
  vendorId: string;
  fileName: string;
  fileSize: number;
  uploadedAt: string;
  description?: string;
  amount?: number;
}

export interface JobHistoryEntry {
  id: string;
  vendorId: string;
  description: string;
  completedAt: string;
  cost?: number;
  rating?: number; // 1-5
  notes?: string;
}

export interface VendorEmergencyContact {
  name: string;
  phone: string;
  email?: string;
  available24x7: boolean;
}

export interface Vendor {
  id: string;
  name: string;
  specialty: VendorSpecialty;
  phone: string;
  email: string;
  status: VendorStatus;
  notes?: string;
  // Emergency contact for after-hours/urgent issues
  emergencyContact?: VendorEmergencyContact;
  // Business info
  companyName?: string;
  licenseNumber?: string;
  insuranceExpiry?: string;
  // Rating and reliability
  averageRating?: number;
  responseTime?: 'same_day' | 'next_day' | '2_3_days' | 'week_plus';
  isPreferred?: boolean;
  createdAt: string;
  updatedAt: string;
}

// Storage keys
const VENDORS_STORAGE_KEY = 'propertyMgr_vendors';
const ESTIMATES_STORAGE_KEY = 'propertyMgr_estimates';
const JOB_HISTORY_STORAGE_KEY = 'propertyMgr_jobHistory';

// Generate a simple unique ID
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// ============ Vendor CRUD Operations ============

export function getVendors(): Vendor[] {
  try {
    const stored = localStorage.getItem(VENDORS_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Error reading vendors from localStorage:', error);
  }
  return getDefaultVendors();
}

export function getVendorById(id: string): Vendor | undefined {
  const vendors = getVendors();
  return vendors.find(v => v.id === id);
}

export function saveVendors(vendors: Vendor[]): void {
  try {
    localStorage.setItem(VENDORS_STORAGE_KEY, JSON.stringify(vendors));
  } catch (error) {
    console.error('Error saving vendors to localStorage:', error);
  }
}

export function createVendor(vendorData: Omit<Vendor, 'id' | 'createdAt' | 'updatedAt'>): Vendor {
  const vendors = getVendors();
  const now = new Date().toISOString();

  const newVendor: Vendor = {
    ...vendorData,
    id: generateId(),
    createdAt: now,
    updatedAt: now,
  };

  vendors.push(newVendor);
  saveVendors(vendors);

  return newVendor;
}

export function updateVendor(id: string, updates: Partial<Omit<Vendor, 'id' | 'createdAt'>>): Vendor | null {
  const vendors = getVendors();
  const index = vendors.findIndex(v => v.id === id);

  if (index === -1) return null;

  vendors[index] = {
    ...vendors[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  saveVendors(vendors);
  return vendors[index];
}

export function deleteVendor(id: string): boolean {
  const vendors = getVendors();
  const filteredVendors = vendors.filter(v => v.id !== id);

  if (filteredVendors.length === vendors.length) return false;

  saveVendors(filteredVendors);

  // Also delete related estimates and job history
  deleteEstimatesByVendor(id);
  deleteJobHistoryByVendor(id);

  return true;
}

// ============ Estimate Operations ============

export function getEstimates(): Estimate[] {
  try {
    const stored = localStorage.getItem(ESTIMATES_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Error reading estimates from localStorage:', error);
  }
  return [];
}

export function getEstimatesByVendor(vendorId: string): Estimate[] {
  return getEstimates().filter(e => e.vendorId === vendorId);
}

export function saveEstimates(estimates: Estimate[]): void {
  try {
    localStorage.setItem(ESTIMATES_STORAGE_KEY, JSON.stringify(estimates));
  } catch (error) {
    console.error('Error saving estimates to localStorage:', error);
  }
}

export function createEstimate(estimateData: Omit<Estimate, 'id' | 'uploadedAt'>): Estimate {
  const estimates = getEstimates();

  const newEstimate: Estimate = {
    ...estimateData,
    id: generateId(),
    uploadedAt: new Date().toISOString(),
  };

  estimates.push(newEstimate);
  saveEstimates(estimates);

  return newEstimate;
}

export function deleteEstimate(id: string): boolean {
  const estimates = getEstimates();
  const filteredEstimates = estimates.filter(e => e.id !== id);

  if (filteredEstimates.length === estimates.length) return false;

  saveEstimates(filteredEstimates);
  return true;
}

function deleteEstimatesByVendor(vendorId: string): void {
  const estimates = getEstimates().filter(e => e.vendorId !== vendorId);
  saveEstimates(estimates);
}

// ============ Job History Operations ============

export function getJobHistory(): JobHistoryEntry[] {
  try {
    const stored = localStorage.getItem(JOB_HISTORY_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Error reading job history from localStorage:', error);
  }
  return [];
}

export function getJobHistoryByVendor(vendorId: string): JobHistoryEntry[] {
  return getJobHistory().filter(j => j.vendorId === vendorId);
}

export function saveJobHistory(jobHistory: JobHistoryEntry[]): void {
  try {
    localStorage.setItem(JOB_HISTORY_STORAGE_KEY, JSON.stringify(jobHistory));
  } catch (error) {
    console.error('Error saving job history to localStorage:', error);
  }
}

export function createJobHistoryEntry(entryData: Omit<JobHistoryEntry, 'id'>): JobHistoryEntry {
  const history = getJobHistory();

  const newEntry: JobHistoryEntry = {
    ...entryData,
    id: generateId(),
  };

  history.push(newEntry);
  saveJobHistory(history);

  return newEntry;
}

export function deleteJobHistoryEntry(id: string): boolean {
  const history = getJobHistory();
  const filteredHistory = history.filter(j => j.id !== id);

  if (filteredHistory.length === history.length) return false;

  saveJobHistory(filteredHistory);
  return true;
}

function deleteJobHistoryByVendor(vendorId: string): void {
  const history = getJobHistory().filter(j => j.vendorId !== vendorId);
  saveJobHistory(history);
}

// ============ Default Data ============

function getDefaultVendors(): Vendor[] {
  const now = new Date().toISOString();
  return [
    {
      id: 'vendor-1',
      name: 'Smith Plumbing',
      specialty: 'plumber',
      phone: '(555) 123-4567',
      email: 'contact@smithplumbing.com',
      status: 'available',
      notes: 'Reliable for emergency calls. 24/7 availability.',
      companyName: 'Smith Plumbing & Drain Services',
      licenseNumber: 'PL-2024-1234',
      responseTime: 'same_day',
      averageRating: 4.8,
      emergencyContact: {
        name: 'Mike Smith (Owner)',
        phone: '(555) 123-4500',
        email: 'emergency@smithplumbing.com',
        available24x7: true,
      },
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'vendor-2',
      name: 'Green Gardens',
      specialty: 'landscaper',
      phone: '(555) 234-5678',
      email: 'info@greengardens.com',
      status: 'scheduled',
      notes: 'Weekly lawn maintenance scheduled for Tuesdays.',
      companyName: 'Green Gardens Landscaping LLC',
      responseTime: '2_3_days',
      averageRating: 4.5,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'vendor-3',
      name: 'Volt Electric',
      specialty: 'electrician',
      phone: '(555) 345-6789',
      email: 'service@voltelectric.com',
      status: 'available',
      notes: 'Licensed and insured. Good for panel upgrades.',
      companyName: 'Volt Electric Inc.',
      licenseNumber: 'EL-2023-5678',
      insuranceExpiry: '2026-12-31',
      responseTime: 'next_day',
      averageRating: 4.9,
      emergencyContact: {
        name: 'Volt Electric Dispatch',
        phone: '(555) 345-6700',
        available24x7: true,
      },
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'vendor-4',
      name: 'Cool Air HVAC',
      specialty: 'hvac',
      phone: '(555) 456-7890',
      email: 'support@coolairhvac.com',
      status: 'scheduled',
      notes: 'Currently handling HVAC upgrade project.',
      companyName: 'Cool Air Heating & Cooling',
      licenseNumber: 'HVAC-2024-9012',
      insuranceExpiry: '2026-06-30',
      responseTime: 'same_day',
      averageRating: 4.2,
      emergencyContact: {
        name: 'Cool Air 24/7 Line',
        phone: '(555) 456-7899',
        email: 'emergency@coolairhvac.com',
        available24x7: true,
      },
      createdAt: now,
      updatedAt: now,
    },
  ];
}
