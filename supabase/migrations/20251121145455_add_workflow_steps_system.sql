/*
  # Système de suivi de dossier avec étapes automatiques et manuelles
  
  1. Nouvelles tables
    - `workflow_steps` - Définition des étapes du workflow
      - `id` (uuid, primary key)
      - `code` (text, unique) - Code technique de l'étape
      - `label` (text) - Libellé affiché
      - `order_index` (integer) - Ordre d'affichage
      - `is_automatic` (boolean) - Étape automatique ou manuelle
      - `trigger_on_status` (text) - Statut du lot qui déclenche l'étape automatique
      - `send_email` (boolean) - Envoyer un email à la complétion
      - `email_template` (text) - Template d'email à utiliser
      - `email_recipients` (text[]) - Destinataires (vendeur, acquereur, bo, cgp, etc.)
      - `description` (text) - Description de l'étape
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `lot_workflow_progress` - Progression du workflow pour chaque lot
      - `id` (uuid, primary key)
      - `lot_id` (uuid, foreign key) - Référence au lot
      - `step_code` (text) - Code de l'étape
      - `status` (text) - pending, completed, skipped
      - `completed_at` (timestamp) - Date de complétion
      - `completed_by` (uuid, foreign key) - Utilisateur ayant complété
      - `notes` (text) - Notes sur l'étape
      - `email_sent` (boolean) - Email envoyé
      - `email_sent_at` (timestamp) - Date d'envoi de l'email
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
  
  2. Sécurité
    - Enable RLS sur les deux tables
    - Policies pour lecture/écriture selon le rôle
  
  3. Fonctions
    - Trigger pour créer automatiquement les étapes lors de la création d'un lot
    - Fonction pour marquer une étape comme complétée
    - Fonction pour envoyer les emails automatiques
*/

-- Table des étapes du workflow
CREATE TABLE IF NOT EXISTS workflow_steps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  label text NOT NULL,
  order_index integer NOT NULL,
  is_automatic boolean DEFAULT false,
  trigger_on_status text,
  send_email boolean DEFAULT false,
  email_template text,
  email_recipients text[],
  description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Table de progression du workflow pour chaque lot
CREATE TABLE IF NOT EXISTS lot_workflow_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lot_id uuid NOT NULL REFERENCES lots_lmnp(id) ON DELETE CASCADE,
  step_code text NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'skipped')),
  completed_at timestamptz,
  completed_by uuid REFERENCES profiles(id),
  notes text,
  email_sent boolean DEFAULT false,
  email_sent_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(lot_id, step_code)
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_workflow_steps_order ON workflow_steps(order_index);
CREATE INDEX IF NOT EXISTS idx_lot_workflow_lot_id ON lot_workflow_progress(lot_id);
CREATE INDEX IF NOT EXISTS idx_lot_workflow_status ON lot_workflow_progress(status);
CREATE INDEX IF NOT EXISTS idx_lot_workflow_step ON lot_workflow_progress(step_code);

-- Enable RLS
ALTER TABLE workflow_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE lot_workflow_progress ENABLE ROW LEVEL SECURITY;

-- Policies pour workflow_steps (lecture pour tous les authentifiés)
CREATE POLICY "Authenticated users can read workflow steps"
  ON workflow_steps FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage workflow steps"
  ON workflow_steps FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role_custom = 'admin'
    )
  );

-- Policies pour lot_workflow_progress
CREATE POLICY "Users can read lot workflow progress"
  ON lot_workflow_progress FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role_custom IN ('admin', 'commercial', 'partenaire')
    )
  );

CREATE POLICY "Admins and commercials can manage lot workflow progress"
  ON lot_workflow_progress FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role_custom IN ('admin', 'commercial')
    )
  );

-- Fonction pour créer automatiquement les étapes de workflow pour un nouveau lot
CREATE OR REPLACE FUNCTION create_workflow_for_lot()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Créer une entrée de progression pour chaque étape définie
  INSERT INTO lot_workflow_progress (lot_id, step_code, status)
  SELECT NEW.id, code, 'pending'
  FROM workflow_steps
  ORDER BY order_index;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour créer les étapes de workflow lors de la création d'un lot
DROP TRIGGER IF EXISTS trigger_create_workflow_for_lot ON lots_lmnp;
CREATE TRIGGER trigger_create_workflow_for_lot
  AFTER INSERT ON lots_lmnp
  FOR EACH ROW
  EXECUTE FUNCTION create_workflow_for_lot();

