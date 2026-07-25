import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { updateHouseProperty } from './data';
import HouseAdmin from './HouseAdmin';
import type { HouseWorkspaceData } from './types';

vi.mock('./data', async (importOriginal) => {
  const actual = await importOriginal<typeof import('./data')>();
  return {
    ...actual,
    updateHouseProperty: vi.fn().mockResolvedValue(undefined),
  };
});

const data: HouseWorkspaceData = {
  membership: {
    id: 'membership-admin',
    propertyId: 'property-1',
    role: 'admin',
  },
  profile: {
    id: 'profile-admin',
    displayName: 'Daniel Connolly',
    email: 'daniel@example.com',
    phone: null,
  },
  property: {
    id: 'property-1',
    nickname: 'The House',
    address: '14102 129th Ave NE, Kirkland, WA 98034',
    unitNumber: null,
    propertyType: 'single_family',
    yearBuilt: 2010,
    squareFootage: 1400,
    bedrooms: 3,
    bathrooms: 2,
    purchasePrice: 350000,
    purchaseDate: '2019-07-01',
    currentMarketValue: 1089100,
    landValue: 70000,
    verified: false,
  },
  lease: {
    id: 'lease-1',
    status: 'active',
    startsOn: '2025-01-01',
    endsOn: '2026-01-01',
    monthlyRent: 2400,
    monthlyUtilities: 150,
    securityDeposit: 2400,
    notes: null,
    verified: true,
  },
  household: {
    id: 'household-1',
    name: 'Marshall household',
    status: 'active',
    people: [],
    verified: true,
  },
  people: [
    {
      id: 'person-1',
      displayName: 'Gregg Marshall',
      email: 'gregg@example.com',
      phone: null,
      notes: null,
      verified: true,
    },
  ],
  photos: [],
  documents: [],
  workOrders: [
    {
      id: 'work-1',
      title: 'Repair deck',
      description: 'Replace damaged boards.',
      category: 'exterior',
      status: 'reported',
      priority: 'high',
      responsibility: 'owner',
      dueOn: null,
      createdAt: '2026-07-24T00:00:00.000Z',
      verified: true,
    },
  ],
  ledgerEntries: [],
  accessMembers: [
    {
      membershipId: 'membership-admin',
      profileId: 'profile-admin',
      personId: null,
      displayName: 'Daniel Connolly',
      email: 'daniel@example.com',
      role: 'admin',
      status: 'active',
    },
  ],
  ownerFinancials: null,
  recovery: null,
};

describe('HouseAdmin', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('provides one administrator editing area for every core record group', () => {
    render(<HouseAdmin data={data} onRefresh={vi.fn()} />);

    expect(
      screen.getByRole('heading', { name: 'Manage House', level: 2 }),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Property/ })).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /People & access/ }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /Lease & money/ }),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^Work/ })).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /Photos & files/ }),
    ).toBeInTheDocument();
  });

  it('opens access editing and work-order editing without leaving the workspace', () => {
    render(<HouseAdmin data={data} onRefresh={vi.fn()} />);

    fireEvent.click(screen.getByRole('button', { name: /People & access/ }));
    expect(
      screen.getByRole('heading', { name: 'Logins and roles' }),
    ).toBeInTheDocument();
    expect(screen.getByText('daniel@example.com')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /^Work/ }));
    expect(
      screen.getByRole('heading', { name: 'Work orders' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Repair deck')).toBeInTheDocument();
  });

  it('saves property edits and refreshes the live workspace', async () => {
    const onRefresh = vi.fn().mockResolvedValue(undefined);
    render(<HouseAdmin data={data} onRefresh={onRefresh} />);

    const propertyName = screen.getByLabelText('Property name');
    fireEvent.change(propertyName, { target: { value: 'Wildvine House' } });
    const propertyForm = propertyName.closest('form');
    expect(propertyForm).not.toBeNull();
    fireEvent.click(
      within(propertyForm!).getByRole('button', { name: 'Save changes' }),
    );

    await waitFor(() => {
      expect(updateHouseProperty).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'property-1',
          nickname: 'Wildvine House',
        }),
      );
    });
    expect(onRefresh).toHaveBeenCalled();
    expect(await screen.findByText('Property details saved.')).toBeInTheDocument();
  });
});
