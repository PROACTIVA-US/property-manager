-- House rebuild foundation
-- Adds the authoritative, property-scoped model alongside the legacy tables.
-- Production records are imported separately and are never committed here.

CREATE TYPE public.property_membership_role AS ENUM (
  'admin',
  'manager',
  'owner',
  'tenant'
);

CREATE TYPE public.membership_status AS ENUM (
  'invited',
  'active',
  'suspended',
  'revoked'
);

CREATE TYPE public.lease_status AS ENUM (
  'draft',
  'active',
  'expired',
  'terminated'
);

CREATE TYPE public.file_visibility AS ENUM (
  'shared',
  'manager_owner',
  'owner',
  'tenant'
);

CREATE TYPE public.work_order_status AS ENUM (
  'reported',
  'triage',
  'waiting_approval',
  'approved',
  'scheduled',
  'in_progress',
  'completed',
  'cancelled'
);

CREATE TYPE public.work_order_priority AS ENUM (
  'low',
  'normal',
  'high',
  'urgent'
);

CREATE TYPE public.ledger_entry_kind AS ENUM (
  'rent_charge',
  'payment',
  'expense',
  'adjustment',
  'refund',
  'deposit'
);

CREATE TABLE public.people (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  display_name TEXT NOT NULL CHECK (length(trim(display_name)) > 0),
  email TEXT,
  phone TEXT,
  notes TEXT,
  source_provenance JSONB NOT NULL DEFAULT '{}'::jsonb,
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX people_email_unique
  ON public.people (lower(email))
  WHERE email IS NOT NULL AND length(trim(email)) > 0;

ALTER TABLE public.profiles
  ADD COLUMN person_id UUID REFERENCES public.people(id) ON DELETE SET NULL;

ALTER TABLE public.properties
  ADD COLUMN nickname TEXT,
  ADD COLUMN source_provenance JSONB NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN verified_at TIMESTAMPTZ;

CREATE TABLE public.property_memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role public.property_membership_role NOT NULL,
  status public.membership_status NOT NULL DEFAULT 'invited',
  invited_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  invited_at TIMESTAMPTZ,
  activated_at TIMESTAMPTZ,
  revoked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (property_id, profile_id)
);

CREATE INDEX property_memberships_profile_idx
  ON public.property_memberships (profile_id, status);

CREATE INDEX property_memberships_property_idx
  ON public.property_memberships (property_id, role, status);

CREATE TABLE public.households (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  name TEXT NOT NULL CHECK (length(trim(name)) > 0),
  status TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'former', 'prospective')),
  source_provenance JSONB NOT NULL DEFAULT '{}'::jsonb,
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX households_property_idx ON public.households (property_id, status);

CREATE TABLE public.household_members (
  household_id UUID NOT NULL REFERENCES public.households(id) ON DELETE CASCADE,
  person_id UUID NOT NULL REFERENCES public.people(id) ON DELETE CASCADE,
  profile_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  relationship TEXT,
  is_primary_contact BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (household_id, person_id)
);

CREATE UNIQUE INDEX household_members_profile_unique
  ON public.household_members (household_id, profile_id)
  WHERE profile_id IS NOT NULL;

CREATE TABLE public.leases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  household_id UUID NOT NULL REFERENCES public.households(id) ON DELETE RESTRICT,
  status public.lease_status NOT NULL DEFAULT 'draft',
  starts_on DATE NOT NULL,
  ends_on DATE,
  monthly_rent NUMERIC(12, 2) NOT NULL CHECK (monthly_rent >= 0),
  monthly_utilities NUMERIC(12, 2) NOT NULL DEFAULT 0
    CHECK (monthly_utilities >= 0),
  security_deposit NUMERIC(12, 2)
    CHECK (security_deposit IS NULL OR security_deposit >= 0),
  notes TEXT,
  source_provenance JSONB NOT NULL DEFAULT '{}'::jsonb,
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (ends_on IS NULL OR ends_on >= starts_on)
);

CREATE INDEX leases_property_status_idx
  ON public.leases (property_id, status);

CREATE INDEX leases_household_idx ON public.leases (household_id);

