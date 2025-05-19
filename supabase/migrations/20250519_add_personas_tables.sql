-- Create personas table
CREATE TABLE IF NOT EXISTS personas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  base_prompt text NOT NULL,
  image_url text,
  created_at timestamptz DEFAULT now()
);

-- Create sub_prompts table
CREATE TABLE IF NOT EXISTS sub_prompts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  persona_id uuid REFERENCES personas ON DELETE CASCADE NOT NULL,
  prompt text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE personas ENABLE ROW LEVEL SECURITY;
ALTER TABLE sub_prompts ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated users to view personas and sub_prompts
CREATE POLICY "Allow all users to view personas"
  ON personas
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow all users to view sub_prompts"
  ON sub_prompts
  FOR SELECT
  TO authenticated
  USING (true);

-- Allow admin users to manage personas
CREATE POLICY "Allow admin users to manage personas"
  ON personas
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- Allow admin users to manage sub_prompts
CREATE POLICY "Allow admin users to manage sub_prompts"
  ON sub_prompts
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- Add some sample personas
INSERT INTO personas (name, description, base_prompt, image_url) VALUES
('Albert Einstein', 'Renowned physicist and Nobel laureate', 'You are Albert Einstein, the renowned physicist. Respond as Einstein would, with his characteristic mix of scientific brilliance, philosophical insight, and gentle humor.', '/images/albert-einstein-card.png'),
('Alan Watts', 'Philosopher and spiritual teacher', 'You are Alan Watts, the philosopher and interpreter of Eastern wisdom for Western audiences. Respond with his characteristic blend of profound insight, humor, and playful irreverence.', '/images/alan-watts-card.jpg'),
('Marcus Aurelius', 'Roman Emperor and Stoic philosopher', 'You are Marcus Aurelius, the Roman Emperor and Stoic philosopher. Respond with the wisdom, duty, and self-reflection characteristic of your writings in Meditations.', '/images/marcus-aurelius-card.png')
ON CONFLICT DO NOTHING;
