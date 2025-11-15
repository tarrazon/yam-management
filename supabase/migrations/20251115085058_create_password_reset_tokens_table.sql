/*
  # Create password reset tokens table

  1. New Tables
    - `password_reset_tokens`
      - `id` (uuid, primary key)
      - `email` (text, not null)
      - `token` (text, unique, not null)
      - `expires_at` (timestamptz, not null)
      - `used` (boolean, default false)
      - `created_at` (timestamptz, default now())
  
  2. Security
    - Enable RLS on `password_reset_tokens` table
    - Only service role can access this table (no public policies)
  
  3. Indexes
    - Index on token for fast lookup
    - Index on email for user queries
*/

CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  token text UNIQUE NOT NULL,
  expires_at timestamptz NOT NULL,
  used boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS (locked down by default, only service role can access)
ALTER TABLE password_reset_tokens ENABLE ROW LEVEL SECURITY;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_token ON password_reset_tokens(token);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_email ON password_reset_tokens(email);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_expires_at ON password_reset_tokens(expires_at);

-- Fonction pour nettoyer les tokens expirés (à exécuter périodiquement)
CREATE OR REPLACE FUNCTION cleanup_expired_reset_tokens()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM password_reset_tokens
  WHERE expires_at < now() OR used = true;
END;
$$;