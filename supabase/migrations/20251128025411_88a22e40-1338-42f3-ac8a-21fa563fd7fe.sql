-- SMS Delivery Tracking Table
CREATE TABLE IF NOT EXISTS public.sms_delivery_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  phone_number TEXT NOT NULL,
  message TEXT NOT NULL,
  retry_count INTEGER DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending', -- pending, sent, failed, fallback_push
  telco_response JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  delivered_at TIMESTAMPTZ
);

-- Index for efficient lookups
CREATE INDEX IF NOT EXISTS idx_sms_delivery_user_id ON public.sms_delivery_log(user_id);
CREATE INDEX IF NOT EXISTS idx_sms_delivery_status ON public.sms_delivery_log(status);
CREATE INDEX IF NOT EXISTS idx_sms_delivery_created_at ON public.sms_delivery_log(created_at DESC);

-- Enable RLS
ALTER TABLE public.sms_delivery_log ENABLE ROW LEVEL SECURITY;

-- Admin can view all SMS logs
CREATE POLICY "Admins can view all SMS logs"
ON public.sms_delivery_log
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role IN ('admin', 'superadmin')
  )
);

-- Users can view their own SMS logs
CREATE POLICY "Users can view their own SMS logs"
ON public.sms_delivery_log
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

COMMENT ON TABLE public.sms_delivery_log IS 'Tracks SMS delivery attempts with retry count to prevent cost overruns from failed deliveries';