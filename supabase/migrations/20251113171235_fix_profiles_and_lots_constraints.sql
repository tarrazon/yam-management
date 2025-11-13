/*
  # Fix Profiles and Lots Constraints
  
  1. Add partenaire_id to profiles table
  2. Make numero nullable in lots_lmnp (can be generated automatically)
*/

-- Add partenaire_id to profiles if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'partenaire_id'
  ) THEN
    ALTER TABLE profiles ADD COLUMN partenaire_id uuid REFERENCES partenaires(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Make numero nullable in lots_lmnp
ALTER TABLE lots_lmnp ALTER COLUMN numero DROP NOT NULL;

-- Make numero nullable in lots
ALTER TABLE lots ALTER COLUMN numero DROP NOT NULL;
