/*
  # Create Initial Schema for Prestige Immo

  1. New Tables
    - `profiles`
      - `id` (uuid, references auth.users)
      - `email` (text)
      - `nom` (text)
      - `prenom` (text)
      - `telephone` (text)
      - `role_custom` (text) - 'admin', 'commercial', 'partenaire'
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `residences`
      - `id` (uuid, primary key)
      - `nom` (text)
      - `adresse` (text)
      - `ville` (text)
      - `code_postal` (text)
      - `description` (text)
      - `type_residence` (text)
      - `nombre_lots` (integer)
      - `date_livraison` (date)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `residences_gestion`
      - `id` (uuid, primary key)
      - `nom` (text)
      - `adresse` (text)
      - `ville` (text)
      - `code_postal` (text)
      - `pays` (text)
      - `latitude` (numeric)
      - `longitude` (numeric)
      - `description` (text)
      - `type_residence` (text)
      - `nombre_lots` (integer)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `lots`
      - `id` (uuid, primary key)
      - `residence_id` (uuid, references residences)
      - `numero` (text)
      - `type` (text)
      - `surface` (numeric)
      - `prix` (numeric)
      - `etage` (integer)
      - `statut` (text) - 'disponible', 'reserve', 'vendu'
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `lots_lmnp`
      - `id` (uuid, primary key)
      - `residence_gestion_id` (uuid, references residences_gestion)
      - `numero` (text)
      - `type` (text)
      - `surface` (numeric)
      - `prix` (numeric)
      - `etage` (integer)
      - `statut` (text) - 'disponible', 'option', 'reserve', 'vendu'
      - `partenaire_id` (uuid, references profiles)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `clients`
      - `id` (uuid, primary key)
      - `nom` (text)
      - `prenom` (text)
      - `email` (text)
      - `telephone` (text)
      - `adresse` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `acquereurs`
      - `id` (uuid, primary key)
      - `nom` (text)
      - `prenom` (text)
      - `email` (text)
      - `telephone` (text)
      - `adresse` (text)
      - `type_acquereur` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `vendeurs`
      - `id` (uuid, primary key)
      - `nom` (text)
      - `prenom` (text)
      - `email` (text)
      - `telephone` (text)
      - `societe` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `partenaires`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `nom_societe` (text)
      - `siret` (text)
      - `adresse` (text)
      - `telephone` (text)
      - `email` (text)
      - `statut` (text) - 'actif', 'inactif', 'en_attente'
      - `commission_taux` (numeric)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `notaires`
      - `id` (uuid, primary key)
      - `nom` (text)
      - `prenom` (text)
      - `office` (text)
      - `email` (text)
      - `telephone` (text)
      - `adresse` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `reservations`
      - `id` (uuid, primary key)
      - `lot_id` (uuid, references lots)
      - `client_id` (uuid, references clients)
      - `date_reservation` (date)
      - `statut` (text) - 'en_cours', 'confirmee', 'annulee'
      - `montant` (numeric)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `dossiers_vente`
      - `id` (uuid, primary key)
      - `lot_id` (uuid, references lots)
      - `acquereur_id` (uuid, references acquereurs)
      - `notaire_id` (uuid, references notaires)
      - `statut` (text) - 'en_preparation', 'en_cours', 'finalise'
      - `date_signature` (date)
      - `montant_total` (numeric)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `options_lot`
      - `id` (uuid, primary key)
      - `lot_lmnp_id` (uuid, references lots_lmnp)
      - `partenaire_id` (uuid, references partenaires)
      - `acquereur_id` (uuid, references acquereurs)
      - `date_option` (date)
      - `date_expiration` (date)
      - `statut` (text) - 'active', 'expiree', 'convertie', 'annulee'
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `contacts_residence`
      - `id` (uuid, primary key)
      - `residence_gestion_id` (uuid, references residences_gestion)
      - `nom` (text)
      - `prenom` (text)
      - `fonction` (text)
      - `email` (text)
      - `telephone` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users based on their role
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  nom text,
  prenom text,
  telephone text,
  role_custom text NOT NULL DEFAULT 'commercial',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role_custom = 'admin'
    )
  );

-- Create residences table
CREATE TABLE IF NOT EXISTS residences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nom text NOT NULL,
  adresse text,
  ville text,
  code_postal text,
  description text,
  type_residence text,
  nombre_lots integer DEFAULT 0,
  date_livraison date,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE residences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view residences"
  ON residences FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can insert residences"
  ON residences FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role_custom = 'admin'
    )
  );

CREATE POLICY "Admins can update residences"
  ON residences FOR UPDATE
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

CREATE POLICY "Admins can delete residences"
  ON residences FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role_custom = 'admin'
    )
  );

-- Create residences_gestion table
CREATE TABLE IF NOT EXISTS residences_gestion (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nom text NOT NULL,
  adresse text,
  ville text,
  code_postal text,
  pays text DEFAULT 'France',
  latitude numeric,
  longitude numeric,
  description text,
  type_residence text,
  nombre_lots integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE residences_gestion ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view residences gestion"
  ON residences_gestion FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage residences gestion"
  ON residences_gestion FOR ALL
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

-- Create lots table
CREATE TABLE IF NOT EXISTS lots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  residence_id uuid REFERENCES residences(id) ON DELETE CASCADE,
  numero text NOT NULL,
  type text,
  surface numeric,
  prix numeric,
  etage integer,
  statut text DEFAULT 'disponible',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE lots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view lots"
  ON lots FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage lots"
  ON lots FOR ALL
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

-- Create lots_lmnp table
CREATE TABLE IF NOT EXISTS lots_lmnp (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  residence_gestion_id uuid REFERENCES residences_gestion(id) ON DELETE CASCADE,
  numero text NOT NULL,
  type text,
  surface numeric,
  prix numeric,
  etage integer,
  statut text DEFAULT 'disponible',
  partenaire_id uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE lots_lmnp ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view lots LMNP"
  ON lots_lmnp FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage lots LMNP"
  ON lots_lmnp FOR ALL
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

-- Create clients table
CREATE TABLE IF NOT EXISTS clients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nom text NOT NULL,
  prenom text NOT NULL,
  email text,
  telephone text,
  adresse text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view clients"
  ON clients FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins and commercials can manage clients"
  ON clients FOR ALL
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

-- Create acquereurs table
CREATE TABLE IF NOT EXISTS acquereurs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nom text NOT NULL,
  prenom text NOT NULL,
  email text,
  telephone text,
  adresse text,
  type_acquereur text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE acquereurs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view acquereurs"
  ON acquereurs FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins and commercials can manage acquereurs"
  ON acquereurs FOR ALL
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

-- Create vendeurs table
CREATE TABLE IF NOT EXISTS vendeurs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nom text NOT NULL,
  prenom text NOT NULL,
  email text,
  telephone text,
  societe text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE vendeurs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view vendeurs"
  ON vendeurs FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage vendeurs"
  ON vendeurs FOR ALL
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

-- Create partenaires table
CREATE TABLE IF NOT EXISTS partenaires (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id),
  nom_societe text NOT NULL,
  siret text,
  adresse text,
  telephone text,
  email text,
  statut text DEFAULT 'en_attente',
  commission_taux numeric DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE partenaires ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view partenaires"
  ON partenaires FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage partenaires"
  ON partenaires FOR ALL
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

-- Create notaires table
CREATE TABLE IF NOT EXISTS notaires (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nom text NOT NULL,
  prenom text NOT NULL,
  office text,
  email text,
  telephone text,
  adresse text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE notaires ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view notaires"
  ON notaires FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage notaires"
  ON notaires FOR ALL
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

-- Create reservations table
CREATE TABLE IF NOT EXISTS reservations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lot_id uuid REFERENCES lots(id),
  client_id uuid REFERENCES clients(id),
  date_reservation date DEFAULT CURRENT_DATE,
  statut text DEFAULT 'en_cours',
  montant numeric,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view reservations"
  ON reservations FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins and commercials can manage reservations"
  ON reservations FOR ALL
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

-- Create dossiers_vente table
CREATE TABLE IF NOT EXISTS dossiers_vente (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lot_id uuid REFERENCES lots(id),
  acquereur_id uuid REFERENCES acquereurs(id),
  notaire_id uuid REFERENCES notaires(id),
  statut text DEFAULT 'en_preparation',
  date_signature date,
  montant_total numeric,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE dossiers_vente ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view dossiers vente"
  ON dossiers_vente FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage dossiers vente"
  ON dossiers_vente FOR ALL
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

-- Create options_lot table
CREATE TABLE IF NOT EXISTS options_lot (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lot_lmnp_id uuid REFERENCES lots_lmnp(id),
  partenaire_id uuid REFERENCES partenaires(id),
  acquereur_id uuid REFERENCES acquereurs(id),
  date_option date DEFAULT CURRENT_DATE,
  date_expiration date,
  statut text DEFAULT 'active',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE options_lot ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view options lot"
  ON options_lot FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins and partenaires can manage options"
  ON options_lot FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role_custom IN ('admin', 'partenaire')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role_custom IN ('admin', 'partenaire')
    )
  );

-- Create contacts_residence table
CREATE TABLE IF NOT EXISTS contacts_residence (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  residence_gestion_id uuid REFERENCES residences_gestion(id) ON DELETE CASCADE,
  nom text NOT NULL,
  prenom text NOT NULL,
  fonction text,
  email text,
  telephone text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE contacts_residence ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view contacts residence"
  ON contacts_residence FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage contacts residence"
  ON contacts_residence FOR ALL
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

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at on all tables
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_residences_updated_at BEFORE UPDATE ON residences FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_residences_gestion_updated_at BEFORE UPDATE ON residences_gestion FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_lots_updated_at BEFORE UPDATE ON lots FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_lots_lmnp_updated_at BEFORE UPDATE ON lots_lmnp FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON clients FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_acquereurs_updated_at BEFORE UPDATE ON acquereurs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_vendeurs_updated_at BEFORE UPDATE ON vendeurs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_partenaires_updated_at BEFORE UPDATE ON partenaires FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_notaires_updated_at BEFORE UPDATE ON notaires FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_reservations_updated_at BEFORE UPDATE ON reservations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_dossiers_vente_updated_at BEFORE UPDATE ON dossiers_vente FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_options_lot_updated_at BEFORE UPDATE ON options_lot FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_contacts_residence_updated_at BEFORE UPDATE ON contacts_residence FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
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
/*
  # Add missing columns to residences_gestion table

  1. New Columns
    - `annee_construction` (integer) - Year the residence was built
    - `gestionnaire` (text) - Property manager name
    - `gestionnaire_email` (text) - Property manager email
    - `gestionnaire_telephone` (text) - Property manager phone
    - `nombre_lots_total` (integer) - Total number of units
    - `nombre_lots_portefeuille` (integer) - Number of units in portfolio
    - `statut` (text) - Status of the residence
    - `rentabilite_moyenne` (numeric) - Average profitability
    - `image_url` (text) - URL to residence image
    - `documents` (jsonb) - Stored documents
    
  2. Notes
    - Using IF NOT EXISTS pattern to avoid errors if columns already exist
    - All columns are nullable to maintain data integrity
*/

