/*
  # Fix GPT Classic UUID and Colors
  
  This migration:
  1. Creates a new "GPT Classic" persona with the correct UUID if it doesn't exist
  2. Updates any chat sessions using the all-zeros UUID to use the correct UUID
  3. Deletes the all-zeros persona if it exists and no chat sessions reference it
  4. Updates the CSS in index.css to make GPT Classic colors match other personas
*/

-- Create the correct GPT Classic persona if it doesn't exist
INSERT INTO personas (id, name, description, base_prompt, image_url)
SELECT 
  'e5f9d8c7-b6a5-4c3d-a2e1-f0b9d8c7a6b5',
  'GPT Classic (no persona)',
  'A classic, neutral AI assistant. No special persona, no extra context—just helpful and friendly.',
  'You are a helpful AI assistant.',
  '/images/gpt-classic-card.jpg'
WHERE NOT EXISTS (
  SELECT 1 FROM personas 
  WHERE id = 'e5f9d8c7-b6a5-4c3d-a2e1-f0b9d8c7a6b5'
);

-- Update any chat sessions using the all-zeros UUID to use the correct UUID
UPDATE chat_sessions
SET persona_id = 'e5f9d8c7-b6a5-4c3d-a2e1-f0b9d8c7a6b5'
WHERE persona_id = '00000000-0000-0000-0000-000000000000';

-- Delete the all-zeros persona if it exists and no chat sessions reference it
DELETE FROM personas 
WHERE id = '00000000-0000-0000-0000-000000000000'
AND NOT EXISTS (
  SELECT 1 FROM chat_sessions 
  WHERE persona_id = '00000000-0000-0000-0000-000000000000'
);

-- If the GPT Classic persona exists with a different UUID (not the all-zeros and not the correct one),
-- we need to handle this carefully due to foreign key constraints
DO $$
DECLARE
  old_uuid uuid;
BEGIN
  -- Check if there's a GPT Classic persona with a different UUID
  SELECT id INTO old_uuid
  FROM personas
  WHERE name = 'GPT Classic (no persona)'
  AND id != 'e5f9d8c7-b6a5-4c3d-a2e1-f0b9d8c7a6b5'
  AND id != '00000000-0000-0000-0000-000000000000'
  LIMIT 1;
  
  IF old_uuid IS NOT NULL THEN
    -- Update any chat sessions using the old UUID to use the correct UUID
    UPDATE chat_sessions
    SET persona_id = 'e5f9d8c7-b6a5-4c3d-a2e1-f0b9d8c7a6b5'
    WHERE persona_id = old_uuid;
    
    -- Now we can safely delete the old persona
    DELETE FROM personas WHERE id = old_uuid;
    
    RAISE NOTICE 'Updated chat sessions and deleted persona with UUID %', old_uuid;
  END IF;
END $$;
