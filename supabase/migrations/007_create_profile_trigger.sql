-- Create function to handle new user creation
-- This function runs with elevated privileges (security definer)
-- and automatically creates a profile when a new user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  -- Insert profile with data from auth.users metadata
  INSERT INTO public.profiles (id, username, country, created_at, updated_at)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', 'User'),
    COALESCE(NEW.raw_user_meta_data->>'country', 'BR'),
    NOW(),
    NOW()
  );

  RETURN NEW;
END;
$$;

-- Create trigger that fires after user creation
-- This ensures profile is created automatically for both email and OAuth signups
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO postgres, anon, authenticated, service_role;

-- Comment for documentation
COMMENT ON FUNCTION public.handle_new_user() IS 'Automatically creates a profile when a new user signs up via email or OAuth. Reads username and country from raw_user_meta_data.';
