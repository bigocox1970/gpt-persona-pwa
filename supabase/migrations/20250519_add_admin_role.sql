-- Add is_admin column to profiles table
ALTER TABLE profiles ADD COLUMN is_admin BOOLEAN DEFAULT false;

-- Add RLS policy for admin access
CREATE POLICY "Allow admin access to all profiles"
ON profiles FOR ALL
TO authenticated
USING (EXISTS (
  SELECT 1 FROM profiles
  WHERE id = auth.uid() AND is_admin = true
));

-- Add RLS policy for admin access to personas
CREATE POLICY "Allow admin access to all personas"
ON personas FOR ALL
TO authenticated
USING (EXISTS (
  SELECT 1 FROM profiles
  WHERE id = auth.uid() AND is_admin = true
));

-- Add RLS policy for admin access to api_calls
CREATE POLICY "Allow admin access to all api_calls"
ON api_calls FOR ALL
TO authenticated
USING (EXISTS (
  SELECT 1 FROM profiles
  WHERE id = auth.uid() AND is_admin = true
));
