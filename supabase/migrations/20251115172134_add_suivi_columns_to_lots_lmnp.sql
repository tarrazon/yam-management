/*
  # Ajout des colonnes de suivi au lots_lmnp

  1. Modifications
    - Ajout des colonnes de suivi commercial et observations à la table `lots_lmnp`
      - `statut_suivi` : statut général du suivi (en_cours, signe, reporte)
      - `statut_suivi_libre` : statut personnalisé (texte libre)
      - `observations_suivi` : observations générales sur le suivi
      - `comptes_rendus_visite` : comptes-rendus des visites
      - `observations_acquereurs` : observations sur les acquéreurs
      - `negociation_en_cours` : informations sur les négociations
    
  2. Notes
    - Ces champs permettent un suivi détaillé du dossier commercial
    - Tous les champs sont optionnels (nullable)
*/

-- Ajouter les colonnes de suivi
DO $$
BEGIN
  -- Statut de suivi
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'lots_lmnp' AND column_name = 'statut_suivi'
  ) THEN
    ALTER TABLE lots_lmnp 
    ADD COLUMN statut_suivi text CHECK (statut_suivi IN ('en_cours', 'signe', 'reporte'));
  END IF;

  -- Statut personnalisé
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'lots_lmnp' AND column_name = 'statut_suivi_libre'
  ) THEN
    ALTER TABLE lots_lmnp 
    ADD COLUMN statut_suivi_libre text;
  END IF;

  -- Observations suivi
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'lots_lmnp' AND column_name = 'observations_suivi'
  ) THEN
    ALTER TABLE lots_lmnp 
    ADD COLUMN observations_suivi text;
  END IF;

  -- Comptes-rendus de visite
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'lots_lmnp' AND column_name = 'comptes_rendus_visite'
  ) THEN
    ALTER TABLE lots_lmnp 
    ADD COLUMN comptes_rendus_visite text;
  END IF;

  -- Observations acquéreurs
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'lots_lmnp' AND column_name = 'observations_acquereurs'
  ) THEN
    ALTER TABLE lots_lmnp 
    ADD COLUMN observations_acquereurs text;
  END IF;

  -- Négociation en cours
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'lots_lmnp' AND column_name = 'negociation_en_cours'
  ) THEN
    ALTER TABLE lots_lmnp 
    ADD COLUMN negociation_en_cours text;
  END IF;
END $$;

-- Ajouter des commentaires
COMMENT ON COLUMN lots_lmnp.statut_suivi IS 'Statut du suivi: en_cours, signe, reporte';
COMMENT ON COLUMN lots_lmnp.statut_suivi_libre IS 'Statut personnalisé en texte libre';
COMMENT ON COLUMN lots_lmnp.observations_suivi IS 'Observations générales sur le suivi du dossier';
COMMENT ON COLUMN lots_lmnp.comptes_rendus_visite IS 'Comptes-rendus des visites effectuées';
COMMENT ON COLUMN lots_lmnp.observations_acquereurs IS 'Observations sur les acquéreurs';
COMMENT ON COLUMN lots_lmnp.negociation_en_cours IS 'Informations sur les négociations en cours';
