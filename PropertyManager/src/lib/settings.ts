/**
 * Settings & Data Management Library
 * Centralized data storage for all property, mortgage, tenant, and financial information
 */

// ============================================================================
// Types
// ============================================================================

export interface PropertyData {
  address: string;
  unitNumber?: string;
  purchasePrice: number;
  purchaseDate: string; // ISO date
  currentMarketValue: number;
  landValue: number;
  yearBuilt?: number;
  squareFootage?: number;
  bedrooms?: number;
  bathrooms?: number;
  propertyType?: 'single_family' | 'condo' | 'townhouse' | 'multi_family' | 'other';
}

export interface MortgageData {
  principal: number;
  interestRate: number; // as percentage (e.g., 5.729)
  monthlyPAndI: number; // Principal and Interest
  monthlyEscrow: number;
  totalMonthlyPayment: number;
  loanStartDate: string; // ISO date format
  loanTermYears: number;
  originalLoanAmount?: number;
  lender?: string;
}

export interface RentalIncomeData {
  monthlyRent: number;
  monthlyUtilities: number; // Utilities paid by tenant separately (owner receives this)
  monthlyPropertyTax: number;
  monthlyInsurance: number;
  monthlyHOA: number;
  monthlyMaintenanceReserve: number;
  monthlyVacancyReserve: number; // Usually 5-8% of rent
  monthlyManagementFee: number; // Usually 8-10% of rent, or 0 if self-managed
  includesUtilities: boolean; // If true, owner pays utilities; if false, tenant pays directly to providers
}

export interface TaxInfoData {
  filingStatus: 'single' | 'married_filing_jointly' | 'married_filing_separately' | 'head_of_household';
  annualIncome: number;
  stateIncomeTaxRate: number; // as percentage
  capitalImprovementsCost: number;
  depreciableValue: number; // Usually purchase price minus land value
  estimatedSellingCosts: number; // Typically 6-10% of sale price
}

export interface OwnerData {
  name: string;
  email: string;
  phone: string;
  entityType: 'individual' | 'llc' | 's_corp' | 'c_corp' | 'partnership' | 'trust';
  entityName?: string; // If different from owner name (e.g., "Smith Properties LLC")
  businessAddress?: string;
  taxId?: string; // EIN or SSN (last 4 digits only for display)
}

export interface PMData {
  name: string;
  email: string;
  phone: string;
  companyName?: string;
  licenseNumber?: string;
  managementFeePercent?: number; // Percentage of monthly rent
}

export interface TenantData {
  name: string;
  email: string;
  phone: string;
  leaseStartDate: string; // ISO date
  leaseEndDate: string; // ISO date
  monthlyRent: number;
  securityDeposit: number;
  emergencyContact?: string;
  emergencyContactPhone?: string;
  moveInDate?: string; // ISO date
}

export interface PersonalExpensesData {
  currentRentPayment: number; // If living elsewhere
  currentUtilityCosts: number;
  currentJobIncome: number;
}

export interface UtilityBill {
  id: string;
  month: string; // YYYY-MM format
  amount: number;
  paidDate?: string; // ISO date when paid
  status: 'pending' | 'paid' | 'overdue';
  notes?: string;
}

export interface UtilitiesTrackingData {
  bills: UtilityBill[];
  overageThreshold: number; // Notify if actual exceeds stated by this amount
  lastNotificationDate?: string; // ISO date of last overage notification
}

export interface AccountInfo {
  providerName: string;
  accountNumber?: string;
  portalUrl?: string;
  loginEmail?: string;
  phone?: string;
  notes?: string;
}

export interface UtilityProvider extends AccountInfo {
  type: 'electric' | 'gas' | 'water' | 'trash' | 'internet' | 'cable' | 'other';
  monthlyEstimate: number;
}

export interface PropertyAccounts {
  mortgage: AccountInfo;
  propertyTax: AccountInfo;
  insurance: AccountInfo;
  utilities: UtilityProvider[];
}

