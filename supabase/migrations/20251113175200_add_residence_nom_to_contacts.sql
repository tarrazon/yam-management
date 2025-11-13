/*
  # Add residence_nom to contacts_residence

  1. Changes
    - Add `residence_nom` column to store the residence name denormalized
    - Create trigger to auto-populate residence_nom on insert/update
    
  2. Security
    - No changes to RLS policies
*/

-- Add residence_nom column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'contacts_residence' AND column_name = 'residence_nom'
  ) THEN
    ALTER TABLE contacts_residence ADD COLUMN residence_nom TEXT;
  END IF;
END $$;

-- Create function to auto-populate residence_nom
CREATE OR REPLACE FUNCTION update_contact_residence_nom()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.residence_gestion_id IS NOT NULL THEN
    SELECT nom INTO NEW.residence_nom
    FROM residences_gestion
    WHERE id = NEW.residence_gestion_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if exists and recreate
DROP TRIGGER IF EXISTS trigger_update_contact_residence_nom ON contacts_residence;

CREATE TRIGGER trigger_update_contact_residence_nom
  BEFORE INSERT OR UPDATE ON contacts_residence
  FOR EACH ROW
  EXECUTE FUNCTION update_contact_residence_nom();

-- Backfill existing records
UPDATE contacts_residence c
SET residence_nom = r.nom
FROM residences_gestion r
WHERE c.residence_gestion_id = r.id
  AND c.residence_nom IS NULL;
