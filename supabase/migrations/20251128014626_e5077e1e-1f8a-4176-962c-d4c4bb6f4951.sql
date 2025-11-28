-- Create immutable ledger_entries table for regulatory audit trail
CREATE TABLE IF NOT EXISTS ledger_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entry_number bigserial UNIQUE NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  
  -- Transaction identification
  user_id uuid NOT NULL,
  transaction_type text NOT NULL CHECK (transaction_type IN (
    'deposit', 'withdrawal', 'bet_placement', 'bet_win', 'bet_loss',
    'bonus_credit', 'bonus_rollover', 'commission_earned', 'commission_paid',
    'cashout', 'refund', 'adjustment'
  )),
  
  -- Financial details
  amount numeric(15,2) NOT NULL,
  currency text NOT NULL DEFAULT 'NGN',
  balance_before numeric(15,2) NOT NULL,
  balance_after numeric(15,2) NOT NULL,
  
  -- Reference data
  reference_id uuid,
  reference_type text,
  
  -- Metadata
  description text NOT NULL,
  metadata jsonb DEFAULT '{}'::jsonb,
  
  -- Audit trail
  ip_address inet,
  user_agent text,
  
  -- Immutability hash
  entry_hash text
);

-- Function to compute entry hash
CREATE OR REPLACE FUNCTION compute_ledger_hash()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.entry_hash := encode(
    digest(
      NEW.id::text || NEW.created_at::text || NEW.user_id::text || 
      NEW.transaction_type || NEW.amount::text || NEW.balance_after::text,
      'sha256'
    ),
    'hex'
  );
  RETURN NEW;
END;
$$;

-- Trigger to compute hash on insert
CREATE TRIGGER compute_ledger_hash_trigger
BEFORE INSERT ON ledger_entries
FOR EACH ROW
EXECUTE FUNCTION compute_ledger_hash();

-- Performance indexes
CREATE INDEX idx_ledger_user_created ON ledger_entries(user_id, created_at DESC);
CREATE INDEX idx_ledger_type_created ON ledger_entries(transaction_type, created_at DESC);
CREATE INDEX idx_ledger_reference ON ledger_entries(reference_id, reference_type);
CREATE INDEX idx_ledger_created ON ledger_entries(created_at DESC);

-- Enable RLS
ALTER TABLE ledger_entries ENABLE ROW LEVEL SECURITY;

-- Users can view their own ledger entries
CREATE POLICY "Users can view own ledger entries"
ON ledger_entries
FOR SELECT
USING (auth.uid() = user_id);

-- Admins can view all ledger entries
CREATE POLICY "Admins can view all ledger entries"
ON ledger_entries
FOR SELECT
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'superadmin'::app_role)
);

-- Only service role can insert (via edge functions)
CREATE POLICY "Service can insert ledger entries"
ON ledger_entries
FOR INSERT
WITH CHECK (true);

-- Create helper function to log ledger entries
CREATE OR REPLACE FUNCTION log_ledger_entry(
  p_user_id uuid,
  p_transaction_type text,
  p_amount numeric,
  p_currency text,
  p_balance_before numeric,
  p_balance_after numeric,
  p_reference_id uuid DEFAULT NULL,
  p_reference_type text DEFAULT NULL,
  p_description text DEFAULT '',
  p_metadata jsonb DEFAULT '{}'::jsonb,
  p_ip_address inet DEFAULT NULL,
  p_user_agent text DEFAULT NULL
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_entry_id uuid;
BEGIN
  INSERT INTO ledger_entries (
    user_id, transaction_type, amount, currency,
    balance_before, balance_after,
    reference_id, reference_type,
    description, metadata,
    ip_address, user_agent
  ) VALUES (
    p_user_id, p_transaction_type, p_amount, p_currency,
    p_balance_before, p_balance_after,
    p_reference_id, p_reference_type,
    p_description, p_metadata,
    p_ip_address, p_user_agent
  )
  RETURNING id INTO v_entry_id;
  
  RETURN v_entry_id;
END;
$$;

COMMENT ON TABLE ledger_entries IS 'Immutable audit trail for all financial transactions. NO UPDATES OR DELETES ALLOWED.';
COMMENT ON FUNCTION log_ledger_entry IS 'Helper function to create ledger entries with proper audit trail.';