-- Add columns one by one with IF NOT EXISTS checks
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'residences_gestion' AND column_name = 'annee_construction'
  ) THEN
    ALTER TABLE residences_gestion ADD COLUMN annee_construction integer;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'residences_gestion' AND column_name = 'gestionnaire'
  ) THEN
    ALTER TABLE residences_gestion ADD COLUMN gestionnaire text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'residences_gestion' AND column_name = 'gestionnaire_email'
  ) THEN
    ALTER TABLE residences_gestion ADD COLUMN gestionnaire_email text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'residences_gestion' AND column_name = 'gestionnaire_telephone'
  ) THEN
    ALTER TABLE residences_gestion ADD COLUMN gestionnaire_telephone text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'residences_gestion' AND column_name = 'nombre_lots_total'
  ) THEN
    ALTER TABLE residences_gestion ADD COLUMN nombre_lots_total integer;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'residences_gestion' AND column_name = 'nombre_lots_portefeuille'
  ) THEN
    ALTER TABLE residences_gestion ADD COLUMN nombre_lots_portefeuille integer;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'residences_gestion' AND column_name = 'statut'
  ) THEN
    ALTER TABLE residences_gestion ADD COLUMN statut text DEFAULT 'active';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'residences_gestion' AND column_name = 'rentabilite_moyenne'
  ) THEN
    ALTER TABLE residences_gestion ADD COLUMN rentabilite_moyenne numeric(5,2);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'residences_gestion' AND column_name = 'image_url'
  ) THEN
    ALTER TABLE residences_gestion ADD COLUMN image_url text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'residences_gestion' AND column_name = 'documents'
  ) THEN
    ALTER TABLE residences_gestion ADD COLUMN documents jsonb DEFAULT '[]'::jsonb;
  END IF;
END $$;
/*
  # Create storage bucket for documents

  1. New Storage Bucket
    - `documents` bucket for storing all application documents
    
  2. Security
    - Enable RLS on storage.objects
    - Authenticated users can upload files
    - Authenticated users can view files
    - Users can only delete their own uploaded files
    
  3. Configuration
    - Public bucket: false (requires authentication)
    - File size limit: 50MB
    - Allowed mime types: images, PDFs, documents
*/

-- Create the documents bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'documents',
  'documents',
  false,
  52428800,
  ARRAY[
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ]
)
ON CONFLICT (id) DO NOTHING;

-- Create RLS policies for storage.objects

-- Allow authenticated users to upload files
CREATE POLICY "Authenticated users can upload documents"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'documents');

-- Allow authenticated users to view all documents
CREATE POLICY "Authenticated users can view documents"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (bucket_id = 'documents');

-- Allow users to update their own uploaded files
CREATE POLICY "Users can update own uploaded documents"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (bucket_id = 'documents' AND auth.uid() = owner);