CREATE TABLE public.lease_parties (
  lease_id UUID NOT NULL REFERENCES public.leases(id) ON DELETE CASCADE,
  person_id UUID NOT NULL REFERENCES public.people(id) ON DELETE RESTRICT,
  party_role TEXT NOT NULL
    CHECK (party_role IN ('owner', 'tenant', 'occupant', 'manager', 'guarantor')),
  signature_status TEXT NOT NULL DEFAULT 'unknown'
    CHECK (signature_status IN ('unknown', 'pending', 'signed', 'declined')),
  signed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (lease_id, person_id, party_role)
);

CREATE TABLE public.owner_property_financials (
  property_id UUID PRIMARY KEY REFERENCES public.properties(id) ON DELETE CASCADE,
  mortgage_principal NUMERIC(12, 2),
  mortgage_interest_rate NUMERIC(7, 4),
  mortgage_monthly_principal_interest NUMERIC(12, 2),
  mortgage_monthly_escrow NUMERIC(12, 2),
  mortgage_total_monthly_payment NUMERIC(12, 2),
  original_loan_amount NUMERIC(12, 2),
  loan_started_on DATE,
  loan_term_years INTEGER,
  lender_label TEXT,
  annual_income NUMERIC(12, 2),
  state_income_tax_rate NUMERIC(7, 4),
  capital_improvements_cost NUMERIC(12, 2),
  depreciable_value NUMERIC(12, 2),
  estimated_selling_costs NUMERIC(12, 2),
  source_provenance JSONB NOT NULL DEFAULT '{}'::jsonb,
  verified_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.property_value_observations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  value NUMERIC(12, 2) NOT NULL CHECK (value >= 0),
  observed_on DATE NOT NULL,
  source_label TEXT NOT NULL,
  source_url TEXT,
  notes TEXT,
  source_provenance JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX property_value_observations_property_idx
  ON public.property_value_observations (property_id, observed_on DESC);

CREATE TABLE public.property_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  storage_path TEXT NOT NULL UNIQUE,
  file_name TEXT NOT NULL,
  mime_type TEXT NOT NULL CHECK (mime_type LIKE 'image/%'),
  file_size BIGINT CHECK (file_size IS NULL OR file_size >= 0),
  checksum_sha256 TEXT,
  caption TEXT,
  category TEXT NOT NULL DEFAULT 'property'
    CHECK (category IN ('property', 'work_evidence', 'inspection', 'receipt', 'other')),
  visibility public.file_visibility NOT NULL DEFAULT 'shared',
  sort_order INTEGER NOT NULL DEFAULT 0,
  captured_at TIMESTAMPTZ,
  source_provenance JSONB NOT NULL DEFAULT '{}'::jsonb,
  verified_at TIMESTAMPTZ,
  uploaded_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX property_photos_property_idx
  ON public.property_photos (property_id, sort_order, created_at);

CREATE TABLE public.property_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  lease_id UUID REFERENCES public.leases(id) ON DELETE SET NULL,
  storage_path TEXT UNIQUE,
  external_url TEXT,
  file_name TEXT NOT NULL,
  mime_type TEXT,
  file_size BIGINT CHECK (file_size IS NULL OR file_size >= 0),
  checksum_sha256 TEXT,
  category TEXT NOT NULL DEFAULT 'general'
    CHECK (category IN ('lease', 'receipt', 'inspection', 'statement', 'general')),
  visibility public.file_visibility NOT NULL DEFAULT 'shared',
  source_provenance JSONB NOT NULL DEFAULT '{}'::jsonb,
  verified_at TIMESTAMPTZ,
  uploaded_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (storage_path IS NOT NULL OR external_url IS NOT NULL)
);

CREATE INDEX property_documents_property_idx
  ON public.property_documents (property_id, category, created_at DESC);

CREATE TABLE public.work_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  household_id UUID REFERENCES public.households(id) ON DELETE SET NULL,
  title TEXT NOT NULL CHECK (length(trim(title)) > 0),
  description TEXT,
  category TEXT NOT NULL DEFAULT 'other',
  status public.work_order_status NOT NULL DEFAULT 'reported',
  priority public.work_order_priority NOT NULL DEFAULT 'normal',
  responsibility TEXT
    CHECK (responsibility IS NULL OR responsibility IN ('owner', 'tenant', 'shared', 'unknown')),
  assigned_profile_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  scheduled_start TIMESTAMPTZ,
  scheduled_end TIMESTAMPTZ,
  due_on DATE,
  completed_at TIMESTAMPTZ,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  source_provenance JSONB NOT NULL DEFAULT '{}'::jsonb,
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (
    scheduled_end IS NULL
    OR scheduled_start IS NULL
    OR scheduled_end >= scheduled_start
  )
);

