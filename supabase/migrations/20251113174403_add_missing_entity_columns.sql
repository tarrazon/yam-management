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