-- Allow users to delete their own uploaded files
CREATE POLICY "Users can delete own uploaded documents"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (bucket_id = 'documents' AND auth.uid() = owner);
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
/*
  # Add Missing Columns to All Tables
  
  This migration adds all missing columns that are used in the application but missing from the database schema.
  
  ## Tables Updated
  
  ### lots_lmnp
  - Add all business logic columns (reference, prices, dates, relationships, etc.)
  
  ### vendeurs
  - Add address and additional contact fields
  
  ### acquereurs  
  - Add all client management fields
  
  ### Other tables
  - Add missing relationships and fields
*/

-- Add missing columns to lots_lmnp
DO $$
BEGIN
  -- Core identification
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'lots_lmnp' AND column_name = 'reference') THEN
    ALTER TABLE lots_lmnp ADD COLUMN reference text;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'lots_lmnp' AND column_name = 'residence_id') THEN
    ALTER TABLE lots_lmnp ADD COLUMN residence_id uuid REFERENCES residences_gestion(id) ON DELETE SET NULL;
  END IF;
  
  -- Relationships
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'lots_lmnp' AND column_name = 'vendeur_id') THEN
    ALTER TABLE lots_lmnp ADD COLUMN vendeur_id uuid REFERENCES vendeurs(id) ON DELETE SET NULL;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'lots_lmnp' AND column_name = 'acquereur_id') THEN
    ALTER TABLE lots_lmnp ADD COLUMN acquereur_id uuid REFERENCES acquereurs(id) ON DELETE SET NULL;
  END IF;
  
  -- Property details
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'lots_lmnp' AND column_name = 'type_residence') THEN
    ALTER TABLE lots_lmnp ADD COLUMN type_residence text DEFAULT 'etudiante';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'lots_lmnp' AND column_name = 'typologie') THEN
    ALTER TABLE lots_lmnp ADD COLUMN typologie text;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'lots_lmnp' AND column_name = 'mobilier_inclus') THEN
    ALTER TABLE lots_lmnp ADD COLUMN mobilier_inclus boolean DEFAULT true;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'lots_lmnp' AND column_name = 'orientation') THEN
    ALTER TABLE lots_lmnp ADD COLUMN orientation text;
  END IF;
  
  -- Manager information
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'lots_lmnp' AND column_name = 'gestionnaire_nom') THEN
    ALTER TABLE lots_lmnp ADD COLUMN gestionnaire_nom text;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'lots_lmnp' AND column_name = 'gestionnaire_contact') THEN
    ALTER TABLE lots_lmnp ADD COLUMN gestionnaire_contact text;
  END IF;
  
  -- Legal status
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'lots_lmnp' AND column_name = 'statut_juridique') THEN
    ALTER TABLE lots_lmnp ADD COLUMN statut_juridique text DEFAULT 'lmnp_existant';
  END IF;
  
  -- Pricing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'lots_lmnp' AND column_name = 'prix_net_vendeur') THEN
    ALTER TABLE lots_lmnp ADD COLUMN prix_net_vendeur numeric;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'lots_lmnp' AND column_name = 'honoraires') THEN
    ALTER TABLE lots_lmnp ADD COLUMN honoraires numeric;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'lots_lmnp' AND column_name = 'tva_honoraires') THEN
    ALTER TABLE lots_lmnp ADD COLUMN tva_honoraires numeric;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'lots_lmnp' AND column_name = 'pourcentage_honoraires') THEN
    ALTER TABLE lots_lmnp ADD COLUMN pourcentage_honoraires numeric;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'lots_lmnp' AND column_name = 'honoraires_acquereur_ht') THEN
    ALTER TABLE lots_lmnp ADD COLUMN honoraires_acquereur_ht numeric;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'lots_lmnp' AND column_name = 'tva_honoraires_acquereur') THEN
    ALTER TABLE lots_lmnp ADD COLUMN tva_honoraires_acquereur numeric;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'lots_lmnp' AND column_name = 'prix_fai') THEN
    ALTER TABLE lots_lmnp ADD COLUMN prix_fai numeric;
  END IF;
  
  -- Financial performance
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'lots_lmnp' AND column_name = 'rentabilite') THEN
    ALTER TABLE lots_lmnp ADD COLUMN rentabilite numeric;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'lots_lmnp' AND column_name = 'loyer_mensuel') THEN
    ALTER TABLE lots_lmnp ADD COLUMN loyer_mensuel numeric;
  END IF;
  
  -- Additional fields
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'lots_lmnp' AND column_name = 'description') THEN
    ALTER TABLE lots_lmnp ADD COLUMN description text;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'lots_lmnp' AND column_name = 'notes') THEN
    ALTER TABLE lots_lmnp ADD COLUMN notes text;
  END IF;
  
  -- WordPress integration
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'lots_lmnp' AND column_name = 'en_ligne_wordpress') THEN
    ALTER TABLE lots_lmnp ADD COLUMN en_ligne_wordpress boolean DEFAULT false;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'lots_lmnp' AND column_name = 'date_mise_en_ligne') THEN
    ALTER TABLE lots_lmnp ADD COLUMN date_mise_en_ligne date;
  END IF;
  
  -- Important dates
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'lots_lmnp' AND column_name = 'date_premier_contact') THEN
    ALTER TABLE lots_lmnp ADD COLUMN date_premier_contact date;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'lots_lmnp' AND column_name = 'date_signature_compromis') THEN
    ALTER TABLE lots_lmnp ADD COLUMN date_signature_compromis date;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'lots_lmnp' AND column_name = 'date_signature_acte') THEN
    ALTER TABLE lots_lmnp ADD COLUMN date_signature_acte date;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'lots_lmnp' AND column_name = 'date_prise_option') THEN
    ALTER TABLE lots_lmnp ADD COLUMN date_prise_option date;
  END IF;
  
  -- Buyer notes
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'lots_lmnp' AND column_name = 'observations_acquereurs') THEN
    ALTER TABLE lots_lmnp ADD COLUMN observations_acquereurs text;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'lots_lmnp' AND column_name = 'comptes_rendus_visite') THEN
    ALTER TABLE lots_lmnp ADD COLUMN comptes_rendus_visite text;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'lots_lmnp' AND column_name = 'negociation_en_cours') THEN
    ALTER TABLE lots_lmnp ADD COLUMN negociation_en_cours text;
  END IF;
  
  -- Documents
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'lots_lmnp' AND column_name = 'photos') THEN
    ALTER TABLE lots_lmnp ADD COLUMN photos text[];
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'lots_lmnp' AND column_name = 'documents') THEN
    ALTER TABLE lots_lmnp ADD COLUMN documents jsonb DEFAULT '{}'::jsonb;
  END IF;
END $$;

