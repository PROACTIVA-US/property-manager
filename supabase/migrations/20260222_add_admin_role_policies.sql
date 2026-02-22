-- Helper function: check if the current user is an admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
      AND role = 'admin'
  );
$$;

-- RLS policy: admins can update any profile's role
CREATE POLICY "admins_can_update_profiles"
  ON profiles
  FOR UPDATE
  USING (is_admin())
  WITH CHECK (is_admin());

-- RLS policy: admins can delete any profile
CREATE POLICY "admins_can_delete_profiles"
  ON profiles
  FOR DELETE
  USING (is_admin());

-- RLS policy: admins can read all profiles
CREATE POLICY "admins_can_read_all_profiles"
  ON profiles
  FOR SELECT
  USING (is_admin());
