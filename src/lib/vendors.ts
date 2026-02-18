/**
 * Vendor Management - Supabase Implementation
 * Data Types and Storage Helpers for vendor management
 */

import { supabase } from './supabase';
import type { Tables, TablesInsert, TablesUpdate } from './database.types';

// ============ Types ============

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

// Database type
type DbVendor = Tables<'vendors'>;

export interface Estimate {
  id: string;
  vendorId: string;
  fileName: string;
  fileSize: number;
  uploadedAt: string;
  description?: string;
  amount?: number;
  storagePath?: string;
}

export interface JobHistoryEntry {
  id: string;
  vendorId: string;
  description: string;
  completedAt: string;
  cost?: number;
  rating?: number;
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
  propertyId?: string;
  emergencyContact?: VendorEmergencyContact;
  companyName?: string;
  licenseNumber?: string;
  insuranceExpiry?: string;
  averageRating?: number;
  hourlyRate?: number;
  responseTime?: ResponseTime;
  isPreferred?: boolean;
  createdAt: string;
  updatedAt: string;
}

// Extended data stored in insurance_info JSONB
interface VendorExtendedData {
  emergencyContact?: VendorEmergencyContact;
  responseTime?: ResponseTime;
  status?: VendorStatus;
  insuranceExpiry?: string;
}

// ============ Demo Mode Storage ============

const VENDORS_STORAGE_KEY = 'propertyMgr_vendors';
const ESTIMATES_STORAGE_KEY = 'propertyMgr_estimates';
const JOB_HISTORY_STORAGE_KEY = 'propertyMgr_jobHistory';

function isDemoMode(): boolean {
  const demoUser = localStorage.getItem('demoUser');
  return !!demoUser;
}