-- Add missing columns to vendeurs
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'vendeurs' AND column_name = 'adresse') THEN
    ALTER TABLE vendeurs ADD COLUMN adresse text;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'vendeurs' AND column_name = 'ville') THEN
    ALTER TABLE vendeurs ADD COLUMN ville text;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'vendeurs' AND column_name = 'code_postal') THEN
    ALTER TABLE vendeurs ADD COLUMN code_postal text;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'vendeurs' AND column_name = 'pays') THEN
    ALTER TABLE vendeurs ADD COLUMN pays text DEFAULT 'France';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'vendeurs' AND column_name = 'type_vendeur') THEN
    ALTER TABLE vendeurs ADD COLUMN type_vendeur text;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'vendeurs' AND column_name = 'notes') THEN
    ALTER TABLE vendeurs ADD COLUMN notes text;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'vendeurs' AND column_name = 'documents') THEN
    ALTER TABLE vendeurs ADD COLUMN documents jsonb DEFAULT '{}'::jsonb;
  END IF;
END $$;

-- Add missing columns to acquereurs
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'acquereurs' AND column_name = 'ville') THEN
    ALTER TABLE acquereurs ADD COLUMN ville text;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'acquereurs' AND column_name = 'code_postal') THEN
    ALTER TABLE acquereurs ADD COLUMN code_postal text;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'acquereurs' AND column_name = 'pays') THEN
    ALTER TABLE acquereurs ADD COLUMN pays text DEFAULT 'France';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'acquereurs' AND column_name = 'date_naissance') THEN
    ALTER TABLE acquereurs ADD COLUMN date_naissance date;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'acquereurs' AND column_name = 'profession') THEN
    ALTER TABLE acquereurs ADD COLUMN profession text;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'acquereurs' AND column_name = 'statut_familial') THEN
    ALTER TABLE acquereurs ADD COLUMN statut_familial text;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'acquereurs' AND column_name = 'capacite_financement') THEN
    ALTER TABLE acquereurs ADD COLUMN capacite_financement numeric;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'acquereurs' AND column_name = 'apport_initial') THEN
    ALTER TABLE acquereurs ADD COLUMN apport_initial numeric;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'acquereurs' AND column_name = 'preferences_investissement') THEN
    ALTER TABLE acquereurs ADD COLUMN preferences_investissement text;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'acquereurs' AND column_name = 'notes') THEN
    ALTER TABLE acquereurs ADD COLUMN notes text;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'acquereurs' AND column_name = 'documents') THEN
    ALTER TABLE acquereurs ADD COLUMN documents jsonb DEFAULT '{}'::jsonb;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'acquereurs' AND column_name = 'partenaire_id') THEN
    ALTER TABLE acquereurs ADD COLUMN partenaire_id uuid REFERENCES profiles(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Add documents to residences_gestion if missing
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'residences_gestion' AND column_name = 'documents') THEN
    ALTER TABLE residences_gestion ADD COLUMN documents jsonb DEFAULT '{}'::jsonb;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'residences_gestion' AND column_name = 'statut') THEN
    ALTER TABLE residences_gestion ADD COLUMN statut text DEFAULT 'active';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'residences_gestion' AND column_name = 'gestionnaire') THEN
    ALTER TABLE residences_gestion ADD COLUMN gestionnaire text;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'residences_gestion' AND column_name = 'contact_gestionnaire') THEN
    ALTER TABLE residences_gestion ADD COLUMN contact_gestionnaire text;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'residences_gestion' AND column_name = 'commission_gestion') THEN
    ALTER TABLE residences_gestion ADD COLUMN commission_gestion numeric;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'residences_gestion' AND column_name = 'date_livraison') THEN
    ALTER TABLE residences_gestion ADD COLUMN date_livraison date;
  END IF;
END $$;
/*
  # Add Derived/Denormalized Columns
  
  Add columns that store denormalized data from relationships for easier querying.
*/

-- Add derived columns to lots_lmnp
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'lots_lmnp' AND column_name = 'acquereur_nom') THEN
    ALTER TABLE lots_lmnp ADD COLUMN acquereur_nom text;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'lots_lmnp' AND column_name = 'vendeur_nom') THEN
    ALTER TABLE lots_lmnp ADD COLUMN vendeur_nom text;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'lots_lmnp' AND column_name = 'partenaire_nom') THEN
    ALTER TABLE lots_lmnp ADD COLUMN partenaire_nom text;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'lots_lmnp' AND column_name = 'residence_nom') THEN
    ALTER TABLE lots_lmnp ADD COLUMN residence_nom text;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'lots_lmnp' AND column_name = 'ville') THEN
    ALTER TABLE lots_lmnp ADD COLUMN ville text;
  END IF;
END $$;

-- Add derived columns to acquereurs
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'acquereurs' AND column_name = 'partenaire_nom') THEN
    ALTER TABLE acquereurs ADD COLUMN partenaire_nom text;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'acquereurs' AND column_name = 'budget_min') THEN
    ALTER TABLE acquereurs ADD COLUMN budget_min numeric;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'acquereurs' AND column_name = 'budget_max') THEN
    ALTER TABLE acquereurs ADD COLUMN budget_max numeric;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'acquereurs' AND column_name = 'budget') THEN
    ALTER TABLE acquereurs ADD COLUMN budget numeric;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'acquereurs' AND column_name = 'apport') THEN
    ALTER TABLE acquereurs ADD COLUMN apport numeric;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'acquereurs' AND column_name = 'endettement_estime') THEN
    ALTER TABLE acquereurs ADD COLUMN endettement_estime numeric;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'acquereurs' AND column_name = 'revenus_mensuels') THEN
    ALTER TABLE acquereurs ADD COLUMN revenus_mensuels numeric;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'acquereurs' AND column_name = 'criteres_recherche') THEN
    ALTER TABLE acquereurs ADD COLUMN criteres_recherche text;
  END IF;
END $$;
/*
  # Fix Partenaires Table Constraints
  
  Make nom_societe nullable since the app uses 'nom' as the main field.
*/

-- Make nom_societe nullable
ALTER TABLE partenaires ALTER COLUMN nom_societe DROP NOT NULL;

-- Ensure nom exists and is not null
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'partenaires' AND column_name = 'nom') THEN
    ALTER TABLE partenaires ADD COLUMN nom text;
  END IF;
END $$;

-- Make nom not null if it isn't already
ALTER TABLE partenaires ALTER COLUMN nom SET NOT NULL;
/*
  # Fix Profiles and Lots Constraints
  
  1. Add partenaire_id to profiles table
  2. Make numero nullable in lots_lmnp (can be generated automatically)
*/

-- Add partenaire_id to profiles if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'partenaire_id'
  ) THEN
    ALTER TABLE profiles ADD COLUMN partenaire_id uuid REFERENCES partenaires(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Make numero nullable in lots_lmnp
ALTER TABLE lots_lmnp ALTER COLUMN numero DROP NOT NULL;

-- Make numero nullable in lots
ALTER TABLE lots ALTER COLUMN numero DROP NOT NULL;
/*
  # Add documents_entreprise column to vendeurs
  
  1. Changes
    - Add `documents_entreprise` column to vendeurs table (JSONB type for storing document metadata)
*/

-- Add documents_entreprise column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'vendeurs' AND column_name = 'documents_entreprise'
  ) THEN
    ALTER TABLE vendeurs ADD COLUMN documents_entreprise jsonb DEFAULT '[]'::jsonb;
  END IF;
