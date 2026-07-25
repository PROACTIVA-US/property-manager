-- Tighten the House foundation before the rebuilt client becomes public.
-- Keep tenant households isolated and prevent managers from escalating roles.

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
      AND public.has_property_role(
        target_membership.property_id,
        ARRAY['admin', 'manager', 'owner']::public.property_membership_role[]
      )
  )
  OR EXISTS (
    SELECT 1
    FROM public.household_members AS target_member
    JOIN public.households AS household
      ON household.id = target_member.household_id
    WHERE target_member.person_id = target_person_id
      AND (
        public.has_property_role(
          household.property_id,
          ARRAY['admin', 'manager', 'owner']::public.property_membership_role[]
        )
        OR EXISTS (
          SELECT 1
          FROM public.household_members AS my_member
          WHERE my_member.household_id = household.id
            AND my_member.profile_id = auth.uid()
        )
      )
  )
$$;

CREATE OR REPLACE FUNCTION public.can_manage_person(target_person_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT public.is_admin()
  OR EXISTS (
    SELECT 1
    FROM public.profiles AS target_profile
    JOIN public.property_memberships AS target_membership
      ON target_membership.profile_id = target_profile.id
     AND target_membership.status = 'active'
    WHERE target_profile.person_id = target_person_id
      AND public.has_property_role(
        target_membership.property_id,
        ARRAY['admin', 'manager']::public.property_membership_role[]
      )
  )
  OR EXISTS (
    SELECT 1
    FROM public.household_members AS target_member
    JOIN public.households AS household
      ON household.id = target_member.household_id
    WHERE target_member.person_id = target_person_id
      AND public.has_property_role(
        household.property_id,
        ARRAY['admin', 'manager']::public.property_membership_role[]
      )
  )
$$;

REVOKE ALL ON FUNCTION public.can_manage_person(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.can_manage_person(UUID) TO authenticated;

DROP POLICY IF EXISTS "Property staff manage people" ON public.people;

CREATE POLICY "Administrators add people"
  ON public.people FOR INSERT TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "Scoped property staff update people"
  ON public.people FOR UPDATE TO authenticated
  USING (public.can_manage_person(id))
  WITH CHECK (public.can_manage_person(id));

CREATE POLICY "Administrators remove people"
  ON public.people FOR DELETE TO authenticated
  USING (public.is_admin());

DROP POLICY IF EXISTS "Property staff manage memberships"
  ON public.property_memberships;

CREATE POLICY "Property administrators manage memberships"
  ON public.property_memberships FOR ALL TO authenticated
  USING (
    public.has_property_role(
      property_id,
      ARRAY['admin']::public.property_membership_role[]
    )
  )
  WITH CHECK (
    public.has_property_role(
      property_id,
      ARRAY['admin']::public.property_membership_role[]
    )
  );

CREATE POLICY "Property managers manage non-staff memberships"
  ON public.property_memberships FOR ALL TO authenticated
  USING (
    role IN ('owner', 'tenant')
    AND public.has_property_role(
      property_id,
      ARRAY['manager']::public.property_membership_role[]
    )
  )
  WITH CHECK (
    role IN ('owner', 'tenant')
    AND public.has_property_role(
      property_id,
      ARRAY['manager']::public.property_membership_role[]
    )
  );

DROP POLICY IF EXISTS "Households visible through membership"
  ON public.households;

CREATE POLICY "Households visible through role or membership"
  ON public.households FOR SELECT TO authenticated
  USING (public.can_access_household(id));

DROP POLICY IF EXISTS "Recovery imports visible to staff"
  ON public.recovery_imports;
DROP POLICY IF EXISTS "Recovery imports managed by staff"
  ON public.recovery_imports;

CREATE POLICY "Property recovery imports visible to staff"
  ON public.recovery_imports FOR SELECT TO authenticated
  USING (
    property_id IS NOT NULL
    AND public.has_property_role(
      property_id,
      ARRAY['admin', 'manager']::public.property_membership_role[]
    )
  );

CREATE POLICY "Property recovery imports managed by staff"
  ON public.recovery_imports FOR ALL TO authenticated
  USING (
    property_id IS NOT NULL
    AND public.has_property_role(
      property_id,
      ARRAY['admin', 'manager']::public.property_membership_role[]
    )
  )
  WITH CHECK (
    property_id IS NOT NULL
    AND public.has_property_role(
      property_id,
      ARRAY['admin', 'manager']::public.property_membership_role[]
    )
  );
