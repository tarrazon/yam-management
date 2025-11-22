/*
  # Mise à jour des étapes d'appels de fond

  ## Modifications
  
  1. Nouvelles étapes détaillées du processus de construction
    - Signature du contrat de réservation
    - Offre de prêt signée
    - Signature de l'acte authentique
    - Démarrage des travaux
    - Gros œuvre / Structure
    - Second œuvre
    - Finitions intérieures
    - Réception des travaux
    - Livraison
    - Mise en location

  2. Ajout de champs supplémentaires
    - sous_titre: Description courte de l'étape
    - montant: Montant de l'appel de fond (optionnel)
    - pourcentage: Pourcentage du montant total (optionnel)
    - documents_requis: Liste des documents requis pour valider l'étape

  3. Modification du statut
    - en_attente: En attente de validation admin
    - valide: Validé par l'admin (peut être dévalidé)
    - complete: Étape terminée

  ## Notes
  - Les admins peuvent valider/dévalider les étapes à tout moment
  - Les étapes sont affichées en frise chronologique
  - Chaque étape peut avoir un montant et/ou un pourcentage
*/

-- Ajout des nouvelles colonnes
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'appels_de_fond' AND column_name = 'sous_titre'
  ) THEN
    ALTER TABLE appels_de_fond ADD COLUMN sous_titre text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'appels_de_fond' AND column_name = 'montant'
  ) THEN
    ALTER TABLE appels_de_fond ADD COLUMN montant numeric(12,2);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'appels_de_fond' AND column_name = 'pourcentage'
  ) THEN
    ALTER TABLE appels_de_fond ADD COLUMN pourcentage numeric(5,2);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'appels_de_fond' AND column_name = 'documents_requis'
  ) THEN
    ALTER TABLE appels_de_fond ADD COLUMN documents_requis text[];
  END IF;
END $$;

-- Supprimer l'ancienne contrainte
ALTER TABLE appels_de_fond DROP CONSTRAINT IF EXISTS appels_de_fond_statut_check;

-- Migrer les anciennes valeurs de statut
UPDATE appels_de_fond SET statut = 'valide' WHERE statut = 'valide_admin';

-- Ajouter la nouvelle contrainte
ALTER TABLE appels_de_fond ADD CONSTRAINT appels_de_fond_statut_check 
  CHECK (statut IN ('en_attente', 'valide', 'complete'));

-- Fonction pour initialiser les étapes d'appels de fond pour un lot
CREATE OR REPLACE FUNCTION init_appels_de_fond_for_lot(p_lot_id uuid, p_acquereur_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Supprimer les anciennes étapes si elles existent
  DELETE FROM appels_de_fond WHERE lot_id = p_lot_id;

  -- Insérer les nouvelles étapes
  INSERT INTO appels_de_fond (lot_id, acquereur_id, etape, sous_titre, ordre, statut) VALUES
  (p_lot_id, p_acquereur_id, 'Signature du contrat de réservation', 'OFFICIALISATION DE LA RÉSERVATION DE VOTRE LOGEMENT', 1, 'en_attente'),
  (p_lot_id, p_acquereur_id, 'Offre de prêt signée', 'VALIDATION DU FINANCEMENT', 2, 'en_attente'),
  (p_lot_id, p_acquereur_id, 'Signature de l''acte authentique', 'Rendez-vous chez le notaire', 3, 'en_attente'),
  (p_lot_id, p_acquereur_id, 'Démarrage des travaux', 'Curage, sécurisation, démontage installations existantes.', 4, 'en_attente'),
  (p_lot_id, p_acquereur_id, 'Gros œuvre / Structure', 'Réfection ou consolidation des planchers, murs porteurs, charpente.', 5, 'en_attente'),
  (p_lot_id, p_acquereur_id, 'Second œuvre', 'Remplacement menuiseries extérieures, Cloisons, isolation, faux-plafonds, Électricité, plomberie, chauffage', 6, 'en_attente'),
  (p_lot_id, p_acquereur_id, 'Finitions intérieures', 'Sols, murs, peintures, Équipements sanitaires, cuisine, ventilation', 7, 'en_attente'),
  (p_lot_id, p_acquereur_id, 'Réception des travaux', 'Visite avec maître d''œuvre, levée des réserves.', 8, 'en_attente'),
  (p_lot_id, p_acquereur_id, 'Livraison', 'Remise des clés, dossier technique, garanties.', 9, 'en_attente'),
  (p_lot_id, p_acquereur_id, 'Mise en location', 'Nettoyage pro, Reportage photo', 10, 'en_attente');
END;
$$;
