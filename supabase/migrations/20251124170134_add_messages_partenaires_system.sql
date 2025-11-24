/*
  # Add Partner Messaging System

  1. New Tables
    - `messages_partenaires`
      - `id` (uuid, primary key)
      - `partenaire_id` (uuid, foreign key to partenaires)
      - `expediteur_type` (text) - 'admin' or 'partenaire'
      - `expediteur_id` (uuid) - ID of the sender user
      - `message` (text) - Message content
      - `lu` (boolean) - Read status
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on `messages_partenaires` table
    - Add policy for admins to read/write all messages
    - Add policy for partners to read/write their own messages

  3. Important Notes
    - System mirrors the existing messages_admin structure for acquéreurs
    - Partners can only access messages for their own account
    - Admins have full access to all partner messages
*/

CREATE TABLE IF NOT EXISTS messages_partenaires (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  partenaire_id uuid REFERENCES partenaires(id) ON DELETE CASCADE,
  expediteur_type text NOT NULL CHECK (expediteur_type IN ('admin', 'partenaire')),
  expediteur_id uuid,
  message text NOT NULL,
  lu boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE messages_partenaires ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all partner messages"
  ON messages_partenaires FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role_custom IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Admins can insert partner messages"
  ON messages_partenaires FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role_custom IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Admins can update partner messages"
  ON messages_partenaires FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role_custom IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Partners can view their own messages"
  ON messages_partenaires FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM partenaires
      WHERE partenaires.id = messages_partenaires.partenaire_id
      AND partenaires.user_id = auth.uid()
    )
  );

CREATE POLICY "Partners can insert their own messages"
  ON messages_partenaires FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM partenaires
      WHERE partenaires.id = partenaire_id
      AND partenaires.user_id = auth.uid()
    )
    AND expediteur_type = 'partenaire'
  );

CREATE POLICY "Partners can update their own messages"
  ON messages_partenaires FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM partenaires
      WHERE partenaires.id = messages_partenaires.partenaire_id
      AND partenaires.user_id = auth.uid()
    )
  );

CREATE INDEX IF NOT EXISTS idx_messages_partenaires_partenaire_id 
  ON messages_partenaires(partenaire_id);
CREATE INDEX IF NOT EXISTS idx_messages_partenaires_created_at 
  ON messages_partenaires(created_at);
CREATE INDEX IF NOT EXISTS idx_messages_partenaires_lu 
  ON messages_partenaires(lu);
