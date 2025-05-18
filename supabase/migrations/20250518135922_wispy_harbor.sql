/*
  # Add Personas Table and Fix Foreign Key Relationship

  1. New Tables
    - `personas`
      - `id` (uuid, primary key)
      - `name` (text)
      - `description` (text)
      - `image_url` (text)
      - `context_file_url` (text)
      - `topic` (text)
      - `created_at` (timestamp)

  2. Changes
    - Modify chat_sessions table to use uuid for persona_id
    - Add foreign key constraint between chat_sessions and personas

  3. Security
    - Enable RLS on personas table
    - Add policies for public access to personas
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

ALTER TABLE personas ENABLE ROW LEVEL SECURITY;

-- Allow public read access to personas
CREATE POLICY "Anyone can view personas"
  ON personas
  FOR SELECT
  TO public
  USING (true);

-- Modify chat_sessions table to use uuid for persona_id
ALTER TABLE chat_sessions
  ALTER COLUMN persona_id TYPE uuid USING persona_id::uuid;

-- Add foreign key constraint
ALTER TABLE chat_sessions
  ADD CONSTRAINT chat_sessions_persona_id_fkey
  FOREIGN KEY (persona_id)
  REFERENCES personas(id)
  ON DELETE CASCADE;