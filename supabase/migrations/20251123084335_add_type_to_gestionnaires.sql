/*
  # Add type field to gestionnaires table

  1. Changes
    - Add `type_gestion` column to `gestionnaires` table
      - Type: text with CHECK constraint
      - Values: 'bail_commercial' or 'mandat_gestion'
      - Default: 'bail_commercial'
      - NOT NULL

  2. Notes
    - Bail commercial: Commercial lease management
    - Mandat de gestion: Property management mandate
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'gestionnaires' AND column_name = 'type_gestion'
  ) THEN
    ALTER TABLE gestionnaires 
    ADD COLUMN type_gestion text DEFAULT 'bail_commercial' NOT NULL
    CHECK (type_gestion IN ('bail_commercial', 'mandat_gestion'));
  END IF;
END $$;