-- Fix function search path warnings for the new functions
CREATE OR REPLACE FUNCTION public.has_tenant_role(_user_id UUID, _tenant_id UUID, _admin_role admin_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = 'public'
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

CREATE OR REPLACE FUNCTION public.get_user_tenants(_user_id UUID)
RETURNS TABLE(tenant_id UUID, admin_role admin_role)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT ata.tenant_id, ata.admin_role
  FROM public.admin_tenant_assignments ata
  WHERE ata.user_id = _user_id
    AND ata.revoked_at IS NULL
$$;