/*
  # Add created_by column to partenaires table

  1. Changes
    - Add created_by column to store the email of the user who created the partenaire
    - This enables filtering partenaires by creator for commercial users
  
  2. Notes
    - Column is nullable to handle existing records
    - Future inserts should populate this field
*/

-- Add created_by column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'partenaires' AND column_name = 'created_by'
  ) THEN
    ALTER TABLE partenaires ADD COLUMN created_by text;
  END IF;
END $$;