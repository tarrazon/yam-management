/*
  # Add notification emails table

  1. New Tables
    - `notification_emails`
      - `id` (uuid, primary key)
      - `email` (text, unique, not null) - Email address to notify
      - `active` (boolean, default true) - Whether notifications are active
      - `created_at` (timestamptz) - When the email was added
      - `created_by` (uuid) - User who added this email
      - `description` (text) - Optional description/note

  2. Security
    - Enable RLS on `notification_emails` table
    - Add policy for admin users to read all notification emails
    - Add policy for admin users to insert notification emails
    - Add policy for admin users to update notification emails
    - Add policy for admin users to delete notification emails

  3. Indexes
    - Index on email for quick lookups
    - Index on active status for filtering
*/

CREATE TABLE IF NOT EXISTS notification_emails (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  active boolean DEFAULT true NOT NULL,
  description text,
  created_at timestamptz DEFAULT now() NOT NULL,
  created_by uuid REFERENCES profiles(id) ON DELETE SET NULL
);

ALTER TABLE notification_emails ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin users can view notification emails"
  ON notification_emails FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role_custom = 'admin'
    )
  );

CREATE POLICY "Admin users can insert notification emails"
  ON notification_emails FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role_custom = 'admin'
    )
  );

CREATE POLICY "Admin users can update notification emails"
  ON notification_emails FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role_custom = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role_custom = 'admin'
    )
  );

CREATE POLICY "Admin users can delete notification emails"
  ON notification_emails FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role_custom = 'admin'
    )
  );

CREATE INDEX IF NOT EXISTS idx_notification_emails_email ON notification_emails(email);
CREATE INDEX IF NOT EXISTS idx_notification_emails_active ON notification_emails(active);