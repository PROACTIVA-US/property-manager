-- PropertyManager Initial Schema
-- This migration creates all core tables for the property management system

-- ============================================================================
-- ENUM TYPES
-- ============================================================================

CREATE TYPE user_role AS ENUM ('owner', 'pm', 'tenant');
CREATE TYPE project_status AS ENUM ('draft', 'pending_approval', 'approved', 'in_progress', 'on_hold', 'completed', 'cancelled');
CREATE TYPE project_priority AS ENUM ('low', 'medium', 'high', 'urgent');
CREATE TYPE project_category AS ENUM ('maintenance', 'renovation', 'repair', 'inspection', 'upgrade', 'landscaping', 'hvac', 'plumbing', 'electrical', 'other');
CREATE TYPE phase_status AS ENUM ('pending', 'in_progress', 'completed', 'skipped');
CREATE TYPE attachment_category AS ENUM ('before', 'during', 'after', 'estimate', 'plan', 'other');
CREATE TYPE entity_type AS ENUM ('individual', 'llc', 's_corp', 'c_corp', 'partnership', 'trust');
CREATE TYPE property_type AS ENUM ('single_family', 'condo', 'townhouse', 'multi_family', 'other');

-- ============================================================================
-- PROFILES (extends Supabase auth.users)
-- ============================================================================

CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  display_name TEXT NOT NULL,
  role user_role NOT NULL DEFAULT 'owner',
  phone TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- PROPERTIES
-- ============================================================================

CREATE TABLE properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  pm_id UUID REFERENCES profiles(id) ON DELETE SET NULL,

  -- Basic info
  address TEXT NOT NULL,
  unit_number TEXT,
  property_type property_type DEFAULT 'single_family',
  year_built INTEGER,
  square_footage INTEGER,
  bedrooms INTEGER,
  bathrooms NUMERIC(3,1),

  -- Financial
  purchase_price NUMERIC(12,2),
  purchase_date DATE,
  current_market_value NUMERIC(12,2),
  land_value NUMERIC(12,2),

  -- Mortgage
  mortgage_principal NUMERIC(12,2),
  mortgage_interest_rate NUMERIC(5,3),
  mortgage_monthly_payment NUMERIC(10,2),
  mortgage_escrow NUMERIC(10,2),
  loan_start_date DATE,
  loan_term_years INTEGER,

  -- Rental
  monthly_rent NUMERIC(10,2),
  security_deposit NUMERIC(10,2),

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- TENANTS (linked to properties)
-- ============================================================================

CREATE TABLE tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE,

  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,

  lease_start_date DATE,
  lease_end_date DATE,
  monthly_rent NUMERIC(10,2),
  security_deposit NUMERIC(10,2),

  emergency_contact TEXT,
  emergency_contact_phone TEXT,
  move_in_date DATE,

  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- VENDORS
-- ============================================================================

CREATE TABLE vendors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE,

  company_name TEXT NOT NULL,
  contact_name TEXT,
  email TEXT,
  phone TEXT,

  specialty TEXT[], -- Array of specialties
  license_number TEXT,
  insurance_info TEXT,

  hourly_rate NUMERIC(10,2),
  rating NUMERIC(2,1),
  notes TEXT,

  is_preferred BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- PROJECTS
-- ============================================================================

CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE,

  title TEXT NOT NULL,
  description TEXT,
  category project_category NOT NULL DEFAULT 'other',
  status project_status NOT NULL DEFAULT 'draft',
  priority project_priority NOT NULL DEFAULT 'medium',

  -- Owner/assignee
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  assigned_to UUID REFERENCES profiles(id) ON DELETE SET NULL,

  -- Primary vendor
  primary_vendor_id UUID REFERENCES vendors(id) ON DELETE SET NULL,

  -- Estimates
  estimated_cost NUMERIC(12,2),
  actual_cost NUMERIC(12,2),
  estimated_start_date DATE,
  estimated_end_date DATE,
  actual_start_date DATE,
  actual_end_date DATE,

  -- AI-generated impact analysis (stored as JSONB)
  impact_analysis JSONB,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- PROJECT PHASES (milestones)
-- ============================================================================

CREATE TABLE project_phases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,

  name TEXT NOT NULL,
  description TEXT,
  order_index INTEGER NOT NULL DEFAULT 0,
  status phase_status NOT NULL DEFAULT 'pending',

  start_date DATE,
  end_date DATE,
  estimated_days INTEGER,

  assigned_vendor_id UUID REFERENCES vendors(id) ON DELETE SET NULL,
  notes TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- PROJECT ATTACHMENTS (images, documents)
