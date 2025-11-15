/*
  # Réinitialisation des dates lors du retour en disponible

  1. Modifications du trigger
    - Améliore le trigger existant pour gérer le retour en disponible
    - Si le statut passe à "disponible", réinitialise :
      * date_prise_option
      * date_signature_compromis
      * date_signature_acte
      * date_premier_contact
    - Si le statut passe de "reserve" à "compromis", remplit date_signature_compromis
    - Si le statut passe de "compromis" à "reserve" ou "sous_option", réinitialise date_signature_compromis

  2. Logique métier
    - Un lot qui repasse en disponible perd toutes ses dates de suivi
    - Un lot qui revient en arrière dans le pipeline perd les dates des étapes futures
    - Les dates ne sont remplies automatiquement que lors de la progression normale
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

-- Le trigger existe déjà, pas besoin de le recréer
-- Il utilisera automatiquement la nouvelle version de la fonction
