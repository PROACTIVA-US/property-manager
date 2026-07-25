export type HouseSection =
  | 'today'
  | 'work'
  | 'people'
  | 'money'
  | 'property'
  | 'inbox'
  | 'manage'
  | 'admin';

export type HouseRole = 'admin' | 'manager' | 'owner' | 'tenant';

export interface HousePerson {
  id: string;
  displayName: string;
  email: string | null;
  phone: string | null;
  notes: string | null;
  verified: boolean;
}

export interface HousePhoto {
  id: string;
  storagePath: string;
  signedUrl: string;
  caption: string | null;
  category: string;
  visibility: HouseFileVisibility;
  sortOrder: number;
  verified: boolean;
}

export interface HouseDocument {
  id: string;
  fileName: string;
  category: string;
  externalUrl: string | null;
  storagePath: string | null;
  signedUrl: string | null;
  visibility: HouseFileVisibility;
  verified: boolean;
}

export interface HouseWorkOrder {
  id: string;
  title: string;
  description: string | null;
  category: string;
  status: string;
  priority: string;
  responsibility: string | null;
  dueOn: string | null;
  createdAt: string;
  verified: boolean;
}

export interface HouseLedgerEntry {
  id: string;
  kind: string;
  amount: number;
  effectiveOn: string;
  description: string;
  status: string;
}

export type HouseFileVisibility =
  | 'shared'
  | 'manager_owner'
  | 'owner'
  | 'tenant';

export interface HouseAccessMember {
  membershipId: string;
  profileId: string;
  personId: string | null;
  displayName: string;
  email: string;
  role: HouseRole;
  status: 'invited' | 'active' | 'suspended' | 'revoked';
}

export interface HouseWorkspaceData {
  membership: {
    id: string;
    propertyId: string;
    role: HouseRole;
  };
  profile: {
    id: string;
    displayName: string;
    email: string;
    phone: string | null;
  };
  property: {
    id: string;
    nickname: string;
    address: string;
    unitNumber: string | null;
    propertyType: string | null;
    yearBuilt: number | null;
    squareFootage: number | null;
    bedrooms: number | null;
    bathrooms: number | null;
    purchasePrice: number | null;
    purchaseDate: string | null;
    currentMarketValue: number | null;
    landValue: number | null;
    verified: boolean;
  };
  lease: {
    id: string;
    status: string;
    startsOn: string;
    endsOn: string | null;
    monthlyRent: number;
    monthlyUtilities: number;
    securityDeposit: number | null;
    notes: string | null;
    verified: boolean;
  } | null;
  household: {
    id: string;
    name: string;
    status: string;
    people: HousePerson[];
    verified: boolean;
  } | null;
  people: HousePerson[];
  photos: HousePhoto[];
  documents: HouseDocument[];
  workOrders: HouseWorkOrder[];
  ledgerEntries: HouseLedgerEntry[];
  accessMembers: HouseAccessMember[];
  ownerFinancials: {
    mortgagePrincipal: number | null;
    mortgageInterestRate: number | null;
    mortgagePayment: number | null;
    mortgageEscrow: number | null;
    mortgagePrincipalInterest: number | null;
    originalLoanAmount: number | null;
    loanStartedOn: string | null;
    loanTermYears: number | null;
    lenderLabel: string | null;
    annualIncome: number | null;
    stateIncomeTaxRate: number | null;
    capitalImprovementsCost: number | null;
    depreciableValue: number | null;
    estimatedSellingCosts: number | null;
    verified: boolean;
  } | null;
  recovery: {
    importedAt: string;
    sourceLabel: string;
    classification: string;
    photoCount: number;
  } | null;
}
