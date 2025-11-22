/*
  # Création de la table galerie_photos pour les photos par lot

  ## Problème
  - Les photos sont actuellement stockées dans un champ JSONB dans la table acquereurs
  - Impossible de distinguer les photos entre les différents lots d'un même acquéreur
  
  ## Solution
  - Créer une table galerie_photos dédiée avec relation vers lots_lmnp
  - Chaque photo est liée à un lot spécifique
  - Permet un suivi photo indépendant par lot
  
  ## Tables créées
  - galerie_photos
    - id (uuid, primary key)
    - lot_id (uuid, foreign key vers lots_lmnp)
    - url (text, URL de la photo dans Supabase Storage)
    - legende (text, description/légende de la photo)
    - categorie (text, catégorie: travaux, avant, apres, visite, etc.)
    - ordre (integer, ordre d'affichage)
    - uploaded_by (uuid, qui a uploadé la photo)
    - created_at (timestamptz)
    - updated_at (timestamptz)
  
  ## Sécurité
  - RLS activé
  - Admins peuvent tout faire
  - Acquéreurs peuvent voir uniquement les photos de leurs lots
*/

-- Créer la table galerie_photos
CREATE TABLE IF NOT EXISTS galerie_photos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lot_id uuid NOT NULL REFERENCES lots_lmnp(id) ON DELETE CASCADE,
  url text NOT NULL,
  legende text,
  categorie text,
  ordre integer DEFAULT 0,
  uploaded_by uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Index pour performance
CREATE INDEX IF NOT EXISTS idx_galerie_photos_lot_id ON galerie_photos(lot_id);
CREATE INDEX IF NOT EXISTS idx_galerie_photos_ordre ON galerie_photos(ordre);

-- Activer RLS
ALTER TABLE galerie_photos ENABLE ROW LEVEL SECURITY;

-- Politique pour les admins (lecture et écriture complète)
CREATE POLICY "Admins peuvent tout faire sur galerie_photos"
  ON galerie_photos
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role_custom IN ('admin', 'super_admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role_custom IN ('admin', 'super_admin')
    )
  );

-- Politique pour les acquéreurs (lecture uniquement de leurs lots)
CREATE POLICY "Acquereurs peuvent voir les photos de leurs lots"
  ON galerie_photos
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM lots_lmnp l
      INNER JOIN acquereurs a ON l.acquereur_id = a.id
      WHERE l.id = galerie_photos.lot_id
      AND a.user_id = auth.uid()
    )
  );

-- Fonction pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION update_galerie_photos_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour updated_at
DROP TRIGGER IF EXISTS trigger_update_galerie_photos_updated_at ON galerie_photos;
CREATE TRIGGER trigger_update_galerie_photos_updated_at
  BEFORE UPDATE ON galerie_photos
  FOR EACH ROW
  EXECUTE FUNCTION update_galerie_photos_updated_at();
