/*
  # Add missing columns to residences_gestion table

  1. New Columns
    - `annee_construction` (integer) - Year the residence was built
    - `gestionnaire` (text) - Property manager name
    - `gestionnaire_email` (text) - Property manager email
    - `gestionnaire_telephone` (text) - Property manager phone
    - `nombre_lots_total` (integer) - Total number of units
    - `nombre_lots_portefeuille` (integer) - Number of units in portfolio
    - `statut` (text) - Status of the residence
    - `rentabilite_moyenne` (numeric) - Average profitability
    - `image_url` (text) - URL to residence image
    - `documents` (jsonb) - Stored documents
    
  2. Notes
    - Using IF NOT EXISTS pattern to avoid errors if columns already exist
    - All columns are nullable to maintain data integrity
*/

-- Add columns one by one with IF NOT EXISTS checks
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'residences_gestion' AND column_name = 'annee_construction'
  ) THEN
    ALTER TABLE residences_gestion ADD COLUMN annee_construction integer;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'residences_gestion' AND column_name = 'gestionnaire'
  ) THEN
    ALTER TABLE residences_gestion ADD COLUMN gestionnaire text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'residences_gestion' AND column_name = 'gestionnaire_email'
  ) THEN
    ALTER TABLE residences_gestion ADD COLUMN gestionnaire_email text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'residences_gestion' AND column_name = 'gestionnaire_telephone'
  ) THEN
    ALTER TABLE residences_gestion ADD COLUMN gestionnaire_telephone text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'residences_gestion' AND column_name = 'nombre_lots_total'
  ) THEN
    ALTER TABLE residences_gestion ADD COLUMN nombre_lots_total integer;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'residences_gestion' AND column_name = 'nombre_lots_portefeuille'
  ) THEN
    ALTER TABLE residences_gestion ADD COLUMN nombre_lots_portefeuille integer;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'residences_gestion' AND column_name = 'statut'
  ) THEN
    ALTER TABLE residences_gestion ADD COLUMN statut text DEFAULT 'active';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'residences_gestion' AND column_name = 'rentabilite_moyenne'
  ) THEN
    ALTER TABLE residences_gestion ADD COLUMN rentabilite_moyenne numeric(5,2);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'residences_gestion' AND column_name = 'image_url'
  ) THEN
    ALTER TABLE residences_gestion ADD COLUMN image_url text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'residences_gestion' AND column_name = 'documents'
  ) THEN
    ALTER TABLE residences_gestion ADD COLUMN documents jsonb DEFAULT '[]'::jsonb;
  END IF;
END $$;
