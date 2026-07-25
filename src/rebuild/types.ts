export type HouseSection =
  | 'today'
  | 'work'
  | 'people'
  | 'money'
  | 'property'
  | 'inbox'
  | 'admin';

export type HouseRole = 'admin' | 'manager' | 'owner' | 'tenant';

export interface HousePerson {
  id: string;
  displayName: string;
  email: string | null;
  phone: string | null;
  verified: boolean;
}

export interface HousePhoto {
  id: string;
  signedUrl: string;
  caption: string | null;
  category: string;
  sortOrder: number;
  verified: boolean;
}

export interface HouseDocument {
  id: string;
  fileName: string;
  category: string;
  externalUrl: string | null;
  storagePath: string | null;
  verified: boolean;
}

export interface HouseWorkOrder {
  id: string;
  title: string;
  description: string | null;
  category: string;
  status: string;
  priority: string;
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
  };
  property: {
    id: string;
    nickname: string;
    address: string;
    propertyType: string | null;
    yearBuilt: number | null;
    squareFootage: number | null;
    bedrooms: number | null;
    bathrooms: number | null;
    currentMarketValue: number | null;
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
    verified: boolean;
  } | null;
  household: {
    id: string;
    name: string;
    people: HousePerson[];
    verified: boolean;
  } | null;
  people: HousePerson[];
  photos: HousePhoto[];
  documents: HouseDocument[];
  workOrders: HouseWorkOrder[];
  ledgerEntries: HouseLedgerEntry[];
  ownerFinancials: {
    mortgagePrincipal: number | null;
    mortgageInterestRate: number | null;
    mortgagePayment: number | null;
    lenderLabel: string | null;
    verified: boolean;
  } | null;
  recovery: {
    importedAt: string;
    sourceLabel: string;
    classification: string;
    photoCount: number;
  } | null;
}
