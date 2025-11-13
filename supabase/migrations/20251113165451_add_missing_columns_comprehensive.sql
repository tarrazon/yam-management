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
