#!/usr/bin/env node

import { createHash } from 'node:crypto';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';

const apply = process.argv.includes('--apply');
const manifestPath = process.env.HOUSE_RECOVERY_MANIFEST;
const supabaseUrl = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!manifestPath) {
  throw new Error('HOUSE_RECOVERY_MANIFEST must point to an operator-reviewed JSON file');
}

if (apply && (!supabaseUrl || !serviceRoleKey)) {
  throw new Error(
    'SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required when using --apply',
  );
}

const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));

const forbiddenKeys = new Set([
  'password',
  'credential',
  'credentials',
  'accountNumber',
  'routingNumber',
  'taxId',
  'token',
  'propertyAccounts',
  'utilitiesTracking',
]);

function assertNoCredentials(value, trail = []) {
  if (!value || typeof value !== 'object') return;
  for (const [key, child] of Object.entries(value)) {
    if (forbiddenKeys.has(key)) {
      throw new Error(`Recovery manifest contains forbidden credential field: ${[...trail, key].join('.')}`);
    }
    assertNoCredentials(child, [...trail, key]);
  }
}

assertNoCredentials(manifest);

const requiredPaths = [
  ['source', 'label'],
  ['source', 'hash'],
  ['property', 'address'],
  ['people', 'manager', 'displayName'],
  ['people', 'owner', 'displayName'],
  ['household', 'name'],
  ['lease', 'startsOn'],
  ['lease', 'monthlyRent'],
];

for (const segments of requiredPaths) {
  let value = manifest;
  for (const segment of segments) value = value?.[segment];
  if (value === undefined || value === null || value === '') {
    throw new Error(`Recovery manifest is missing ${segments.join('.')}`);
  }
}

const sourceProvenance = {
  source_kind: manifest.source.kind,
  source_label: manifest.source.label,
  source_hash: manifest.source.hash,
  classification: manifest.source.classification,
  recovered_at: manifest.source.recoveredAt,
};

const photoFiles = [];
for (const photo of manifest.photos ?? []) {
  const filePath = path.resolve(path.dirname(manifestPath), photo.file);
  const fileBytes = await readFile(filePath);
  const fileStat = await stat(filePath);
  photoFiles.push({
    ...photo,
    filePath,
    fileBytes,
    fileSize: fileStat.size,
    checksum: createHash('sha256').update(fileBytes).digest('hex'),
  });
}

const preview = {
  mode: apply ? 'apply' : 'dry-run',
  source: {
    kind: manifest.source.kind,
    label: manifest.source.label,
    classification: manifest.source.classification,
  },
  records: {
    properties: 1,
    people: [
      manifest.people.manager,
      manifest.people.owner,
      ...(manifest.people.tenants ?? []),
    ].length,
    authenticatedProfiles: [manifest.people.manager, manifest.people.owner].filter(
      (person) => person.authUserId,
    ).length,
    memberships: [manifest.people.manager, manifest.people.owner].filter(
      (person) => person.authUserId,
    ).length,
    households: 1,
    leases: 1,
    leaseParties:
      1 + (manifest.people.tenants ?? []).length,
    privateFinancialRecords: manifest.ownerFinancials ? 1 : 0,
    propertyValueObservations: manifest.propertyValue ? 1 : 0,
    leaseDocuments: manifest.leaseDocument ? 1 : 0,
    photos: photoFiles.length,
    demoWorkRecords: 0,
    credentials: 0,
  },
  verification: {
    operatorConfirmed: manifest.verification?.operatorConfirmed ?? [],
    recoveredUnverified: manifest.verification?.recoveredUnverified ?? [],
    excludedAsMock: manifest.verification?.excludedAsMock ?? [],
  },
};

if (!apply) {
  console.log(JSON.stringify(preview, null, 2));
  process.exit(0);
}

const baseHeaders = {
  apikey: serviceRoleKey,
  Authorization: `Bearer ${serviceRoleKey}`,
};

async function request(endpoint, options = {}) {
  const response = await fetch(`${supabaseUrl}${endpoint}`, {
    ...options,
    headers: {
      ...baseHeaders,
      ...(options.headers ?? {}),
    },
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`${options.method ?? 'GET'} ${endpoint} failed (${response.status}): ${body}`);
  }

  if (response.status === 204) return null;
  const text = await response.text();
  return text ? JSON.parse(text) : null;
}

