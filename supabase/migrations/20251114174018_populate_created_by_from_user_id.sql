/*
  # Populate created_by field from user_id

  1. Changes
    - Update existing partenaires to populate created_by from profiles.email based on user_id
    - This ensures existing records are properly attributed to their creators
  
  2. Notes
    - Only updates records where created_by is null and user_id exists
*/

-- Populate created_by from profiles.email based on user_id
UPDATE partenaires
SET created_by = profiles.email
FROM profiles
WHERE partenaires.user_id = profiles.id
  AND partenaires.created_by IS NULL;