/*
  # Allow commercials to create and manage partenaires

  1. Changes
    - Add policy for commercials to insert partenaires
    - Add policy for commercials to update partenaires
    - This allows commercial users to add new partners in the system
  
  2. Security
    - Only authenticated users with role_custom = 'commercial' or 'admin' can create partenaires
    - Maintains read access for all authenticated users
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Admins can manage partenaires" ON partenaires;
DROP POLICY IF EXISTS "Authenticated users can view partenaires" ON partenaires;
DROP POLICY IF EXISTS "All authenticated users can view partenaires" ON partenaires;
DROP POLICY IF EXISTS "Admins and commercials can create partenaires" ON partenaires;
DROP POLICY IF EXISTS "Admins and commercials can update partenaires" ON partenaires;
DROP POLICY IF EXISTS "Only admins can delete partenaires" ON partenaires;

-- SELECT: All authenticated users can view
CREATE POLICY "All authenticated users can view partenaires"
  ON partenaires FOR SELECT
  TO authenticated
  USING (true);

-- INSERT: Admins and commercials can create
CREATE POLICY "Admins and commercials can create partenaires"
  ON partenaires FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role_custom IN ('admin', 'commercial')
    )
  );

-- UPDATE: Admins and commercials can update
CREATE POLICY "Admins and commercials can update partenaires"
  ON partenaires FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role_custom IN ('admin', 'commercial')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role_custom IN ('admin', 'commercial')
    )
  );

-- DELETE: Only admins can delete
CREATE POLICY "Only admins can delete partenaires"
  ON partenaires FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role_custom = 'admin'
    )
  );