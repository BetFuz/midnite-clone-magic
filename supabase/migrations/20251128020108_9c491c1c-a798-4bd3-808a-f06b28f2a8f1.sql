-- AML Alerts Table
CREATE TABLE IF NOT EXISTS public.aml_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  alert_type TEXT NOT NULL, -- 'duplicate_bvn', 'structuring_deposits', 'round_trip_transfer'
  severity TEXT NOT NULL DEFAULT 'medium', -- 'low', 'medium', 'high', 'critical'
  description TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'reviewing', 'resolved', 'escalated'
  reviewed_by UUID,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  resolution_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Document Archive Table (7-year retention)
CREATE TABLE IF NOT EXISTS public.document_archives (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_type TEXT NOT NULL, -- 'bet_ticket', 'ledger_entry', 'kyc_document', 'audit_log'
  document_id UUID NOT NULL,
  user_id UUID,
  storage_path TEXT NOT NULL, -- Path in Supabase Storage
  retention_until DATE NOT NULL, -- 7 years from creation
  is_immutable BOOLEAN DEFAULT true,
  metadata JSONB DEFAULT '{}'::jsonb,
  archived_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- NLRC Quarterly Reports Table
CREATE TABLE IF NOT EXISTS public.nlrc_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quarter TEXT NOT NULL, -- 'Q1-2025', 'Q2-2025', etc.
  year INTEGER NOT NULL,
  quarter_number INTEGER NOT NULL CHECK (quarter_number BETWEEN 1 AND 4),
  gross_gaming_revenue NUMERIC NOT NULL DEFAULT 0,
  tax_payable NUMERIC NOT NULL DEFAULT 0,
  total_players INTEGER NOT NULL DEFAULT 0,
  active_players INTEGER NOT NULL DEFAULT 0,
  unpaid_tickets INTEGER NOT NULL DEFAULT 0,
  unpaid_tickets_value NUMERIC NOT NULL DEFAULT 0,
  report_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  exported_at TIMESTAMP WITH TIME ZONE,
  submitted_to_nlrc BOOLEAN DEFAULT false,
  submitted_at TIMESTAMP WITH TIME ZONE,
  submitted_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(year, quarter_number)
);

-- Enable RLS
ALTER TABLE public.aml_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_archives ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nlrc_reports ENABLE ROW LEVEL SECURITY;

-- RLS Policies for AML Alerts
CREATE POLICY "Admins can view all AML alerts"
ON public.aml_alerts FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'superadmin'::app_role));

CREATE POLICY "System can insert AML alerts"
ON public.aml_alerts FOR INSERT
WITH CHECK (true);

CREATE POLICY "Admins can update AML alerts"
ON public.aml_alerts FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'superadmin'::app_role));

-- RLS Policies for Document Archives
CREATE POLICY "Admins can view all archives"
ON public.document_archives FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'superadmin'::app_role));

CREATE POLICY "System can insert archives"
ON public.document_archives FOR INSERT
WITH CHECK (true);

CREATE POLICY "Archives are immutable"
ON public.document_archives FOR UPDATE
USING (false);

CREATE POLICY "Archives cannot be deleted"
ON public.document_archives FOR DELETE
USING (false);

-- RLS Policies for NLRC Reports
CREATE POLICY "Admins can view NLRC reports"
ON public.nlrc_reports FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'superadmin'::app_role));

CREATE POLICY "Admins can insert NLRC reports"
ON public.nlrc_reports FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'superadmin'::app_role));

CREATE POLICY "Admins can update NLRC reports"
ON public.nlrc_reports FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'superadmin'::app_role));

-- Indexes for performance
CREATE INDEX idx_aml_alerts_user_id ON public.aml_alerts(user_id);
CREATE INDEX idx_aml_alerts_status ON public.aml_alerts(status);
CREATE INDEX idx_aml_alerts_severity ON public.aml_alerts(severity);
CREATE INDEX idx_aml_alerts_created_at ON public.aml_alerts(created_at DESC);

CREATE INDEX idx_document_archives_document_type ON public.document_archives(document_type);
CREATE INDEX idx_document_archives_user_id ON public.document_archives(user_id);
CREATE INDEX idx_document_archives_retention_until ON public.document_archives(retention_until);

CREATE INDEX idx_nlrc_reports_year_quarter ON public.nlrc_reports(year, quarter_number);

-- Trigger for updated_at
CREATE TRIGGER update_aml_alerts_updated_at
  BEFORE UPDATE ON public.aml_alerts
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();