export interface SettingsData {
  owner: OwnerData;
  pm: PMData;
  property: PropertyData;
  mortgage: MortgageData;
  rentalIncome: RentalIncomeData;
  taxInfo: TaxInfoData;
  tenant: TenantData;
  personalExpenses: PersonalExpensesData;
  utilitiesTracking: UtilitiesTrackingData;
  propertyAccounts: PropertyAccounts;
  lastUpdated: string; // ISO timestamp
}

// ============================================================================
// Default Values (from legacy system)
// ============================================================================

export const DEFAULT_OWNER: OwnerData = {
  name: 'Shanie Holman',
  email: 'Shanieh@comcast.net',
  phone: '(425) 445-3257',
  entityType: 'individual',
  entityName: '',
  businessAddress: '',
  taxId: '',
};

export const DEFAULT_PM: PMData = {
  name: 'Daniel D. Connolly',
  email: 'Danieldconnolly@gmail.com',
  phone: '(425) 444-1113',
  companyName: 'Connolly Property Management',
  licenseNumber: 'PM-2024-0001',
  managementFeePercent: 0,
};

export const DEFAULT_PROPERTY: PropertyData = {
  address: '14102 129th Ave NE, Kirkland, WA 98034',
  unitNumber: '',
  purchasePrice: 350000,
  purchaseDate: '2019-07-01',
  currentMarketValue: 1089100,
  landValue: 70000, // ~20% of purchase price
  yearBuilt: 2010,
  squareFootage: 1400,
  bedrooms: 3,
  bathrooms: 2,
  propertyType: 'single_family',
};

// Real data from legacy mortgage calculator
export const DEFAULT_MORTGAGE: MortgageData = {
  principal: 59957.41,
  interestRate: 5.729,
  monthlyPAndI: 1336.39,
  monthlyEscrow: 790.03,
  totalMonthlyPayment: 2126.42,
  loanStartDate: '2025-07-01',
  loanTermYears: 30,
  originalLoanAmount: 280000,
  lender: 'Bank of America',
};

export const DEFAULT_RENTAL_INCOME: RentalIncomeData = {
  monthlyRent: 3000, // Base rent amount
  monthlyUtilities: 300, // Utilities paid by tenant separately (Cable, Electric, Heat, Internet, Gas, Trash, Water)
  monthlyPropertyTax: 350,
  monthlyInsurance: 150,
  monthlyHOA: 0,
  monthlyMaintenanceReserve: 200,
  monthlyVacancyReserve: 165, // 5% of rent
  monthlyManagementFee: 0, // Self-managed
  includesUtilities: true, // If true, owner pays utilities and receives reimbursement from tenant
};

export const DEFAULT_TAX_INFO: TaxInfoData = {
  filingStatus: 'single',
  annualIncome: 85000,
  stateIncomeTaxRate: 5.0,
  capitalImprovementsCost: 15000,
  depreciableValue: 280000, // Purchase price minus land
  estimatedSellingCosts: 25200, // ~6% of current value
};

export const DEFAULT_TENANT: TenantData = {
  name: 'Gregg Marshall & Miranti Marshall',
  email: 'gregg.marshall@email.com',
  phone: '(555) 123-4567',
  leaseStartDate: '2023-05-06',
  leaseEndDate: '2026-05-06',
  monthlyRent: 3000, // Base lease amount (utilities paid separately)
  securityDeposit: 700,
  emergencyContact: 'Miranti Marshall',
  emergencyContactPhone: '(555) 987-6543',
  moveInDate: '2023-05-06',
};

export const DEFAULT_PERSONAL_EXPENSES: PersonalExpensesData = {
  currentRentPayment: 1800, // Office space cost per month
  currentUtilityCosts: 0,
  currentJobIncome: 70000 / 12, // $70k annual income
};

export const DEFAULT_UTILITIES_TRACKING: UtilitiesTrackingData = {
  bills: [],
  overageThreshold: 50, // Notify if actual exceeds stated by $50 or more
};

