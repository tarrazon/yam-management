/*
  # Add updated_at column to galerie_photos

  1. Changes
    - Add `updated_at` column to `galerie_photos` table
    - Set default value to current timestamp
    - Update existing records to have created_at as updated_at
*/

-- Add updated_at column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'galerie_photos' AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE galerie_photos 
    ADD COLUMN updated_at timestamptz DEFAULT now();
    
    -- Set updated_at to created_at for existing records
    UPDATE galerie_photos 
    SET updated_at = created_at 
    WHERE updated_at IS NULL;
  END IF;
END $$;
