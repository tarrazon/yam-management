/*
  # Ajout de la date d'email programmé

  1. Changements
    - Ajoute email_scheduled_at pour stocker quand l'email doit être envoyé
    - Utile pour les relances automatiques avec délai
  
  2. Colonnes ajoutées
    - email_scheduled_at (timestamptz) - Date programmée d'envoi automatique
*/

-- Ajouter la colonne si elle n'existe pas
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'lot_workflow_progress' AND column_name = 'email_scheduled_at'
  ) THEN
    ALTER TABLE lot_workflow_progress ADD COLUMN email_scheduled_at timestamptz;
  END IF;
END $$;