function restQuery(table, query) {
  return request(`/rest/v1/${table}?${query}`);
}

async function insert(table, value) {
  const rows = await request(`/rest/v1/${table}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Prefer: 'return=representation',
    },
    body: JSON.stringify(value),
  });
  return rows[0];
}

async function upsert(table, value, onConflict) {
  const rows = await request(
    `/rest/v1/${table}?on_conflict=${encodeURIComponent(onConflict)}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Prefer: 'resolution=merge-duplicates,return=representation',
      },
      body: JSON.stringify(value),
    },
  );
  return rows[0];
}

async function findOne(table, filters, select = '*') {
  const query = new URLSearchParams({ select, limit: '1' });
  for (const [column, expression] of Object.entries(filters)) {
    query.set(column, expression);
  }
  const rows = await restQuery(table, query.toString());
  return rows[0] ?? null;
}

async function ensurePerson(person) {
  let existing = null;
  if (person.email) {
    existing = await findOne('people', {
      email: `ilike.${person.email}`,
    });
  }
  if (!existing) {
    existing = await findOne('people', {
      display_name: `eq.${person.displayName}`,
    });
  }

  const value = {
    display_name: person.displayName,
    email: person.email ?? null,
    phone: person.phone ?? null,
    notes: person.notes ?? null,
    source_provenance: {
      ...sourceProvenance,
      classification: person.classification,
    },
    verified_at:
      person.classification === 'operator_confirmed'
        ? manifest.source.recoveredAt
        : null,
  };

  if (existing) {
    const rows = await request(`/rest/v1/people?id=eq.${existing.id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Prefer: 'return=representation',
      },
      body: JSON.stringify(value),
    });
    return rows[0];
  }

  return insert('people', value);
}

const propertyQuery = new URLSearchParams({
  select: '*',
  address: `eq.${manifest.property.address}`,
  limit: '1',
});

let property = (await restQuery('properties', propertyQuery.toString()))[0];
const propertyValue = {
  address: manifest.property.address,
  unit_number: manifest.property.unitNumber ?? null,
  nickname: manifest.property.nickname ?? null,
  property_type: manifest.property.propertyType ?? 'single_family',
  year_built: manifest.property.yearBuilt ?? null,
  square_footage: manifest.property.squareFootage ?? null,
  bedrooms: manifest.property.bedrooms ?? null,
  bathrooms: manifest.property.bathrooms ?? null,
  purchase_price: manifest.property.purchasePrice ?? null,
  purchase_date: manifest.property.purchaseDate ?? null,
  current_market_value: manifest.property.currentMarketValue ?? null,
  land_value: manifest.property.landValue ?? null,
  monthly_rent: manifest.lease.monthlyRent,
  security_deposit: manifest.lease.securityDeposit ?? null,
  source_provenance: {
    ...sourceProvenance,
    classification: manifest.property.classification,
  },
  verified_at:
    manifest.property.classification === 'operator_confirmed'
      ? manifest.source.recoveredAt
      : null,
};

if (property) {
  [property] = await request(`/rest/v1/properties?id=eq.${property.id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Prefer: 'return=representation',
    },
    body: JSON.stringify(propertyValue),
  });
} else {
  property = await insert('properties', propertyValue);
}

const managerPerson = await ensurePerson(manifest.people.manager);
const ownerPerson = await ensurePerson(manifest.people.owner);
const tenantPeople = [];
for (const tenant of manifest.people.tenants ?? []) {
  tenantPeople.push(await ensurePerson(tenant));
}

async function ensureProfile(personConfig, personRecord, legacyRole) {
  if (!personConfig.authUserId) return null;
  return upsert(
    'profiles',
    {
      id: personConfig.authUserId,
      email: personConfig.email,
      display_name: personConfig.displayName,
      role: legacyRole,
      phone: personConfig.phone ?? null,
      person_id: personRecord.id,
    },
    'id',
  );
}

