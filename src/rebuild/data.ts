import { supabase } from '../lib/supabase';
import type { Database } from '../lib/database.types';
import type {
  HouseAccessMember,
  HouseCustomField,
  HouseDocument,
  HouseFieldType,
  HouseFileVisibility,
  HouseLedgerEntry,
  HousePageIcon,
  HousePerson,
  HousePhoto,
  HouseRole,
  HouseSystemPage,
  HouseWorkspaceData,
  HouseWorkspacePage,
  HouseWorkOrder,
} from './types';

type PropertyType = Database['public']['Enums']['property_type'];
type LeaseStatus = Database['public']['Enums']['lease_status'];
type WorkOrderStatus = Database['public']['Enums']['work_order_status'];
type WorkOrderPriority = Database['public']['Enums']['work_order_priority'];
type LedgerEntryKind = Database['public']['Enums']['ledger_entry_kind'];
type MembershipStatus = Database['public']['Enums']['membership_status'];

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
    accessResult,
    workspacePagesResult,
    customFieldsResult,
  ] = await Promise.all([
    supabase
      .from('profiles')
      .select('id, email, display_name, phone')
      .eq('id', userId)
      .single(),
    supabase
      .from('properties')
      .select(
        'id, nickname, address, unit_number, property_type, year_built, square_footage, bedrooms, bathrooms, purchase_price, purchase_date, current_market_value, land_value, verified_at',
      )
      .eq('id', propertyId)
      .single(),
    supabase
      .from('leases')
      .select(
        'id, household_id, status, starts_on, ends_on, monthly_rent, monthly_utilities, security_deposit, notes, verified_at',
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
      .select('id, display_name, email, phone, notes, verified_at')
      .order('display_name'),
    supabase
      .from('property_photos')
      .select(
        'id, storage_path, caption, category, visibility, sort_order, verified_at',
      )
      .eq('property_id', propertyId)
      .order('sort_order'),
    supabase
      .from('property_documents')
      .select(
        'id, file_name, category, external_url, storage_path, visibility, verified_at',
      )
      .eq('property_id', propertyId)
      .order('created_at', { ascending: false }),
    supabase
      .from('work_orders')
      .select(
        'id, title, description, category, status, priority, responsibility, due_on, created_at, verified_at',
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
            'mortgage_principal, mortgage_interest_rate, mortgage_monthly_principal_interest, mortgage_monthly_escrow, mortgage_total_monthly_payment, original_loan_amount, loan_started_on, loan_term_years, lender_label, annual_income, state_income_tax_rate, capital_improvements_cost, depreciable_value, estimated_selling_costs, verified_at',
          )
          .eq('property_id', propertyId)
          .maybeSingle()
      : Promise.resolve({ data: null, error: null }),
    role === 'admin' || role === 'manager'
      ? supabase
          .from('property_memberships')
          .select(
            'id, profile_id, role, status, profiles!property_memberships_profile_id_fkey(id, email, display_name, person_id)',
          )
          .eq('property_id', propertyId)
          .order('created_at')
      : Promise.resolve({ data: [], error: null }),
    supabase
      .from('property_workspace_pages')
      .select(
        'id, system_key, slug, label, icon, sort_order, visible_roles, is_visible, hidden_core_fields',
      )
      .eq('property_id', propertyId)
      .is('archived_at', null)
      .order('sort_order'),
    supabase
      .from('property_workspace_fields')
      .select(
        'id, page_id, label, field_type, value, sort_order, visible_roles, is_visible',
      )
      .eq('property_id', propertyId)
      .is('archived_at', null)
      .order('sort_order'),
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
    accessResult,
    workspacePagesResult,
    customFieldsResult,
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
    notes: person.notes,
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
        storagePath: photo.storage_path,
        signedUrl,
        caption: photo.caption,
        category: photo.category,
        visibility: photo.visibility as HouseFileVisibility,
        sortOrder: photo.sort_order,
        verified: verifiedAt(photo.verified_at),
      }];
    });
  }

  const documentRows = documentsResult.data ?? [];
  const storedDocuments = documentRows.filter(
    (document) => document.storage_path,
  );
  let signedDocumentUrls = new Map<string, string>();
  if (storedDocuments.length > 0) {
    const { data: signedDocuments, error: signedDocumentsError } =
      await supabase.storage
        .from('property-files')
        .createSignedUrls(
          storedDocuments.flatMap((document) =>
            document.storage_path ? [document.storage_path] : [],
          ),
          60 * 60,
        );
    if (signedDocumentsError) throw signedDocumentsError;
    signedDocumentUrls = new Map(
      storedDocuments.flatMap((document, index) => {
        const signedUrl = signedDocuments[index]?.signedUrl;
        return document.storage_path && signedUrl
          ? [[document.id, signedUrl]]
          : [];
      }),
    );
  }

  const documents: HouseDocument[] = documentRows.map(
    (document) => ({
      id: document.id,
      fileName: document.file_name,
      category: document.category,
      externalUrl: document.external_url,
      storagePath: document.storage_path,
      signedUrl: signedDocumentUrls.get(document.id) ?? null,
      visibility: document.visibility as HouseFileVisibility,
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
      responsibility: workOrder.responsibility,
      dueOn: workOrder.due_on,
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
      notes: leaseResult.data.notes,
      verified: verifiedAt(leaseResult.data.verified_at),
    }
    : null;

  const accessMembers: HouseAccessMember[] = (accessResult.data ?? []).flatMap(
    (membership) => {
      const profile = membership.profiles;
      if (!profile) return [];
      return [{
        membershipId: membership.id,
        profileId: membership.profile_id,
        personId: profile.person_id,
        displayName: profile.display_name,
        email: profile.email,
        role: membership.role as HouseRole,
        status: membership.status,
      }];
    },
  );

  const recoveryCounts =
    recoveryResult.data?.imported_counts &&
    typeof recoveryResult.data.imported_counts === 'object' &&
    !Array.isArray(recoveryResult.data.imported_counts)
      ? recoveryResult.data.imported_counts
      : {};

  const workspacePages: HouseWorkspacePage[] = (
    workspacePagesResult.data ?? []
  ).map((page) => ({
    id: page.id,
    systemKey: page.system_key as HouseSystemPage | null,
    slug: page.slug,
    label: page.label,
    icon: page.icon as HousePageIcon,
    sortOrder: page.sort_order,
    visibleRoles: page.visible_roles as HouseRole[],
    isVisible: page.is_visible,
    hiddenCoreFields: page.hidden_core_fields,
  }));

  const customFields: HouseCustomField[] = (
    customFieldsResult.data ?? []
  ).map((field) => ({
    id: field.id,
    pageId: field.page_id,
    label: field.label,
    fieldType: field.field_type as HouseFieldType,
    value: field.value,
    sortOrder: field.sort_order,
    visibleRoles: field.visible_roles as HouseRole[],
    isVisible: field.is_visible,
  }));

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
      phone: profile.phone,
    },
    property: {
      id: property.id,
      nickname: property.nickname || 'The House',
      address: property.address,
      unitNumber: property.unit_number,
      propertyType: property.property_type,
      yearBuilt: property.year_built,
      squareFootage: property.square_footage,
      bedrooms: property.bedrooms,
      bathrooms: numeric(property.bathrooms),
      purchasePrice: numeric(property.purchase_price),
      purchaseDate: property.purchase_date,
      currentMarketValue: numeric(property.current_market_value),
      landValue: numeric(property.land_value),
      verified: verifiedAt(property.verified_at),
    },
    lease,
    household: householdResult.data
      ? {
          id: householdResult.data.id,
          name: householdResult.data.name,
          status: householdResult.data.status,
          people: householdPeople,
          verified: verifiedAt(householdResult.data.verified_at),
        }
      : null,
    people,
    photos,
    documents,
    workOrders,
    ledgerEntries,
    accessMembers,
    workspacePages,
    customFields,
    ownerFinancials: ownerFinancialsResult.data
      ? {
          mortgagePrincipal: numeric(
            ownerFinancialsResult.data.mortgage_principal,
          ),
          mortgageInterestRate: numeric(
            ownerFinancialsResult.data.mortgage_interest_rate,
          ),
          mortgagePrincipalInterest: numeric(
            ownerFinancialsResult.data.mortgage_monthly_principal_interest,
          ),
          mortgageEscrow: numeric(
            ownerFinancialsResult.data.mortgage_monthly_escrow,
          ),
          mortgagePayment: numeric(
            ownerFinancialsResult.data.mortgage_total_monthly_payment,
          ),
          originalLoanAmount: numeric(
            ownerFinancialsResult.data.original_loan_amount,
          ),
          loanStartedOn: ownerFinancialsResult.data.loan_started_on,
          loanTermYears: ownerFinancialsResult.data.loan_term_years,
          lenderLabel: ownerFinancialsResult.data.lender_label,
          annualIncome: numeric(ownerFinancialsResult.data.annual_income),
          stateIncomeTaxRate: numeric(
            ownerFinancialsResult.data.state_income_tax_rate,
          ),
          capitalImprovementsCost: numeric(
            ownerFinancialsResult.data.capital_improvements_cost,
          ),
          depreciableValue: numeric(
            ownerFinancialsResult.data.depreciable_value,
          ),
          estimatedSellingCosts: numeric(
            ownerFinancialsResult.data.estimated_selling_costs,
          ),
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

function workspaceSlug(label: string) {
  const normalized = label
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 42);
  return normalized || 'page';
}

export async function createWorkspacePage(input: {
  propertyId: string;
  userId: string;
  label: string;
  icon: HousePageIcon;
  visibleRoles: HouseRole[];
  sortOrder: number;
}) {
  const { data, error } = await supabase
    .from('property_workspace_pages')
    .insert({
      property_id: input.propertyId,
      created_by: input.userId,
      label: input.label.trim(),
      slug: `${workspaceSlug(input.label)}-${crypto.randomUUID().slice(0, 6)}`,
      icon: input.icon,
      visible_roles: input.visibleRoles,
      sort_order: input.sortOrder,
    })
    .select('id')
    .single();
  if (error) throw error;
  return data;
}

export async function updateWorkspacePage(input: {
  id: string;
  label?: string;
  icon?: HousePageIcon;
  visibleRoles?: HouseRole[];
  isVisible?: boolean;
  hiddenCoreFields?: string[];
  sortOrder?: number;
}) {
  const values: Database['public']['Tables']['property_workspace_pages']['Update'] = {};
  if (input.label !== undefined) values.label = input.label.trim();
  if (input.icon !== undefined) values.icon = input.icon;
  if (input.visibleRoles !== undefined) values.visible_roles = input.visibleRoles;
  if (input.isVisible !== undefined) values.is_visible = input.isVisible;
  if (input.hiddenCoreFields !== undefined) {
    values.hidden_core_fields = input.hiddenCoreFields;
  }
  if (input.sortOrder !== undefined) values.sort_order = input.sortOrder;

  const { error } = await supabase
    .from('property_workspace_pages')
    .update(values)
    .eq('id', input.id);
  if (error) throw error;
}

export async function reorderWorkspacePages(pageIds: string[]) {
  const results = await Promise.all(
    pageIds.map((id, sortOrder) =>
      supabase
        .from('property_workspace_pages')
        .update({ sort_order: sortOrder })
        .eq('id', id),
    ),
  );
  const firstError = results.find((result) => result.error)?.error;
  if (firstError) throw firstError;
}

export async function archiveWorkspacePage(id: string) {
  const { error } = await supabase
    .from('property_workspace_pages')
    .update({
      archived_at: new Date().toISOString(),
      is_visible: false,
    })
    .eq('id', id)
    .is('system_key', null);
  if (error) throw error;
}

export async function createWorkspaceField(input: {
  propertyId: string;
  pageId: string;
  userId: string;
  label: string;
  fieldType: HouseFieldType;
  value: string;
  visibleRoles: HouseRole[];
  sortOrder: number;
}) {
  const { error } = await supabase
    .from('property_workspace_fields')
    .insert({
      property_id: input.propertyId,
      page_id: input.pageId,
      created_by: input.userId,
      label: input.label.trim(),
      field_type: input.fieldType,
      value: input.value,
      visible_roles: input.visibleRoles,
      sort_order: input.sortOrder,
    });
  if (error) throw error;
}

export async function updateWorkspaceField(input: {
  id: string;
  label: string;
  fieldType: HouseFieldType;
  value: string;
  visibleRoles: HouseRole[];
  isVisible: boolean;
}) {
  const { error } = await supabase
    .from('property_workspace_fields')
    .update({
      label: input.label.trim(),
      field_type: input.fieldType,
      value: input.value,
      visible_roles: input.visibleRoles,
      is_visible: input.isVisible,
    })
    .eq('id', input.id);
  if (error) throw error;
}

export async function reorderWorkspaceFields(fieldIds: string[]) {
  const results = await Promise.all(
    fieldIds.map((id, sortOrder) =>
      supabase
        .from('property_workspace_fields')
        .update({ sort_order: sortOrder })
        .eq('id', id),
    ),
  );
  const firstError = results.find((result) => result.error)?.error;
  if (firstError) throw firstError;
}

export async function archiveWorkspaceField(id: string) {
  const { error } = await supabase
    .from('property_workspace_fields')
    .update({
      archived_at: new Date().toISOString(),
      is_visible: false,
    })
    .eq('id', id);
  if (error) throw error;
}

function verifiedTimestamp(verified: boolean) {
  return verified ? new Date().toISOString() : null;
}

function cleanOptional(value: string) {
  const cleaned = value.trim();
  return cleaned.length > 0 ? cleaned : null;
}

function storageVisibilityFolder(visibility: HouseFileVisibility) {
  return visibility === 'manager_owner' ? 'manager-owner' : visibility;
}

function safeStorageFileName(fileName: string) {
  const normalized = fileName
    .normalize('NFKD')
    .replace(/[^\w.-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
  return normalized || 'file';
}

function storagePath(
  propertyId: string,
  visibility: HouseFileVisibility,
  kind: 'photos' | 'documents',
  fileName: string,
) {
  return [
    propertyId,
    storageVisibilityFolder(visibility),
    kind,
    `${crypto.randomUUID()}-${safeStorageFileName(fileName)}`,
  ].join('/');
}

export async function updateHouseProperty(input: {
  id: string;
  nickname: string;
  address: string;
  unitNumber: string;
  propertyType: PropertyType | '';
  yearBuilt: number | null;
  squareFootage: number | null;
  bedrooms: number | null;
  bathrooms: number | null;
  purchasePrice: number | null;
  purchaseDate: string;
  currentMarketValue: number | null;
  landValue: number | null;
  verified: boolean;
}) {
  const { error } = await supabase
    .from('properties')
    .update({
      nickname: cleanOptional(input.nickname),
      address: input.address.trim(),
      unit_number: cleanOptional(input.unitNumber),
      property_type: input.propertyType || null,
      year_built: input.yearBuilt,
      square_footage: input.squareFootage,
      bedrooms: input.bedrooms,
      bathrooms: input.bathrooms,
      purchase_price: input.purchasePrice,
      purchase_date: input.purchaseDate || null,
      current_market_value: input.currentMarketValue,
      land_value: input.landValue,
      verified_at: verifiedTimestamp(input.verified),
    })
    .eq('id', input.id);
  if (error) throw error;
}

export async function updateHousehold(input: {
  id: string;
  name: string;
  status: string;
  verified: boolean;
}) {
  const { error } = await supabase
    .from('households')
    .update({
      name: input.name.trim(),
      status: input.status,
      verified_at: verifiedTimestamp(input.verified),
    })
    .eq('id', input.id);
  if (error) throw error;
}

export async function saveHouseLease(input: {
  id: string | null;
  propertyId: string;
  householdId: string;
  status: LeaseStatus;
  startsOn: string;
  endsOn: string;
  monthlyRent: number;
  monthlyUtilities: number;
  securityDeposit: number | null;
  notes: string;
  verified: boolean;
}) {
  const values = {
    property_id: input.propertyId,
    household_id: input.householdId,
    status: input.status,
    starts_on: input.startsOn,
    ends_on: input.endsOn || null,
    monthly_rent: input.monthlyRent,
    monthly_utilities: input.monthlyUtilities,
    security_deposit: input.securityDeposit,
    notes: cleanOptional(input.notes),
    verified_at: verifiedTimestamp(input.verified),
  };

  const query = input.id
    ? supabase.from('leases').update(values).eq('id', input.id)
    : supabase.from('leases').insert(values);
  const { error } = await query;
  if (error) throw error;
}

export async function saveOwnerFinancials(input: {
  propertyId: string;
  mortgagePrincipal: number | null;
  mortgageInterestRate: number | null;
  mortgagePrincipalInterest: number | null;
  mortgageEscrow: number | null;
  mortgagePayment: number | null;
  originalLoanAmount: number | null;
  loanStartedOn: string;
  loanTermYears: number | null;
  lenderLabel: string;
  annualIncome: number | null;
  stateIncomeTaxRate: number | null;
  capitalImprovementsCost: number | null;
  depreciableValue: number | null;
  estimatedSellingCosts: number | null;
  verified: boolean;
}) {
  const { error } = await supabase
    .from('owner_property_financials')
    .upsert({
      property_id: input.propertyId,
      mortgage_principal: input.mortgagePrincipal,
      mortgage_interest_rate: input.mortgageInterestRate,
      mortgage_monthly_principal_interest: input.mortgagePrincipalInterest,
      mortgage_monthly_escrow: input.mortgageEscrow,
      mortgage_total_monthly_payment: input.mortgagePayment,
      original_loan_amount: input.originalLoanAmount,
      loan_started_on: input.loanStartedOn || null,
      loan_term_years: input.loanTermYears,
      lender_label: cleanOptional(input.lenderLabel),
      annual_income: input.annualIncome,
      state_income_tax_rate: input.stateIncomeTaxRate,
      capital_improvements_cost: input.capitalImprovementsCost,
      depreciable_value: input.depreciableValue,
      estimated_selling_costs: input.estimatedSellingCosts,
      verified_at: verifiedTimestamp(input.verified),
    }, {
      onConflict: 'property_id',
    });
  if (error) throw error;
}

export async function updateHousePerson(input: {
  id: string;
  displayName: string;
  email: string;
  phone: string;
  notes: string;
  verified: boolean;
}) {
  const { error } = await supabase
    .from('people')
    .update({
      display_name: input.displayName.trim(),
      email: cleanOptional(input.email),
      phone: cleanOptional(input.phone),
      notes: cleanOptional(input.notes),
      verified_at: verifiedTimestamp(input.verified),
    })
    .eq('id', input.id);
  if (error) throw error;
}

export async function updateHouseProfile(input: {
  id: string;
  displayName: string;
  phone: string;
}) {
  const { error } = await supabase
    .from('profiles')
    .update({
      display_name: input.displayName.trim(),
      phone: cleanOptional(input.phone),
    })
    .eq('id', input.id);
  if (error) throw error;
}

export async function updateHouseWorkOrder(input: {
  id: string;
  title: string;
  description: string;
  category: string;
  status: WorkOrderStatus;
  priority: WorkOrderPriority;
  responsibility: string;
  dueOn: string;
  verified: boolean;
}) {
  const { error } = await supabase
    .from('work_orders')
    .update({
      title: input.title.trim(),
      description: cleanOptional(input.description),
      category: input.category,
      status: input.status,
      priority: input.priority,
      responsibility: cleanOptional(input.responsibility),
      due_on: input.dueOn || null,
      completed_at:
        input.status === 'completed' ? new Date().toISOString() : null,
      verified_at: verifiedTimestamp(input.verified),
    })
    .eq('id', input.id);
  if (error) throw error;
}

export async function saveHouseLedgerEntry(input: {
  id: string | null;
  propertyId: string;
  householdId: string | null;
  userId: string;
  kind: LedgerEntryKind;
  amount: number;
  effectiveOn: string;
  description: string;
  status: 'draft' | 'posted' | 'void';
}) {
  const values = {
    property_id: input.propertyId,
    household_id: input.householdId,
    kind: input.kind,
    amount: input.amount,
    effective_on: input.effectiveOn,
    description: input.description.trim(),
    status: input.status,
    verified_at: new Date().toISOString(),
    created_by: input.userId,
  };
  const query = input.id
    ? supabase.from('ledger_entries').update(values).eq('id', input.id)
    : supabase.from('ledger_entries').insert(values);
  const { error } = await query;
  if (error) throw error;
}

export async function deleteHouseLedgerEntry(id: string) {
  const { error } = await supabase.from('ledger_entries').delete().eq('id', id);
  if (error) throw error;
}

export async function updateHousePhoto(input: {
  id: string;
  caption: string;
  category: string;
  visibility: HouseFileVisibility;
  sortOrder: number;
  verified: boolean;
}) {
  const { error } = await supabase
    .from('property_photos')
    .update({
      caption: cleanOptional(input.caption),
      category: input.category,
      visibility: input.visibility,
      sort_order: input.sortOrder,
      verified_at: verifiedTimestamp(input.verified),
    })
    .eq('id', input.id);
  if (error) throw error;
}

export async function uploadHousePhoto(input: {
  propertyId: string;
  userId: string;
  file: File;
  caption: string;
  visibility: HouseFileVisibility;
  sortOrder: number;
}) {
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(input.file.type)) {
    throw new Error('Use a JPG, PNG, or WebP image.');
  }
  const path = storagePath(
    input.propertyId,
    input.visibility,
    'photos',
    input.file.name,
  );
  const { error: uploadError } = await supabase.storage
    .from('property-files')
    .upload(path, input.file, {
      contentType: input.file.type,
      upsert: false,
    });
  if (uploadError) throw uploadError;

  const { error: recordError } = await supabase.from('property_photos').insert({
    property_id: input.propertyId,
    storage_path: path,
    file_name: input.file.name,
    mime_type: input.file.type,
    file_size: input.file.size,
    caption: cleanOptional(input.caption),
    visibility: input.visibility,
    sort_order: input.sortOrder,
    category: 'property',
    uploaded_by: input.userId,
    source_provenance: {
      source_kind: 'house_application',
      classification: 'authoritative',
    },
    verified_at: new Date().toISOString(),
  });
  if (recordError) {
    await supabase.storage.from('property-files').remove([path]);
    throw recordError;
  }
}

export async function deleteHousePhoto(input: {
  id: string;
  storagePath: string;
}) {
  const { error } = await supabase
    .from('property_photos')
    .delete()
    .eq('id', input.id);
  if (error) throw error;
  const { error: storageError } = await supabase.storage
    .from('property-files')
    .remove([input.storagePath]);
  if (storageError) throw storageError;
}

export async function updateHouseDocument(input: {
  id: string;
  fileName: string;
  category: string;
  externalUrl: string;
  visibility: HouseFileVisibility;
  verified: boolean;
}) {
  const { error } = await supabase
    .from('property_documents')
    .update({
      file_name: input.fileName.trim(),
      category: input.category,
      external_url: cleanOptional(input.externalUrl),
      visibility: input.visibility,
      verified_at: verifiedTimestamp(input.verified),
    })
    .eq('id', input.id);
  if (error) throw error;
}

export async function addHouseExternalDocument(input: {
  propertyId: string;
  leaseId: string | null;
  userId: string;
  fileName: string;
  category: string;
  externalUrl: string;
  visibility: HouseFileVisibility;
}) {
  const { error } = await supabase.from('property_documents').insert({
    property_id: input.propertyId,
    lease_id: input.leaseId,
    file_name: input.fileName.trim(),
    category: input.category,
    external_url: input.externalUrl.trim(),
    visibility: input.visibility,
    uploaded_by: input.userId,
    source_provenance: {
      source_kind: 'house_application',
      classification: 'authoritative',
    },
    verified_at: new Date().toISOString(),
  });
  if (error) throw error;
}

export async function uploadHouseDocument(input: {
  propertyId: string;
  leaseId: string | null;
  userId: string;
  file: File;
  category: string;
  visibility: HouseFileVisibility;
}) {
  const acceptedTypes = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'image/jpeg',
    'image/png',
    'image/webp',
  ];
  if (!acceptedTypes.includes(input.file.type)) {
    throw new Error('Use a PDF, DOCX, JPG, PNG, or WebP file.');
  }
  const path = storagePath(
    input.propertyId,
    input.visibility,
    'documents',
    input.file.name,
  );
  const { error: uploadError } = await supabase.storage
    .from('property-files')
    .upload(path, input.file, {
      contentType: input.file.type,
      upsert: false,
    });
  if (uploadError) throw uploadError;

  const { error: recordError } = await supabase
    .from('property_documents')
    .insert({
      property_id: input.propertyId,
      lease_id: input.leaseId,
      storage_path: path,
      file_name: input.file.name,
      mime_type: input.file.type,
      file_size: input.file.size,
      category: input.category,
      visibility: input.visibility,
      uploaded_by: input.userId,
      source_provenance: {
        source_kind: 'house_application',
        classification: 'authoritative',
      },
      verified_at: new Date().toISOString(),
    });
  if (recordError) {
    await supabase.storage.from('property-files').remove([path]);
    throw recordError;
  }
}

export async function deleteHouseDocument(input: {
  id: string;
  storagePath: string | null;
}) {
  const { error } = await supabase
    .from('property_documents')
    .delete()
    .eq('id', input.id);
  if (error) throw error;
  if (input.storagePath) {
    const { error: storageError } = await supabase.storage
      .from('property-files')
      .remove([input.storagePath]);
    if (storageError) throw storageError;
  }
}

export async function updateHouseMembership(input: {
  membershipId: string;
  role: HouseRole;
  status: MembershipStatus;
}) {
  const { error } = await supabase
    .from('property_memberships')
    .update({
      role: input.role,
      status: input.status,
      activated_at:
        input.status === 'active' ? new Date().toISOString() : null,
      revoked_at:
        input.status === 'revoked' ? new Date().toISOString() : null,
    })
    .eq('id', input.membershipId);
  if (error) throw error;
}

export async function provisionHouseUser(input: {
  propertyId: string;
  householdId: string | null;
  email: string;
  displayName: string;
  role: HouseRole;
  temporaryPassword: string;
}) {
  return invokeHouseAdminAccess(
    {
      action: 'provision_user',
      ...input,
    },
  );
}

async function invokeHouseAdminAccess(body: Record<string, unknown>) {
  const { data, error } = await supabase.functions.invoke(
    'house-admin-access',
    {
      body,
    },
  );
  if (error) {
    const context = (error as unknown as { context?: Response }).context;
    if (context) {
      try {
        const payload = await context.json() as { error?: string };
        if (payload.error) throw new Error(payload.error);
      } catch (contextError) {
        if (contextError instanceof Error && !(contextError instanceof SyntaxError)) {
          throw contextError;
        }
      }
    }
    throw error;
  }
  return data;
}

export async function setHouseUserPassword(input: {
  propertyId: string;
  profileId: string;
  temporaryPassword: string;
}) {
  return invokeHouseAdminAccess(
    {
      action: 'set_password',
      ...input,
    },
  );
}
