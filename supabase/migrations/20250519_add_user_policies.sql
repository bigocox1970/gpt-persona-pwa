-- Add RLS policy for users to view their own profile
CREATE POLICY "Users can view their own profile data"
ON profiles FOR SELECT
TO authenticated
USING (
  auth.uid() = id
  OR 
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND is_admin = true
  )
);

-- Add RLS policy for users to update their own profile
CREATE POLICY "Users can update their own profile"
ON profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Add RLS policy for users to view their own API calls
CREATE POLICY "Users can view their own api calls"
ON api_calls FOR SELECT
TO authenticated
USING (
  user_id = auth.uid()
  OR 
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND is_admin = true
  )
);

-- Add RLS policy for users to view personas
CREATE POLICY "Allow all users to view personas"
ON personas FOR SELECT
TO authenticated
USING (true);

-- Add RLS policy for users to create API calls
CREATE POLICY "Users can create their own api calls"
ON api_calls FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());