END $$;
/*
  # Add Missing Columns to Entity Tables

  1. Changes to `vendeurs` table
    - Add `ville` (text) - City
    - Add `code_postal` (text) - Postal code
    - Add `pays` (text) - Country
    - Add `statut_juridique` (text) - Legal status
    - Add `situation_familiale` (text) - Family situation
    - Add `profession` (text) - Profession
    - Add `situation_financiere` (text) - Financial situation
    - Add `source_contact` (text) - Contact source
    - Add `statut_commercial` (text) - Commercial status
    - Add `documents_particulier` (jsonb) - Individual documents

  2. Changes to `acquereurs` table
    - Add `date_entree_crm` (date) - CRM entry date
    - Add `statut_professionnel` (text) - Professional status
    - Add `situation_familiale` (text) - Family situation (rename from statut_familial)
    - Add `residence_fiscale` (text) - Tax residence
    - Add `statut_fiscal` (text) - Tax status
    - Add `source_contact` (text) - Contact source
    - Add `mode_financement` (text) - Financing mode
    - Add `courtier` (text) - Broker
    - Add `accord_bancaire` (text) - Banking agreement
    - Add `statut_commercial` (text) - Commercial status

  3. Changes to `notaires` table
    - Rename `office` to `etude` - Notary office name
    - Add `ville` (text) - City
    - Add `code_postal` (text) - Postal code
    - Add `type_notaire` (text) - Type (vendeur/acquereur/mixte)
    - Add `vendeurs_ids` (uuid[]) - Associated sellers
    - Add `acquereurs_ids` (uuid[]) - Associated buyers
    - Add `specialites` (text) - Specialties
    - Add `nombre_dossiers` (integer) - Number of cases
    - Add `notes` (text) - Internal notes

  4. Changes to `contacts_residence` table
    - Add `type_contact` (text) - Contact type
    - Add `adresse` (text) - Address
    - Add `site_web` (text) - Website
    - Add `societe` (text) - Company
    - Add `mode_communication` (text) - Preferred communication mode
    - Add `observations` (text) - Observations
    - Add `reactivite` (text) - Responsiveness
    - Add `qualite_relation` (text) - Relationship quality
*/

-- Vendeurs table additions
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'vendeurs' AND column_name = 'statut_juridique') THEN
    ALTER TABLE vendeurs ADD COLUMN statut_juridique TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'vendeurs' AND column_name = 'situation_familiale') THEN
    ALTER TABLE vendeurs ADD COLUMN situation_familiale TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'vendeurs' AND column_name = 'profession') THEN
    ALTER TABLE vendeurs ADD COLUMN profession TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'vendeurs' AND column_name = 'situation_financiere') THEN
    ALTER TABLE vendeurs ADD COLUMN situation_financiere TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'vendeurs' AND column_name = 'source_contact') THEN
    ALTER TABLE vendeurs ADD COLUMN source_contact TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'vendeurs' AND column_name = 'statut_commercial') THEN
    ALTER TABLE vendeurs ADD COLUMN statut_commercial TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'vendeurs' AND column_name = 'documents_particulier') THEN
    ALTER TABLE vendeurs ADD COLUMN documents_particulier JSONB DEFAULT '{}'::jsonb;
  END IF;
END $$;

-- Acquereurs table additions
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'acquereurs' AND column_name = 'date_entree_crm') THEN
    ALTER TABLE acquereurs ADD COLUMN date_entree_crm DATE DEFAULT CURRENT_DATE;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'acquereurs' AND column_name = 'statut_professionnel') THEN
    ALTER TABLE acquereurs ADD COLUMN statut_professionnel TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'acquereurs' AND column_name = 'situation_familiale') THEN
    ALTER TABLE acquereurs ADD COLUMN situation_familiale TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'acquereurs' AND column_name = 'residence_fiscale') THEN
    ALTER TABLE acquereurs ADD COLUMN residence_fiscale TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'acquereurs' AND column_name = 'statut_fiscal') THEN
    ALTER TABLE acquereurs ADD COLUMN statut_fiscal TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'acquereurs' AND column_name = 'source_contact') THEN
    ALTER TABLE acquereurs ADD COLUMN source_contact TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'acquereurs' AND column_name = 'mode_financement') THEN
    ALTER TABLE acquereurs ADD COLUMN mode_financement TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'acquereurs' AND column_name = 'courtier') THEN
    ALTER TABLE acquereurs ADD COLUMN courtier TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'acquereurs' AND column_name = 'accord_bancaire') THEN
    ALTER TABLE acquereurs ADD COLUMN accord_bancaire TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'acquereurs' AND column_name = 'statut_commercial') THEN
    ALTER TABLE acquereurs ADD COLUMN statut_commercial TEXT;
  END IF;
END $$;

-- Notaires table additions
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'notaires' AND column_name = 'office') THEN
    ALTER TABLE notaires RENAME COLUMN office TO etude;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'notaires' AND column_name = 'etude') THEN
    ALTER TABLE notaires ADD COLUMN etude TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'notaires' AND column_name = 'ville') THEN
    ALTER TABLE notaires ADD COLUMN ville TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'notaires' AND column_name = 'code_postal') THEN
    ALTER TABLE notaires ADD COLUMN code_postal TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'notaires' AND column_name = 'type_notaire') THEN
    ALTER TABLE notaires ADD COLUMN type_notaire TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'notaires' AND column_name = 'vendeurs_ids') THEN
    ALTER TABLE notaires ADD COLUMN vendeurs_ids UUID[];
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'notaires' AND column_name = 'acquereurs_ids') THEN
    ALTER TABLE notaires ADD COLUMN acquereurs_ids UUID[];
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'notaires' AND column_name = 'specialites') THEN
    ALTER TABLE notaires ADD COLUMN specialites TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'notaires' AND column_name = 'nombre_dossiers') THEN
    ALTER TABLE notaires ADD COLUMN nombre_dossiers INTEGER DEFAULT 0;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'notaires' AND column_name = 'notes') THEN
    ALTER TABLE notaires ADD COLUMN notes TEXT;
  END IF;
END $$;

-- Contacts_residence table additions
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'contacts_residence' AND column_name = 'type_contact') THEN
    ALTER TABLE contacts_residence ADD COLUMN type_contact TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'contacts_residence' AND column_name = 'adresse') THEN
    ALTER TABLE contacts_residence ADD COLUMN adresse TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'contacts_residence' AND column_name = 'site_web') THEN
    ALTER TABLE contacts_residence ADD COLUMN site_web TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'contacts_residence' AND column_name = 'societe') THEN
    ALTER TABLE contacts_residence ADD COLUMN societe TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'contacts_residence' AND column_name = 'mode_communication') THEN
    ALTER TABLE contacts_residence ADD COLUMN mode_communication TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'contacts_residence' AND column_name = 'observations') THEN
    ALTER TABLE contacts_residence ADD COLUMN observations TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'contacts_residence' AND column_name = 'reactivite') THEN
    ALTER TABLE contacts_residence ADD COLUMN reactivite TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'contacts_residence' AND column_name = 'qualite_relation') THEN
    ALTER TABLE contacts_residence ADD COLUMN qualite_relation TEXT;
  END IF;
