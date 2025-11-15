/*
  # Ajout de la date automatique pour le statut "reserve"

  1. Modifications du trigger
    - Ajoute le remplissage automatique de date_prise_option lors du passage en "reserve"
    - Conserve la logique existante pour "compromis"
    - Conserve la réinitialisation lors du retour en "disponible"

  2. Logique métier
    - Sous option → Reserve : Remplit date_prise_option automatiquement
    - Reserve → Compromis : Remplit date_signature_compromis automatiquement
    - Retour en disponible : Réinitialise toutes les dates
*/

-- Fonction améliorée pour gérer les dates selon le statut
CREATE OR REPLACE FUNCTION set_date_compromis_on_status_change()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  -- Si le statut passe à "disponible", réinitialiser TOUTES les dates
  IF NEW.statut = 'disponible' AND OLD.statut != 'disponible' THEN
    NEW.date_prise_option := NULL;
    NEW.date_signature_compromis := NULL;
    NEW.date_signature_acte := NULL;
    NEW.date_premier_contact := NULL;
    NEW.observations_suivi := NULL;
    NEW.comptes_rendus_visite := NULL;
    NEW.observations_acquereurs := NULL;
    NEW.negociation_en_cours := NULL;
  
  -- Si le statut passe à "reserve" depuis "sous_option", remplir la date de prise d'option
  ELSIF OLD.statut = 'sous_option' 
     AND NEW.statut = 'reserve' 
     AND (NEW.date_prise_option IS NULL OR NEW.date_prise_option = OLD.date_prise_option)
  THEN
    NEW.date_prise_option := CURRENT_DATE;
  
  -- Si le statut passe de "reserve" à "compromis", remplir la date du compromis
  ELSIF OLD.statut = 'reserve' 
     AND NEW.statut = 'compromis' 
     AND (NEW.date_signature_compromis IS NULL OR NEW.date_signature_compromis = OLD.date_signature_compromis)
  THEN
    NEW.date_signature_compromis := CURRENT_DATE;
  
  -- Si le statut revient en arrière (compromis -> reserve ou sous_option), réinitialiser la date du compromis
  ELSIF OLD.statut = 'compromis' 
     AND NEW.statut IN ('reserve', 'sous_option')
  THEN
    NEW.date_signature_compromis := NULL;
  
  -- Si le statut revient à sous_option depuis reserve, compromis ou vendu, réinitialiser les dates futures
  ELSIF NEW.statut = 'sous_option'
     AND OLD.statut IN ('reserve', 'compromis', 'vendu')
  THEN
    NEW.date_prise_option := NULL;
    NEW.date_signature_compromis := NULL;
    NEW.date_signature_acte := NULL;
  
  -- Si le statut revient à reserve depuis compromis ou vendu, réinitialiser les dates futures
  ELSIF NEW.statut = 'reserve'
     AND OLD.statut IN ('compromis', 'vendu')
  THEN
    NEW.date_signature_compromis := NULL;
    NEW.date_signature_acte := NULL;
  
  END IF;

  RETURN NEW;
END;
$$;
