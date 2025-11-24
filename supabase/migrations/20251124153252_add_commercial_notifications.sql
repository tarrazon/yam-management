/*
  # Système de notifications pour les commerciaux

  1. Nouvelle table
    - `notifications_commerciales`
      - `id` (uuid, primary key)
      - `commercial_id` (uuid, référence vers profiles)
      - `partenaire_id` (uuid, référence vers partenaires)
      - `lot_id` (uuid, référence vers lots_lmnp)
      - `option_id` (uuid, référence vers options_lot)
      - `type` (text: 'option_posee', 'option_expiree', etc.)
      - `titre` (text)
      - `message` (text)
      - `is_read` (boolean, default false)
      - `created_at` (timestamptz)
      - `read_at` (timestamptz, nullable)

  2. Sécurité
    - Enable RLS
    - Les commerciaux peuvent voir leurs propres notifications
    - Les admins peuvent voir toutes les notifications
*/

CREATE TABLE IF NOT EXISTS notifications_commerciales (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  commercial_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  partenaire_id uuid REFERENCES partenaires(id) ON DELETE CASCADE,
  lot_id uuid REFERENCES lots_lmnp(id) ON DELETE CASCADE,
  option_id uuid REFERENCES options_lot(id) ON DELETE CASCADE,
  type text NOT NULL DEFAULT 'option_posee',
  titre text NOT NULL,
  message text NOT NULL,
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  read_at timestamptz,
  CONSTRAINT valid_type CHECK (type IN ('option_posee', 'option_expiree', 'option_transformee', 'autre'))
);

ALTER TABLE notifications_commerciales ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Commerciaux peuvent voir leurs notifications"
  ON notifications_commerciales
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = commercial_id
    OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role_custom = 'admin'
    )
  );

CREATE POLICY "Commerciaux peuvent marquer leurs notifications comme lues"
  ON notifications_commerciales
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = commercial_id)
  WITH CHECK (auth.uid() = commercial_id);

CREATE POLICY "Système peut créer des notifications"
  ON notifications_commerciales
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_notifications_commerciales_commercial_id
  ON notifications_commerciales(commercial_id);

CREATE INDEX IF NOT EXISTS idx_notifications_commerciales_is_read
  ON notifications_commerciales(is_read);

CREATE INDEX IF NOT EXISTS idx_notifications_commerciales_created_at
  ON notifications_commerciales(created_at DESC);
