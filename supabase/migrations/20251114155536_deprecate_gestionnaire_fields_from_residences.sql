/*
  # Deprecate gestionnaire fields from residences_gestion

  1. Changes
    - Remove gestionnaire, gestionnaire_email, gestionnaire_telephone columns
    - These are now managed through the gestionnaires table
    - Existing data relationships should be migrated manually if needed
  
  2. Notes
    - The new gestionnaires table provides proper relational structure
    - Multiple residences can now share the same gestionnaire
    - A residence can have multiple gestionnaires through the junction table
*/

DO $$
BEGIN
  -- Drop gestionnaire column if it exists
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'residences_gestion' AND column_name = 'gestionnaire'
  ) THEN
    ALTER TABLE residences_gestion DROP COLUMN gestionnaire;
  END IF;

  -- Drop gestionnaire_email column if it exists
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'residences_gestion' AND column_name = 'gestionnaire_email'
  ) THEN
    ALTER TABLE residences_gestion DROP COLUMN gestionnaire_email;
  END IF;

  -- Drop gestionnaire_telephone column if it exists
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'residences_gestion' AND column_name = 'gestionnaire_telephone'
  ) THEN
    ALTER TABLE residences_gestion DROP COLUMN gestionnaire_telephone;
  END IF;
END $$;