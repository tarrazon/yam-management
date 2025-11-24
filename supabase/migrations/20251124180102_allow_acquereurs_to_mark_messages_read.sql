/*
  # Permettre aux acquéreurs de marquer leurs messages comme lus

  1. Modification
    - Ajoute une policy UPDATE pour permettre aux acquéreurs de marquer comme lus les messages de l'admin

  2. Sécurité
    - Les acquéreurs ne peuvent marquer que les messages qui leur sont destinés
    - Les acquéreurs ne peuvent marquer que les messages envoyés par l'admin
*/

CREATE POLICY "Acquéreurs peuvent marquer les messages admin comme lus"
  ON messages_admin FOR UPDATE
  TO authenticated
  USING (
    expediteur_type = 'admin'
    AND EXISTS (
      SELECT 1 FROM acquereurs
      WHERE acquereurs.id = messages_admin.acquereur_id
      AND acquereurs.user_id = auth.uid()
    )
  )
  WITH CHECK (
    expediteur_type = 'admin'
    AND EXISTS (
      SELECT 1 FROM acquereurs
      WHERE acquereurs.id = messages_admin.acquereur_id
      AND acquereurs.user_id = auth.uid()
    )
  );
