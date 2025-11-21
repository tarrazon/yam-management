/*
  # Ajouter délai d'envoi automatique aux étapes workflow

  1. Modifications
    - Ajoute colonne `delay_days` à `workflow_steps` pour définir le délai avant envoi automatique
    - Configure les délais pour les étapes de relance (15 jours par défaut)
  
  2. Configuration
    - Relance documents vendeurs: 15 jours après complétion étape précédente
    - Signature mission: 15 jours après complétion étape précédente
*/

-- Ajouter la colonne delay_days
ALTER TABLE workflow_steps 
ADD COLUMN IF NOT EXISTS delay_days INTEGER DEFAULT 0;

-- Configurer les délais pour les étapes de relance
UPDATE workflow_steps 
SET delay_days = 15 
WHERE code IN ('relance_docs_vendeurs', 'signature_mission');

-- Pour les autres étapes avec email, envoi immédiat (0 jours)
UPDATE workflow_steps 
SET delay_days = 0 
WHERE send_email = true AND delay_days IS NULL;