/*
  # Add GPS coordinates and Street View availability to residences_gestion

  1. Changes
    - Add `latitude` column (decimal) to store GPS latitude
    - Add `longitude` column (decimal) to store GPS longitude
    - Add `street_view_available` column (boolean) to indicate if Street View is available
    - Add `address_verified_at` column (timestamp) to track when address was last verified
  
  2. Purpose
    - Enable precise Street View links using GPS coordinates
    - Track which residences have verified Street View coverage
    - Allow re-verification of addresses over time
*/

DO $$
BEGIN
  -- Add latitude column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'residences_gestion' AND column_name = 'latitude'
  ) THEN
    ALTER TABLE residences_gestion ADD COLUMN latitude DECIMAL(10, 8);
  END IF;

  -- Add longitude column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'residences_gestion' AND column_name = 'longitude'
  ) THEN
    ALTER TABLE residences_gestion ADD COLUMN longitude DECIMAL(11, 8);
  END IF;

  -- Add street_view_available column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'residences_gestion' AND column_name = 'street_view_available'
  ) THEN
    ALTER TABLE residences_gestion ADD COLUMN street_view_available BOOLEAN DEFAULT false;
  END IF;

  -- Add address_verified_at column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'residences_gestion' AND column_name = 'address_verified_at'
  ) THEN
    ALTER TABLE residences_gestion ADD COLUMN address_verified_at TIMESTAMPTZ;
  END IF;
END $$;