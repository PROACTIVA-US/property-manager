import { supabase } from '../lib/supabase';
import type {
  HouseDocument,
  HouseLedgerEntry,
  HousePerson,
  HousePhoto,
  HouseRole,
  HouseWorkspaceData,
  HouseWorkOrder,
} from './types';

function numeric(value: number | string | null): number | null {
  if (value === null) return null;
  const parsed = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function verifiedAt(value: string | null): boolean {
  return Boolean(value);
}

export async function loadHouseWorkspace(
  userId: string,
): Promise<HouseWorkspaceData | null> {
  const { data: membership, error: membershipError } = await supabase
    .from('property_memberships')
    .select('id, property_id, role, status')
    .eq('profile_id', userId)
    .eq('status', 'active')
    .limit(1)
    .maybeSingle();

  if (membershipError) throw membershipError;
  if (!membership) return null;

  const propertyId = membership.property_id;
  const role = membership.role as HouseRole;

  const [
    profileResult,
    propertyResult,
    leaseResult,
    householdResult,
    peopleResult,
    photosResult,
    documentsResult,
    workOrdersResult,
    ledgerResult,
    recoveryResult,
    ownerFinancialsResult,
  ] = await Promise.all([
    supabase
      .from('profiles')
      .select('id, email, display_name')
      .eq('id', userId)
      .single(),
    supabase
      .from('properties')
      .select(
        'id, nickname, address, property_type, year_built, square_footage, bedrooms, bathrooms, current_market_value, verified_at',
      )
      .eq('id', propertyId)
      .single(),
    supabase
      .from('leases')
      .select(
        'id, household_id, status, starts_on, ends_on, monthly_rent, monthly_utilities, security_deposit, verified_at',
      )
      .eq('property_id', propertyId)
      .order('starts_on', { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from('households')
      .select('id, name, status, verified_at')
      .eq('property_id', propertyId)
      .eq('status', 'active')
      .limit(1)
      .maybeSingle(),
    supabase
      .from('people')
      .select('id, display_name, email, phone, verified_at')
      .order('display_name'),
    supabase
      .from('property_photos')
      .select(
        'id, storage_path, caption, category, sort_order, verified_at',
      )
      .eq('property_id', propertyId)
      .order('sort_order'),
    supabase
      .from('property_documents')
      .select(
        'id, file_name, category, external_url, storage_path, verified_at',
      )
      .eq('property_id', propertyId)
      .order('created_at', { ascending: false }),
    supabase
      .from('work_orders')
      .select(
        'id, title, description, category, status, priority, created_at, verified_at',
      )
      .eq('property_id', propertyId)
      .order('created_at', { ascending: false }),
    supabase
      .from('ledger_entries')
      .select(
        'id, kind, amount, effective_on, description, status',
      )
      .eq('property_id', propertyId)
      .order('effective_on', { ascending: false }),
    supabase
      .from('recovery_imports')
      .select(
        'source_label, classification, imported_counts, created_at',
      )
      .eq('property_id', propertyId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
    role === 'owner' || role === 'admin'
      ? supabase
          .from('owner_property_financials')
          .select(
            'mortgage_principal, mortgage_interest_rate, mortgage_total_monthly_payment, lender_label, verified_at',
          )
          .eq('property_id', propertyId)
          .maybeSingle()
      : Promise.resolve({ data: null, error: null }),
  ]);

  const results = [
    profileResult,
    propertyResult,
    leaseResult,
    householdResult,
    peopleResult,
    photosResult,
    documentsResult,
    workOrdersResult,
    ledgerResult,
    recoveryResult,
    ownerFinancialsResult,
  ];
  const firstError = results.find((result) => result.error)?.error;
  if (firstError) throw firstError;

  const profile = profileResult.data;
  const property = propertyResult.data;
  if (!profile || !property) return null;

  const people: HousePerson[] = (peopleResult.data ?? []).map((person) => ({
    id: person.id,
    displayName: person.display_name,
    email: person.email,
    phone: person.phone,
    verified: verifiedAt(person.verified_at),
  }));

  let householdPeople: HousePerson[] = [];
  if (householdResult.data) {
    const { data: members, error: membersError } = await supabase
      .from('household_members')
      .select('person_id')
      .eq('household_id', householdResult.data.id);
    if (membersError) throw membersError;
    const personIds = new Set((members ?? []).map((member) => member.person_id));
    householdPeople = people.filter((person) => personIds.has(person.id));
  }

  const photoRows = photosResult.data ?? [];
  let photos: HousePhoto[] = [];
  if (photoRows.length > 0) {
    const { data: signedPhotos, error: signedPhotosError } =
      await supabase.storage
        .from('property-files')
        .createSignedUrls(
          photoRows.map((photo) => photo.storage_path),
          60 * 60,
        );
    if (signedPhotosError) throw signedPhotosError;
    photos = photoRows.flatMap((photo, index) => {
      const signedUrl = signedPhotos[index]?.signedUrl;
      if (!signedUrl) return [];
      return [{
        id: photo.id,
        signedUrl,
        caption: photo.caption,
        category: photo.category,
        sortOrder: photo.sort_order,
        verified: verifiedAt(photo.verified_at),
      }];
    });
  }

  const documents: HouseDocument[] = (documentsResult.data ?? []).map(
    (document) => ({
      id: document.id,
      fileName: document.file_name,
      category: document.category,
      externalUrl: document.external_url,
      storagePath: document.storage_path,
      verified: verifiedAt(document.verified_at),
    }),
  );

  const workOrders: HouseWorkOrder[] = (workOrdersResult.data ?? []).map(
    (workOrder) => ({
      id: workOrder.id,
      title: workOrder.title,
      description: workOrder.description,
      category: workOrder.category,
      status: workOrder.status,
      priority: workOrder.priority,
      createdAt: workOrder.created_at,
      verified: verifiedAt(workOrder.verified_at),
    }),
  );

  const ledgerEntries: HouseLedgerEntry[] = (ledgerResult.data ?? []).map(
    (entry) => ({
      id: entry.id,
      kind: entry.kind,
      amount: numeric(entry.amount) ?? 0,
      effectiveOn: entry.effective_on,
      description: entry.description,
      status: entry.status,
    }),
  );

  const lease = leaseResult.data
    ? {
        id: leaseResult.data.id,
        status: leaseResult.data.status,
        startsOn: leaseResult.data.starts_on,
        endsOn: leaseResult.data.ends_on,
        monthlyRent: numeric(leaseResult.data.monthly_rent) ?? 0,
        monthlyUtilities: numeric(leaseResult.data.monthly_utilities) ?? 0,
        securityDeposit: numeric(leaseResult.data.security_deposit),
        verified: verifiedAt(leaseResult.data.verified_at),
      }
    : null;

  const recoveryCounts =
    recoveryResult.data?.imported_counts &&
    typeof recoveryResult.data.imported_counts === 'object' &&
    !Array.isArray(recoveryResult.data.imported_counts)
      ? recoveryResult.data.imported_counts
      : {};

  return {
    membership: {
      id: membership.id,
      propertyId,
      role,
    },
    profile: {
      id: profile.id,
      displayName: profile.display_name,
      email: profile.email,
    },
    property: {
      id: property.id,
      nickname: property.nickname || 'The House',
      address: property.address,
      propertyType: property.property_type,
      yearBuilt: property.year_built,
      squareFootage: property.square_footage,
      bedrooms: property.bedrooms,
      bathrooms: numeric(property.bathrooms),
      currentMarketValue: numeric(property.current_market_value),
      verified: verifiedAt(property.verified_at),
    },
    lease,
    household: householdResult.data
      ? {
          id: householdResult.data.id,
          name: householdResult.data.name,
          people: householdPeople,
          verified: verifiedAt(householdResult.data.verified_at),
        }
      : null,
    people,
    photos,
    documents,
    workOrders,
    ledgerEntries,
    ownerFinancials: ownerFinancialsResult.data
      ? {
          mortgagePrincipal: numeric(
            ownerFinancialsResult.data.mortgage_principal,
          ),
          mortgageInterestRate: numeric(
            ownerFinancialsResult.data.mortgage_interest_rate,
          ),
          mortgagePayment: numeric(
            ownerFinancialsResult.data.mortgage_total_monthly_payment,
          ),
          lenderLabel: ownerFinancialsResult.data.lender_label,
          verified: verifiedAt(ownerFinancialsResult.data.verified_at),
        }
      : null,
    recovery: recoveryResult.data
      ? {
          importedAt: recoveryResult.data.created_at,
          sourceLabel: recoveryResult.data.source_label,
          classification: recoveryResult.data.classification,
          photoCount:
            typeof recoveryCounts.photos === 'number'
              ? recoveryCounts.photos
              : photos.length,
        }
      : null,
  };
}

export async function createHouseWorkOrder(input: {
  propertyId: string;
  userId: string;
  title: string;
  description: string;
  category: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
}) {
  const { data, error } = await supabase
    .from('work_orders')
    .insert({
      property_id: input.propertyId,
      created_by: input.userId,
      title: input.title,
      description: input.description || null,
      category: input.category,
      priority: input.priority,
      status: 'reported',
      source_provenance: {
        source_kind: 'house_application',
        classification: 'authoritative',
      },
      verified_at: new Date().toISOString(),
    })
    .select('id')
    .single();

  if (error) throw error;
  return data;
}
