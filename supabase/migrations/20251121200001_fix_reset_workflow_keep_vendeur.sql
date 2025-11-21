/*
  # Correction du trigger de réinitialisation - garder le vendeur

  1. Changements
    - Modifie la fonction pour NE PAS toucher aux informations vendeur
    - Réinitialise uniquement le workflow acquéreur et les infos liées à la vente
  
  2. Ce qui est CONSERVÉ (important pour le suivi vendeur)
    - vendeur_id → CONSERVÉ
    - residence_id → CONSERVÉ
    - residence_gestion_id → CONSERVÉ
    - Toutes les infos du lot (prix, surface, etc.) → CONSERVÉES
  
  3. Ce qui est RÉINITIALISÉ (uniquement côté acquéreur)
    - acquereur_id → NULL
    - date_premier_contact → NULL
    - date_signature_compromis → NULL
    - date_signature_acte → NULL
    - phase_post_vente → NULL
    - observations_acquereurs → NULL
    - comptes_rendus_visite → NULL
    - negociation_en_cours → NULL
    - Workflow acquéreur (lot_workflow_progress avec workflow_type = 'acquereur')
*/

-- Supprimer l'ancienne fonction
DROP FUNCTION IF EXISTS reset_lot_workflow_on_disponible() CASCADE;

-- Nouvelle fonction qui garde le vendeur et son suivi
CREATE OR REPLACE FUNCTION reset_lot_workflow_on_disponible()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  -- Si le statut passe à 'disponible'
  IF NEW.statut = 'disponible' AND (OLD.statut IS NULL OR OLD.statut != 'disponible') THEN
    
    -- Supprimer UNIQUEMENT le workflow acquéreur (pas le vendeur)
    DELETE FROM lot_workflow_progress
    WHERE lot_id = NEW.id 
    AND step_code IN (
      SELECT code FROM workflow_steps WHERE workflow_type = 'acquereur'
    );
    
    -- Réinitialiser UNIQUEMENT les champs liés à l'acquéreur
    NEW.date_premier_contact := NULL;
    NEW.date_signature_compromis := NULL;
    NEW.date_signature_acte := NULL;
    NEW.phase_post_vente := NULL;
    NEW.observations_acquereurs := NULL;
    NEW.comptes_rendus_visite := NULL;
    NEW.negociation_en_cours := NULL;
    NEW.acquereur_id := NULL;
    
    -- NE PAS toucher à :
    -- - vendeur_id (CONSERVÉ)
    -- - residence_id (CONSERVÉ)
    -- - residence_gestion_id (CONSERVÉ)
    -- - prix, surface, etc. (CONSERVÉS)
    
  END IF;
  
  RETURN NEW;
END;
$$;

-- Recréer le trigger
DROP TRIGGER IF EXISTS trigger_reset_workflow_on_disponible ON lots_lmnp;

CREATE TRIGGER trigger_reset_workflow_on_disponible
  BEFORE UPDATE ON lots_lmnp
  FOR EACH ROW
  EXECUTE FUNCTION reset_lot_workflow_on_disponible();
