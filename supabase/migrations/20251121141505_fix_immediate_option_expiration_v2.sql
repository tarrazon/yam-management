/*
  # Correction : Expiration immédiate des options (version simplifiée)

  1. Modifications
    - Modifie la fonction pour expirer IMMÉDIATEMENT après date_expiration
    - Les options qui ont dépassé leur date_expiration sont automatiquement expirées
    - Les lots associés repassent immédiatement en "disponible"
  
  2. Comportement
    - Dès que date_expiration < NOW(), l'option est expirée
    - Le lot repasse en "disponible" instantanément
    - Conservation de l'historique des options
  
  3. Sécurité
    - Fonction en SECURITY DEFINER
    - Pas de suppression de données, seulement des mises à jour de statut
*/

-- Supprimer l'ancienne version de la fonction
DROP FUNCTION IF EXISTS expire_old_options_and_reset_lots();

-- Fonction corrigée pour expiration IMMÉDIATE (pas après 5 jours)
CREATE OR REPLACE FUNCTION expire_old_options_and_reset_lots()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  option_record RECORD;
  hours_since_expiration NUMERIC;
BEGIN
  -- Parcourir toutes les options actives expirées (IMMÉDIATEMENT après date_expiration)
  FOR option_record IN 
    SELECT 
      ol.id as option_id,
      ol.lot_lmnp_id,
      ol.date_expiration,
      ll.statut as lot_statut,
      EXTRACT(EPOCH FROM (NOW() - ol.date_expiration)) / 3600 as hours_expired
    FROM options_lot ol
    INNER JOIN lots_lmnp ll ON ol.lot_lmnp_id = ll.id
    WHERE ol.statut = 'active'
      AND ol.date_expiration < NOW()
  LOOP
    -- Mettre à jour le statut de l'option à 'expiree'
    UPDATE options_lot
    SET statut = 'expiree',
        updated_at = NOW()
    WHERE id = option_record.option_id;
    
    -- Remettre le lot en disponible si il est encore en sous_option
    IF option_record.lot_statut = 'sous_option' THEN
      UPDATE lots_lmnp
      SET 
        statut = 'disponible',
        updated_at = NOW()
      WHERE id = option_record.lot_lmnp_id;
      
      RAISE NOTICE 'Option % expirée (%.1f heures) - Lot % remis en disponible', 
        option_record.option_id, 
        option_record.hours_expired, 
        option_record.lot_lmnp_id;
    ELSE
      RAISE NOTICE 'Option % expirée mais lot % a le statut: %', 
        option_record.option_id,
        option_record.lot_lmnp_id,
        option_record.lot_statut;
    END IF;
  END LOOP;
END;
$$;

-- Fonction corrigée pour statistiques
DROP FUNCTION IF EXISTS force_expire_all_old_options();

CREATE OR REPLACE FUNCTION force_expire_all_old_options()
RETURNS TABLE (
  expired_count INTEGER,
  lots_reset_count INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  expired_opts INTEGER := 0;
  reset_lots INTEGER := 0;
  opts_before INTEGER := 0;
  opts_after INTEGER := 0;
BEGIN
  -- Compter les options actives expirées AVANT traitement
  SELECT COUNT(*) INTO opts_before
  FROM options_lot
  WHERE statut = 'active'
    AND date_expiration < NOW();
  
  -- Exécuter l'expiration
  PERFORM expire_old_options_and_reset_lots();
  
  -- Compter les options actives expirées APRÈS traitement (devrait être 0)
  SELECT COUNT(*) INTO opts_after
  FROM options_lot
  WHERE statut = 'active'
    AND date_expiration < NOW();
  
  -- Le nombre d'options expirées = différence
  expired_opts := opts_before - opts_after;
  
  -- Compter les lots disponibles modifiés récemment
  SELECT COUNT(*) INTO reset_lots
  FROM lots_lmnp
  WHERE statut = 'disponible'
    AND updated_at > NOW() - INTERVAL '10 seconds';
  
  RETURN QUERY SELECT expired_opts, reset_lots;
END;
$$;

-- Exécuter immédiatement pour traiter toutes les options déjà expirées
SELECT expire_old_options_and_reset_lots();