END $$;
/*
  # Fix Foreign Key Constraint for Acquéreurs

  1. Changes
    - Drop existing foreign key constraint that incorrectly points to profiles
    - Add correct foreign key constraint pointing to partenaires table
    
  2. Security
    - No changes to RLS policies
*/

-- Drop the incorrect foreign key constraint
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'acquereurs_partenaire_id_fkey'
    AND table_name = 'acquereurs'
  ) THEN
    ALTER TABLE acquereurs DROP CONSTRAINT acquereurs_partenaire_id_fkey;
  END IF;
END $$;

-- Add the correct foreign key constraint pointing to partenaires table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'acquereurs_partenaire_id_fkey'
    AND table_name = 'acquereurs'
  ) THEN
    ALTER TABLE acquereurs 
    ADD CONSTRAINT acquereurs_partenaire_id_fkey 
    FOREIGN KEY (partenaire_id) 
    REFERENCES partenaires(id) 
    ON DELETE SET NULL;
  END IF;
END $$;
/*
  # Add residence_nom to contacts_residence

  1. Changes
    - Add `residence_nom` column to store the residence name denormalized
    - Create trigger to auto-populate residence_nom on insert/update
    
  2. Security
    - No changes to RLS policies
*/

-- Add residence_nom column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'contacts_residence' AND column_name = 'residence_nom'
  ) THEN
    ALTER TABLE contacts_residence ADD COLUMN residence_nom TEXT;
  END IF;
END $$;

-- Create function to auto-populate residence_nom
CREATE OR REPLACE FUNCTION update_contact_residence_nom()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.residence_gestion_id IS NOT NULL THEN
    SELECT nom INTO NEW.residence_nom
    FROM residences_gestion
    WHERE id = NEW.residence_gestion_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if exists and recreate
DROP TRIGGER IF EXISTS trigger_update_contact_residence_nom ON contacts_residence;

CREATE TRIGGER trigger_update_contact_residence_nom
  BEFORE INSERT OR UPDATE ON contacts_residence
  FOR EACH ROW
  EXECUTE FUNCTION update_contact_residence_nom();

-- Backfill existing records
UPDATE contacts_residence c
SET residence_nom = r.nom
FROM residences_gestion r
WHERE c.residence_gestion_id = r.id
  AND c.residence_nom IS NULL;
/*
  # Fix Foreign Key Constraint for Lots LMNP

  1. Changes
    - Drop existing foreign key constraint that incorrectly points to profiles
    - Add correct foreign key constraint pointing to partenaires table
    
  2. Security
    - No changes to RLS policies
*/

-- Drop the incorrect foreign key constraint
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'lots_lmnp_partenaire_id_fkey'
    AND table_name = 'lots_lmnp'
  ) THEN
    ALTER TABLE lots_lmnp DROP CONSTRAINT lots_lmnp_partenaire_id_fkey;
  END IF;
END $$;

-- Add the correct foreign key constraint pointing to partenaires table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'lots_lmnp_partenaire_id_fkey'
    AND table_name = 'lots_lmnp'
  ) THEN
    ALTER TABLE lots_lmnp 
    ADD CONSTRAINT lots_lmnp_partenaire_id_fkey 
    FOREIGN KEY (partenaire_id) 
    REFERENCES partenaires(id) 
    ON DELETE SET NULL;
  END IF;
END $$;
/*
  # Add Unique Constraint for Active Options

  1. Changes
    - Clean up duplicate active options (keep the most recent one)
    - Add partial unique constraint to ensure only one active option per lot
    
  2. Security
    - No changes to RLS policies
*/

-- First, cancel duplicate active options (keep the most recent, cancel older ones)
DO $$
DECLARE
  duplicate_record RECORD;
  option_to_cancel UUID;
BEGIN
  FOR duplicate_record IN 
    SELECT 
      lot_lmnp_id,
      array_agg(id ORDER BY created_at ASC) as option_ids
    FROM options_lot
    WHERE statut = 'active'
    GROUP BY lot_lmnp_id
    HAVING COUNT(*) > 1
  LOOP
    -- Cancel all but the last (most recent) option
    FOR i IN 1..(array_length(duplicate_record.option_ids, 1) - 1) LOOP
      option_to_cancel := duplicate_record.option_ids[i];
      UPDATE options_lot 
      SET statut = 'annulee', 
          updated_at = now() 
      WHERE id = option_to_cancel;
    END LOOP;
  END LOOP;
END $$;

-- Add partial unique index to prevent multiple active options on same lot
CREATE UNIQUE INDEX IF NOT EXISTS options_lot_unique_active_per_lot 
ON options_lot (lot_lmnp_id) 
WHERE statut = 'active';
/*
  # Add Denormalized Names to Options Lot

  1. Changes
    - Add `partenaire_nom` column to `options_lot` table
    - Add `acquereur_nom` column to `options_lot` table
    - Add `lot_reference` column to `options_lot` table
    - Add `residence_nom` column to `options_lot` table
    
  2. Purpose
    - Store snapshot of names at the time of option creation
    - Prevent display issues when related records are updated
    - Improve query performance by avoiding joins
    
  3. Security
    - No changes to RLS policies
*/

-- Add denormalized columns to options_lot
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'options_lot' AND column_name = 'partenaire_nom'
  ) THEN
    ALTER TABLE options_lot ADD COLUMN partenaire_nom text DEFAULT '';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'options_lot' AND column_name = 'acquereur_nom'
  ) THEN
    ALTER TABLE options_lot ADD COLUMN acquereur_nom text DEFAULT '';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'options_lot' AND column_name = 'lot_reference'
  ) THEN
    ALTER TABLE options_lot ADD COLUMN lot_reference text DEFAULT '';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'options_lot' AND column_name = 'residence_nom'
  ) THEN
    ALTER TABLE options_lot ADD COLUMN residence_nom text DEFAULT '';
  END IF;
END $$;

-- Update existing options with current names
UPDATE options_lot
SET 
  partenaire_nom = COALESCE((SELECT nom FROM partenaires WHERE id = options_lot.partenaire_id), ''),
  acquereur_nom = COALESCE((SELECT prenom || ' ' || nom FROM acquereurs WHERE id = options_lot.acquereur_id), ''),
  lot_reference = COALESCE((SELECT reference FROM lots_lmnp WHERE id = options_lot.lot_lmnp_id), ''),
  residence_nom = COALESCE((SELECT residence_nom FROM lots_lmnp WHERE id = options_lot.lot_lmnp_id), '')
WHERE partenaire_nom IS NULL OR partenaire_nom = '';
/*
  # Ajouter les colonnes pose_par et user_email à la table options_lot

  1. Modifications
    - Ajout de la colonne `pose_par` (text) : Indique qui a posé l'option ('admin' ou 'partenaire')
    - Ajout de la colonne `user_email` (text) : Email de l'utilisateur qui a posé l'option
    - Valeur par défaut 'partenaire' pour pose_par pour les options existantes

  2. Notes
    - Ces colonnes permettent de tracer qui a créé chaque option
    - Utilisé pour afficher des badges dans l'interface
*/

