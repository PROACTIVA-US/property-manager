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
  monthlyPropertyTax: number;
  monthlyInsurance: number;
  monthlyHOA: number;
  monthlyMaintenanceReserve: number;
  monthlyVacancyReserve: number; // Usually 5-8% of rent
  monthlyManagementFee: number; // Usually 8-10% of rent, or 0 if self-managed
  includesUtilities: boolean;
}

export interface TaxInfoData {
  filingStatus: 'single' | 'married_filing_jointly' | 'married_filing_separately' | 'head_of_household';
  annualIncome: number;
  stateIncomeTaxRate: number; // as percentage
  capitalImprovementsCost: number;
  depreciableValue: number; // Usually purchase price minus land value
  estimatedSellingCosts: number; // Typically 6-10% of sale price
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

export interface SettingsData {
  property: PropertyData;
  mortgage: MortgageData;
  rentalIncome: RentalIncomeData;
  taxInfo: TaxInfoData;
  tenant: TenantData;
  personalExpenses: PersonalExpensesData;
  lastUpdated: string; // ISO timestamp
}

// ============================================================================
// Default Values (from legacy system)
// ============================================================================

export const DEFAULT_PROPERTY: PropertyData = {
  address: '1234 Property Lane',
  unitNumber: 'Apt 4B',
  purchasePrice: 350000,
  purchaseDate: '2019-07-01',
  currentMarketValue: 420000,
  landValue: 70000, // ~20% of purchase price
  yearBuilt: 2010,
  squareFootage: 1200,
  bedrooms: 2,
  bathrooms: 2,
  propertyType: 'condo',
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
  monthlyRent: 2400,
  monthlyPropertyTax: 350,
  monthlyInsurance: 150,
  monthlyHOA: 0,
  monthlyMaintenanceReserve: 200,
  monthlyVacancyReserve: 120, // 5% of rent
  monthlyManagementFee: 0, // Self-managed
  includesUtilities: false,
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
  name: 'Gregg Marshall',
  email: 'gregg.marshall@email.com',
  phone: '(555) 123-4567',
  leaseStartDate: '2024-07-01',
  leaseEndDate: '2025-06-30',
  monthlyRent: 2400,
  securityDeposit: 4800,
  emergencyContact: 'Sarah Marshall',
  emergencyContactPhone: '(555) 987-6543',
  moveInDate: '2024-06-28',
};

export const DEFAULT_PERSONAL_EXPENSES: PersonalExpensesData = {
  currentRentPayment: 1500,
  currentUtilityCosts: 200,
  currentJobIncome: 6000,
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
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as SettingsData;
      return parsed;
    }
  } catch (error) {
    console.error('Failed to load settings:', error);
  }

  // Return defaults if nothing stored
  return {
    property: DEFAULT_PROPERTY,
    mortgage: DEFAULT_MORTGAGE,
    rentalIncome: DEFAULT_RENTAL_INCOME,
    taxInfo: DEFAULT_TAX_INFO,
    tenant: DEFAULT_TENANT,
    personalExpenses: DEFAULT_PERSONAL_EXPENSES,
    lastUpdated: new Date().toISOString(),
  };
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
    property: DEFAULT_PROPERTY,
    mortgage: DEFAULT_MORTGAGE,
    rentalIncome: DEFAULT_RENTAL_INCOME,
    taxInfo: DEFAULT_TAX_INFO,
    tenant: DEFAULT_TENANT,
    personalExpenses: DEFAULT_PERSONAL_EXPENSES,
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
