-- The document service already reads and writes these fields. Add the missing
-- database columns so authenticated uploads do not fail at runtime.
ALTER TABLE public.documents
  ADD COLUMN IF NOT EXISTS description TEXT,
  ADD COLUMN IF NOT EXISTS tags TEXT[] NOT NULL DEFAULT '{}';
