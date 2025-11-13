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