-- ============================================================================

CREATE TABLE project_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,

  file_name TEXT NOT NULL,
  file_size INTEGER,
  mime_type TEXT,
  storage_path TEXT NOT NULL, -- Supabase Storage path

  category attachment_category DEFAULT 'other',
  description TEXT,

  uploaded_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- PROJECT MESSAGES
-- ============================================================================

CREATE TABLE project_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,

  sender_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  content TEXT NOT NULL,

  is_system_message BOOLEAN DEFAULT FALSE,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Message read receipts
CREATE TABLE project_message_reads (
  message_id UUID REFERENCES project_messages(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  read_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (message_id, user_id)
);

-- ============================================================================
-- GENERAL MESSAGES/THREADS
-- ============================================================================

CREATE TABLE message_threads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE,

  subject TEXT NOT NULL,

  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id UUID REFERENCES message_threads(id) ON DELETE CASCADE,

  sender_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  content TEXT NOT NULL,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- EXPENSES
-- ============================================================================

CREATE TABLE expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,

  description TEXT NOT NULL,
  amount NUMERIC(12,2) NOT NULL,
  category TEXT,
  vendor_id UUID REFERENCES vendors(id) ON DELETE SET NULL,

  expense_date DATE NOT NULL,
  receipt_path TEXT, -- Supabase Storage path

  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- DOCUMENTS
-- ============================================================================

CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,

  name TEXT NOT NULL,
  file_size INTEGER,
  mime_type TEXT,
  storage_path TEXT NOT NULL,
  category TEXT,

  uploaded_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- NOTIFICATIONS
-- ============================================================================

CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,

  type TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT,
  link TEXT,

  is_read BOOLEAN DEFAULT FALSE,
  is_archived BOOLEAN DEFAULT FALSE,

  metadata JSONB,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- INDEXES
-- ============================================================================

CREATE INDEX idx_properties_owner ON properties(owner_id);
CREATE INDEX idx_properties_pm ON properties(pm_id);
CREATE INDEX idx_tenants_property ON tenants(property_id);
CREATE INDEX idx_vendors_property ON vendors(property_id);
CREATE INDEX idx_projects_property ON projects(property_id);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_project_phases_project ON project_phases(project_id);
CREATE INDEX idx_project_attachments_project ON project_attachments(project_id);
CREATE INDEX idx_project_messages_project ON project_messages(project_id);
CREATE INDEX idx_expenses_property ON expenses(property_id);
CREATE INDEX idx_expenses_project ON expenses(project_id);
CREATE INDEX idx_documents_property ON documents(property_id);
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_unread ON notifications(user_id) WHERE is_read = FALSE;

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_phases ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_message_reads ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- RLS POLICIES
-- ============================================================================

-- Profiles: users can read all profiles, update their own
CREATE POLICY "Profiles are viewable by authenticated users" ON profiles
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE TO authenticated USING (auth.uid() = id);

-- Properties: visible to owner, PM, and tenants of that property
CREATE POLICY "Properties visible to stakeholders" ON properties
  FOR SELECT TO authenticated
  USING (
    owner_id = auth.uid() OR
    pm_id = auth.uid() OR
    EXISTS (SELECT 1 FROM tenants WHERE tenants.property_id = properties.id AND tenants.profile_id = auth.uid())
  );

CREATE POLICY "Owners can manage properties" ON properties
  FOR ALL TO authenticated
  USING (owner_id = auth.uid());

-- Projects: visible to property stakeholders
CREATE POLICY "Projects visible to property stakeholders" ON projects
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM properties p
      WHERE p.id = projects.property_id
      AND (p.owner_id = auth.uid() OR p.pm_id = auth.uid() OR
           EXISTS (SELECT 1 FROM tenants t WHERE t.property_id = p.id AND t.profile_id = auth.uid()))
    )
  );

CREATE POLICY "Property managers can manage projects" ON projects
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM properties p
      WHERE p.id = projects.property_id
      AND (p.owner_id = auth.uid() OR p.pm_id = auth.uid())
    )
  );

-- Notifications: users see their own
CREATE POLICY "Users see own notifications" ON notifications
  FOR ALL TO authenticated
  USING (user_id = auth.uid());

-- ============================================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_properties_updated_at BEFORE UPDATE ON properties
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_tenants_updated_at BEFORE UPDATE ON tenants
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_vendors_updated_at BEFORE UPDATE ON vendors
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_project_phases_updated_at BEFORE UPDATE ON project_phases
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, display_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)),
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'owner')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
