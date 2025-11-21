/*
  # Séparation des étapes workflow vendeur et acquéreur

  1. Modifications
    - Ajout de la colonne `workflow_type` à `workflow_steps`
    - Mise à jour des étapes existantes pour définir leur type
    - Les étapes 1-2 sont de type 'vendeur'
    - Les étapes 3-15 sont de type 'acquereur'

  2. Objectif
    - Permettre de filtrer les étapes selon le contexte (vendeur ou acquéreur)
    - Les étapes vendeur peuvent être gérées dès la création du lot
    - Les étapes acquéreur sont gérées après mise sous option
*/

-- Ajouter la colonne workflow_type
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'workflow_steps' AND column_name = 'workflow_type'
  ) THEN
    ALTER TABLE workflow_steps ADD COLUMN workflow_type text NOT NULL DEFAULT 'acquereur';
  END IF;
END $$;

-- Mettre à jour les étapes existantes
UPDATE workflow_steps
SET workflow_type = 'vendeur'
WHERE order_index <= 2;

UPDATE workflow_steps
SET workflow_type = 'acquereur'
WHERE order_index > 2;

-- Ajouter un commentaire
COMMENT ON COLUMN workflow_steps.workflow_type IS 'Type de workflow: vendeur (étapes 1-2) ou acquereur (étapes 3-15)';