export const DEFAULT_PROPERTY_ACCOUNTS: PropertyAccounts = {
  mortgage: {
    providerName: '',
    accountNumber: '',
    portalUrl: '',
    loginEmail: '',
    phone: '',
    notes: '',
  },
  propertyTax: {
    providerName: 'King County Treasury',
    accountNumber: '',
    portalUrl: 'https://kingcounty.gov/depts/finance-business-operations/treasury/property-tax.aspx',
    loginEmail: '',
    phone: '',
    notes: '',
  },
  insurance: {
    providerName: '',
    accountNumber: '',
    portalUrl: '',
    loginEmail: '',
    phone: '',
    notes: '',
  },
  utilities: [
    { type: 'electric', providerName: 'Puget Sound Energy', monthlyEstimate: 80, portalUrl: 'https://pse.com' },
    { type: 'gas', providerName: 'Puget Sound Energy', monthlyEstimate: 50, portalUrl: 'https://pse.com' },
    { type: 'water', providerName: 'Kirkland Water', monthlyEstimate: 40, portalUrl: '' },
    { type: 'trash', providerName: 'Waste Management', monthlyEstimate: 35, portalUrl: 'https://wm.com' },
    { type: 'internet', providerName: 'Xfinity', monthlyEstimate: 70, portalUrl: 'https://xfinity.com' },
    { type: 'cable', providerName: '', monthlyEstimate: 0, portalUrl: '' },
  ],
};

// ============================================================================
// Storage Keys
// ============================================================================

const STORAGE_KEY = 'propertyManager_settings_v1';

// ============================================================================
// CRUD Operations
// ============================================================================

/**
 * Load all settings from localStorage
 */
export function loadSettings(): SettingsData {
  const defaults: SettingsData = {
    owner: DEFAULT_OWNER,
    pm: DEFAULT_PM,
    property: DEFAULT_PROPERTY,
    mortgage: DEFAULT_MORTGAGE,
    rentalIncome: DEFAULT_RENTAL_INCOME,
    taxInfo: DEFAULT_TAX_INFO,
    tenant: DEFAULT_TENANT,
    personalExpenses: DEFAULT_PERSONAL_EXPENSES,
    utilitiesTracking: DEFAULT_UTILITIES_TRACKING,
    propertyAccounts: DEFAULT_PROPERTY_ACCOUNTS,
    lastUpdated: new Date().toISOString(),
  };

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as Partial<SettingsData>;

      // Merge with defaults to handle missing fields (migration from old versions)
      return {
        owner: parsed.owner || DEFAULT_OWNER,
        pm: parsed.pm || DEFAULT_PM,
        property: parsed.property || DEFAULT_PROPERTY,
        mortgage: parsed.mortgage || DEFAULT_MORTGAGE,
        rentalIncome: parsed.rentalIncome || DEFAULT_RENTAL_INCOME,
        taxInfo: parsed.taxInfo || DEFAULT_TAX_INFO,
        tenant: parsed.tenant || DEFAULT_TENANT,
        personalExpenses: parsed.personalExpenses || DEFAULT_PERSONAL_EXPENSES,
        utilitiesTracking: parsed.utilitiesTracking || DEFAULT_UTILITIES_TRACKING,
        propertyAccounts: parsed.propertyAccounts || DEFAULT_PROPERTY_ACCOUNTS,
        lastUpdated: parsed.lastUpdated || new Date().toISOString(),
      };
    }
  } catch (error) {
    console.error('Failed to load settings:', error);
  }

  // Return defaults if nothing stored
  return defaults;
}

/**
 * Save all settings to localStorage
 */
