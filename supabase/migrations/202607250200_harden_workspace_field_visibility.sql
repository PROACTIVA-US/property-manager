-- A custom field must never be readable through the API when its parent page
-- is hidden from the current role, even if the field itself has broader roles.

DROP POLICY IF EXISTS "Workspace fields visible through configured roles"
  ON public.property_workspace_fields;

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
        AND EXISTS (
          SELECT 1
          FROM public.property_workspace_pages AS page
          WHERE page.id = page_id
            AND page.property_id = property_workspace_fields.property_id
            AND page.archived_at IS NULL
            AND page.is_visible
            AND public.current_property_role(
              property_workspace_fields.property_id
            ) = ANY(page.visible_roles)
        )
      )
    )
  );
