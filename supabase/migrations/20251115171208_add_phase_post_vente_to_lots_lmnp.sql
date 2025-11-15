/*
  # Ajout du champ phase_post_vente pour suivi détaillé

  1. Modifications
    - Ajout de la colonne `phase_post_vente` à la table `lots_lmnp`
      - Type: text avec valeurs prédéfinies
      - Valeurs possibles: 'suivi_post_vente', 'archive'
      - Par défaut: null (pour les lots non vendus ou ventes récentes)
    
  2. Notes
    - Ce champ permet de suivre les phases après la vente finalisée
    - Utilisé uniquement quand statut = 'vendu'
    - Permet une progression visuelle au-delà de la simple vente
*/

-- Ajouter la colonne phase_post_vente
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'lots_lmnp' AND column_name = 'phase_post_vente'
  ) THEN
    ALTER TABLE lots_lmnp 
    ADD COLUMN phase_post_vente text CHECK (phase_post_vente IN ('suivi_post_vente', 'archive'));
  END IF;
END $$;

-- Ajouter un commentaire
COMMENT ON COLUMN lots_lmnp.phase_post_vente IS 'Phase après vente: suivi_post_vente ou archive';
