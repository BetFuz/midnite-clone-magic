-- Create responsible gaming limits table
CREATE TABLE IF NOT EXISTS public.responsible_gaming_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  daily_stake_limit NUMERIC NOT NULL DEFAULT 100000,
  daily_loss_limit NUMERIC NOT NULL DEFAULT 50000,
  session_time_limit INTEGER NOT NULL DEFAULT 180, -- minutes
  cooling_off_until TIMESTAMP WITH TIME ZONE,
  self_excluded_until TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add indexes
CREATE INDEX idx_gaming_limits_user_id ON public.responsible_gaming_limits(user_id);

-- Enable RLS
ALTER TABLE public.responsible_gaming_limits ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own limits"
  ON public.responsible_gaming_limits FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own limits"
  ON public.responsible_gaming_limits FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own limits"
  ON public.responsible_gaming_limits FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all limits"
  ON public.responsible_gaming_limits FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
      AND role IN ('admin', 'superadmin')
    )
  );

-- Create function to track daily usage
CREATE OR REPLACE FUNCTION get_daily_usage(p_user_id UUID)
RETURNS TABLE(total_stake NUMERIC, total_loss NUMERIC) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(SUM(total_stake), 0) as total_stake,
    COALESCE(SUM(
      CASE 
        WHEN status = 'lost' THEN total_stake
        ELSE 0
      END
    ), 0) as total_loss
  FROM bet_slips
  WHERE user_id = p_user_id
    AND created_at >= CURRENT_DATE
    AND created_at < CURRENT_DATE + INTERVAL '1 day';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;