import type { UserRole } from '../contexts/AuthContext';

export type FinancialTab = 'overview' | 'property' | 'rental' | 'tax' | 'projections';

const FINANCIAL_TAB_ACCESS: Record<string, FinancialTab[]> = {
  owner: ['overview', 'property', 'rental', 'tax', 'projections'],
  pm: ['rental'],
  tenant: [],
};

export function getAccessibleTabs(role: UserRole | null): FinancialTab[] {
  return FINANCIAL_TAB_ACCESS[role || ''] || [];
}

export function canAccessTab(role: UserRole | null, tab: FinancialTab): boolean {
  return getAccessibleTabs(role).includes(tab);
}

export function getDefaultTab(role: UserRole | null): FinancialTab | null {
  const accessible = getAccessibleTabs(role);
  return accessible.length > 0 ? accessible[0] : null;
}

export interface OverviewSections {
  rentalIncome: boolean;
  rentalExpenses: boolean;
  netCashFlow: boolean;
  mortgageAnalysis: boolean;
  personalIncome: boolean;
  combinedSummary: boolean;
}

export function getOverviewSections(role: UserRole | null): OverviewSections {
  switch (role) {
    case 'owner':
      return {
        rentalIncome: true,
        rentalExpenses: true,
        netCashFlow: true,
        mortgageAnalysis: true,
        personalIncome: true,
        combinedSummary: true,
      };
    case 'pm':
      return {
        rentalIncome: true,
        rentalExpenses: true,
        netCashFlow: true,
        mortgageAnalysis: false,
        personalIncome: false,
        combinedSummary: false,
      };
    default:
      return {
        rentalIncome: false,
        rentalExpenses: false,
        netCashFlow: false,
        mortgageAnalysis: false,
        personalIncome: false,
        combinedSummary: false,
      };
  }
}