-- Ajouter la colonne pose_par avec valeur par défaut
ALTER TABLE options_lot 
ADD COLUMN IF NOT EXISTS pose_par text DEFAULT 'partenaire';

-- Ajouter la colonne user_email
ALTER TABLE options_lot 
ADD COLUMN IF NOT EXISTS user_email text DEFAULT '';

-- Créer un index pour améliorer les performances de recherche
CREATE INDEX IF NOT EXISTS idx_options_lot_pose_par ON options_lot(pose_par);
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
CREATE INDEX IF NOT EXISTS idx_notification_emails_active ON notification_emails(active);/*
  # Ajouter un trigger pour synchroniser automatiquement le statut des lots

  1. Fonction trigger
    - Fonction `sync_lot_statut_from_options()` qui met à jour le statut du lot selon les options
    - Logique: 
      - Si une option active existe → statut = 'sous_option'
      - Si aucune option active → statut = 'disponible' (sauf si déjà réservé, compromis, vendu)

  2. Triggers
    - `sync_lot_statut_after_option_insert`: Après insertion d'une option
    - `sync_lot_statut_after_option_update`: Après mise à jour d'une option
    - `sync_lot_statut_after_option_delete`: Après suppression d'une option

  3. Correction manuelle
    - Corriger le statut de tous les lots qui ont une option active mais sont marqués 'disponible'
*/

-- Créer la fonction de synchronisation
CREATE OR REPLACE FUNCTION sync_lot_statut_from_options()
RETURNS TRIGGER AS $$
DECLARE
  v_lot_id uuid;
  v_has_active_option boolean;
  v_current_statut text;
BEGIN
  -- Déterminer l'ID du lot concerné
  IF TG_OP = 'DELETE' THEN
    v_lot_id := OLD.lot_lmnp_id;
  ELSE
    v_lot_id := NEW.lot_lmnp_id;
  END IF;

  -- Récupérer le statut actuel du lot
  SELECT statut INTO v_current_statut
  FROM lots_lmnp
  WHERE id = v_lot_id;

  -- Vérifier s'il existe une option active sur ce lot
  SELECT EXISTS(
    SELECT 1 FROM options_lot 
    WHERE lot_lmnp_id = v_lot_id 
    AND statut = 'active'
  ) INTO v_has_active_option;

  -- Mettre à jour le statut du lot selon la présence d'options actives
  IF v_has_active_option THEN
    -- Si une option active existe, mettre le lot en sous_option
    UPDATE lots_lmnp
    SET statut = 'sous_option'
    WHERE id = v_lot_id
    AND statut NOT IN ('reserve', 'allotement', 'compromis', 'vendu');
  ELSE
    -- Si aucune option active, remettre le lot en disponible
    -- SAUF s'il est déjà dans un statut plus avancé
    UPDATE lots_lmnp
    SET statut = 'disponible'
    WHERE id = v_lot_id
    AND statut = 'sous_option';
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Créer les triggers sur la table options_lot
DROP TRIGGER IF EXISTS sync_lot_statut_after_option_insert ON options_lot;
CREATE TRIGGER sync_lot_statut_after_option_insert
  AFTER INSERT ON options_lot
  FOR EACH ROW
  EXECUTE FUNCTION sync_lot_statut_from_options();

DROP TRIGGER IF EXISTS sync_lot_statut_after_option_update ON options_lot;
CREATE TRIGGER sync_lot_statut_after_option_update
  AFTER UPDATE ON options_lot
  FOR EACH ROW
  WHEN (OLD.statut IS DISTINCT FROM NEW.statut OR OLD.lot_lmnp_id IS DISTINCT FROM NEW.lot_lmnp_id)
  EXECUTE FUNCTION sync_lot_statut_from_options();

DROP TRIGGER IF EXISTS sync_lot_statut_after_option_delete ON options_lot;
CREATE TRIGGER sync_lot_statut_after_option_delete
  AFTER DELETE ON options_lot
  FOR EACH ROW
  EXECUTE FUNCTION sync_lot_statut_from_options();

-- Correction manuelle: Synchroniser les lots qui ont une option active mais sont marqués 'disponible'
UPDATE lots_lmnp
SET statut = 'sous_option'
WHERE id IN (
  SELECT DISTINCT lot_lmnp_id 
  FROM options_lot 
  WHERE statut = 'active'
)
AND statut = 'disponible';/*
  # Supprimer les triggers en doublon

  1. Problème
    - Il existe deux séries de triggers qui synchronisent le statut des lots
    - `trigger_sync_lot_on_option_*` (anciens) utilisant `sync_lot_statut_on_option_change`
    - `sync_lot_statut_after_option_*` (nouveaux) utilisant `sync_lot_statut_from_options`
    - Cette duplication cause des problèmes de synchronisation

  2. Solution
    - Supprimer les anciens triggers et leur fonction
    - Garder uniquement les nouveaux triggers qui sont mieux implémentés
*/

-- Supprimer les anciens triggers
DROP TRIGGER IF EXISTS trigger_sync_lot_on_option_insert ON options_lot;
DROP TRIGGER IF EXISTS trigger_sync_lot_on_option_update ON options_lot;
DROP TRIGGER IF EXISTS trigger_sync_lot_on_option_delete ON options_lot;

-- Supprimer l'ancienne fonction
DROP FUNCTION IF EXISTS sync_lot_statut_on_option_change();

-- Vérifier et corriger tous les lots qui ont une option active mais ne sont pas en sous_option
UPDATE lots_lmnp
SET statut = 'sous_option'
WHERE id IN (
  SELECT DISTINCT lot_lmnp_id 
  FROM options_lot 
  WHERE statut = 'active'
)
AND statut NOT IN ('sous_option', 'reserve', 'allotement', 'compromis', 'vendu');/*
  # Corriger les permissions du trigger de synchronisation

  1. Problème
    - La fonction trigger `sync_lot_statut_from_options()` s'exécute avec SECURITY INVOKER par défaut
    - Cela signifie qu'elle utilise les permissions de l'utilisateur qui fait l'INSERT/UPDATE/DELETE
    - Avec RLS activé, le trigger ne peut pas voir/modifier les données correctement
    
  2. Solution
    - Ajouter `SECURITY DEFINER` pour que la fonction s'exécute avec les permissions de son créateur
    - Cela permet au trigger de bypasser RLS et de toujours fonctionner
*/

-- Recréer la fonction avec SECURITY DEFINER
CREATE OR REPLACE FUNCTION sync_lot_statut_from_options()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_lot_id uuid;
  v_has_active_option boolean;
  v_current_statut text;
