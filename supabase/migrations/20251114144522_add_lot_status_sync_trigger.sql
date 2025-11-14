/*
  # Ajouter un trigger pour synchroniser automatiquement le statut des lots

  1. Fonction trigger
    - Fonction `sync_lot_statut_from_options()` qui met à jour le statut du lot selon les options
    - Logique: 
      - Si une option active existe → statut = 'sous_option'
      - Si aucune option active → statut = 'disponible' (sauf si déjà réservé, compromis, vendu)

  2. Triggers
    - `sync_lot_statut_after_option_insert`: Après insertion d'une option
    - `sync_lot_statut_after_option_update`: Après mise à jour d'une option
    - `sync_lot_statut_after_option_delete`: Après suppression d'une option

  3. Correction manuelle
    - Corriger le statut de tous les lots qui ont une option active mais sont marqués 'disponible'
*/

-- Créer la fonction de synchronisation
CREATE OR REPLACE FUNCTION sync_lot_statut_from_options()
RETURNS TRIGGER AS $$
DECLARE
  v_lot_id uuid;
  v_has_active_option boolean;
  v_current_statut text;
BEGIN
  -- Déterminer l'ID du lot concerné
  IF TG_OP = 'DELETE' THEN
    v_lot_id := OLD.lot_lmnp_id;
  ELSE
    v_lot_id := NEW.lot_lmnp_id;
  END IF;

  -- Récupérer le statut actuel du lot
  SELECT statut INTO v_current_statut
  FROM lots_lmnp
  WHERE id = v_lot_id;

  -- Vérifier s'il existe une option active sur ce lot
  SELECT EXISTS(
    SELECT 1 FROM options_lot 
    WHERE lot_lmnp_id = v_lot_id 
    AND statut = 'active'
  ) INTO v_has_active_option;

  -- Mettre à jour le statut du lot selon la présence d'options actives
  IF v_has_active_option THEN
    -- Si une option active existe, mettre le lot en sous_option
    UPDATE lots_lmnp
    SET statut = 'sous_option'
    WHERE id = v_lot_id
    AND statut NOT IN ('reserve', 'allotement', 'compromis', 'vendu');
  ELSE
    -- Si aucune option active, remettre le lot en disponible
    -- SAUF s'il est déjà dans un statut plus avancé
    UPDATE lots_lmnp
    SET statut = 'disponible'
    WHERE id = v_lot_id
    AND statut = 'sous_option';
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Créer les triggers sur la table options_lot
DROP TRIGGER IF EXISTS sync_lot_statut_after_option_insert ON options_lot;
CREATE TRIGGER sync_lot_statut_after_option_insert
  AFTER INSERT ON options_lot
  FOR EACH ROW
  EXECUTE FUNCTION sync_lot_statut_from_options();

DROP TRIGGER IF EXISTS sync_lot_statut_after_option_update ON options_lot;
CREATE TRIGGER sync_lot_statut_after_option_update
  AFTER UPDATE ON options_lot
  FOR EACH ROW
  WHEN (OLD.statut IS DISTINCT FROM NEW.statut OR OLD.lot_lmnp_id IS DISTINCT FROM NEW.lot_lmnp_id)
  EXECUTE FUNCTION sync_lot_statut_from_options();

DROP TRIGGER IF EXISTS sync_lot_statut_after_option_delete ON options_lot;
CREATE TRIGGER sync_lot_statut_after_option_delete
  AFTER DELETE ON options_lot
  FOR EACH ROW
  EXECUTE FUNCTION sync_lot_statut_from_options();

-- Correction manuelle: Synchroniser les lots qui ont une option active mais sont marqués 'disponible'
UPDATE lots_lmnp
SET statut = 'sous_option'
WHERE id IN (
  SELECT DISTINCT lot_lmnp_id 
  FROM options_lot 
  WHERE statut = 'active'
)
AND statut = 'disponible';