CREATE INDEX work_orders_property_status_idx
  ON public.work_orders (property_id, status, priority, created_at DESC);

CREATE TABLE public.work_order_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  work_order_id UUID NOT NULL REFERENCES public.work_orders(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  from_status public.work_order_status,
  to_status public.work_order_status,
  body TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  actor_profile_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX work_order_events_order_idx
  ON public.work_order_events (work_order_id, created_at, id);

CREATE TABLE public.ledger_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  household_id UUID REFERENCES public.households(id) ON DELETE SET NULL,
  work_order_id UUID REFERENCES public.work_orders(id) ON DELETE SET NULL,
  kind public.ledger_entry_kind NOT NULL,
  amount NUMERIC(12, 2) NOT NULL,
  effective_on DATE NOT NULL,
  description TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'posted'
    CHECK (status IN ('draft', 'posted', 'void')),
  correction_of UUID REFERENCES public.ledger_entries(id) ON DELETE RESTRICT,
  source_provenance JSONB NOT NULL DEFAULT '{}'::jsonb,
  verified_at TIMESTAMPTZ,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX ledger_entries_property_date_idx
  ON public.ledger_entries (property_id, effective_on DESC, created_at DESC);

CREATE TABLE public.recovery_imports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE,
  source_kind TEXT NOT NULL,
  source_label TEXT NOT NULL,
  source_hash TEXT,
  classification TEXT NOT NULL
    CHECK (classification IN ('authoritative', 'operator_confirmed', 'recovered_unverified', 'mock', 'obsolete')),
  imported_counts JSONB NOT NULL DEFAULT '{}'::jsonb,
  notes TEXT,
  imported_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Property-scoped authorization helpers. SECURITY DEFINER avoids RLS recursion,
-- while fixed search paths and explicit auth.uid checks prevent caller spoofing.
CREATE OR REPLACE FUNCTION public.current_property_role(target_property_id UUID)
RETURNS public.property_membership_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT membership.role
  FROM public.property_memberships AS membership
  WHERE membership.property_id = target_property_id
    AND membership.profile_id = auth.uid()
    AND membership.status = 'active'
  LIMIT 1
$$;

CREATE OR REPLACE FUNCTION public.has_property_role(
  target_property_id UUID,
  allowed_roles public.property_membership_role[] DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.property_memberships AS membership
    WHERE membership.property_id = target_property_id
      AND membership.profile_id = auth.uid()
      AND membership.status = 'active'
      AND (allowed_roles IS NULL OR membership.role = ANY(allowed_roles))
  )
$$;

CREATE OR REPLACE FUNCTION public.shares_property_with(target_profile_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT auth.uid() = target_profile_id OR EXISTS (
    SELECT 1
    FROM public.property_memberships AS mine
    JOIN public.property_memberships AS theirs
      ON theirs.property_id = mine.property_id
    WHERE mine.profile_id = auth.uid()
      AND mine.status = 'active'
      AND theirs.profile_id = target_profile_id
      AND theirs.status = 'active'
  )
$$;

CREATE OR REPLACE FUNCTION public.can_access_household(target_household_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.households AS household
    WHERE household.id = target_household_id
      AND (
        public.has_property_role(
          household.property_id,
          ARRAY['admin', 'manager', 'owner']::public.property_membership_role[]
        )
        OR EXISTS (
          SELECT 1
          FROM public.household_members AS member
          WHERE member.household_id = household.id
            AND member.profile_id = auth.uid()
        )
      )
  )
$$;

CREATE OR REPLACE FUNCTION public.can_read_file_visibility(
  target_property_id UUID,
  target_visibility public.file_visibility
)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT CASE target_visibility
    WHEN 'shared' THEN public.has_property_role(target_property_id, NULL)
    WHEN 'manager_owner' THEN public.has_property_role(
      target_property_id,
      ARRAY['admin', 'manager', 'owner']::public.property_membership_role[]
    )
    WHEN 'owner' THEN public.has_property_role(
      target_property_id,
      ARRAY['admin', 'owner']::public.property_membership_role[]
    )
    WHEN 'tenant' THEN public.has_property_role(
      target_property_id,
      ARRAY['admin', 'manager', 'tenant']::public.property_membership_role[]
    )
    ELSE false
  END
$$;

CREATE OR REPLACE FUNCTION public.can_access_person(target_person_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles AS profile
    WHERE profile.id = auth.uid()
      AND profile.person_id = target_person_id
  )
  OR EXISTS (
    SELECT 1
    FROM public.profiles AS target_profile
    JOIN public.property_memberships AS target_membership
      ON target_membership.profile_id = target_profile.id
     AND target_membership.status = 'active'
    WHERE target_profile.person_id = target_person_id
      AND public.has_property_role(target_membership.property_id, NULL)
  )
  OR EXISTS (
    SELECT 1
    FROM public.household_members AS household_member
    JOIN public.households AS household
      ON household.id = household_member.household_id
    WHERE household_member.person_id = target_person_id
      AND public.has_property_role(household.property_id, NULL)
  )
$$;

CREATE OR REPLACE FUNCTION public.can_read_storage_scope(
  target_property_id UUID,
  target_scope TEXT
)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT CASE target_scope
    WHEN 'shared' THEN public.has_property_role(target_property_id, NULL)
    WHEN 'manager-owner' THEN public.has_property_role(
      target_property_id,
      ARRAY['admin', 'manager', 'owner']::public.property_membership_role[]
    )
    WHEN 'owner' THEN public.has_property_role(
      target_property_id,
      ARRAY['admin', 'owner']::public.property_membership_role[]
    )
    WHEN 'tenant' THEN public.has_property_role(
      target_property_id,
      ARRAY['admin', 'manager', 'tenant']::public.property_membership_role[]
    )
    ELSE false
  END
$$;

REVOKE ALL ON FUNCTION public.current_property_role(UUID) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.has_property_role(UUID, public.property_membership_role[]) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.shares_property_with(UUID) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.can_access_household(UUID) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.can_read_file_visibility(UUID, public.file_visibility) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.can_access_person(UUID) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.can_read_storage_scope(UUID, TEXT) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.current_property_role(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_property_role(UUID, public.property_membership_role[]) TO authenticated;
GRANT EXECUTE ON FUNCTION public.shares_property_with(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.can_access_household(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.can_read_file_visibility(UUID, public.file_visibility) TO authenticated;
GRANT EXECUTE ON FUNCTION public.can_access_person(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.can_read_storage_scope(UUID, TEXT) TO authenticated;

-- Updated-at triggers reuse the existing public.update_updated_at() function.
CREATE TRIGGER people_updated_at
  BEFORE UPDATE ON public.people
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER property_memberships_updated_at
  BEFORE UPDATE ON public.property_memberships
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER households_updated_at
  BEFORE UPDATE ON public.households
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER leases_updated_at
  BEFORE UPDATE ON public.leases
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER owner_property_financials_updated_at
  BEFORE UPDATE ON public.owner_property_financials
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER work_orders_updated_at
  BEFORE UPDATE ON public.work_orders
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- Tighten the legacy profile visibility policy now that memberships exist.
DROP POLICY IF EXISTS "Profiles are viewable by authenticated users" ON public.profiles;
CREATE POLICY "Profiles visible within shared properties"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (public.shares_property_with(id));

DROP POLICY IF EXISTS "Properties visible to stakeholders" ON public.properties;
DROP POLICY IF EXISTS "Owners can manage properties" ON public.properties;

CREATE POLICY "Properties visible through membership"
  ON public.properties
  FOR SELECT
  TO authenticated
  USING (public.has_property_role(id, NULL));

CREATE POLICY "Property administrators can insert"
  ON public.properties
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "Property leaders can update"
  ON public.properties
  FOR UPDATE
  TO authenticated
  USING (
    public.has_property_role(
      id,
      ARRAY['admin', 'manager', 'owner']::public.property_membership_role[]
    )
  )
  WITH CHECK (
    public.has_property_role(
      id,
      ARRAY['admin', 'manager', 'owner']::public.property_membership_role[]
    )
  );

ALTER TABLE public.people ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.property_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.households ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.household_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lease_parties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.owner_property_financials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.property_value_observations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.property_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.property_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.work_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.work_order_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ledger_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recovery_imports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "People visible within property scope"
  ON public.people FOR SELECT TO authenticated
  USING (public.can_access_person(id));

CREATE POLICY "Property staff manage people"
  ON public.people FOR ALL TO authenticated
  USING (EXISTS (
    SELECT 1
    FROM public.profiles AS profile
    JOIN public.property_memberships AS membership
      ON membership.profile_id = profile.id
    WHERE profile.id = auth.uid()
      AND membership.status = 'active'
      AND membership.role IN ('admin', 'manager')
  ))
  WITH CHECK (EXISTS (
    SELECT 1
    FROM public.profiles AS profile
    JOIN public.property_memberships AS membership
      ON membership.profile_id = profile.id
    WHERE profile.id = auth.uid()
      AND membership.status = 'active'
      AND membership.role IN ('admin', 'manager')
  ));

CREATE POLICY "Memberships visible to self and staff"
  ON public.property_memberships FOR SELECT TO authenticated
  USING (
    profile_id = auth.uid()
    OR public.has_property_role(
      property_id,
      ARRAY['admin', 'manager']::public.property_membership_role[]
    )
  );

CREATE POLICY "Property staff manage memberships"
  ON public.property_memberships FOR ALL TO authenticated
  USING (
    public.has_property_role(
      property_id,
      ARRAY['admin', 'manager']::public.property_membership_role[]
    )
  )
  WITH CHECK (
    public.has_property_role(
      property_id,
      ARRAY['admin', 'manager']::public.property_membership_role[]
    )
  );

CREATE POLICY "Households visible through membership"
  ON public.households FOR SELECT TO authenticated
  USING (public.has_property_role(property_id, NULL));

CREATE POLICY "Property staff manage households"
  ON public.households FOR ALL TO authenticated
  USING (
    public.has_property_role(
      property_id,
      ARRAY['admin', 'manager']::public.property_membership_role[]
    )
  )
  WITH CHECK (
    public.has_property_role(
      property_id,
      ARRAY['admin', 'manager']::public.property_membership_role[]
    )
  );

CREATE POLICY "Household members visible through household"
  ON public.household_members FOR SELECT TO authenticated
  USING (public.can_access_household(household_id));

CREATE POLICY "Property staff manage household members"
  ON public.household_members FOR ALL TO authenticated
  USING (EXISTS (
    SELECT 1
    FROM public.households AS household
    WHERE household.id = household_id
      AND public.has_property_role(
        household.property_id,
        ARRAY['admin', 'manager']::public.property_membership_role[]
      )
  ))
  WITH CHECK (EXISTS (
    SELECT 1
    FROM public.households AS household
    WHERE household.id = household_id
      AND public.has_property_role(
        household.property_id,
        ARRAY['admin', 'manager']::public.property_membership_role[]
      )
  ));

CREATE POLICY "Leases visible through membership"
  ON public.leases FOR SELECT TO authenticated
  USING (
    public.has_property_role(property_id, NULL)
    AND (
      public.current_property_role(property_id) <> 'tenant'
      OR public.can_access_household(household_id)
    )
  );

CREATE POLICY "Property staff manage leases"
  ON public.leases FOR ALL TO authenticated
  USING (
    public.has_property_role(
      property_id,
      ARRAY['admin', 'manager']::public.property_membership_role[]
    )
  )
  WITH CHECK (
    public.has_property_role(
      property_id,
      ARRAY['admin', 'manager']::public.property_membership_role[]
    )
  );

CREATE POLICY "Lease parties visible through lease"
  ON public.lease_parties FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1
    FROM public.leases AS lease
    WHERE lease.id = lease_id
      AND public.has_property_role(lease.property_id, NULL)
      AND (
        public.current_property_role(lease.property_id) <> 'tenant'
        OR public.can_access_household(lease.household_id)
      )
  ));

CREATE POLICY "Property staff manage lease parties"
  ON public.lease_parties FOR ALL TO authenticated
  USING (EXISTS (
    SELECT 1
    FROM public.leases AS lease
    WHERE lease.id = lease_id
      AND public.has_property_role(
        lease.property_id,
        ARRAY['admin', 'manager']::public.property_membership_role[]
      )
  ))
  WITH CHECK (EXISTS (
    SELECT 1
    FROM public.leases AS lease
    WHERE lease.id = lease_id
      AND public.has_property_role(
        lease.property_id,
        ARRAY['admin', 'manager']::public.property_membership_role[]
      )
  ));

CREATE POLICY "Owner financials visible to owner and admin"
  ON public.owner_property_financials FOR SELECT TO authenticated
  USING (
    public.has_property_role(
      property_id,
      ARRAY['admin', 'owner']::public.property_membership_role[]
    )
  );

CREATE POLICY "Owner financials managed by owner and admin"
  ON public.owner_property_financials FOR ALL TO authenticated
  USING (
    public.has_property_role(
      property_id,
      ARRAY['admin', 'owner']::public.property_membership_role[]
    )
  )
  WITH CHECK (
    public.has_property_role(
      property_id,
      ARRAY['admin', 'owner']::public.property_membership_role[]
    )
  );

CREATE POLICY "Property values visible to leaders"
  ON public.property_value_observations FOR SELECT TO authenticated
  USING (
    public.has_property_role(
      property_id,
      ARRAY['admin', 'manager', 'owner']::public.property_membership_role[]
    )
  );

CREATE POLICY "Property leaders manage values"
  ON public.property_value_observations FOR ALL TO authenticated
  USING (
    public.has_property_role(
      property_id,
      ARRAY['admin', 'manager', 'owner']::public.property_membership_role[]
    )
  )
  WITH CHECK (
    public.has_property_role(
      property_id,
      ARRAY['admin', 'manager', 'owner']::public.property_membership_role[]
    )
  );

CREATE POLICY "Photos visible by property and visibility"
  ON public.property_photos FOR SELECT TO authenticated
  USING (public.can_read_file_visibility(property_id, visibility));

CREATE POLICY "Property staff manage photos"
  ON public.property_photos FOR ALL TO authenticated
  USING (
    public.has_property_role(
      property_id,
      ARRAY['admin', 'manager']::public.property_membership_role[]
    )
  )
  WITH CHECK (
    public.has_property_role(
      property_id,
      ARRAY['admin', 'manager']::public.property_membership_role[]
    )
  );

CREATE POLICY "Documents visible by property and visibility"
  ON public.property_documents FOR SELECT TO authenticated
  USING (public.can_read_file_visibility(property_id, visibility));

CREATE POLICY "Property staff manage documents"
  ON public.property_documents FOR ALL TO authenticated
  USING (
    public.has_property_role(
      property_id,
      ARRAY['admin', 'manager']::public.property_membership_role[]
    )
  )
  WITH CHECK (
    public.has_property_role(
      property_id,
      ARRAY['admin', 'manager']::public.property_membership_role[]
    )
  );

CREATE POLICY "Work orders visible through membership"
  ON public.work_orders FOR SELECT TO authenticated
  USING (
    public.has_property_role(property_id, NULL)
    AND (
      public.current_property_role(property_id) <> 'tenant'
      OR household_id IS NULL
      OR public.can_access_household(household_id)
    )
  );

CREATE POLICY "Members can report work"
  ON public.work_orders FOR INSERT TO authenticated
  WITH CHECK (
    public.has_property_role(property_id, NULL)
    AND created_by = auth.uid()
  );

CREATE POLICY "Property staff manage work"
  ON public.work_orders FOR UPDATE TO authenticated
  USING (
    public.has_property_role(
      property_id,
      ARRAY['admin', 'manager']::public.property_membership_role[]
    )
  )
  WITH CHECK (
    public.has_property_role(
      property_id,
      ARRAY['admin', 'manager']::public.property_membership_role[]
    )
  );

CREATE POLICY "Work events visible through work order"
  ON public.work_order_events FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1
    FROM public.work_orders AS work_order
    WHERE work_order.id = work_order_id
      AND public.has_property_role(work_order.property_id, NULL)
  ));

CREATE POLICY "Property staff add work events"
  ON public.work_order_events FOR INSERT TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1
    FROM public.work_orders AS work_order
    WHERE work_order.id = work_order_id
      AND public.has_property_role(
        work_order.property_id,
        ARRAY['admin', 'manager']::public.property_membership_role[]
      )
  ));

