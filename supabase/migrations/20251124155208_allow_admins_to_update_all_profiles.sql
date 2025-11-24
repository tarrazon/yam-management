/*
  # Permettre aux administrateurs de modifier tous les profils

  1. Modifications
    - Ajout d'une politique permettant aux utilisateurs avec role_custom = 'admin' de mettre à jour tous les profils
    - Cette politique est nécessaire pour la gestion des utilisateurs dans l'interface d'administration

  2. Sécurité
    - Seuls les utilisateurs avec le rôle 'admin' peuvent modifier les profils des autres utilisateurs
    - Les utilisateurs normaux peuvent toujours uniquement modifier leur propre profil
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'profiles' 
    AND policyname = 'Admins can update all profiles'
  ) THEN
    CREATE POLICY "Admins can update all profiles"
      ON profiles
      FOR UPDATE
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
  END IF;
END $$;
