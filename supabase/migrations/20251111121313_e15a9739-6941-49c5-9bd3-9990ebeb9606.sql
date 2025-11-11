-- Create table for secure admin webhook settings storage
CREATE TABLE public.admin_webhook_settings (
  id INTEGER PRIMARY KEY DEFAULT 1,
  bet_placed TEXT,
  bet_won TEXT,
  bet_lost TEXT,
  deposit TEXT,
  withdrawal TEXT,
  user_registered TEXT,
  updated_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  CONSTRAINT single_row_webhook_settings CHECK (id = 1)
);

-- Enable RLS on webhook settings
ALTER TABLE public.admin_webhook_settings ENABLE ROW LEVEL SECURITY;

-- Only admins and superadmins can view webhook settings
CREATE POLICY "Admins can view webhook settings"
ON public.admin_webhook_settings
FOR SELECT
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'superadmin'));

-- Only superadmins can modify webhook settings
CREATE POLICY "Superadmins can update webhook settings"
ON public.admin_webhook_settings
FOR UPDATE
USING (public.has_role(auth.uid(), 'superadmin'));

-- Only superadmins can insert webhook settings
CREATE POLICY "Superadmins can insert webhook settings"
ON public.admin_webhook_settings
FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'superadmin'));

-- No one can delete webhook settings (single row config)
-- No DELETE policy = immutable configuration

-- Create trigger to update updated_at timestamp
CREATE TRIGGER update_webhook_settings_updated_at
BEFORE UPDATE ON public.admin_webhook_settings
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- Create index for updated_by queries
CREATE INDEX idx_webhook_settings_updated_by ON public.admin_webhook_settings(updated_by);