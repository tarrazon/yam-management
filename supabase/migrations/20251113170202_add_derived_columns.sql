/*
  # Add Derived/Denormalized Columns
  
  Add columns that store denormalized data from relationships for easier querying.
*/

-- Add derived columns to lots_lmnp
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'lots_lmnp' AND column_name = 'acquereur_nom') THEN
    ALTER TABLE lots_lmnp ADD COLUMN acquereur_nom text;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'lots_lmnp' AND column_name = 'vendeur_nom') THEN
    ALTER TABLE lots_lmnp ADD COLUMN vendeur_nom text;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'lots_lmnp' AND column_name = 'partenaire_nom') THEN
    ALTER TABLE lots_lmnp ADD COLUMN partenaire_nom text;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'lots_lmnp' AND column_name = 'residence_nom') THEN
    ALTER TABLE lots_lmnp ADD COLUMN residence_nom text;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'lots_lmnp' AND column_name = 'ville') THEN
    ALTER TABLE lots_lmnp ADD COLUMN ville text;
  END IF;
END $$;

-- Add derived columns to acquereurs
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'acquereurs' AND column_name = 'partenaire_nom') THEN
    ALTER TABLE acquereurs ADD COLUMN partenaire_nom text;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'acquereurs' AND column_name = 'budget_min') THEN
    ALTER TABLE acquereurs ADD COLUMN budget_min numeric;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'acquereurs' AND column_name = 'budget_max') THEN
    ALTER TABLE acquereurs ADD COLUMN budget_max numeric;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'acquereurs' AND column_name = 'budget') THEN
    ALTER TABLE acquereurs ADD COLUMN budget numeric;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'acquereurs' AND column_name = 'apport') THEN
    ALTER TABLE acquereurs ADD COLUMN apport numeric;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'acquereurs' AND column_name = 'endettement_estime') THEN
    ALTER TABLE acquereurs ADD COLUMN endettement_estime numeric;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'acquereurs' AND column_name = 'revenus_mensuels') THEN
    ALTER TABLE acquereurs ADD COLUMN revenus_mensuels numeric;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'acquereurs' AND column_name = 'criteres_recherche') THEN
    ALTER TABLE acquereurs ADD COLUMN criteres_recherche text;
  END IF;
END $$;
