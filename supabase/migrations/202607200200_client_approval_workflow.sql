-- Client approval workflow.
--
-- Authenticated staff create a request and share the raw token with a client.
-- Only a SHA-256 hash of that token is stored. Public RPCs expose the minimum
-- request data and process the decision in a single database transaction.

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;

CREATE TABLE public.approval_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  description TEXT NOT NULL CHECK (char_length(description) BETWEEN 1 AND 5000),
  action_question TEXT NOT NULL CHECK (char_length(action_question) BETWEEN 1 AND 500),
  composite_image_url TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'approved', 'declined')),
  token_hash TEXT NOT NULL UNIQUE
    CHECK (token_hash ~ '^[0-9a-f]{64}$'),
  created_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + INTERVAL '30 days'),
  decided_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX approval_requests_created_by_idx
  ON public.approval_requests (created_by, created_at DESC);
CREATE INDEX approval_requests_status_idx
  ON public.approval_requests (status, created_at DESC);

ALTER TABLE public.approval_requests ENABLE ROW LEVEL SECURITY;

-- RPCs are the only data-access surface. In particular, token_hash is never
-- selectable by browser clients, even by authenticated staff.
REVOKE ALL ON TABLE public.approval_requests FROM anon, authenticated;

CREATE TRIGGER update_approval_requests_updated_at
  BEFORE UPDATE ON public.approval_requests
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- Public image delivery mirrors the requested cloud-storage URL behavior.
-- Writes are restricted to a staff member's own UUID-prefixed folder.
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'approval-images',
  'approval-images',
  true,
  8388608,
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

CREATE POLICY "staff_upload_approval_images"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'approval-images'
    AND (storage.foldername(name))[1] = auth.uid()::text
    AND EXISTS (
      SELECT 1
      FROM public.profiles
      WHERE id = auth.uid()
        AND role::text IN ('owner', 'pm', 'admin')
    )
  );

CREATE POLICY "staff_delete_own_approval_images"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'approval-images'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE OR REPLACE FUNCTION public.create_client_approval(
  request_id UUID,
  request_description TEXT,
  request_action_question TEXT,
  request_image_url TEXT,
  request_storage_path TEXT,
  request_token_hash TEXT
)
RETURNS TABLE (
  id UUID,
  description TEXT,
  action_question TEXT,
  composite_image_url TEXT,
  status TEXT,
  project_id UUID,
  expires_at TIMESTAMPTZ,
  decided_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
BEGIN
  IF auth.uid() IS NULL OR NOT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE profiles.id = auth.uid()
      AND profiles.role::text IN ('owner', 'pm', 'admin')
  ) THEN
    RAISE EXCEPTION 'Only property staff can create approval requests'
      USING ERRCODE = '42501';
  END IF;

  IF request_id IS NULL
    OR char_length(trim(request_description)) NOT BETWEEN 1 AND 5000
    OR char_length(trim(request_action_question)) NOT BETWEEN 1 AND 500
    OR request_image_url !~ '^https://'
    OR request_storage_path = ''
    OR request_token_hash !~ '^[0-9a-f]{64}$'
  THEN
    RAISE EXCEPTION 'Invalid approval request'
      USING ERRCODE = '22023';
  END IF;

  RETURN QUERY
  INSERT INTO public.approval_requests (
    id,
    description,
    action_question,
    composite_image_url,
    storage_path,
    token_hash,
    created_by
  ) VALUES (
    request_id,
    trim(request_description),
    trim(request_action_question),
    request_image_url,
    request_storage_path,
    request_token_hash,
    auth.uid()
  )
  RETURNING
    approval_requests.id,
    approval_requests.description,
    approval_requests.action_question,
    approval_requests.composite_image_url,
    approval_requests.status,
    approval_requests.project_id,
    approval_requests.expires_at,
    approval_requests.decided_at,
    approval_requests.created_at;
END;
$$;

CREATE OR REPLACE FUNCTION public.list_client_approvals()
RETURNS TABLE (
  id UUID,
  description TEXT,
  action_question TEXT,
  composite_image_url TEXT,
  status TEXT,
  project_id UUID,
  expires_at TIMESTAMPTZ,
  decided_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL OR NOT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE profiles.id = auth.uid()
      AND profiles.role::text IN ('owner', 'pm', 'admin')
  ) THEN
    RAISE EXCEPTION 'Only property staff can list approval requests'
      USING ERRCODE = '42501';
  END IF;

  RETURN QUERY
  SELECT
    approval_requests.id,
    approval_requests.description,
    approval_requests.action_question,
    approval_requests.composite_image_url,
    approval_requests.status,
    approval_requests.project_id,
    approval_requests.expires_at,
    approval_requests.decided_at,
    approval_requests.created_at
  FROM public.approval_requests
  WHERE approval_requests.created_by = auth.uid()
    OR EXISTS (
      SELECT 1
      FROM public.profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role::text = 'admin'
    )
  ORDER BY approval_requests.created_at DESC;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_client_approval(request_token TEXT)
