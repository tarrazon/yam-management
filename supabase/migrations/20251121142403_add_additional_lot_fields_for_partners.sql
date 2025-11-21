/*
  # Ajout des champs supplémentaires pour les lots LMNP

  1. Nouveaux champs
    - region (text) - Région de la résidence (dénormalisé depuis residences_gestion)
    - surface_exterieure (numeric) - Surface extérieure (balcon, terrasse, jardin)
    - parking (boolean) - Présence d'un parking
    - prix_mobilier (numeric) - Prix du mobilier
    - prix_total_ht (numeric) - Prix immobilier + mobilier + honoraires HT
    - tva_recuperable (numeric) - TVA récupérable par l'acquéreur
    - prix_total_ttc (numeric) - Prix immobilier + meubles + honoraires TTC
    - exploitant (text) - Nom de l'exploitant de la résidence
    - loyer_annuel_ht (numeric) - Loyer annuel hors taxes
  
  2. Comportement
    - Les champs sont optionnels (nullable)
    - Valeurs par défaut appropriées pour les booléens et numériques
  
  3. Sécurité
    - Pas de modification des politiques RLS existantes
    - Les champs suivent les mêmes règles d'accès que les autres champs de la table
*/

-- Ajouter les nouveaux champs à la table lots_lmnp
DO $$
BEGIN
  -- Région (dénormalisée)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'lots_lmnp' AND column_name = 'region'
  ) THEN
    ALTER TABLE lots_lmnp ADD COLUMN region TEXT;
  END IF;

  -- Surface extérieure
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'lots_lmnp' AND column_name = 'surface_exterieure'
  ) THEN
    ALTER TABLE lots_lmnp ADD COLUMN surface_exterieure NUMERIC(10, 2) DEFAULT 0;
  END IF;

  -- Parking
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'lots_lmnp' AND column_name = 'parking'
  ) THEN
    ALTER TABLE lots_lmnp ADD COLUMN parking BOOLEAN DEFAULT false;
  END IF;

  -- Prix mobilier
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'lots_lmnp' AND column_name = 'prix_mobilier'
  ) THEN
    ALTER TABLE lots_lmnp ADD COLUMN prix_mobilier NUMERIC(12, 2) DEFAULT 0;
  END IF;

  -- Prix total HT (immobilier + mobilier + honoraires HT)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'lots_lmnp' AND column_name = 'prix_total_ht'
  ) THEN
    ALTER TABLE lots_lmnp ADD COLUMN prix_total_ht NUMERIC(12, 2);
  END IF;

  -- TVA récupérable par l'acquéreur
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'lots_lmnp' AND column_name = 'tva_recuperable'
  ) THEN
    ALTER TABLE lots_lmnp ADD COLUMN tva_recuperable NUMERIC(12, 2);
  END IF;

  -- Prix total TTC (immobilier + meubles + honoraires TTC)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'lots_lmnp' AND column_name = 'prix_total_ttc'
  ) THEN
    ALTER TABLE lots_lmnp ADD COLUMN prix_total_ttc NUMERIC(12, 2);
  END IF;

  -- Exploitant
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'lots_lmnp' AND column_name = 'exploitant'
  ) THEN
    ALTER TABLE lots_lmnp ADD COLUMN exploitant TEXT;
  END IF;

  -- Loyer annuel HT
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'lots_lmnp' AND column_name = 'loyer_annuel_ht'
  ) THEN
    ALTER TABLE lots_lmnp ADD COLUMN loyer_annuel_ht NUMERIC(12, 2);
  END IF;
END $$;

-- Commentaires pour documentation
COMMENT ON COLUMN lots_lmnp.region IS 'Région de la résidence (dénormalisé depuis residences_gestion)';
COMMENT ON COLUMN lots_lmnp.surface_exterieure IS 'Surface extérieure en m² (balcon, terrasse, jardin)';
COMMENT ON COLUMN lots_lmnp.parking IS 'Présence d''un parking (box, place extérieure)';
COMMENT ON COLUMN lots_lmnp.prix_mobilier IS 'Prix du mobilier en euros';
COMMENT ON COLUMN lots_lmnp.prix_total_ht IS 'Prix immobilier + mobilier + honoraires HT';
COMMENT ON COLUMN lots_lmnp.tva_recuperable IS 'TVA récupérable par l''acquéreur';
COMMENT ON COLUMN lots_lmnp.prix_total_ttc IS 'Prix immobilier + meubles + honoraires TTC';
COMMENT ON COLUMN lots_lmnp.exploitant IS 'Nom de l''exploitant de la résidence';
COMMENT ON COLUMN lots_lmnp.loyer_annuel_ht IS 'Loyer annuel hors taxes';

-- Trigger pour calculer automatiquement les prix totaux
CREATE OR REPLACE FUNCTION calculate_lot_total_prices()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Calcul du prix total HT si les composants sont présents
  IF NEW.prix IS NOT NULL AND NEW.honoraires_acquereur_ht IS NOT NULL THEN
    NEW.prix_total_ht := COALESCE(NEW.prix, 0) + COALESCE(NEW.prix_mobilier, 0) + COALESCE(NEW.honoraires_acquereur_ht, 0);
  END IF;

  -- Calcul du prix total TTC
  IF NEW.prix_total_ht IS NOT NULL THEN
    NEW.prix_total_ttc := NEW.prix_total_ht + COALESCE(NEW.tva_recuperable, 0) + COALESCE(NEW.tva_honoraires_acquereur, 0);
  END IF;

  -- Calcul du loyer annuel HT à partir du loyer mensuel
  IF NEW.loyer_mensuel IS NOT NULL AND NEW.loyer_annuel_ht IS NULL THEN
    NEW.loyer_annuel_ht := NEW.loyer_mensuel * 12;
  END IF;

  RETURN NEW;
END;
$$;

-- Créer le trigger
DROP TRIGGER IF EXISTS trigger_calculate_lot_prices ON lots_lmnp;

CREATE TRIGGER trigger_calculate_lot_prices
  BEFORE INSERT OR UPDATE ON lots_lmnp
  FOR EACH ROW
  EXECUTE FUNCTION calculate_lot_total_prices();
