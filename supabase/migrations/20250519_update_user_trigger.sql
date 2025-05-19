-- Update the handle_new_user function to include is_admin
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, username, name, email, is_admin)
  VALUES (
    new.id,
    new.email,
    new.raw_user_meta_data->>'name',
    new.email,
    false
  );

  INSERT INTO public.user_preferences (user_id)
  VALUES (new.id);

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
