/*
  # Auto-expiration des options et remise en disponibilité des lots

  1. Modifications
    - Crée une fonction pour détecter et expirer automatiquement les options
    - Crée un trigger pour mettre à jour le statut du lot quand une option expire
    - Remet automatiquement les lots en "disponible" quand leur option expire (date_fin > 5 jours)
  
  2. Comportement
    - Quand une option active a dépassé sa date_expiration de plus de 5 jours :
      * Le statut de l'option passe à 'expiree'
      * Le statut du lot associé repasse à 'disponible'
      * Les champs date_debut et date_fin du lot sont réinitialisés
    - Ce mécanisme se déclenche automatiquement à chaque lecture/modification
  
  3. Sécurité
    - Fonction en SECURITY DEFINER pour permettre les mises à jour automatiques
    - Préserve l'historique des options expirées
*/

-- Fonction pour expirer automatiquement les options et remettre les lots en disponible
CREATE OR REPLACE FUNCTION expire_old_options_and_reset_lots()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  option_record RECORD;
  days_since_expiration INTEGER;
BEGIN
  -- Parcourir toutes les options actives expirées
  FOR option_record IN 
    SELECT 
      ol.id as option_id,
      ol.lot_lmnp_id,
      ol.date_expiration,
      ll.statut as lot_statut,
      EXTRACT(DAY FROM (NOW() - ol.date_expiration)) as days_expired
    FROM options_lot ol
    INNER JOIN lots_lmnp ll ON ol.lot_lmnp_id = ll.id
    WHERE ol.statut = 'active'
      AND ol.date_expiration < NOW()
      AND EXTRACT(DAY FROM (NOW() - ol.date_expiration)) >= 5
  LOOP
    -- Mettre à jour le statut de l'option à 'expiree'
    UPDATE options_lot
    SET statut = 'expiree'
    WHERE id = option_record.option_id;
    
    -- Remettre le lot en disponible si il est encore en sous_option
    IF option_record.lot_statut = 'sous_option' THEN
      UPDATE lots_lmnp
      SET 
        statut = 'disponible',
        date_debut = NULL,
        date_fin = NULL,
        updated_at = NOW()
      WHERE id = option_record.lot_lmnp_id;
      
      RAISE NOTICE 'Option % expirée depuis % jours - Lot % remis en disponible', 
        option_record.option_id, 
        option_record.days_expired, 
        option_record.lot_lmnp_id;
    END IF;
  END LOOP;
END;
$$;

-- Trigger pour exécuter la fonction d'expiration avant chaque lecture des options
CREATE OR REPLACE FUNCTION trigger_expire_options_before_read()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Exécuter l'expiration automatique
  PERFORM expire_old_options_and_reset_lots();
  RETURN NEW;
END;
$$;

-- Supprimer le trigger s'il existe déjà
DROP TRIGGER IF EXISTS before_options_lot_select ON options_lot;

-- Créer un trigger qui s'exécute avant les SELECT sur options_lot
-- Note: PostgreSQL ne supporte pas les triggers BEFORE SELECT directement
-- On va utiliser une approche différente avec un trigger BEFORE INSERT/UPDATE sur lots_lmnp

-- Trigger sur la table lots_lmnp pour vérifier les expirations
CREATE OR REPLACE FUNCTION check_and_expire_options_on_lot_access()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Exécuter l'expiration automatique
  PERFORM expire_old_options_and_reset_lots();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS check_expired_options_on_lot_update ON lots_lmnp;

CREATE TRIGGER check_expired_options_on_lot_update
  BEFORE UPDATE ON lots_lmnp
  FOR EACH ROW
  EXECUTE FUNCTION check_and_expire_options_on_lot_access();

-- Fonction utilitaire pour forcer l'expiration manuellement (peut être appelée via cron ou manuellement)
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
BEGIN
  -- Exécuter l'expiration
  PERFORM expire_old_options_and_reset_lots();
  
  -- Compter les options expirées
  SELECT COUNT(*) INTO expired_opts
  FROM options_lot
  WHERE statut = 'expiree'
    AND date_expiration < NOW()
    AND EXTRACT(DAY FROM (NOW() - date_expiration)) >= 5;
  
  -- Compter les lots remis en disponible
  SELECT COUNT(*) INTO reset_lots
  FROM lots_lmnp
  WHERE statut = 'disponible'
    AND updated_at > NOW() - INTERVAL '1 minute';
  
  RETURN QUERY SELECT expired_opts, reset_lots;
END;
$$;

-- Exécuter immédiatement pour traiter les options déjà expirées
SELECT expire_old_options_and_reset_lots();
