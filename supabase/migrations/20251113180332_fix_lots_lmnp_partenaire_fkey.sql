/*
  # Fix Foreign Key Constraint for Lots LMNP

  1. Changes
    - Drop existing foreign key constraint that incorrectly points to profiles
    - Add correct foreign key constraint pointing to partenaires table
    
  2. Security
    - No changes to RLS policies
*/

-- Drop the incorrect foreign key constraint
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'lots_lmnp_partenaire_id_fkey'
    AND table_name = 'lots_lmnp'
  ) THEN
    ALTER TABLE lots_lmnp DROP CONSTRAINT lots_lmnp_partenaire_id_fkey;
  END IF;
END $$;

-- Add the correct foreign key constraint pointing to partenaires table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'lots_lmnp_partenaire_id_fkey'
    AND table_name = 'lots_lmnp'
  ) THEN
    ALTER TABLE lots_lmnp 
    ADD CONSTRAINT lots_lmnp_partenaire_id_fkey 
    FOREIGN KEY (partenaire_id) 
    REFERENCES partenaires(id) 
    ON DELETE SET NULL;
  END IF;
END $$;