export function saveSettings(settings: SettingsData): void {
  try {
    const toSave = {
      ...settings,
      lastUpdated: new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
  } catch (error) {
    console.error('Failed to save settings:', error);
    throw error;
  }
}

/**
 * Update owner data
 */
export function updateOwner(owner: Partial<OwnerData>): SettingsData {
  const settings = loadSettings();
  settings.owner = { ...settings.owner, ...owner };
  saveSettings(settings);
  return settings;
}

/**
 * Update property manager data
 */
export function updatePM(pm: Partial<PMData>): SettingsData {
  const settings = loadSettings();
  settings.pm = { ...settings.pm, ...pm };
  saveSettings(settings);
  return settings;
}

/**
 * Update property data
 */
export function updateProperty(property: Partial<PropertyData>): SettingsData {
  const settings = loadSettings();
  settings.property = { ...settings.property, ...property };
  saveSettings(settings);
  return settings;
}

/**
 * Update mortgage data
 */
export function updateMortgage(mortgage: Partial<MortgageData>): SettingsData {
  const settings = loadSettings();
  settings.mortgage = { ...settings.mortgage, ...mortgage };
  saveSettings(settings);
  return settings;
}

/**
 * Update rental income data
 */
export function updateRentalIncome(rentalIncome: Partial<RentalIncomeData>): SettingsData {
  const settings = loadSettings();
  settings.rentalIncome = { ...settings.rentalIncome, ...rentalIncome };
  saveSettings(settings);
  return settings;
}

/**
 * Update tax info data
 */
export function updateTaxInfo(taxInfo: Partial<TaxInfoData>): SettingsData {
  const settings = loadSettings();
  settings.taxInfo = { ...settings.taxInfo, ...taxInfo };
  saveSettings(settings);
  return settings;
}

/**
 * Update tenant data
 */
export function updateTenant(tenant: Partial<TenantData>): SettingsData {
  const settings = loadSettings();
  settings.tenant = { ...settings.tenant, ...tenant };
  saveSettings(settings);
  return settings;
}

/**
 * Update personal expenses data
 */
export function updatePersonalExpenses(expenses: Partial<PersonalExpensesData>): SettingsData {
  const settings = loadSettings();
  settings.personalExpenses = { ...settings.personalExpenses, ...expenses };
  saveSettings(settings);
  return settings;
}

/**
 * Reset all settings to defaults
 */
export function resetSettings(): SettingsData {
  const defaults: SettingsData = {
    owner: DEFAULT_OWNER,
    pm: DEFAULT_PM,
    property: DEFAULT_PROPERTY,
    mortgage: DEFAULT_MORTGAGE,
    rentalIncome: DEFAULT_RENTAL_INCOME,
    taxInfo: DEFAULT_TAX_INFO,
    tenant: DEFAULT_TENANT,
    personalExpenses: DEFAULT_PERSONAL_EXPENSES,
    utilitiesTracking: DEFAULT_UTILITIES_TRACKING,
    propertyAccounts: DEFAULT_PROPERTY_ACCOUNTS,
    lastUpdated: new Date().toISOString(),
  };
  saveSettings(defaults);
  return defaults;
}

/**
 * Export settings as JSON file
 */
export function exportSettings(): string {
  const settings = loadSettings();
  return JSON.stringify(settings, null, 2);
}

/**
 * Import settings from JSON
 */
export function importSettings(jsonString: string): SettingsData {
  try {
    const imported = JSON.parse(jsonString) as SettingsData;
    saveSettings(imported);
    return imported;
  } catch (error) {
    console.error('Failed to import settings:', error);
    throw new Error('Invalid settings file format');
  }
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Calculate total monthly operating expenses
 */
export function calculateMonthlyOperatingExpenses(rentalIncome: RentalIncomeData): number {
  return (
    rentalIncome.monthlyPropertyTax +
    rentalIncome.monthlyInsurance +
    rentalIncome.monthlyHOA +
    rentalIncome.monthlyMaintenanceReserve +
    rentalIncome.monthlyVacancyReserve +
    rentalIncome.monthlyManagementFee
  );
}

/**
 * Calculate monthly cash flow
 */
export function calculateMonthlyCashFlow(
  rentalIncome: RentalIncomeData,
  mortgage: MortgageData
): number {
  const operatingExpenses = calculateMonthlyOperatingExpenses(rentalIncome);
  return rentalIncome.monthlyRent - operatingExpenses - mortgage.monthlyPAndI;
}

/**
 * Calculate years owned from purchase date
 */
export function calculateYearsOwned(purchaseDate: string): number {
  const purchase = new Date(purchaseDate);
  const today = new Date();
  const diffTime = today.getTime() - purchase.getTime();
  const diffYears = diffTime / (1000 * 60 * 60 * 24 * 365.25);
  return Math.max(0, diffYears);
}

/**
 * Format currency
 */
export function formatCurrency(value: number, decimals: number = 2): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

/**
 * Format date for input fields (YYYY-MM-DD)
 */
export function formatDateForInput(isoDate: string): string {
  return isoDate.split('T')[0];
}

/**
 * Validate settings data
 */
export function validateSettings(settings: Partial<SettingsData>): string[] {
  const errors: string[] = [];

  if (settings.property) {
    if (settings.property.purchasePrice <= 0) {
      errors.push('Purchase price must be greater than 0');
    }
    if (settings.property.currentMarketValue <= 0) {
      errors.push('Current market value must be greater than 0');
    }
    if (settings.property.landValue < 0) {
      errors.push('Land value cannot be negative');
    }
  }

  if (settings.mortgage) {
    if (settings.mortgage.principal <= 0) {
      errors.push('Mortgage principal must be greater than 0');
    }
    if (settings.mortgage.interestRate < 0 || settings.mortgage.interestRate > 100) {
      errors.push('Interest rate must be between 0 and 100');
    }
    if (settings.mortgage.monthlyPAndI <= 0) {
      errors.push('Monthly P&I must be greater than 0');
    }
  }

  if (settings.rentalIncome) {
    if (settings.rentalIncome.monthlyRent <= 0) {
      errors.push('Monthly rent must be greater than 0');
    }
  }

  return errors;
}

// ============================================================================
// Utility Bill Management Functions
// ============================================================================

/**
 * Add a new utility bill
 */
export function addUtilityBill(bill: Omit<UtilityBill, 'id'>): UtilityBill {
  const settings = loadSettings();
  const newBill: UtilityBill = {
    ...bill,
    id: `util-${Date.now()}`,
  };
  settings.utilitiesTracking.bills.unshift(newBill);
  saveSettings(settings);
  return newBill;
}

/**
 * Update an existing utility bill
 */
export function updateUtilityBill(id: string, updates: Partial<UtilityBill>): UtilityBill | null {
  const settings = loadSettings();
  const billIndex = settings.utilitiesTracking.bills.findIndex(b => b.id === id);
  if (billIndex === -1) return null;

  settings.utilitiesTracking.bills[billIndex] = {
    ...settings.utilitiesTracking.bills[billIndex],
    ...updates,
  };
  saveSettings(settings);
  return settings.utilitiesTracking.bills[billIndex];
}

/**
 * Get all utility bills
 */
export function getUtilityBills(): UtilityBill[] {
  const settings = loadSettings();
  return settings.utilitiesTracking.bills;
}

/**
 * Check if any utility bill exceeds the stated amount and needs notification
 */
export interface UtilityOverageAlert {
  bill: UtilityBill;
  statedAmount: number;
  overage: number;
}

export function checkUtilityOverages(): UtilityOverageAlert[] {
  const settings = loadSettings();
  const statedAmount = settings.rentalIncome.monthlyUtilities;
  const threshold = settings.utilitiesTracking.overageThreshold;

  return settings.utilitiesTracking.bills
    .filter(bill => bill.amount > statedAmount + threshold)
    .map(bill => ({
      bill,
      statedAmount,
      overage: bill.amount - statedAmount,
    }));
}

/**
 * Update the overage threshold
 */
export function updateOverageThreshold(threshold: number): void {
  const settings = loadSettings();
  settings.utilitiesTracking.overageThreshold = threshold;
  saveSettings(settings);
}

/**
 * Get pending/unpaid utility bills count
 */
export function getPendingUtilityBillsCount(): number {
  const settings = loadSettings();
  return settings.utilitiesTracking.bills.filter(b => b.status !== 'paid').length;
}