RETURNS TABLE (
  id UUID,
  description TEXT,
  action_question TEXT,
  composite_image_url TEXT,
  status TEXT,
  expires_at TIMESTAMPTZ,
  decided_at TIMESTAMPTZ
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, extensions
AS $$
  SELECT
    approval_requests.id,
    approval_requests.description,
    approval_requests.action_question,
    approval_requests.composite_image_url,
    approval_requests.status,
    approval_requests.expires_at,
    approval_requests.decided_at
  FROM public.approval_requests
  WHERE request_token ~ '^[0-9a-f]{64}$'
    AND approval_requests.token_hash = encode(digest(request_token, 'sha256'), 'hex')
    AND (
      approval_requests.status <> 'pending'
      OR approval_requests.expires_at > now()
    )
  LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.decide_client_approval(
  request_token TEXT,
  request_decision TEXT
)
RETURNS TABLE (
  final_status TEXT,
  created_project_id UUID
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  approval public.approval_requests%ROWTYPE;
  creator_name TEXT;
  new_project_id UUID;
BEGIN
  IF request_token !~ '^[0-9a-f]{64}$'
    OR request_decision NOT IN ('approve', 'decline')
  THEN
    RAISE EXCEPTION 'Missing or invalid parameters'
      USING ERRCODE = '22023';
  END IF;

  SELECT *
  INTO approval
  FROM public.approval_requests
  WHERE token_hash = encode(digest(request_token, 'sha256'), 'hex')
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Approval request not found'
      USING ERRCODE = 'P0002';
  END IF;

  IF approval.expires_at <= now() AND approval.status = 'pending' THEN
    RAISE EXCEPTION 'This approval link has expired'
      USING ERRCODE = 'P0001';
  END IF;

  IF approval.status <> 'pending' THEN
    RAISE EXCEPTION 'This request has already been processed'
      USING ERRCODE = 'P0001';
  END IF;

  IF request_decision = 'approve' THEN
    SELECT display_name
    INTO creator_name
    FROM public.profiles
    WHERE profiles.id = approval.created_by;

    INSERT INTO public.projects (
      title,
      description,
      category,
      status,
      priority,
      created_by,
      impact_analysis
    ) VALUES (
      'Approved Task: ' || approval.action_question,
      approval.description,
      'maintenance',
      'approved',
      'high',
      approval.created_by,
      jsonb_build_object(
        'projectOwnerName', coalesce(creator_name, 'Property staff'),
        'notes', 'Created automatically from an approved client request.',
        'tags', jsonb_build_array('client-approved'),
        'approvalRequest', jsonb_build_object(
          'id', approval.id,
          'compositeImageUrl', approval.composite_image_url,
          'actionQuestion', approval.action_question
        )
      )
    )
    RETURNING projects.id INTO new_project_id;
  END IF;

  UPDATE public.approval_requests
  SET
    status = CASE WHEN request_decision = 'approve' THEN 'approved' ELSE 'declined' END,
    decided_at = now(),
    project_id = new_project_id
  WHERE approval_requests.id = approval.id;

  RETURN QUERY
  SELECT
    CASE WHEN request_decision = 'approve' THEN 'approved' ELSE 'declined' END,
    new_project_id;
END;
$$;

-- Projects produced without a property still need to appear in the creator's
-- Kanban. Existing property-scoped policies continue to cover other projects.
CREATE POLICY "Project creators can manage own projects"
  ON public.projects
  FOR ALL
  TO authenticated
  USING (created_by = auth.uid() OR public.is_admin())
  WITH CHECK (created_by = auth.uid() OR public.is_admin());

REVOKE ALL ON FUNCTION public.create_client_approval(UUID, TEXT, TEXT, TEXT, TEXT, TEXT) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.list_client_approvals() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.get_client_approval(TEXT) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.decide_client_approval(TEXT, TEXT) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.create_client_approval(UUID, TEXT, TEXT, TEXT, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.list_client_approvals() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_client_approval(TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.decide_client_approval(TEXT, TEXT) TO anon, authenticated;