-- Fonction pour marquer automatiquement les étapes selon le statut du lot
CREATE OR REPLACE FUNCTION update_workflow_on_status_change()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Si le statut a changé, marquer les étapes automatiques correspondantes
  IF NEW.statut IS DISTINCT FROM OLD.statut THEN
    UPDATE lot_workflow_progress
    SET 
      status = 'completed',
      completed_at = now(),
      completed_by = auth.uid()
    WHERE lot_id = NEW.id
      AND step_code IN (
        SELECT code FROM workflow_steps
        WHERE is_automatic = true
        AND trigger_on_status = NEW.statut
      )
      AND status = 'pending';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour mettre à jour les étapes automatiques
DROP TRIGGER IF EXISTS trigger_update_workflow_on_status ON lots_lmnp;
CREATE TRIGGER trigger_update_workflow_on_status
  AFTER UPDATE ON lots_lmnp
  FOR EACH ROW
  EXECUTE FUNCTION update_workflow_on_status_change();

-- Insérer les étapes du workflow
INSERT INTO workflow_steps (code, label, order_index, is_automatic, trigger_on_status, send_email, email_template, email_recipients, description)
VALUES
  ('signature_mission', 'Signature de la Lettre de mission', 1, false, null, true, 'mission_signed', ARRAY['vendeur', 'bo'], 'Lettre de mission signée par le vendeur'),
  ('relance_docs_vendeurs', 'Relance documents vendeurs', 2, false, null, true, 'docs_reminder', ARRAY['vendeur', 'bo'], 'Relance pour obtenir les documents administratifs'),
  ('option', 'Option', 3, true, 'option', true, 'option_notification', ARRAY['vendeur', 'bo', 'commercial'], 'Lot passé sous option'),
  ('reservation', 'Réservation', 4, true, 'reserve', false, null, null, 'Lot réservé par un acquéreur'),
  ('relance_syndic', 'Relance syndic', 5, false, null, false, null, null, 'Relance du syndic pour documents'),
  ('relance_service_proprio', 'Relance service propriétaire', 6, false, null, false, null, null, 'Relance du service propriétaire'),
  ('relance_cgp', 'Relance CGP', 7, false, null, false, null, null, 'Relance du conseiller en gestion de patrimoine'),
  ('compromis_signe', 'Compromis de vente signé', 8, true, 'compromis', false, null, null, 'Compromis de vente signé'),
  ('sru_envoye', 'SRU envoyé', 9, false, null, false, null, null, 'SRU (Statut des Risques et Pollutions) envoyé'),
  ('dia_envoyee', 'DIA envoyée', 10, false, null, false, null, null, 'DIA (Dossier Information Acquéreur) envoyée'),
  ('offre_prets_obtenu', 'Offre de prêts obtenu', 11, false, null, false, null, null, 'Offre de prêts bancaires obtenue'),
  ('offre_pret_signee', 'Offre de prêt signée', 12, false, null, false, null, null, 'Offre de prêt signée par l acquéreur'),
  ('date_estimee_acte', 'Date estimée acte', 13, false, null, false, null, null, 'Date estimée de l acte authentique'),
  ('preparation_acte', 'Préparation acte authentique', 14, false, null, false, null, null, 'Préparation de l acte authentique par le notaire'),
  ('acte_authentique', 'Acte authentique', 15, true, 'vendu', true, 'acte_signed', ARRAY['vendeur', 'acquereur', 'cgp', 'bo'], 'Acte authentique signé chez le notaire')
ON CONFLICT (code) DO UPDATE SET
  label = EXCLUDED.label,
  order_index = EXCLUDED.order_index,
  is_automatic = EXCLUDED.is_automatic,
  trigger_on_status = EXCLUDED.trigger_on_status,
  send_email = EXCLUDED.send_email,
  email_template = EXCLUDED.email_template,
  email_recipients = EXCLUDED.email_recipients,
  description = EXCLUDED.description,
  updated_at = now();

-- Créer les étapes de workflow pour les lots existants
INSERT INTO lot_workflow_progress (lot_id, step_code, status)
SELECT l.id, ws.code, 'pending'
FROM lots_lmnp l
CROSS JOIN workflow_steps ws
ON CONFLICT (lot_id, step_code) DO NOTHING;
