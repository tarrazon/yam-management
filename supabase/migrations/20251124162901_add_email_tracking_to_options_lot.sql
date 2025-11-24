/*
  # Ajout du suivi des emails pour les options

  1. Modifications
    - Ajoute `notification_recipient` à `options_lot` - Email du destinataire de la notification
    - Ajoute `email_scheduled_at` à `options_lot` - Date prévue d'envoi de l'email
    - Ajoute `email_sent` à `options_lot` - Booléen indiquant si l'email a été envoyé
    - Ajoute `email_sent_at` à `options_lot` - Date d'envoi réel de l'email

  2. Notes
    - Ces champs permettent de suivre les notifications envoyées pour chaque option
    - `notification_recipient` stocke l'email du destinataire prévu
    - `email_scheduled_at` indique quand l'email doit être envoyé
    - `email_sent` confirme si l'envoi a eu lieu
    - `email_sent_at` enregistre la date effective d'envoi
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'options_lot' AND column_name = 'notification_recipient'
  ) THEN
    ALTER TABLE options_lot ADD COLUMN notification_recipient text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'options_lot' AND column_name = 'email_scheduled_at'
  ) THEN
    ALTER TABLE options_lot ADD COLUMN email_scheduled_at timestamptz;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'options_lot' AND column_name = 'email_sent'
  ) THEN
    ALTER TABLE options_lot ADD COLUMN email_sent boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'options_lot' AND column_name = 'email_sent_at'
  ) THEN
    ALTER TABLE options_lot ADD COLUMN email_sent_at timestamptz;
  END IF;
END $$;