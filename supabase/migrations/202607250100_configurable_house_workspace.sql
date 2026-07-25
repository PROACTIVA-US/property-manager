-- Configurable House workspace
-- Keeps authoritative property records structured while allowing administrators
-- to shape the navigation and add role-aware content directly in the live site.

CREATE TABLE public.property_workspace_pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  system_key TEXT
    CHECK (
      system_key IS NULL
      OR system_key IN ('today', 'work', 'people', 'money', 'property', 'inbox')
    ),
  slug TEXT NOT NULL CHECK (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  label TEXT NOT NULL CHECK (length(trim(label)) BETWEEN 1 AND 60),
  icon TEXT NOT NULL DEFAULT 'file-text'
    CHECK (
      icon IN (
        'home',
        'clipboard-list',
        'users',
        'circle-dollar-sign',
        'building-2',
        'inbox',
        'file-text',
        'notebook-tabs',
        'calendar-days',
        'wrench'
      )
    ),
  sort_order INTEGER NOT NULL DEFAULT 0,
  visible_roles public.property_membership_role[] NOT NULL DEFAULT
    ARRAY['admin', 'manager', 'owner', 'tenant']::public.property_membership_role[],
  is_visible BOOLEAN NOT NULL DEFAULT true,
  hidden_core_fields TEXT[] NOT NULL DEFAULT '{}'::TEXT[],
  archived_at TIMESTAMPTZ,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (property_id, slug),
  UNIQUE (id, property_id)
);

CREATE UNIQUE INDEX property_workspace_pages_system_unique
  ON public.property_workspace_pages (property_id, system_key)
  WHERE system_key IS NOT NULL;

CREATE INDEX property_workspace_pages_navigation_idx
  ON public.property_workspace_pages (property_id, sort_order)
  WHERE archived_at IS NULL;

CREATE TABLE public.property_workspace_fields (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  page_id UUID NOT NULL,
  label TEXT NOT NULL CHECK (length(trim(label)) BETWEEN 1 AND 80),
  field_type TEXT NOT NULL DEFAULT 'text'
    CHECK (
      field_type IN (
        'text',
        'long_text',
        'number',
        'currency',
        'date',
        'link',
        'checkbox'
      )
    ),
  value TEXT NOT NULL DEFAULT '',
  sort_order INTEGER NOT NULL DEFAULT 0,
  visible_roles public.property_membership_role[] NOT NULL DEFAULT
    ARRAY['admin', 'manager', 'owner', 'tenant']::public.property_membership_role[],
  is_visible BOOLEAN NOT NULL DEFAULT true,
  archived_at TIMESTAMPTZ,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT property_workspace_fields_page_fkey
    FOREIGN KEY (page_id, property_id)
    REFERENCES public.property_workspace_pages(id, property_id)
    ON DELETE CASCADE
);

CREATE INDEX property_workspace_fields_page_idx
  ON public.property_workspace_fields (page_id, sort_order)
  WHERE archived_at IS NULL;

CREATE TRIGGER property_workspace_pages_updated_at
  BEFORE UPDATE ON public.property_workspace_pages
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER property_workspace_fields_updated_at
  BEFORE UPDATE ON public.property_workspace_fields
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE OR REPLACE FUNCTION public.seed_property_workspace_pages(
  target_property_id UUID,
  target_created_by UUID DEFAULT NULL
)
RETURNS VOID
LANGUAGE SQL
SECURITY DEFINER
SET search_path = public
AS $$
  INSERT INTO public.property_workspace_pages (
    property_id,
    system_key,
    slug,
    label,
    icon,
    sort_order,
    visible_roles,
    created_by
  )
  VALUES
    (
      target_property_id,
      'today',
      'today',
      'Today',
      'home',
      0,
      ARRAY['admin', 'manager', 'owner', 'tenant']::public.property_membership_role[],
      target_created_by
    ),
    (
      target_property_id,
      'work',
      'work',
      'Work',
      'clipboard-list',
      1,
      ARRAY['admin', 'manager', 'owner', 'tenant']::public.property_membership_role[],
      target_created_by
    ),
    (
      target_property_id,
      'people',
      'people',
      'People',
      'users',
      2,
      ARRAY['admin', 'manager', 'owner']::public.property_membership_role[],
      target_created_by
    ),
    (
      target_property_id,
      'money',
      'money',
      'Money',
      'circle-dollar-sign',
      3,
      ARRAY['admin', 'manager', 'owner', 'tenant']::public.property_membership_role[],
      target_created_by
    ),
    (
      target_property_id,
      'property',
      'property',
      'Property',
      'building-2',
      4,
      ARRAY['admin', 'manager', 'owner', 'tenant']::public.property_membership_role[],
      target_created_by
    ),
    (
      target_property_id,
      'inbox',
      'inbox',
      'Inbox',
      'inbox',
      5,
      ARRAY['admin', 'manager', 'owner', 'tenant']::public.property_membership_role[],
      target_created_by
    )
  ON CONFLICT (property_id, slug) DO NOTHING;
$$;

CREATE OR REPLACE FUNCTION public.seed_workspace_pages_for_new_property()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM public.seed_property_workspace_pages(NEW.id, auth.uid());
  RETURN NEW;
END;
$$;

CREATE TRIGGER seed_workspace_pages_after_property_insert
  AFTER INSERT ON public.properties
  FOR EACH ROW EXECUTE FUNCTION public.seed_workspace_pages_for_new_property();

SELECT public.seed_property_workspace_pages(id, NULL)
FROM public.properties;

ALTER TABLE public.property_workspace_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.property_workspace_fields ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Workspace pages visible through configured roles"
  ON public.property_workspace_pages
  FOR SELECT
  TO authenticated
  USING (
    public.has_property_role(property_id, NULL)
    AND archived_at IS NULL
    AND (
      public.current_property_role(property_id) = 'admin'
      OR (
        is_visible
        AND public.current_property_role(property_id) = ANY(visible_roles)
      )
    )
  );

CREATE POLICY "Property administrators manage workspace pages"
  ON public.property_workspace_pages
  FOR ALL
  TO authenticated
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

CREATE POLICY "Workspace fields visible through configured roles"
  ON public.property_workspace_fields
  FOR SELECT
  TO authenticated
  USING (
    public.has_property_role(property_id, NULL)
    AND archived_at IS NULL
    AND (
      public.current_property_role(property_id) = 'admin'
      OR (
        is_visible
        AND public.current_property_role(property_id) = ANY(visible_roles)
      )
    )
  );

CREATE POLICY "Property administrators manage workspace fields"
  ON public.property_workspace_fields
  FOR ALL
  TO authenticated
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

REVOKE ALL ON FUNCTION public.seed_property_workspace_pages(UUID, UUID)
  FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.seed_property_workspace_pages(UUID, UUID)
  TO service_role;
