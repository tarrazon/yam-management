/*
  # Add region field to residences_gestion

  1. Changes
    - Add `region` column to residences_gestion table
    - This will allow filtering lots by region through their residence
  
  2. Notes
    - Region is a text field for flexibility (e.g., "Île-de-France", "Auvergne-Rhône-Alpes", etc.)
    - Can be used to filter and organize residences and lots by geographical area
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'residences_gestion' AND column_name = 'region'
  ) THEN
    ALTER TABLE residences_gestion ADD COLUMN region text;
  END IF;
END $$;

-- Create index for better filtering performance
CREATE INDEX IF NOT EXISTS idx_residences_gestion_region 
  ON residences_gestion(region);