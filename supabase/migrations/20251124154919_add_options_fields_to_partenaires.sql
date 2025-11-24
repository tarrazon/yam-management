/*
  # Ajouter les champs de gestion des options aux partenaires

  1. Modifications
    - Ajout de la colonne `options_max` (integer) : Nombre maximum d'options simultanées
    - Ajout de la colonne `duree_option_jours` (integer) : Durée en jours des options
    - Ajout de la colonne `prenom` (text) : Prénom du partenaire (si manquant)

  2. Notes
    - Par défaut, un partenaire peut poser 3 options simultanées
    - Par défaut, chaque option dure 5 jours
*/

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'partenaires' AND column_name = 'options_max'
  ) THEN
    ALTER TABLE partenaires ADD COLUMN options_max integer DEFAULT 3;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'partenaires' AND column_name = 'duree_option_jours'
  ) THEN
    ALTER TABLE partenaires ADD COLUMN duree_option_jours integer DEFAULT 5;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'partenaires' AND column_name = 'prenom'
  ) THEN
    ALTER TABLE partenaires ADD COLUMN prenom text;
  END IF;
END $$;
