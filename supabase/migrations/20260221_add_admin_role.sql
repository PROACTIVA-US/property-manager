-- Add 'admin' to the user_role enum
-- Must be committed separately before referencing the new value
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'admin';
