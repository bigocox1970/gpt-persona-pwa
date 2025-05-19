-- Update persona colors in the database to ensure consistency
-- This migration ensures all personas use the same color scheme

-- Check if background_color and text_color columns exist
DO $$
BEGIN
  -- Add background_color column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'personas' AND column_name = 'background_color'
  ) THEN
    ALTER TABLE personas ADD COLUMN background_color text;
  END IF;

  -- Add text_color column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'personas' AND column_name = 'text_color'
  ) THEN
    ALTER TABLE personas ADD COLUMN text_color text;
  END IF;
END $$;

-- Update all personas to use the same color scheme
UPDATE personas
SET 
  background_color = '#443627',
  text_color = '#EFDCAB';

-- Specifically ensure Marcus Aurelius has the correct colors
UPDATE personas
SET 
  background_color = '#443627',
  text_color = '#EFDCAB'
WHERE name = 'Marcus Aurelius' OR id = '7d9e3b1c-e491-4b5c-9f06-24b43b247178';

-- Specifically ensure Napoleon Hill has the correct colors
UPDATE personas
SET 
  background_color = '#443627',
  text_color = '#EFDCAB'
WHERE name = 'Napoleon Hill' OR id = 'a2e4c6b8-d0f2-4e6a-8c0d-9b3e7f5a1d2c';

-- Specifically ensure GPT Classic has the correct colors
UPDATE personas
SET 
  background_color = '#443627',
  text_color = '#EFDCAB'
WHERE name = 'GPT Classic (no persona)' OR id = 'e5f9d8c7-b6a5-4c3d-a2e1-f0b9d8c7a6b5';
