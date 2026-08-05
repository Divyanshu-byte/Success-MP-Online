/*
  # Complete Supabase Backend Setup

  1. Tables
     - `profiles`
       - `id` (uuid, primary key, references `auth.users`)
       - `full_name` (text)
       - `phone` (text)
       - `address` (text)
       - `role` (text, default 'user', check: 'user' | 'admin')
       - `created_at` (timestamp with time zone)
       - `updated_at` (timestamp with time zone)
     - `applications`
       - `id` (uuid, primary key, default `gen_random_uuid()`)
       - `user_id` (uuid, references `profiles.id`)
       - `service_type` (text, check: 'pan_card' | 'gumasta_license' | 'msme_registration')
       - `form_data` (jsonb, default '{}')
       - `documents` (jsonb, default '{}')
       - `status` (text, default 'pending', check: 'pending' | 'approved' | 'rejected')
       - `admin_notes` (text)
       - `created_at` (timestamp with time zone)
       - `updated_at` (timestamp with time zone)
     - `application_status_history`
       - `id` (uuid, primary key, default `gen_random_uuid()`)
       - `application_id` (uuid, references `applications.id`)
       - `old_status` (text)
       - `new_status` (text)
       - `changed_by` (uuid, references `profiles.id`)
       - `changed_at` (timestamp with time zone)

  2. Triggers & Functions
     - `is_admin()`: Helper function to check if the caller is an admin without recursion.
     - `handle_new_user()`: Automatically creates a profile row when a user registers (email/pass or Google OAuth).
     - `update_updated_at_column()`: Automatically updates `updated_at` timestamps on table edits.
     - `log_application_status_change()`: Audit trail logging status changes to `application_status_history`.
     - `prevent_role_escalation()`: Prevents non-admin users from altering their role column.

  3. Indexes
     - `idx_applications_user_id`
     - `idx_applications_status`
     - `idx_applications_created_at`

  4. Row Level Security (RLS)
     - Enabled on `profiles`, `applications`, and `application_status_history`.
*/

-- 1. PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL DEFAULT '',
  phone TEXT NOT NULL DEFAULT '',
  address TEXT NOT NULL DEFAULT '',
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. APPLICATIONS TABLE
CREATE TABLE IF NOT EXISTS public.applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  service_type TEXT NOT NULL CHECK (service_type IN ('pan_card', 'gumasta_license', 'msme_registration')),
  form_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  documents JSONB NOT NULL DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  admin_notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. AUDIT LOG TABLE
CREATE TABLE IF NOT EXISTS public.application_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL REFERENCES public.applications(id) ON DELETE CASCADE,
  old_status TEXT,
  new_status TEXT NOT NULL,
  changed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  changed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. INDEXES
CREATE INDEX IF NOT EXISTS idx_applications_user_id ON public.applications(user_id);
CREATE INDEX IF NOT EXISTS idx_applications_status ON public.applications(status);
CREATE INDEX IF NOT EXISTS idx_applications_created_at ON public.applications(created_at DESC);

-- 5. HELPER FUNCTION: IS_ADMIN
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

-- 6. TRIGGER FUNCTION: UPDATED_AT
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS set_profiles_updated_at ON public.profiles;
CREATE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS set_applications_updated_at ON public.applications;
CREATE TRIGGER set_applications_updated_at
  BEFORE UPDATE ON public.applications
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- 7. TRIGGER FUNCTION: PREVENT ROLE ESCALATION
CREATE OR REPLACE FUNCTION public.prevent_role_escalation()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF NEW.role <> OLD.role AND NOT public.is_admin() THEN
    NEW.role = OLD.role;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS enforce_profile_role ON public.profiles;
CREATE TRIGGER enforce_profile_role
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_role_escalation();

-- 8. TRIGGER FUNCTION: NEW USER SIGNUP (Handles Email & Google Login metadata)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  meta_name TEXT;
BEGIN
  meta_name := COALESCE(
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'name',
    split_part(NEW.email, '@', 1)
  );

  INSERT INTO public.profiles (id, full_name, phone, address, role, created_at, updated_at)
  VALUES (
    NEW.id,
    meta_name,
    COALESCE(NEW.raw_user_meta_data->>'phone', ''),
    COALESCE(NEW.raw_user_meta_data->>'address', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'user'),
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE
  SET
    full_name = EXCLUDED.full_name,
    updated_at = NOW()
  WHERE public.profiles.full_name = '' OR public.profiles.full_name IS NULL;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 9. TRIGGER FUNCTION: APPLICATION STATUS CHANGE AUDIT LOG
CREATE OR REPLACE FUNCTION public.log_application_status_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO public.application_status_history (application_id, old_status, new_status, changed_by, changed_at)
    VALUES (NEW.id, OLD.status, NEW.status, auth.uid(), NOW());
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_application_status_change ON public.applications;
CREATE TRIGGER on_application_status_change
  AFTER UPDATE ON public.applications
  FOR EACH ROW
  EXECUTE FUNCTION public.log_application_status_change();

-- 10. ROW LEVEL SECURITY (RLS)

-- PROFILES RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users and Admins read profiles" ON public.profiles;
CREATE POLICY "Users and Admins read profiles"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (id = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS "Users update own profile" ON public.profiles;
CREATE POLICY "Users update own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (id = auth.uid() OR public.is_admin())
  WITH CHECK (id = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS "Users insert profile" ON public.profiles;
CREATE POLICY "Users insert profile"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (id = auth.uid() OR public.is_admin());

-- APPLICATIONS RLS
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users read own applications or Admins read all" ON public.applications;
CREATE POLICY "Users read own applications or Admins read all"
  ON public.applications FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS "Users insert own applications" ON public.applications;
CREATE POLICY "Users insert own applications"
  ON public.applications FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS "Users update own applications or Admins update all" ON public.applications;
CREATE POLICY "Users update own applications or Admins update all"
  ON public.applications FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid() OR public.is_admin())
  WITH CHECK (user_id = auth.uid() OR public.is_admin());

-- APPLICATION STATUS HISTORY RLS
ALTER TABLE public.application_status_history ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users view own history or Admins view all" ON public.application_status_history;
CREATE POLICY "Users view own history or Admins view all"
  ON public.application_status_history FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.applications a
      WHERE a.id = application_id AND (a.user_id = auth.uid() OR public.is_admin())
    )
  );

DROP POLICY IF EXISTS "Authenticated users insert status history" ON public.application_status_history;
CREATE POLICY "Authenticated users insert status history"
  ON public.application_status_history FOR INSERT
  TO authenticated
  WITH CHECK (true);