const managerProfile = await ensureProfile(
  manifest.people.manager,
  managerPerson,
  'admin',
);
const ownerProfile = await ensureProfile(
  manifest.people.owner,
  ownerPerson,
  'owner',
);

async function ensureMembership(profile, role) {
  if (!profile) return null;
  return upsert(
    'property_memberships',
    {
      property_id: property.id,
      profile_id: profile.id,
      role,
      status: 'active',
      activated_at: manifest.source.recoveredAt,
      invited_by: managerProfile?.id ?? null,
      invited_at: manifest.source.recoveredAt,
    },
    'property_id,profile_id',
  );
}

await ensureMembership(managerProfile, 'admin');
await ensureMembership(ownerProfile, 'owner');

// Keep the legacy columns aligned during the transition.
const propertyLegacyLinks = {};
if (ownerProfile) propertyLegacyLinks.owner_id = ownerProfile.id;
if (managerProfile) propertyLegacyLinks.pm_id = managerProfile.id;
if (Object.keys(propertyLegacyLinks).length > 0) {
  await request(`/rest/v1/properties?id=eq.${property.id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Prefer: 'return=minimal',
    },
    body: JSON.stringify(propertyLegacyLinks),
  });
}

let household = await findOne('households', {
  property_id: `eq.${property.id}`,
  name: `eq.${manifest.household.name}`,
});

const householdValue = {
  property_id: property.id,
  name: manifest.household.name,
  status: manifest.household.status ?? 'active',
  source_provenance: {
    ...sourceProvenance,
    classification: manifest.household.classification,
  },
  verified_at:
    manifest.household.classification === 'operator_confirmed'
      ? manifest.source.recoveredAt
      : null,
};

if (!household) {
  household = await insert('households', householdValue);
}

for (const [index, tenantPerson] of tenantPeople.entries()) {
  await upsert(
    'household_members',
    {
      household_id: household.id,
      person_id: tenantPerson.id,
      relationship: manifest.people.tenants[index].relationship ?? null,
      is_primary_contact:
        manifest.people.tenants[index].isPrimaryContact ?? index === 0,
    },
    'household_id,person_id',
  );
}

let lease = await findOne('leases', {
  property_id: `eq.${property.id}`,
  household_id: `eq.${household.id}`,
  starts_on: `eq.${manifest.lease.startsOn}`,
});

const leaseValue = {
  property_id: property.id,
  household_id: household.id,
  status: manifest.lease.status ?? 'active',
  starts_on: manifest.lease.startsOn,
  ends_on: manifest.lease.endsOn ?? null,
  monthly_rent: manifest.lease.monthlyRent,
  monthly_utilities: manifest.lease.monthlyUtilities ?? 0,
  security_deposit: manifest.lease.securityDeposit ?? null,
  notes: manifest.lease.notes ?? null,
  source_provenance: {
    ...sourceProvenance,
    classification: manifest.lease.classification,
  },
  verified_at:
    manifest.lease.classification === 'operator_confirmed'
      ? manifest.source.recoveredAt
      : null,
};

if (lease) {
  [lease] = await request(`/rest/v1/leases?id=eq.${lease.id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Prefer: 'return=representation',
    },
    body: JSON.stringify(leaseValue),
  });
} else {
  lease = await insert('leases', leaseValue);
}

await upsert(
  'lease_parties',
  {
    lease_id: lease.id,
    person_id: ownerPerson.id,
    party_role: 'owner',
    signature_status: manifest.lease.signatureStatus ?? 'unknown',
  },
  'lease_id,person_id,party_role',
);

for (const tenantPerson of tenantPeople) {
  await upsert(
    'lease_parties',
    {
      lease_id: lease.id,
      person_id: tenantPerson.id,
      party_role: 'tenant',
      signature_status: manifest.lease.signatureStatus ?? 'unknown',
    },
    'lease_id,person_id,party_role',
  );
}

if (manifest.ownerFinancials) {
  await upsert(
    'owner_property_financials',
    {
      property_id: property.id,
      ...manifest.ownerFinancials,
      source_provenance: {
        ...sourceProvenance,
        classification: 'recovered_unverified',
      },
      verified_at: null,
    },
    'property_id',
  );
}

