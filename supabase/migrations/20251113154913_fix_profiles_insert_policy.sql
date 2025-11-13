/*
  # Fix profiles INSERT policy

  1. Changes
    - Add policy to allow users to create their own profile during signup
    - This allows the AuthContext signUp function to insert the profile
  
  2. Security
    - Users can only insert a profile with their own user ID
    - This prevents users from creating profiles for other users
*/

-- Drop existing restrictive insert policy if it exists
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;

-- Create new policy that allows users to create their own profile
CREATE POLICY "Users can insert own profile"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);