BEGIN
  -- Déterminer l'ID du lot concerné
  IF TG_OP = 'DELETE' THEN
    v_lot_id := OLD.lot_lmnp_id;
  ELSE
    v_lot_id := NEW.lot_lmnp_id;
  END IF;

  -- Récupérer le statut actuel du lot
  SELECT statut INTO v_current_statut
  FROM lots_lmnp
  WHERE id = v_lot_id;

  -- Vérifier s'il existe une option active sur ce lot
  SELECT EXISTS(
    SELECT 1 FROM options_lot 
    WHERE lot_lmnp_id = v_lot_id 
    AND statut = 'active'
  ) INTO v_has_active_option;

  -- Mettre à jour le statut du lot selon la présence d'options actives
  IF v_has_active_option THEN
    -- Si une option active existe, mettre le lot en sous_option
    UPDATE lots_lmnp
    SET statut = 'sous_option'
    WHERE id = v_lot_id
    AND statut NOT IN ('reserve', 'allotement', 'compromis', 'vendu');
  ELSE
    -- Si aucune option active, remettre le lot en disponible
    -- SAUF s'il est déjà dans un statut plus avancé
    UPDATE lots_lmnp
    SET statut = 'disponible'
    WHERE id = v_lot_id
    AND statut = 'sous_option';
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Corriger tous les lots qui ont une option active mais ne sont pas en sous_option
UPDATE lots_lmnp
SET statut = 'sous_option'
WHERE id IN (
  SELECT DISTINCT lot_lmnp_id 
  FROM options_lot 
  WHERE statut = 'active'
)
AND statut NOT IN ('sous_option', 'reserve', 'allotement', 'compromis', 'vendu');/*
  # Créer la table de statistiques de vues

  1. Table `vues_stats`
    - `id` (uuid, primary key)
    - `entity_type` (text) - Type d'entité: 'lot' ou 'residence'
    - `entity_id` (uuid) - ID de l'entité vue
    - `entity_name` (text) - Nom/référence de l'entité (dénormalisé pour faciliter les requêtes)
    - `user_id` (uuid, référence profiles) - Utilisateur qui a vu
    - `user_email` (text) - Email de l'utilisateur (dénormalisé)
    - `user_role` (text) - Rôle de l'utilisateur (admin/partenaire)
    - `partenaire_id` (uuid, nullable) - ID du partenaire si applicable
    - `partenaire_nom` (text, nullable) - Nom du partenaire (dénormalisé)
    - `viewed_at` (timestamptz) - Date et heure de la vue
    - `created_at` (timestamptz)

  2. Index
    - Index sur entity_type et entity_id pour les statistiques
    - Index sur user_id pour les requêtes par utilisateur
    - Index sur viewed_at pour les requêtes temporelles

  3. RLS
    - Les admins peuvent tout voir
    - Les partenaires ne peuvent voir que leurs propres vues
    - Tous les utilisateurs authentifiés peuvent insérer des vues
*/

-- Créer la table vues_stats
CREATE TABLE IF NOT EXISTS vues_stats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type text NOT NULL CHECK (entity_type IN ('lot', 'residence')),
  entity_id uuid NOT NULL,
  entity_name text NOT NULL DEFAULT '',
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  user_email text NOT NULL DEFAULT '',
  user_role text NOT NULL DEFAULT '',
  partenaire_id uuid REFERENCES partenaires(id) ON DELETE SET NULL,
  partenaire_nom text,
  viewed_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Créer les index pour optimiser les requêtes
CREATE INDEX IF NOT EXISTS idx_vues_stats_entity ON vues_stats(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_vues_stats_user ON vues_stats(user_id);
CREATE INDEX IF NOT EXISTS idx_vues_stats_viewed_at ON vues_stats(viewed_at);
CREATE INDEX IF NOT EXISTS idx_vues_stats_partenaire ON vues_stats(partenaire_id) WHERE partenaire_id IS NOT NULL;

-- Activer RLS
ALTER TABLE vues_stats ENABLE ROW LEVEL SECURITY;

-- Policy pour admins: lecture complète
CREATE POLICY "Admins can view all stats"
  ON vues_stats FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role_custom = 'admin'
    )
  );

-- Policy pour partenaires: lecture de leurs propres vues uniquement
CREATE POLICY "Partenaires can view own stats"
  ON vues_stats FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role_custom = 'partenaire'
      AND profiles.partenaire_id = vues_stats.partenaire_id
    )
  );

-- Policy pour insertion: tous les utilisateurs authentifiés peuvent créer des vues
CREATE POLICY "Authenticated users can insert views"
  ON vues_stats FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = auth.uid()
  );

-- Ajouter un trigger pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.created_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_vues_stats_updated_at ON vues_stats;
CREATE TRIGGER update_vues_stats_updated_at
  BEFORE UPDATE ON vues_stats
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();/*
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
END $$;/*
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
END $$;/*
  # Deprecate gestionnaire fields from residences_gestion

  1. Changes
    - Remove gestionnaire, gestionnaire_email, gestionnaire_telephone columns
    - These are now managed through the gestionnaires table
    - Existing data relationships should be migrated manually if needed
  
  2. Notes
    - The new gestionnaires table provides proper relational structure
    - Multiple residences can now share the same gestionnaire
    - A residence can have multiple gestionnaires through the junction table
*/

DO $$
BEGIN
  -- Drop gestionnaire column if it exists
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'residences_gestion' AND column_name = 'gestionnaire'
  ) THEN
    ALTER TABLE residences_gestion DROP COLUMN gestionnaire;
  END IF;

  -- Drop gestionnaire_email column if it exists
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'residences_gestion' AND column_name = 'gestionnaire_email'
  ) THEN
    ALTER TABLE residences_gestion DROP COLUMN gestionnaire_email;
  END IF;

  -- Drop gestionnaire_telephone column if it exists
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'residences_gestion' AND column_name = 'gestionnaire_telephone'
  ) THEN
    ALTER TABLE residences_gestion DROP COLUMN gestionnaire_telephone;
  END IF;
END $$;/*
  # Add region field to residences_gestion

  1. Changes
    - Add `region` column to residences_gestion table
    - This will allow filtering lots by region through their residence
  
  2. Notes
    - Region is a text field for flexibility (e.g., "Île-de-France", "Auvergne-Rhône-Alpes", etc.)
    - Can be used to filter and organize residences and lots by geographical area
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'residences_gestion' AND column_name = 'region'
  ) THEN
    ALTER TABLE residences_gestion ADD COLUMN region text;
  END IF;
END $$;

-- Create index for better filtering performance
CREATE INDEX IF NOT EXISTS idx_residences_gestion_region 
  ON residences_gestion(region);/*
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
  );/*
  # Add created_by column to partenaires table

  1. Changes
    - Add created_by column to store the email of the user who created the partenaire
    - This enables filtering partenaires by creator for commercial users
  
  2. Notes
    - Column is nullable to handle existing records
    - Future inserts should populate this field
*/

-- Add created_by column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'partenaires' AND column_name = 'created_by'
  ) THEN
    ALTER TABLE partenaires ADD COLUMN created_by text;
  END IF;
END $$;/*
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
  AND partenaires.created_by IS NULL;/*
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
$$;/*
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
