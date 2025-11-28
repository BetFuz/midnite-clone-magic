-- Add 'cashed_out' status to bet_slips if not already present
DO $$ 
BEGIN
    -- Check if the constraint exists and includes 'cashed_out'
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'bet_slips_status_check' 
        AND conbin::text LIKE '%cashed_out%'
    ) THEN
        -- Drop old constraint if it exists
        ALTER TABLE bet_slips DROP CONSTRAINT IF EXISTS bet_slips_status_check;
        
        -- Add new constraint with 'cashed_out' status
        ALTER TABLE bet_slips 
        ADD CONSTRAINT bet_slips_status_check 
        CHECK (status IN ('pending', 'pending_settlement', 'won', 'lost', 'cashed_out', 'cancelled'));
    END IF;
END $$;

-- Enable realtime for bet_slips table
ALTER TABLE bet_slips REPLICA IDENTITY FULL;

-- Enable realtime for bet_selections table  
ALTER TABLE bet_selections REPLICA IDENTITY FULL;

-- Create index for faster user bet lookups
CREATE INDEX IF NOT EXISTS idx_bet_slips_user_status 
ON bet_slips(user_id, status);

-- Create index for bet selections lookups
CREATE INDEX IF NOT EXISTS idx_bet_selections_bet_slip 
ON bet_selections(bet_slip_id);
