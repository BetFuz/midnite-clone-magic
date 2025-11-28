-- Create KYC verifications table
CREATE TABLE IF NOT EXISTS public.kyc_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  nin TEXT NOT NULL,
  selfie_url TEXT NOT NULL,
  verification_status TEXT NOT NULL DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'failed', 'expired')),
  provider TEXT NOT NULL CHECK (provider IN ('youverify', 'nibss')),
  provider_response JSONB,
  verification_score NUMERIC,
  verified_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add indexes
CREATE INDEX idx_kyc_user_id ON public.kyc_verifications(user_id);
CREATE INDEX idx_kyc_status ON public.kyc_verifications(verification_status);

-- Enable RLS
ALTER TABLE public.kyc_verifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own KYC records"
  ON public.kyc_verifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own KYC records"
  ON public.kyc_verifications FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all KYC records"
  ON public.kyc_verifications FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
      AND role IN ('admin', 'superadmin')
    )
  );

CREATE POLICY "Admins can update KYC records"
  ON public.kyc_verifications FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
      AND role IN ('admin', 'superadmin')
    )
  );