CREATE POLICY "Ledger visible by role and household"
  ON public.ledger_entries FOR SELECT TO authenticated
  USING (
    public.has_property_role(
      property_id,
      ARRAY['admin', 'manager', 'owner']::public.property_membership_role[]
    )
    OR (
      public.current_property_role(property_id) = 'tenant'
      AND household_id IS NOT NULL
      AND public.can_access_household(household_id)
    )
  );

CREATE POLICY "Property staff manage ledger"
  ON public.ledger_entries FOR ALL TO authenticated
  USING (
    public.has_property_role(
      property_id,
      ARRAY['admin', 'manager']::public.property_membership_role[]
    )
  )
  WITH CHECK (
    public.has_property_role(
      property_id,
      ARRAY['admin', 'manager']::public.property_membership_role[]
    )
  );

CREATE POLICY "Recovery imports visible to staff"
  ON public.recovery_imports FOR SELECT TO authenticated
  USING (
    property_id IS NULL
    OR public.has_property_role(
      property_id,
      ARRAY['admin', 'manager']::public.property_membership_role[]
    )
  );

CREATE POLICY "Recovery imports managed by staff"
  ON public.recovery_imports FOR ALL TO authenticated
  USING (
    property_id IS NULL
    OR public.has_property_role(
      property_id,
      ARRAY['admin', 'manager']::public.property_membership_role[]
    )
  )
  WITH CHECK (
    property_id IS NULL
    OR public.has_property_role(
      property_id,
      ARRAY['admin', 'manager']::public.property_membership_role[]
    )
  );

