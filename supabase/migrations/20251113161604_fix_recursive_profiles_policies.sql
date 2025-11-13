/*
  # Fix recursive RLS policies on profiles table

  1. Changes
    - Drop the recursive "Admins can view all profiles" policy
    - Replace with a simpler policy using JWT claims
    - Keep other policies intact
    
  2. Security
    - Users can still view their own profile
    - Users can update their own profile
    - Admins can view all profiles using a non-recursive check
*/

-- Drop the problematic recursive policy
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;

-- Create a new non-recursive policy for admins
-- This uses the app_metadata from JWT which doesn't require querying profiles table
CREATE POLICY "Admins can view all profiles using JWT"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (
    auth.jwt()->>'role_custom' = 'admin' 
    OR auth.uid() = id
  );
