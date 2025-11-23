/*
  # Update partenaires type system for hierarchical multi-selection

  1. Changes
    - Change `type_partenaire` from text to jsonb to store hierarchical selections
    - The JSON structure will be: { "cgp": ["etudiant", "affaires"], "agent_immobilier": [...], ... }
    - Migrate existing data to new format

  2. Structure
    Main categories (level 1):
      - cgp
      - conseiller_investissement
      - agent_immobilier
      - notaire
      - avocat
      - vendeur_immobilier

    Sub-categories vary by main category (see detailed hierarchy in code)
*/

-- First, backup existing type_partenaire values
DO $$
DECLARE
  rec RECORD;
BEGIN
  -- Update existing records to new JSONB format
  FOR rec IN SELECT id, type_partenaire FROM partenaires WHERE type_partenaire IS NOT NULL
  LOOP
    -- Convert old single type to new format
    -- Default: map old types to new categories
    UPDATE partenaires 
    SET type_partenaire = 
      CASE 
        WHEN rec.type_partenaire = 'cgp' THEN '{"cgp": []}'::jsonb
        WHEN rec.type_partenaire = 'conseiller' THEN '{"conseiller_investissement": []}'::jsonb
        WHEN rec.type_partenaire = 'agent' THEN '{"agent_immobilier": []}'::jsonb
        WHEN rec.type_partenaire = 'notaire' THEN '{"notaire": []}'::jsonb
        WHEN rec.type_partenaire = 'avocat' THEN '{"avocat": []}'::jsonb
        WHEN rec.type_partenaire = 'vendeur' THEN '{"vendeur_immobilier": []}'::jsonb
        ELSE '{}'::jsonb
      END
    WHERE id = rec.id;
  END LOOP;
END $$;

-- Change column type to jsonb
ALTER TABLE partenaires ALTER COLUMN type_partenaire TYPE jsonb USING 
  CASE 
    WHEN type_partenaire IS NULL THEN '{}'::jsonb
    ELSE type_partenaire::jsonb
  END;

-- Set default to empty JSON object
ALTER TABLE partenaires ALTER COLUMN type_partenaire SET DEFAULT '{}'::jsonb;