GRANT SELECT, INSERT, UPDATE, DELETE ON
  public.people,
  public.property_memberships,
  public.households,
  public.household_members,
  public.leases,
  public.lease_parties,
  public.owner_property_financials,
  public.property_value_observations,
  public.property_photos,
  public.property_documents,
  public.work_orders,
  public.work_order_events,
  public.ledger_entries,
  public.recovery_imports
TO authenticated;

GRANT ALL ON
  public.people,
  public.property_memberships,
  public.households,
  public.household_members,
  public.leases,
  public.lease_parties,
  public.owner_property_financials,
  public.property_value_observations,
  public.property_photos,
  public.property_documents,
  public.work_orders,
  public.work_order_events,
  public.ledger_entries,
  public.recovery_imports
TO service_role;

INSERT INTO storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
VALUES (
  'property-files',
  'property-files',
  false,
  52428800,
  ARRAY[
    'image/jpeg',
    'image/png',
    'image/webp',
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ]
)
ON CONFLICT (id) DO UPDATE
SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

CREATE POLICY "Property files readable by scoped members"
  ON storage.objects FOR SELECT TO authenticated
  USING (
    bucket_id = 'property-files'
    AND array_length(storage.foldername(name), 1) >= 2
    AND (storage.foldername(name))[1] ~
      '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'
    AND public.can_read_storage_scope(
      ((storage.foldername(name))[1])::UUID,
      (storage.foldername(name))[2]
    )
  );

