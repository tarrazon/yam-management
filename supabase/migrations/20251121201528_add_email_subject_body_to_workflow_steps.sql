/*
  # Ajout des colonnes email_subject et email_body

  1. Changements
    - Ajoute email_subject pour stocker le sujet de l'email
    - Ajoute email_body pour stocker le corps de l'email
    - Conserve email_template pour la compatibilité
  
  2. Colonnes ajoutées
    - email_subject (text) - Sujet de l'email avec variables
    - email_body (text) - Corps de l'email avec variables
*/

-- Ajouter les colonnes si elles n'existent pas
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'workflow_steps' AND column_name = 'email_subject'
  ) THEN
    ALTER TABLE workflow_steps ADD COLUMN email_subject text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'workflow_steps' AND column_name = 'email_body'
  ) THEN
    ALTER TABLE workflow_steps ADD COLUMN email_body text;
  END IF;
END $$;
