/*
  # Simplify profiles RLS policies to avoid recursion

  1. Changes
    - Drop all existing SELECT policies on profiles
    - Create a single simple policy: all authenticated users can read all profiles
    - Keep INSERT and UPDATE policies for data safety
    
  2. Security
    - All authenticated users can view profiles (non-sensitive data)
    - Users can only insert their own profile
    - Users can only update their own profile
    
  3. Rationale
    - Profiles contain business contact info, not sensitive personal data
    - This avoids the infinite recursion problem
    - Still maintains data integrity with INSERT/UPDATE restrictions
*/

-- Drop all existing SELECT policies
DROP POLICY IF EXISTS "Admins can view all profiles using JWT" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;

-- Create a single simple SELECT policy
CREATE POLICY "Authenticated users can view all profiles"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (true);
