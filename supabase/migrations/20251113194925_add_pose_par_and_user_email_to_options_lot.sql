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
