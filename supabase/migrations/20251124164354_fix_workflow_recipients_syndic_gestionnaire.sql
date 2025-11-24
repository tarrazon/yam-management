/*
  # Correction des destinataires workflow syndic et gestionnaire

  1. Modifications
    - Mise à jour de l'étape "relance_service_proprio" pour envoyer au gestionnaire
    - Confirmation que "relance_syndic" envoie bien au contact_residence

  2. Détails
    - relance_syndic : contact_residence (syndic)
    - relance_service_proprio : gestionnaire (service propriétaire)
*/

-- Mise à jour de l'étape relance_service_proprio pour envoyer au gestionnaire
UPDATE workflow_steps
SET 
  email_recipients = ARRAY['gestionnaire']::text[],
  description = 'Relance du gestionnaire/service propriétaire pour documents'
WHERE code = 'relance_service_proprio';

-- Vérification que relance_syndic est bien configuré
UPDATE workflow_steps
SET 
  email_recipients = ARRAY['contact_residence']::text[],
  description = 'Relance du syndic/contact résidence pour documents'
WHERE code = 'relance_syndic';
