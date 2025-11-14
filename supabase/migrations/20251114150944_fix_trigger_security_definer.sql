/*
  # Corriger les permissions du trigger de synchronisation

  1. Problème
    - La fonction trigger `sync_lot_statut_from_options()` s'exécute avec SECURITY INVOKER par défaut
    - Cela signifie qu'elle utilise les permissions de l'utilisateur qui fait l'INSERT/UPDATE/DELETE
    - Avec RLS activé, le trigger ne peut pas voir/modifier les données correctement
    
  2. Solution
    - Ajouter `SECURITY DEFINER` pour que la fonction s'exécute avec les permissions de son créateur
    - Cela permet au trigger de bypasser RLS et de toujours fonctionner
*/

-- Recréer la fonction avec SECURITY DEFINER
CREATE OR REPLACE FUNCTION sync_lot_statut_from_options()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
AS $$
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

-- Corriger tous les lots qui ont une option active mais ne sont pas en sous_option
UPDATE lots_lmnp
SET statut = 'sous_option'
WHERE id IN (
  SELECT DISTINCT lot_lmnp_id 
  FROM options_lot 
  WHERE statut = 'active'
)
AND statut NOT IN ('sous_option', 'reserve', 'allotement', 'compromis', 'vendu');