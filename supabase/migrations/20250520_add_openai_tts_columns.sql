-- Add OpenAI TTS columns to user_metadata
-- This migration adds columns for OpenAI TTS settings to the user_metadata table

-- Since user_metadata is stored in the auth.users table as a JSONB column,
-- we don't need to alter the table structure. The metadata is stored as a JSON object
-- and we'll access it using the keys tts_openai_voice and tts_openai_model.

-- However, we can create a function to ensure these fields are properly initialized
-- when a new user is created:

CREATE OR REPLACE FUNCTION public.initialize_user_metadata()
RETURNS TRIGGER AS $$
BEGIN
  -- Initialize OpenAI TTS settings if they don't exist
  NEW.raw_user_meta_data = 
    COALESCE(NEW.raw_user_meta_data, '{}'::jsonb) || 
    jsonb_build_object(
      'tts_openai_tts', COALESCE(NEW.raw_user_meta_data->>'tts_openai_tts', 'false'),
      'tts_openai_voice', COALESCE(NEW.raw_user_meta_data->>'tts_openai_voice', 'nova'),
      'tts_openai_model', COALESCE(NEW.raw_user_meta_data->>'tts_openai_model', 'tts-1')
    );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop the trigger if it exists
DROP TRIGGER IF EXISTS initialize_user_metadata_trigger ON auth.users;

-- Create the trigger
CREATE TRIGGER initialize_user_metadata_trigger
BEFORE INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.initialize_user_metadata();

-- Update existing users to have default OpenAI TTS settings
UPDATE auth.users
SET raw_user_meta_data = 
  raw_user_meta_data || 
  jsonb_build_object(
    'tts_openai_tts', COALESCE(raw_user_meta_data->>'tts_openai_tts', 'false'),
    'tts_openai_voice', COALESCE(raw_user_meta_data->>'tts_openai_voice', 'nova'),
    'tts_openai_model', COALESCE(raw_user_meta_data->>'tts_openai_model', 'tts-1')
  );
