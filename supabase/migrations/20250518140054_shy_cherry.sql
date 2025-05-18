/*
  # Update personas and chat sessions schema
  
  1. New Tables
    - Creates personas table with required fields
    - Recreates chat_sessions table with UUID persona_id
  
  2. Data Migration
    - Inserts initial persona data
    - Preserves existing chat session data
  
  3. Security
    - Enables RLS on both tables
    - Adds appropriate access policies
*/

-- Create personas table
CREATE TABLE IF NOT EXISTS personas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  image_url text,
  context_file_url text,
  topic text,
  created_at timestamptz DEFAULT now()
);

-- Insert initial personas data
INSERT INTO personas (id, name, description, image_url, topic) VALUES
  ('c9f771d7-2320-4574-a3d0-3597e9fe35b2', 'Albert Einstein', 'The father of relativity and quantum physics theories, known for his intellectual achievements and thought experiments.', '/images/albert-einstein-card.png', 'physics'),
  ('7d9e3b1c-e491-4b5c-9f06-24b43b247178', 'Marcus Aurelius', 'Stoic philosopher and Roman Emperor from 161 to 180 AD, known for his philosophical work "Meditations."', '/images/marcus-aurelius-card.png', 'philosophy'),
  ('f6d8a35e-c2d4-4a9b-b5d1-1c5f7e89d4b3', 'Alan Watts', 'British philosopher who interpreted Eastern wisdom for Western audiences, known for his insights on consciousness and existence.', '/images/alan-watts-card.jpg', 'philosophy'),
  ('a2e4c6b8-d0f2-4e6a-8c0d-9b3e7f5a1d2c', 'Napoleon Hill', 'Pioneer of personal success literature and author of "Think and Grow Rich", known for his principles of achievement.', '/images/napolian-hill-card.jpg', 'success'),
  ('b1d9e3f5-a7c2-4b8e-9d6f-8a4c2e0b1d9e', 'Neville Goddard', 'Spiritual teacher and author known for his practical philosophy of consciousness and manifestation.', '/images/neville-goddard-card.png', 'spirituality');

-- Enable RLS
ALTER TABLE personas ENABLE ROW LEVEL SECURITY;

-- Allow public read access to personas
CREATE POLICY "Anyone can view personas"
  ON personas
  FOR SELECT
  TO public
  USING (true);

-- Create a temporary table to store existing chat_sessions data
CREATE TEMP TABLE temp_chat_sessions AS
SELECT * FROM chat_sessions;

-- Drop existing constraints if they exist
ALTER TABLE messages DROP CONSTRAINT IF EXISTS messages_chat_id_fkey;
ALTER TABLE highlights DROP CONSTRAINT IF EXISTS highlights_chat_id_fkey;
ALTER TABLE notes DROP CONSTRAINT IF EXISTS notes_chat_id_fkey;
ALTER TABLE todos DROP CONSTRAINT IF EXISTS todos_chat_id_fkey;

-- Drop existing chat_sessions table and its dependencies
DROP TABLE IF EXISTS chat_sessions CASCADE;

-- Recreate chat_sessions table with UUID persona_id
CREATE TABLE chat_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  persona_id uuid NOT NULL REFERENCES personas(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  last_message_at timestamptz DEFAULT now()
);

-- Copy data back from temporary table, ensuring persona_id exists
INSERT INTO chat_sessions (id, user_id, persona_id, created_at, last_message_at)
SELECT 
  id,
  user_id,
  COALESCE(
    (SELECT id FROM personas WHERE personas.id = temp_chat_sessions.persona_id::uuid),
    'c9f771d7-2320-4574-a3d0-3597e9fe35b2'  -- Default to Einstein if persona not found
  ),
  created_at,
  last_message_at
FROM temp_chat_sessions;

-- Drop existing constraints again to ensure clean slate
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'messages_chat_id_fkey') THEN
    ALTER TABLE messages DROP CONSTRAINT messages_chat_id_fkey;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'highlights_chat_id_fkey') THEN
    ALTER TABLE highlights DROP CONSTRAINT highlights_chat_id_fkey;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'notes_chat_id_fkey') THEN
    ALTER TABLE notes DROP CONSTRAINT notes_chat_id_fkey;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'todos_chat_id_fkey') THEN
    ALTER TABLE todos DROP CONSTRAINT todos_chat_id_fkey;
  END IF;
END $$;

-- Recreate foreign key constraints
ALTER TABLE messages
  ADD CONSTRAINT messages_chat_id_fkey
  FOREIGN KEY (chat_id)
  REFERENCES chat_sessions(id)
  ON DELETE CASCADE;

ALTER TABLE highlights
  ADD CONSTRAINT highlights_chat_id_fkey
  FOREIGN KEY (chat_id)
  REFERENCES chat_sessions(id)
  ON DELETE CASCADE;

ALTER TABLE notes
  ADD CONSTRAINT notes_chat_id_fkey
  FOREIGN KEY (chat_id)
  REFERENCES chat_sessions(id)
  ON DELETE SET NULL;

ALTER TABLE todos
  ADD CONSTRAINT todos_chat_id_fkey
  FOREIGN KEY (chat_id)
  REFERENCES chat_sessions(id)
  ON DELETE SET NULL;

-- Enable RLS on chat_sessions
ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;

-- Add policies for chat_sessions
CREATE POLICY "Users can view their own chat sessions"
  ON chat_sessions
  FOR SELECT
  TO public
  USING (user_id = auth.uid());

CREATE POLICY "Users can create their own chat sessions"
  ON chat_sessions
  FOR INSERT
  TO public
  WITH CHECK (user_id = auth.uid());

-- Drop temporary table
DROP TABLE temp_chat_sessions;