// Generate a simple unique ID
export function generateId(): string {
  return crypto.randomUUID ? crypto.randomUUID() :
    `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// ============ Helper Functions ============

function mapDbToVendor(dbVendor: DbVendor): Vendor {
  const extendedData = (typeof dbVendor.insurance_info === 'string'
    ? JSON.parse(dbVendor.insurance_info)
    : dbVendor.insurance_info) as VendorExtendedData | null;

  // Determine status from is_active flag and extended data
  let status: VendorStatus = 'available';
  if (!dbVendor.is_active) {
    status = 'inactive';
  } else if (extendedData?.status) {
    status = extendedData.status;
  }

  return {
    id: dbVendor.id,
    name: dbVendor.contact_name || dbVendor.company_name,
    specialty: (dbVendor.specialty?.[0] as VendorSpecialty) || 'other',
    phone: dbVendor.phone || '',
    email: dbVendor.email || '',
    status,
    notes: dbVendor.notes || undefined,
    propertyId: dbVendor.property_id || undefined,
    emergencyContact: extendedData?.emergencyContact,
    companyName: dbVendor.company_name,
    licenseNumber: dbVendor.license_number || undefined,
    insuranceExpiry: extendedData?.insuranceExpiry,
    averageRating: dbVendor.rating ? Number(dbVendor.rating) : undefined,
    hourlyRate: dbVendor.hourly_rate ? Number(dbVendor.hourly_rate) : undefined,
    responseTime: extendedData?.responseTime,
    isPreferred: dbVendor.is_preferred || false,
    createdAt: dbVendor.created_at || new Date().toISOString(),
    updatedAt: dbVendor.updated_at || new Date().toISOString(),
  };
}

function mapVendorToDb(vendor: Partial<Vendor>): Partial<TablesInsert<'vendors'>> {
  const extendedData: VendorExtendedData = {
    emergencyContact: vendor.emergencyContact,
    responseTime: vendor.responseTime,
    status: vendor.status,
    insuranceExpiry: vendor.insuranceExpiry,
  };

  return {
    company_name: vendor.companyName || vendor.name,
    contact_name: vendor.name,
    email: vendor.email,
    phone: vendor.phone,
    specialty: vendor.specialty ? [vendor.specialty] : undefined,
    license_number: vendor.licenseNumber,
    insurance_info: JSON.stringify(extendedData),
    hourly_rate: vendor.hourlyRate,
    rating: vendor.averageRating,
    notes: vendor.notes,
    is_preferred: vendor.isPreferred,
    is_active: vendor.status !== 'inactive',
    property_id: vendor.propertyId,
  };
}

// ============ Vendor CRUD - Supabase ============

export async function getVendorsAsync(): Promise<Vendor[]> {
  if (isDemoMode()) {
    return getVendors();
  }

  const { data, error } = await supabase
    .from('vendors')
    .select('*')
    .order('company_name');

  if (error) {
    console.error('Error fetching vendors:', error);
    return [];
  }

  return data.map(mapDbToVendor);
}

export async function getVendorByIdAsync(id: string): Promise<Vendor | null> {
  if (isDemoMode()) {
    return getVendorById(id) || null;
  }

  const { data, error } = await supabase
    .from('vendors')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !data) {
    console.error('Error fetching vendor:', error);
    return null;
  }

  return mapDbToVendor(data);
}

export async function getVendorsBySpecialtyAsync(specialty: VendorSpecialty): Promise<Vendor[]> {
  if (isDemoMode()) {
    return getVendors().filter(v => v.specialty === specialty);
  }

  const { data, error } = await supabase
    .from('vendors')
    .select('*')
    .contains('specialty', [specialty])
    .order('rating', { ascending: false });

  if (error) {
    console.error('Error fetching vendors by specialty:', error);
    return [];
  }

  return data.map(mapDbToVendor);
}

export async function getActiveVendorsAsync(): Promise<Vendor[]> {
  if (isDemoMode()) {
    return getVendors().filter(v => v.status !== 'inactive');
  }

  const { data, error } = await supabase
    .from('vendors')
    .select('*')
    .eq('is_active', true)
    .order('is_preferred', { ascending: false })
    .order('rating', { ascending: false });

  if (error) {
    console.error('Error fetching active vendors:', error);
    return [];
  }

  return data.map(mapDbToVendor);
}

export async function createVendorAsync(
  vendorData: Omit<Vendor, 'id' | 'createdAt' | 'updatedAt'>
): Promise<Vendor> {
  if (isDemoMode()) {
    return createVendor(vendorData);
  }

  const dbData = mapVendorToDb(vendorData);

  const { data, error } = await supabase
    .from('vendors')
    .insert(dbData as TablesInsert<'vendors'>)
    .select()
    .single();

  if (error || !data) {
    throw new Error('Failed to create vendor: ' + error?.message);
  }

  return mapDbToVendor(data);
}

export async function updateVendorAsync(
  id: string,
  updates: Partial<Omit<Vendor, 'id' | 'createdAt'>>
): Promise<Vendor | null> {
  if (isDemoMode()) {
    return updateVendor(id, updates);
  }

  // Get existing vendor to merge extended data
  const existing = await getVendorByIdAsync(id);
  if (!existing) return null;

  const merged = { ...existing, ...updates };
  const dbData = mapVendorToDb(merged);

  // Remove undefined values
  Object.keys(dbData).forEach(key => {
    if (dbData[key as keyof typeof dbData] === undefined) {
      delete dbData[key as keyof typeof dbData];
    }
  });

  const { data, error } = await supabase
    .from('vendors')
    .update(dbData as TablesUpdate<'vendors'>)
    .eq('id', id)
    .select()
    .single();

  if (error || !data) {
    console.error('Error updating vendor:', error);
    return null;
  }

  return mapDbToVendor(data);
}

export async function deleteVendorAsync(id: string): Promise<boolean> {
  if (isDemoMode()) {
    return deleteVendor(id);
  }

  const { error } = await supabase
    .from('vendors')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting vendor:', error);
    return false;
  }

  return true;
}

// ============ Estimate Operations - Supabase ============
// Note: Estimates are stored in localStorage for now (no dedicated table in schema)
// In production, create a vendor_estimates table

export async function getEstimatesAsync(): Promise<Estimate[]> {
  // For now, use localStorage - would need a dedicated table
  return getEstimates();
}

export async function getEstimatesByVendorAsync(vendorId: string): Promise<Estimate[]> {
  return getEstimatesByVendor(vendorId);
}

export async function createEstimateAsync(
  estimateData: Omit<Estimate, 'id' | 'uploadedAt'>
): Promise<Estimate> {
  return createEstimate(estimateData);
}

export async function deleteEstimateAsync(id: string): Promise<boolean> {
  return deleteEstimate(id);
}

// ============ Job History Operations - Supabase ============
// Note: Job history is stored in localStorage for now (no dedicated table)
// In production, create a vendor_job_history table or use expenses table

export async function getJobHistoryAsync(): Promise<JobHistoryEntry[]> {
  return getJobHistory();
}

export async function getJobHistoryByVendorAsync(vendorId: string): Promise<JobHistoryEntry[]> {
  return getJobHistoryByVendor(vendorId);
}

export async function createJobHistoryEntryAsync(
  entryData: Omit<JobHistoryEntry, 'id'>
): Promise<JobHistoryEntry> {
  return createJobHistoryEntry(entryData);
}

export async function deleteJobHistoryEntryAsync(id: string): Promise<boolean> {
  return deleteJobHistoryEntry(id);
}

// ============ Synchronous Functions (Demo Mode / Backwards Compatibility) ============

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

// ============ Estimate Operations (localStorage) ============

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

// ============ Job History Operations (localStorage) ============

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

// ============ Default Demo Data ============

function getDefaultVendors(): Vendor[] {
  const now = new Date().toISOString();
  return [
    {
      id: 'vendor-dan',
      name: 'Dan',
      specialty: 'general_contractor',
      phone: '(555) 800-1234',
      email: 'dan@dcdesignandbuild.com',
      status: 'available',
      notes: 'Full-service design and build firm specializing in residential remodels, custom decks, and siding.',
      companyName: 'DC Design and Build',
      licenseNumber: 'GC-2024-DC001',
      insuranceExpiry: '2027-01-31',
      responseTime: 'next_day',
      averageRating: 4.9,
      isPreferred: true,
      emergencyContact: {
        name: 'Dan (Owner)',
        phone: '(555) 800-1234',
        email: 'dan@dcdesignandbuild.com',
        available24x7: false,
      },
      createdAt: now,
      updatedAt: now,
    },
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