CREATE POLICY "Property staff upload files"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'property-files'
    AND array_length(storage.foldername(name), 1) >= 2
    AND (storage.foldername(name))[1] ~
      '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'
    AND public.has_property_role(
      ((storage.foldername(name))[1])::UUID,
      ARRAY['admin', 'manager']::public.property_membership_role[]
    )
  );

CREATE POLICY "Property staff update files"
  ON storage.objects FOR UPDATE TO authenticated
  USING (
    bucket_id = 'property-files'
    AND array_length(storage.foldername(name), 1) >= 2
    AND (storage.foldername(name))[1] ~
      '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'
    AND public.has_property_role(
      ((storage.foldername(name))[1])::UUID,
      ARRAY['admin', 'manager']::public.property_membership_role[]
    )
  )
  WITH CHECK (
    bucket_id = 'property-files'
    AND array_length(storage.foldername(name), 1) >= 2
    AND (storage.foldername(name))[1] ~
      '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'
    AND public.has_property_role(
      ((storage.foldername(name))[1])::UUID,
      ARRAY['admin', 'manager']::public.property_membership_role[]
    )
  );

CREATE POLICY "Property staff delete files"
  ON storage.objects FOR DELETE TO authenticated
  USING (
    bucket_id = 'property-files'
    AND array_length(storage.foldername(name), 1) >= 2
    AND (storage.foldername(name))[1] ~
      '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'
    AND public.has_property_role(
      ((storage.foldername(name))[1])::UUID,
      ARRAY['admin', 'manager']::public.property_membership_role[]
    )
  );
