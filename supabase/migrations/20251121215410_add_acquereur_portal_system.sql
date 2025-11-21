/*
  # Système Espace Client Acquéreur
  
  1. Nouvelles Tables
    - appels_de_fond: Système appel de fonds avec validation admin
    - faq: Questions fréquentes pour tous les clients
    - galerie_photos: Photos du logement pour acquéreur
    - messages_admin: Messagerie entre admin et acquéreur
    
  2. Modifications Tables Existantes
    - Ajouter user_id à acquereurs pour lier au compte utilisateur
    - Ajouter role acquereur dans profiles
    
  3. Sécurité
    - RLS sur toutes les tables
    - Acquéreurs ne voient que leurs propres données
    - Admins et commerciaux ont accès complet
*/

-- Ajouter user_id à la table acquereurs
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'acquereurs' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE acquereurs ADD COLUMN user_id uuid REFERENCES profiles(id);
    CREATE INDEX IF NOT EXISTS idx_acquereurs_user_id ON acquereurs(user_id);
  END IF;
END $$;

-- Table appels_de_fond
CREATE TABLE IF NOT EXISTS appels_de_fond (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lot_id uuid REFERENCES lots_lmnp(id) ON DELETE CASCADE,
  acquereur_id uuid REFERENCES acquereurs(id) ON DELETE CASCADE,
  etape text NOT NULL,
  description text,
  ordre integer NOT NULL DEFAULT 0,
  statut text NOT NULL DEFAULT 'en_attente' CHECK (statut IN ('en_attente', 'valide_admin', 'complete')),
  date_validation_admin timestamptz,
  valide_par uuid REFERENCES profiles(id),
  date_completion timestamptz,
  notes_admin text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_appels_de_fond_lot_id ON appels_de_fond(lot_id);
CREATE INDEX IF NOT EXISTS idx_appels_de_fond_acquereur_id ON appels_de_fond(acquereur_id);

-- Table faq
CREATE TABLE IF NOT EXISTS faq (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question text NOT NULL,
  reponse text NOT NULL,
  categorie text,
  ordre integer NOT NULL DEFAULT 0,
  actif boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES profiles(id)
);

CREATE INDEX IF NOT EXISTS idx_faq_actif ON faq(actif);
CREATE INDEX IF NOT EXISTS idx_faq_categorie ON faq(categorie);

-- Table galerie_photos
CREATE TABLE IF NOT EXISTS galerie_photos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lot_id uuid REFERENCES lots_lmnp(id) ON DELETE CASCADE,
  titre text,
  photo_url text NOT NULL,
  description text,
  ordre integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_galerie_photos_lot_id ON galerie_photos(lot_id);

-- Table messages_admin
CREATE TABLE IF NOT EXISTS messages_admin (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  acquereur_id uuid REFERENCES acquereurs(id) ON DELETE CASCADE,
  expediteur_type text NOT NULL CHECK (expediteur_type IN ('admin', 'acquereur')),
  expediteur_id uuid REFERENCES profiles(id),
  message text NOT NULL,
  lu boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_messages_admin_acquereur_id ON messages_admin(acquereur_id);
CREATE INDEX IF NOT EXISTS idx_messages_admin_lu ON messages_admin(lu);

-- Activer RLS sur toutes les nouvelles tables
ALTER TABLE appels_de_fond ENABLE ROW LEVEL SECURITY;
ALTER TABLE faq ENABLE ROW LEVEL SECURITY;
ALTER TABLE galerie_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages_admin ENABLE ROW LEVEL SECURITY;

-- Policies pour appels_de_fond
CREATE POLICY "Admins et commerciaux peuvent tout voir sur appels_de_fond"
  ON appels_de_fond FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role_custom IN ('admin', 'commercial')
    )
  );

CREATE POLICY "Acquéreurs peuvent voir leurs appels de fond"
  ON appels_de_fond FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM acquereurs
      WHERE acquereurs.id = appels_de_fond.acquereur_id
      AND acquereurs.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins et commerciaux peuvent créer des appels de fond"
  ON appels_de_fond FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role_custom IN ('admin', 'commercial')
    )
  );

CREATE POLICY "Admins et commerciaux peuvent modifier les appels de fond"
  ON appels_de_fond FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role_custom IN ('admin', 'commercial')
    )
  );

CREATE POLICY "Admins peuvent supprimer les appels de fond"
  ON appels_de_fond FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role_custom = 'admin'
    )
  );

-- Policies pour faq
CREATE POLICY "Tout le monde authentifié peut voir les FAQ actives"
  ON faq FOR SELECT
  TO authenticated
  USING (actif = true);

CREATE POLICY "Admins peuvent voir toutes les FAQ"
  ON faq FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role_custom = 'admin'
    )
  );

CREATE POLICY "Admins peuvent créer des FAQ"
  ON faq FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role_custom = 'admin'
    )
  );

CREATE POLICY "Admins peuvent modifier les FAQ"
  ON faq FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role_custom = 'admin'
    )
  );

CREATE POLICY "Admins peuvent supprimer les FAQ"
  ON faq FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role_custom = 'admin'
    )
  );

-- Policies pour galerie_photos
CREATE POLICY "Admins et commerciaux peuvent voir toutes les photos"
  ON galerie_photos FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role_custom IN ('admin', 'commercial')
    )
  );

CREATE POLICY "Acquéreurs peuvent voir les photos de leur lot"
  ON galerie_photos FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM acquereurs
      JOIN lots_lmnp ON lots_lmnp.acquereur_id = acquereurs.id
      WHERE lots_lmnp.id = galerie_photos.lot_id
      AND acquereurs.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins et commerciaux peuvent créer des photos"
  ON galerie_photos FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role_custom IN ('admin', 'commercial')
    )
  );

CREATE POLICY "Admins et commerciaux peuvent modifier les photos"
  ON galerie_photos FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role_custom IN ('admin', 'commercial')
    )
  );

CREATE POLICY "Admins peuvent supprimer les photos"
  ON galerie_photos FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role_custom = 'admin'
    )
  );

-- Policies pour messages_admin
CREATE POLICY "Admins et commerciaux peuvent voir tous les messages"
  ON messages_admin FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role_custom IN ('admin', 'commercial')
    )
  );

CREATE POLICY "Acquéreurs peuvent voir leurs messages"
  ON messages_admin FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM acquereurs
      WHERE acquereurs.id = messages_admin.acquereur_id
      AND acquereurs.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins et commerciaux peuvent envoyer des messages"
  ON messages_admin FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role_custom IN ('admin', 'commercial')
    )
    OR
    (
      expediteur_type = 'acquereur'
      AND EXISTS (
        SELECT 1 FROM acquereurs
        WHERE acquereurs.id = messages_admin.acquereur_id
        AND acquereurs.user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Admins peuvent marquer les messages comme lus"
  ON messages_admin FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role_custom IN ('admin', 'commercial')
    )
  );