-- Affiliate System with Self-Bet Abuse Prevention
-- Creates affiliate_links table and prevents self-betting/circular relationships

-- Create affiliate tier enum
DO $$ BEGIN
  CREATE TYPE affiliate_tier AS ENUM ('BRONZE', 'SILVER', 'GOLD');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create affiliate_links table
CREATE TABLE IF NOT EXISTS affiliate_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  code TEXT UNIQUE NOT NULL,
  tier affiliate_tier NOT NULL DEFAULT 'BRONZE',
  clicks INTEGER NOT NULL DEFAULT 0,
  conversions INTEGER NOT NULL DEFAULT 0,
  active_referrals INTEGER NOT NULL DEFAULT 0,
  commission NUMERIC NOT NULL DEFAULT 0,
  commission_rate NUMERIC NOT NULL DEFAULT 0.20,
  override_rate NUMERIC NOT NULL DEFAULT 0,
  daily_salary NUMERIC NOT NULL DEFAULT 0,
  parent_id UUID REFERENCES affiliate_links(id) ON DELETE SET NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_salary_paid_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_affiliate_links_user_id ON affiliate_links(user_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_links_code ON affiliate_links(code);
CREATE INDEX IF NOT EXISTS idx_affiliate_links_parent_id ON affiliate_links(parent_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_links_tier ON affiliate_links(tier);

-- Enable RLS
ALTER TABLE affiliate_links ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own affiliate links" ON affiliate_links
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own affiliate links" ON affiliate_links
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own affiliate links" ON affiliate_links
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all affiliate links" ON affiliate_links
  FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'superadmin'::app_role));

-- Add affiliate_code column to bet_slips if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'bet_slips' AND column_name = 'affiliate_code'
  ) THEN
    ALTER TABLE bet_slips ADD COLUMN affiliate_code TEXT;
    CREATE INDEX idx_bet_slips_affiliate_code ON bet_slips(affiliate_code);
  END IF;
END $$;

-- Function to get all ancestor affiliate IDs in the tree (recursive)
CREATE OR REPLACE FUNCTION get_affiliate_ancestors(p_user_id UUID)
RETURNS TABLE(ancestor_id UUID)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  WITH RECURSIVE ancestor_tree AS (
    -- Base case: direct parent
    SELECT parent_id
    FROM affiliate_links
    WHERE user_id = p_user_id AND parent_id IS NOT NULL
    
    UNION
    
    -- Recursive case: parent's parents
    SELECT al.parent_id
    FROM affiliate_links al
    INNER JOIN ancestor_tree at ON al.user_id = at.parent_id
    WHERE al.parent_id IS NOT NULL
  )
  SELECT DISTINCT parent_id
  FROM ancestor_tree
  WHERE parent_id IS NOT NULL;
END;
$$;

-- Function to validate affiliate relationship (no self-betting, no circular refs)
CREATE OR REPLACE FUNCTION validate_affiliate_relationship()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_affiliate_user_id UUID;
  v_is_ancestor BOOLEAN;
BEGIN
  -- For bet_slips: check if affiliate code belongs to the betting user
  IF TG_TABLE_NAME = 'bet_slips' AND NEW.affiliate_code IS NOT NULL THEN
    SELECT user_id INTO v_affiliate_user_id
    FROM affiliate_links
    WHERE code = NEW.affiliate_code;
    
    IF v_affiliate_user_id IS NOT NULL AND v_affiliate_user_id = NEW.user_id THEN
      RAISE EXCEPTION 'Affiliate self-bet blocked: Cannot bet using your own affiliate code';
    END IF;
  END IF;
  
  -- For affiliate_links: check if parent is in user's ancestor tree (circular ref)
  IF TG_TABLE_NAME = 'affiliate_links' AND NEW.parent_id IS NOT NULL THEN
    -- Check direct self-reference
    SELECT user_id INTO v_affiliate_user_id
    FROM affiliate_links
    WHERE id = NEW.parent_id;
    
    IF v_affiliate_user_id = NEW.user_id THEN
      RAISE EXCEPTION 'Affiliate self-reference blocked: Cannot be your own parent affiliate';
    END IF;
    
    -- Check if parent is in user's ancestor tree (would create circular reference)
    SELECT EXISTS(
      SELECT 1 FROM get_affiliate_ancestors(NEW.parent_id)
      WHERE ancestor_id = NEW.user_id
    ) INTO v_is_ancestor;
    
    IF v_is_ancestor THEN
      RAISE EXCEPTION 'Affiliate circular reference blocked: Parent is already your descendant in the affiliate tree';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger on bet_slips to prevent self-betting
DROP TRIGGER IF EXISTS prevent_affiliate_self_bet ON bet_slips;
CREATE TRIGGER prevent_affiliate_self_bet
  BEFORE INSERT OR UPDATE ON bet_slips
  FOR EACH ROW
  EXECUTE FUNCTION validate_affiliate_relationship();

-- Create trigger on affiliate_links to prevent circular references
DROP TRIGGER IF EXISTS prevent_affiliate_circular_ref ON affiliate_links;
CREATE TRIGGER prevent_affiliate_circular_ref
  BEFORE INSERT OR UPDATE ON affiliate_links
  FOR EACH ROW
  EXECUTE FUNCTION validate_affiliate_relationship();

-- Add comments for documentation
COMMENT ON TABLE affiliate_links IS 'Affiliate program tracking with tiered commissions and hierarchical structure';
COMMENT ON FUNCTION get_affiliate_ancestors(UUID) IS 'Returns all ancestor affiliate IDs for a given user, traversing up the affiliate tree recursively';
COMMENT ON FUNCTION validate_affiliate_relationship() IS 'Prevents affiliate self-betting and circular affiliate relationships';
