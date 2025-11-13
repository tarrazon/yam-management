/*
  # Add Unique Constraint for Active Options

  1. Changes
    - Clean up duplicate active options (keep the most recent one)
    - Add partial unique constraint to ensure only one active option per lot
    
  2. Security
    - No changes to RLS policies
*/

-- First, cancel duplicate active options (keep the most recent, cancel older ones)
DO $$
DECLARE
  duplicate_record RECORD;
  option_to_cancel UUID;
BEGIN
  FOR duplicate_record IN 
    SELECT 
      lot_lmnp_id,
      array_agg(id ORDER BY created_at ASC) as option_ids
    FROM options_lot
    WHERE statut = 'active'
    GROUP BY lot_lmnp_id
    HAVING COUNT(*) > 1
  LOOP
    -- Cancel all but the last (most recent) option
    FOR i IN 1..(array_length(duplicate_record.option_ids, 1) - 1) LOOP
      option_to_cancel := duplicate_record.option_ids[i];
      UPDATE options_lot 
      SET statut = 'annulee', 
          updated_at = now() 
      WHERE id = option_to_cancel;
    END LOOP;
  END LOOP;
END $$;

-- Add partial unique index to prevent multiple active options on same lot
CREATE UNIQUE INDEX IF NOT EXISTS options_lot_unique_active_per_lot 
ON options_lot (lot_lmnp_id) 
WHERE statut = 'active';
