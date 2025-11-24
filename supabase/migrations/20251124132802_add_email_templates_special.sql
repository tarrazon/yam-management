/*
  # Création de la table pour les templates d'emails spéciaux

  1. Nouvelle table
    - `email_templates_special`
      - `id` (uuid, primary key)
      - `code` (text, unique) - Code unique du template (ex: 'birthday')
      - `label` (text) - Libellé du template
      - `description` (text) - Description du template
      - `email_subject` (text) - Sujet de l'email avec variables
      - `email_body` (text) - Corps de l'email avec variables
      - `is_active` (boolean) - Template activé ou non
      - `trigger_type` (text) - Type de déclencheur (ex: 'birthday', 'anniversary')
      - `variables_available` (jsonb) - Liste des variables disponibles
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Sécurité
    - Enable RLS sur `email_templates_special`
    - Politique pour les admins uniquement

  3. Données initiales
    - Template pour les anniversaires
*/

-- Créer la table si elle n'existe pas
CREATE TABLE IF NOT EXISTS email_templates_special (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  label text NOT NULL,
  description text,
  email_subject text NOT NULL,
  email_body text NOT NULL,
  is_active boolean DEFAULT true,
  trigger_type text NOT NULL,
  variables_available jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Activer RLS
ALTER TABLE email_templates_special ENABLE ROW LEVEL SECURITY;

-- Politique pour les admins
CREATE POLICY "Admins can manage special email templates"
  ON email_templates_special
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role_custom = 'admin'
    )
  );

-- Insérer le template d'anniversaire par défaut
INSERT INTO email_templates_special (
  code,
  label,
  description,
  email_subject,
  email_body,
  is_active,
  trigger_type,
  variables_available
)
VALUES (
  'birthday',
  'Anniversaire acquéreur',
  'Email automatique envoyé le jour de l''anniversaire de l''acquéreur',
  'Joyeux anniversaire {{prenom}} ! 🎉',
  E'Bonjour {{prenom}} {{nom}},\n\nToute l''équipe YAM Management vous souhaite un très joyeux anniversaire ! 🎂🎉\n\nNous sommes ravis de vous accompagner dans votre projet immobilier et espérons que cette journée sera remplie de joie et de bonheur.\n\nNous vous remercions pour votre confiance.\n\nBien cordialement,\nL''équipe YAM Management',
  true,
  'birthday',
  '["prenom", "nom", "email"]'::jsonb
)
ON CONFLICT (code) DO UPDATE SET
  label = EXCLUDED.label,
  description = EXCLUDED.description,
  email_subject = EXCLUDED.email_subject,
  email_body = EXCLUDED.email_body,
  variables_available = EXCLUDED.variables_available,
  updated_at = now();
