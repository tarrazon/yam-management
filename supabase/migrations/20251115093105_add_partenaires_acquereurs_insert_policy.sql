/*
  # Allow partners to create their own acquereurs

  1. Changes
    - Add INSERT policy for partners to create acquereurs with their own partenaire_id
    - Add UPDATE policy for partners to update their own acquereurs
    - Add DELETE policy for partners to delete their own acquereurs
  
  2. Security
    - Partners can only create acquereurs with their own partenaire_id
    - Partners can only update/delete acquereurs linked to their partenaire_id
*/

-- Allow partners to insert acquereurs with their own partenaire_id
CREATE POLICY "Partners can create their own acquereurs"
  ON acquereurs
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role_custom = 'partenaire'
      AND profiles.partenaire_id = acquereurs.partenaire_id
    )
  );

-- Allow partners to update their own acquereurs
CREATE POLICY "Partners can update their own acquereurs"
  ON acquereurs
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role_custom = 'partenaire'
      AND profiles.partenaire_id = acquereurs.partenaire_id
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role_custom = 'partenaire'
      AND profiles.partenaire_id = acquereurs.partenaire_id
    )
  );

-- Allow partners to delete their own acquereurs
CREATE POLICY "Partners can delete their own acquereurs"
  ON acquereurs
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role_custom = 'partenaire'
      AND profiles.partenaire_id = acquereurs.partenaire_id
    )
  );
