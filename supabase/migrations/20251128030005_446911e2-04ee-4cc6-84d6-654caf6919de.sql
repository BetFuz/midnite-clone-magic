-- Regulatory Breach Auto-Escrow System
-- Protects user funds during NLRC regulatory freezes by transferring 20% of platform float to multisig escrow

-- Regulatory flags table tracks NLRC compliance status
CREATE TABLE IF NOT EXISTS public.regulatory_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  flag_type TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT false,
  reason TEXT,
  activated_at TIMESTAMPTZ,
  deactivated_at TIMESTAMPTZ,
  activated_by UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Escrow transfers table provides immutable audit trail
CREATE TABLE IF NOT EXISTS public.escrow_transfers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  amount NUMERIC NOT NULL,
  reason TEXT NOT NULL,
  source_wallet TEXT NOT NULL DEFAULT 'hot_wallet',
  destination_wallet TEXT NOT NULL DEFAULT 'escrow_multisig',
  tx_hash TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  regulatory_flag_id UUID REFERENCES public.regulatory_flags(id),
  initiated_by UUID,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.regulatory_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.escrow_transfers ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Admin-only access
CREATE POLICY "Admins can view regulatory flags"
  ON public.regulatory_flags FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'superadmin'::app_role));

CREATE POLICY "Admins can insert regulatory flags"
  ON public.regulatory_flags FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'superadmin'::app_role));

CREATE POLICY "Admins can update regulatory flags"
  ON public.regulatory_flags FOR UPDATE
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'superadmin'::app_role));

CREATE POLICY "Admins can view escrow transfers"
  ON public.escrow_transfers FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'superadmin'::app_role));

CREATE POLICY "System can insert escrow transfers"
  ON public.escrow_transfers FOR INSERT
  WITH CHECK (true);

-- Indexes for performance
CREATE INDEX idx_regulatory_flags_active ON public.regulatory_flags(flag_type, is_active);
CREATE INDEX idx_escrow_transfers_status ON public.escrow_transfers(status, created_at DESC);
CREATE INDEX idx_escrow_transfers_flag_id ON public.escrow_transfers(regulatory_flag_id);

-- Trigger for updated_at
CREATE TRIGGER update_regulatory_flags_updated_at
  BEFORE UPDATE ON public.regulatory_flags
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

COMMENT ON TABLE public.regulatory_flags IS 'Tracks regulatory compliance flags (NLRC freezes) that trigger auto-escrow transfers';
COMMENT ON TABLE public.escrow_transfers IS 'Immutable audit trail of all escrow transfers to multisig wallet during regulatory events';