/*
  # Correction des étapes d'appels de fond existantes

  ## Problème
  - Des étapes d'appels de fond avec d'anciennes valeurs existent en base
  - Les étapes affichées dans l'espace admin ne correspondent pas au portail acquéreur
  
  ## Solution
  - Supprimer toutes les anciennes étapes
  - Réinitialiser avec les bonnes étapes pour tous les lots ayant un acquéreur
  
  ## Étapes standard (10)
  1. Signature du contrat de réservation
  2. Offre de prêt signée
  3. Signature de l'acte authentique
  4. Démarrage des travaux
  5. Gros œuvre / Structure
  6. Second œuvre
  7. Finitions intérieures
  8. Réception des travaux
  9. Livraison
  10. Mise en location
*/

-- Fonction pour nettoyer et réinitialiser les étapes d'appels de fond
CREATE OR REPLACE FUNCTION reset_appels_de_fond_for_all_lots()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  lot_record RECORD;
BEGIN
  -- Pour chaque lot ayant un acquéreur
  FOR lot_record IN 
    SELECT id, acquereur_id 
    FROM lots_lmnp 
    WHERE acquereur_id IS NOT NULL
  LOOP
    -- Supprimer les anciennes étapes de ce lot
    DELETE FROM appels_de_fond WHERE lot_id = lot_record.id;
    
    -- Insérer les nouvelles étapes standardisées
    INSERT INTO appels_de_fond (lot_id, acquereur_id, etape, sous_titre, ordre, statut) VALUES
    (lot_record.id, lot_record.acquereur_id, 'Signature du contrat de réservation', 'OFFICIALISATION DE LA RÉSERVATION DE VOTRE LOGEMENT', 1, 'en_attente'),
    (lot_record.id, lot_record.acquereur_id, 'Offre de prêt signée', 'VALIDATION DU FINANCEMENT', 2, 'en_attente'),
    (lot_record.id, lot_record.acquereur_id, 'Signature de l''acte authentique', 'Rendez-vous chez le notaire', 3, 'en_attente'),
    (lot_record.id, lot_record.acquereur_id, 'Démarrage des travaux', 'Curage, sécurisation, démontage installations existantes.', 4, 'en_attente'),
    (lot_record.id, lot_record.acquereur_id, 'Gros œuvre / Structure', 'Réfection ou consolidation des planchers, murs porteurs, charpente.', 5, 'en_attente'),
    (lot_record.id, lot_record.acquereur_id, 'Second œuvre', 'Remplacement menuiseries extérieures, Cloisons, isolation, faux-plafonds, Électricité, plomberie, chauffage', 6, 'en_attente'),
    (lot_record.id, lot_record.acquereur_id, 'Finitions intérieures', 'Sols, murs, peintures, Équipements sanitaires, cuisine, ventilation', 7, 'en_attente'),
    (lot_record.id, lot_record.acquereur_id, 'Réception des travaux', 'Visite avec maître d''œuvre, levée des réserves.', 8, 'en_attente'),
    (lot_record.id, lot_record.acquereur_id, 'Livraison', 'Remise des clés, dossier technique, garanties.', 9, 'en_attente'),
    (lot_record.id, lot_record.acquereur_id, 'Mise en location', 'Nettoyage pro, Reportage photo', 10, 'en_attente');
  END LOOP;
END;
$$;

-- Exécuter la fonction pour corriger les données existantes
SELECT reset_appels_de_fond_for_all_lots();
