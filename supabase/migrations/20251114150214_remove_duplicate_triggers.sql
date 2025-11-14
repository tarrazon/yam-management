/*
  # Supprimer les triggers en doublon

  1. Problème
    - Il existe deux séries de triggers qui synchronisent le statut des lots
    - `trigger_sync_lot_on_option_*` (anciens) utilisant `sync_lot_statut_on_option_change`
    - `sync_lot_statut_after_option_*` (nouveaux) utilisant `sync_lot_statut_from_options`
    - Cette duplication cause des problèmes de synchronisation

  2. Solution
    - Supprimer les anciens triggers et leur fonction
    - Garder uniquement les nouveaux triggers qui sont mieux implémentés
*/

-- Supprimer les anciens triggers
DROP TRIGGER IF EXISTS trigger_sync_lot_on_option_insert ON options_lot;
DROP TRIGGER IF EXISTS trigger_sync_lot_on_option_update ON options_lot;
DROP TRIGGER IF EXISTS trigger_sync_lot_on_option_delete ON options_lot;

-- Supprimer l'ancienne fonction
DROP FUNCTION IF EXISTS sync_lot_statut_on_option_change();

-- Vérifier et corriger tous les lots qui ont une option active mais ne sont pas en sous_option
UPDATE lots_lmnp
SET statut = 'sous_option'
WHERE id IN (
  SELECT DISTINCT lot_lmnp_id 
  FROM options_lot 
  WHERE statut = 'active'
)
AND statut NOT IN ('sous_option', 'reserve', 'allotement', 'compromis', 'vendu');