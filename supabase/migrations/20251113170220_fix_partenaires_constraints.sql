/*
  # Fix Partenaires Table Constraints
  
  Make nom_societe nullable since the app uses 'nom' as the main field.
*/

-- Make nom_societe nullable
ALTER TABLE partenaires ALTER COLUMN nom_societe DROP NOT NULL;

-- Ensure nom exists and is not null
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'partenaires' AND column_name = 'nom') THEN
    ALTER TABLE partenaires ADD COLUMN nom text;
  END IF;
END $$;

-- Make nom not null if it isn't already
ALTER TABLE partenaires ALTER COLUMN nom SET NOT NULL;
