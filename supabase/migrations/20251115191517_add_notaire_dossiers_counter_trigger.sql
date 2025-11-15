/*
  # Compteur automatique des dossiers traités par notaire

  1. Fonction et trigger
    - Fonction pour mettre à jour le compteur de dossiers d'un notaire
    - Trigger sur INSERT/UPDATE/DELETE dans dossiers_vente
    - Compte uniquement les dossiers finalisés (statut = 'finalise')

  2. Initialisation
    - Mise à jour des compteurs existants pour tous les notaires

  3. Notes
    - Le compteur se met à jour automatiquement
    - Compte uniquement les dossiers avec statut 'finalise'
    - Gère les INSERT, UPDATE (changement de statut), et DELETE
*/

-- Fonction pour mettre à jour le compteur de dossiers d'un notaire
CREATE OR REPLACE FUNCTION update_notaire_dossiers_count()
RETURNS TRIGGER AS $$
BEGIN
  -- Si c'est un INSERT ou UPDATE et le dossier est finalisé
  IF (TG_OP = 'INSERT' OR TG_OP = 'UPDATE') AND NEW.statut = 'finalise' THEN
    -- Incrémenter le compteur pour le nouveau notaire
    UPDATE notaires
    SET nombre_dossiers = (
      SELECT COUNT(*)
      FROM dossiers_vente
      WHERE notaire_id = NEW.notaire_id
      AND statut = 'finalise'
    )
    WHERE id = NEW.notaire_id;
  END IF;

  -- Si c'est un UPDATE et l'ancien statut était finalisé mais plus maintenant
  IF TG_OP = 'UPDATE' AND OLD.statut = 'finalise' AND NEW.statut != 'finalise' THEN
    -- Décrémenter le compteur pour l'ancien notaire
    UPDATE notaires
    SET nombre_dossiers = (
      SELECT COUNT(*)
      FROM dossiers_vente
      WHERE notaire_id = OLD.notaire_id
      AND statut = 'finalise'
    )
    WHERE id = OLD.notaire_id;
  END IF;

  -- Si c'est un UPDATE avec changement de notaire
  IF TG_OP = 'UPDATE' AND OLD.notaire_id IS DISTINCT FROM NEW.notaire_id THEN
    -- Mettre à jour l'ancien notaire si le dossier était finalisé
    IF OLD.notaire_id IS NOT NULL AND OLD.statut = 'finalise' THEN
      UPDATE notaires
      SET nombre_dossiers = (
        SELECT COUNT(*)
        FROM dossiers_vente
        WHERE notaire_id = OLD.notaire_id
        AND statut = 'finalise'
      )
      WHERE id = OLD.notaire_id;
    END IF;

    -- Mettre à jour le nouveau notaire si le dossier est finalisé
    IF NEW.notaire_id IS NOT NULL AND NEW.statut = 'finalise' THEN
      UPDATE notaires
      SET nombre_dossiers = (
        SELECT COUNT(*)
        FROM dossiers_vente
        WHERE notaire_id = NEW.notaire_id
        AND statut = 'finalise'
      )
      WHERE id = NEW.notaire_id;
    END IF;
  END IF;

  -- Si c'est un DELETE et le dossier était finalisé
  IF TG_OP = 'DELETE' AND OLD.statut = 'finalise' THEN
    UPDATE notaires
    SET nombre_dossiers = (
      SELECT COUNT(*)
      FROM dossiers_vente
      WHERE notaire_id = OLD.notaire_id
      AND statut = 'finalise'
    )
    WHERE id = OLD.notaire_id;
  END IF;

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Supprimer le trigger s'il existe déjà
DROP TRIGGER IF EXISTS trigger_update_notaire_dossiers_count ON dossiers_vente;

-- Créer le trigger
CREATE TRIGGER trigger_update_notaire_dossiers_count
  AFTER INSERT OR UPDATE OR DELETE ON dossiers_vente
  FOR EACH ROW
  EXECUTE FUNCTION update_notaire_dossiers_count();

-- Initialiser les compteurs pour tous les notaires existants
UPDATE notaires
SET nombre_dossiers = (
  SELECT COUNT(*)
  FROM dossiers_vente
  WHERE dossiers_vente.notaire_id = notaires.id
  AND dossiers_vente.statut = 'finalise'
);
