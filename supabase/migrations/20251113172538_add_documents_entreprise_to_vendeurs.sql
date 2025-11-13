/*
  # Add documents_entreprise column to vendeurs
  
  1. Changes
    - Add `documents_entreprise` column to vendeurs table (JSONB type for storing document metadata)
*/

-- Add documents_entreprise column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'vendeurs' AND column_name = 'documents_entreprise'
  ) THEN
    ALTER TABLE vendeurs ADD COLUMN documents_entreprise jsonb DEFAULT '[]'::jsonb;
  END IF;
END $$;
