/*
  # Add Denormalized Names to Options Lot

  1. Changes
    - Add `partenaire_nom` column to `options_lot` table
    - Add `acquereur_nom` column to `options_lot` table
    - Add `lot_reference` column to `options_lot` table
    - Add `residence_nom` column to `options_lot` table
    
  2. Purpose
    - Store snapshot of names at the time of option creation
    - Prevent display issues when related records are updated
    - Improve query performance by avoiding joins
    
  3. Security
    - No changes to RLS policies
*/

-- Add denormalized columns to options_lot
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'options_lot' AND column_name = 'partenaire_nom'
  ) THEN
    ALTER TABLE options_lot ADD COLUMN partenaire_nom text DEFAULT '';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'options_lot' AND column_name = 'acquereur_nom'
  ) THEN
    ALTER TABLE options_lot ADD COLUMN acquereur_nom text DEFAULT '';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'options_lot' AND column_name = 'lot_reference'
  ) THEN
    ALTER TABLE options_lot ADD COLUMN lot_reference text DEFAULT '';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'options_lot' AND column_name = 'residence_nom'
  ) THEN
    ALTER TABLE options_lot ADD COLUMN residence_nom text DEFAULT '';
  END IF;
END $$;

-- Update existing options with current names
UPDATE options_lot
SET 
  partenaire_nom = COALESCE((SELECT nom FROM partenaires WHERE id = options_lot.partenaire_id), ''),
  acquereur_nom = COALESCE((SELECT prenom || ' ' || nom FROM acquereurs WHERE id = options_lot.acquereur_id), ''),
  lot_reference = COALESCE((SELECT reference FROM lots_lmnp WHERE id = options_lot.lot_lmnp_id), ''),
  residence_nom = COALESCE((SELECT residence_nom FROM lots_lmnp WHERE id = options_lot.lot_lmnp_id), '')
WHERE partenaire_nom IS NULL OR partenaire_nom = '';
