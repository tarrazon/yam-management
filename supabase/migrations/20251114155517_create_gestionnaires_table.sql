/*
  # Create gestionnaires table and relationships

  1. New Tables
    - `gestionnaires`
      - `id` (uuid, primary key)
      - `nom_societe` (text) - Company or person name
      - `contact_principal` (text) - Main contact person name
      - `email` (text) - Email address
      - `telephone` (text) - Phone number
      - `adresse` (text) - Address
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `gestionnaires_residences` (junction table)
      - `id` (uuid, primary key)
      - `gestionnaire_id` (uuid, foreign key to gestionnaires)
      - `residence_id` (uuid, foreign key to residences_gestion)
      - `created_at` (timestamptz)
  
  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users to manage gestionnaires
    - Add policies for authenticated users to manage relationships
  
  3. Changes
    - Will deprecate gestionnaire fields in residences_gestion in next migration
*/

-- Create gestionnaires table
CREATE TABLE IF NOT EXISTS gestionnaires (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nom_societe text NOT NULL,
  contact_principal text,
  email text,
  telephone text,
  adresse text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create junction table for many-to-many relationship
CREATE TABLE IF NOT EXISTS gestionnaires_residences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  gestionnaire_id uuid NOT NULL REFERENCES gestionnaires(id) ON DELETE CASCADE,
  residence_id uuid NOT NULL REFERENCES residences_gestion(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(gestionnaire_id, residence_id)
);

-- Enable RLS
ALTER TABLE gestionnaires ENABLE ROW LEVEL SECURITY;
ALTER TABLE gestionnaires_residences ENABLE ROW LEVEL SECURITY;

-- Policies for gestionnaires
CREATE POLICY "Users can view gestionnaires"
  ON gestionnaires FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert gestionnaires"
  ON gestionnaires FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update gestionnaires"
  ON gestionnaires FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can delete gestionnaires"
  ON gestionnaires FOR DELETE
  TO authenticated
  USING (true);

-- Policies for gestionnaires_residences
CREATE POLICY "Users can view gestionnaire-residence relationships"
  ON gestionnaires_residences FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert gestionnaire-residence relationships"
  ON gestionnaires_residences FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update gestionnaire-residence relationships"
  ON gestionnaires_residences FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can delete gestionnaire-residence relationships"
  ON gestionnaires_residences FOR DELETE
  TO authenticated
  USING (true);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_gestionnaires_residences_gestionnaire 
  ON gestionnaires_residences(gestionnaire_id);

CREATE INDEX IF NOT EXISTS idx_gestionnaires_residences_residence 
  ON gestionnaires_residences(residence_id);

-- Add trigger to update updated_at
CREATE OR REPLACE FUNCTION update_gestionnaires_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'trigger_update_gestionnaires_updated_at'
  ) THEN
    CREATE TRIGGER trigger_update_gestionnaires_updated_at
      BEFORE UPDATE ON gestionnaires
      FOR EACH ROW
      EXECUTE FUNCTION update_gestionnaires_updated_at();
  END IF;
END $$;