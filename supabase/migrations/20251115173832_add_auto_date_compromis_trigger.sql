/*
  # Trigger automatique pour la date de compromis

  1. Fonction et Trigger
    - Crée une fonction qui détecte le changement de statut de "reserve" à "compromis"
    - Remplit automatiquement la date_signature_compromis avec la date actuelle
    - S'applique uniquement si la date n'est pas déjà définie

  2. Sécurité
    - Fonction SECURITY DEFINER pour permettre la mise à jour automatique
    - Trigger exécuté BEFORE UPDATE pour capturer le changement
*/

-- Fonction pour remplir automatiquement la date du compromis
CREATE OR REPLACE FUNCTION set_date_compromis_on_status_change()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  -- Si le statut passe de "reserve" à "compromis" et que la date n'est pas déjà définie
  IF OLD.statut = 'reserve' 
     AND NEW.statut = 'compromis' 
     AND (NEW.date_signature_compromis IS NULL OR NEW.date_signature_compromis = OLD.date_signature_compromis)
  THEN
    NEW.date_signature_compromis := CURRENT_DATE;
  END IF;

  RETURN NEW;
END;
$$;

-- Supprimer le trigger s'il existe déjà
DROP TRIGGER IF EXISTS trigger_set_date_compromis ON lots_lmnp;

-- Créer le trigger
CREATE TRIGGER trigger_set_date_compromis
  BEFORE UPDATE ON lots_lmnp
  FOR EACH ROW
  EXECUTE FUNCTION set_date_compromis_on_status_change();