/*
  # Fix Messages Table RLS Policies

  1. Changes
    - Drop existing RLS policies that reference the old chats table
    - Create new RLS policies that correctly reference chat_sessions
    - Ensure policies properly check chat ownership for both select and insert operations
  
  2. Security
    - Maintain row-level security
    - Users can only access messages in chats they own
    - Users can only insert messages in chats they own
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Users can access messages in their chats" ON messages;
DROP POLICY IF EXISTS "Users can insert messages in their chats" ON messages;

-- Create new policies with correct table references
CREATE POLICY "Users can access messages in their chats"
ON messages
FOR SELECT
TO public
USING (
  chat_id IN (
    SELECT id 
    FROM chat_sessions 
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can insert messages in their chats"
ON messages
FOR INSERT
TO public
WITH CHECK (
  chat_id IN (
    SELECT id 
    FROM chat_sessions 
    WHERE user_id = auth.uid()
  )
);