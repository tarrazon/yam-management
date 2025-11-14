/*
  # Créer la table de statistiques de vues

  1. Table `vues_stats`
    - `id` (uuid, primary key)
    - `entity_type` (text) - Type d'entité: 'lot' ou 'residence'
    - `entity_id` (uuid) - ID de l'entité vue
    - `entity_name` (text) - Nom/référence de l'entité (dénormalisé pour faciliter les requêtes)
    - `user_id` (uuid, référence profiles) - Utilisateur qui a vu
    - `user_email` (text) - Email de l'utilisateur (dénormalisé)
    - `user_role` (text) - Rôle de l'utilisateur (admin/partenaire)
    - `partenaire_id` (uuid, nullable) - ID du partenaire si applicable
    - `partenaire_nom` (text, nullable) - Nom du partenaire (dénormalisé)
    - `viewed_at` (timestamptz) - Date et heure de la vue
    - `created_at` (timestamptz)

  2. Index
    - Index sur entity_type et entity_id pour les statistiques
    - Index sur user_id pour les requêtes par utilisateur
    - Index sur viewed_at pour les requêtes temporelles

  3. RLS
    - Les admins peuvent tout voir
    - Les partenaires ne peuvent voir que leurs propres vues
    - Tous les utilisateurs authentifiés peuvent insérer des vues
*/

-- Créer la table vues_stats
CREATE TABLE IF NOT EXISTS vues_stats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type text NOT NULL CHECK (entity_type IN ('lot', 'residence')),
  entity_id uuid NOT NULL,
  entity_name text NOT NULL DEFAULT '',
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  user_email text NOT NULL DEFAULT '',
  user_role text NOT NULL DEFAULT '',
  partenaire_id uuid REFERENCES partenaires(id) ON DELETE SET NULL,
  partenaire_nom text,
  viewed_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Créer les index pour optimiser les requêtes
CREATE INDEX IF NOT EXISTS idx_vues_stats_entity ON vues_stats(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_vues_stats_user ON vues_stats(user_id);
CREATE INDEX IF NOT EXISTS idx_vues_stats_viewed_at ON vues_stats(viewed_at);
CREATE INDEX IF NOT EXISTS idx_vues_stats_partenaire ON vues_stats(partenaire_id) WHERE partenaire_id IS NOT NULL;

-- Activer RLS
ALTER TABLE vues_stats ENABLE ROW LEVEL SECURITY;

-- Policy pour admins: lecture complète
CREATE POLICY "Admins can view all stats"
  ON vues_stats FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role_custom = 'admin'
    )
  );

-- Policy pour partenaires: lecture de leurs propres vues uniquement
CREATE POLICY "Partenaires can view own stats"
  ON vues_stats FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role_custom = 'partenaire'
      AND profiles.partenaire_id = vues_stats.partenaire_id
    )
  );

-- Policy pour insertion: tous les utilisateurs authentifiés peuvent créer des vues
CREATE POLICY "Authenticated users can insert views"
  ON vues_stats FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = auth.uid()
  );

-- Ajouter un trigger pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.created_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_vues_stats_updated_at ON vues_stats;
CREATE TRIGGER update_vues_stats_updated_at
  BEFORE UPDATE ON vues_stats
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();