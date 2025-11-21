/*
  # Trigger de réinitialisation du workflow quand un lot repasse en disponible

  1. Changements
    - Crée une fonction qui supprime toutes les entrées de lot_workflow_progress
    - Crée une fonction qui réinitialise tous les champs de suivi du lot
    - Crée un trigger qui s'exécute quand le statut passe à 'disponible'
  
  2. Champs réinitialisés
    - date_premier_contact → NULL
    - date_signature_compromis → NULL
    - date_signature_acte → NULL
    - phase_post_vente → NULL
    - observations_acquereurs → NULL
    - comptes_rendus_visite → NULL
    - negociation_en_cours → NULL
    - acquereur_id → NULL (le lot n'a plus d'acquéreur)
  
  3. Workflow
    - Supprime toutes les entrées de lot_workflow_progress pour ce lot
    - Le workflow repart à zéro
*/

-- Fonction pour réinitialiser le workflow d'un lot
CREATE OR REPLACE FUNCTION reset_lot_workflow_on_disponible()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  -- Si le statut passe à 'disponible'
  IF NEW.statut = 'disponible' AND (OLD.statut IS NULL OR OLD.statut != 'disponible') THEN
    
    -- Supprimer toutes les entrées de workflow pour ce lot
    DELETE FROM lot_workflow_progress
    WHERE lot_id = NEW.id;
    
    -- Réinitialiser tous les champs de suivi
    NEW.date_premier_contact := NULL;
    NEW.date_signature_compromis := NULL;
    NEW.date_signature_acte := NULL;
    NEW.phase_post_vente := NULL;
    NEW.observations_acquereurs := NULL;
    NEW.comptes_rendus_visite := NULL;
    NEW.negociation_en_cours := NULL;
    NEW.acquereur_id := NULL;
    
  END IF;
  
  RETURN NEW;
END;
$$;

-- Créer le trigger (supprimer l'ancien s'il existe)
DROP TRIGGER IF EXISTS trigger_reset_workflow_on_disponible ON lots_lmnp;

CREATE TRIGGER trigger_reset_workflow_on_disponible
  BEFORE UPDATE ON lots_lmnp
  FOR EACH ROW
  EXECUTE FUNCTION reset_lot_workflow_on_disponible();
