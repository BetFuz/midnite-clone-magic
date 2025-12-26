-- Create extended admin roles enum
CREATE TYPE public.admin_role AS ENUM (
  'super_admin',
  'country_admin',
  'compliance_officer',
  'finance_admin',
  'support_agent'
);

-- Create tenants table for multi-country support
CREATE TABLE public.tenants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  country_code TEXT NOT NULL UNIQUE,
  country_name TEXT NOT NULL,
  currency TEXT NOT NULL DEFAULT 'NGN',
  timezone TEXT NOT NULL DEFAULT 'Africa/Lagos',
  is_active BOOLEAN NOT NULL DEFAULT true,
  regulatory_license TEXT,
  license_expiry DATE,
  config JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create admin_tenant_assignments table to link admins to tenants
CREATE TABLE public.admin_tenant_assignments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  admin_role admin_role NOT NULL,
  is_primary BOOLEAN NOT NULL DEFAULT false,
  granted_by UUID REFERENCES auth.users(id),
  granted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  revoked_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(user_id, tenant_id, admin_role)
);

-- Create tenant_kpis table to store aggregated metrics per tenant
CREATE TABLE public.tenant_kpis (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  kpi_date DATE NOT NULL DEFAULT CURRENT_DATE,
  total_users INTEGER NOT NULL DEFAULT 0,
  active_users_24h INTEGER NOT NULL DEFAULT 0,
  new_users_24h INTEGER NOT NULL DEFAULT 0,
  total_bets INTEGER NOT NULL DEFAULT 0,
  pending_bets INTEGER NOT NULL DEFAULT 0,
  total_staked NUMERIC NOT NULL DEFAULT 0,
  total_payouts NUMERIC NOT NULL DEFAULT 0,
  gross_revenue NUMERIC NOT NULL DEFAULT 0,
  live_matches INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(tenant_id, kpi_date)
);

-- Add tenant_id to profiles table for multi-tenancy
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES public.tenants(id);

-- Enable RLS on new tables
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_tenant_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenant_kpis ENABLE ROW LEVEL SECURITY;

-- Create function to check if user is super_admin
CREATE OR REPLACE FUNCTION public.is_super_admin(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = 'superadmin'
  )
$$;

-- Create function to check admin role for tenant
CREATE OR REPLACE FUNCTION public.has_tenant_role(_user_id UUID, _tenant_id UUID, _admin_role admin_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.admin_tenant_assignments
    WHERE user_id = _user_id
      AND tenant_id = _tenant_id
      AND admin_role = _admin_role
      AND revoked_at IS NULL
  )
$$;

-- Create function to get user's assigned tenants
CREATE OR REPLACE FUNCTION public.get_user_tenants(_user_id UUID)
RETURNS TABLE(tenant_id UUID, admin_role admin_role)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT tenant_id, admin_role
  FROM public.admin_tenant_assignments
  WHERE user_id = _user_id
    AND revoked_at IS NULL
$$;

-- RLS Policies for tenants table
CREATE POLICY "Super admins can view all tenants"
ON public.tenants FOR SELECT
USING (is_super_admin(auth.uid()));

CREATE POLICY "Super admins can manage tenants"
ON public.tenants FOR ALL
USING (is_super_admin(auth.uid()));

CREATE POLICY "Country admins can view their tenant"
ON public.tenants FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.admin_tenant_assignments
    WHERE user_id = auth.uid()
      AND tenant_id = tenants.id
      AND revoked_at IS NULL
  )
);

-- RLS Policies for admin_tenant_assignments table
CREATE POLICY "Super admins can manage all assignments"
ON public.admin_tenant_assignments FOR ALL
USING (is_super_admin(auth.uid()));

CREATE POLICY "Users can view their own assignments"
ON public.admin_tenant_assignments FOR SELECT
USING (user_id = auth.uid());

-- RLS Policies for tenant_kpis table
CREATE POLICY "Super admins can view all KPIs"
ON public.tenant_kpis FOR SELECT
USING (is_super_admin(auth.uid()));

CREATE POLICY "Tenant admins can view their KPIs"
ON public.tenant_kpis FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.admin_tenant_assignments
    WHERE user_id = auth.uid()
      AND tenant_id = tenant_kpis.tenant_id
      AND revoked_at IS NULL
  )
);

CREATE POLICY "System can manage KPIs"
ON public.tenant_kpis FOR ALL
USING (true);

-- Insert initial tenants for 2-5 countries
INSERT INTO public.tenants (country_code, country_name, currency, timezone, regulatory_license) VALUES
('NG', 'Nigeria', 'NGN', 'Africa/Lagos', 'NLRC-2024-001'),
('KE', 'Kenya', 'KES', 'Africa/Nairobi', 'BCLB-2024-001'),
('GH', 'Ghana', 'GHS', 'Africa/Accra', 'GGC-2024-001'),
('ZA', 'South Africa', 'ZAR', 'Africa/Johannesburg', 'NGB-2024-001'),
('UG', 'Uganda', 'UGX', 'Africa/Kampala', 'UGL-2024-001');

-- Create trigger to update updated_at
CREATE TRIGGER update_tenants_updated_at
BEFORE UPDATE ON public.tenants
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_tenant_kpis_updated_at
BEFORE UPDATE ON public.tenant_kpis
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();