-- Create app_role enum for user roles
CREATE TYPE public.app_role AS ENUM ('user', 'admin', 'superadmin');

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  role public.app_role NOT NULL DEFAULT 'user',
  granted_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  granted_by UUID,
  UNIQUE(user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles (prevents recursive RLS)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
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
      AND role = _role
  )
$$;

-- RLS policies for user_roles table
CREATE POLICY "Users can view own roles"
ON public.user_roles
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles"
ON public.user_roles
FOR SELECT
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'superadmin'));

CREATE POLICY "Superadmins can manage roles"
ON public.user_roles
FOR ALL
USING (public.has_role(auth.uid(), 'superadmin'));

-- Create admin_audit_log table for immutable audit trail
CREATE TABLE public.admin_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL,
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id TEXT,
  payload_hash TEXT,
  ip_address TEXT,
  user_agent TEXT,
  mfa_verified BOOLEAN DEFAULT false,
  status TEXT NOT NULL,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on audit log
ALTER TABLE public.admin_audit_log ENABLE ROW LEVEL SECURITY;

-- Only admins and superadmins can view audit logs
CREATE POLICY "Admins can view audit logs"
ON public.admin_audit_log
FOR SELECT
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'superadmin'));

-- System can insert audit logs (service role)
CREATE POLICY "System can insert audit logs"
ON public.admin_audit_log
FOR INSERT
WITH CHECK (true);

-- Audit logs are immutable (no updates or deletes)
-- No UPDATE or DELETE policies = no one can modify/delete

-- Create indexes for performance
CREATE INDEX idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX idx_user_roles_role ON public.user_roles(role);
CREATE INDEX idx_audit_log_admin_id ON public.admin_audit_log(admin_id);
CREATE INDEX idx_audit_log_created_at ON public.admin_audit_log(created_at DESC);
CREATE INDEX idx_audit_log_action ON public.admin_audit_log(action);

-- Create function to log admin actions
CREATE OR REPLACE FUNCTION public.log_admin_action(
  _admin_id UUID,
  _action TEXT,
  _resource_type TEXT,
  _resource_id TEXT DEFAULT NULL,
  _payload_hash TEXT DEFAULT NULL,
  _ip_address TEXT DEFAULT NULL,
  _user_agent TEXT DEFAULT NULL,
  _mfa_verified BOOLEAN DEFAULT false,
  _status TEXT DEFAULT 'success',
  _error_message TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  log_id UUID;
BEGIN
  INSERT INTO public.admin_audit_log (
    admin_id,
    action,
    resource_type,
    resource_id,
    payload_hash,
    ip_address,
    user_agent,
    mfa_verified,
    status,
    error_message
  ) VALUES (
    _admin_id,
    _action,
    _resource_type,
    _resource_id,
    _payload_hash,
    _ip_address,
    _user_agent,
    _mfa_verified,
    _status,
    _error_message
  )
  RETURNING id INTO log_id;
  
  RETURN log_id;
END;
$$;