if (manifest.propertyValue) {
  const existingValue = await findOne('property_value_observations', {
    property_id: `eq.${property.id}`,
    observed_on: `eq.${manifest.propertyValue.observedOn}`,
    source_label: `eq.${manifest.propertyValue.sourceLabel}`,
  });
  if (!existingValue) {
    await insert('property_value_observations', {
      property_id: property.id,
      value: manifest.propertyValue.value,
      observed_on: manifest.propertyValue.observedOn,
      source_label: manifest.propertyValue.sourceLabel,
      source_url: manifest.propertyValue.sourceUrl ?? null,
      notes: manifest.propertyValue.notes ?? null,
      source_provenance: {
        ...sourceProvenance,
        classification: 'recovered_unverified',
      },
      created_by: managerProfile?.id ?? null,
    });
  }
}

if (manifest.leaseDocument) {
  const existingDocument = await findOne('property_documents', {
    property_id: `eq.${property.id}`,
    external_url: `eq.${manifest.leaseDocument.externalUrl}`,
  });
  if (!existingDocument) {
    await insert('property_documents', {
      property_id: property.id,
      lease_id: lease.id,
      external_url: manifest.leaseDocument.externalUrl,
      file_name: manifest.leaseDocument.fileName,
      mime_type: manifest.leaseDocument.mimeType,
      category: 'lease',
      visibility: 'shared',
      source_provenance: {
        ...sourceProvenance,
        classification: manifest.leaseDocument.classification,
      },
      verified_at: null,
      uploaded_by: managerProfile?.id ?? null,
    });
  }
}

for (const [index, photo] of photoFiles.entries()) {
  const storagePath = `${property.id}/shared/recovered/${photo.checksum.slice(0, 12)}-${path.basename(photo.filePath)}`;
  const encodedStoragePath = storagePath
    .split('/')
    .map((segment) => encodeURIComponent(segment))
    .join('/');

  await request(`/storage/v1/object/property-files/${encodedStoragePath}`, {
    method: 'POST',
    headers: {
      'Content-Type': photo.mimeType ?? 'image/jpeg',
      'x-upsert': 'true',
      'cache-control': '3600',
    },
    body: photo.fileBytes,
  });

  const existingPhoto = await findOne('property_photos', {
    storage_path: `eq.${storagePath}`,
  });
  const photoValue = {
    property_id: property.id,
    storage_path: storagePath,
    file_name: path.basename(photo.filePath),
    mime_type: photo.mimeType ?? 'image/jpeg',
    file_size: photo.fileSize,
    checksum_sha256: photo.checksum,
    caption: photo.caption ?? `Recovered property work photo ${index + 1}`,
    category: photo.category ?? 'work_evidence',
    visibility: photo.visibility ?? 'shared',
    sort_order: photo.sortOrder ?? index,
    captured_at: photo.capturedAt ?? null,
    source_provenance: {
      ...sourceProvenance,
      classification: photo.classification ?? 'recovered_unverified',
      original_key: photo.originalKey ?? null,
    },
    verified_at: null,
    uploaded_by: managerProfile?.id ?? null,
  };

  if (existingPhoto) {
    await request(`/rest/v1/property_photos?id=eq.${existingPhoto.id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Prefer: 'return=minimal',
      },
      body: JSON.stringify(photoValue),
    });
  } else {
    await insert('property_photos', photoValue);
  }
}

const existingImport = await findOne('recovery_imports', {
  property_id: `eq.${property.id}`,
  source_hash: `eq.${manifest.source.hash}`,
});

if (!existingImport) {
  await insert('recovery_imports', {
    property_id: property.id,
    source_kind: manifest.source.kind,
    source_label: manifest.source.label,
    source_hash: manifest.source.hash,
    classification: manifest.source.classification,
    imported_counts: preview.records,
    notes: manifest.source.notes ?? null,
    imported_by: managerProfile?.id ?? null,
  });
}

console.log(
  JSON.stringify(
    {
      ...preview,
      result: {
        propertyId: property.id,
        householdId: household.id,
        leaseId: lease.id,
        importedPhotos: photoFiles.length,
      },
    },
    null,
    2,
  ),
);
