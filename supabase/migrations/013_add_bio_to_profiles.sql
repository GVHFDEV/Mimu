-- Add bio field to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS bio TEXT;

-- Add comment for documentation
COMMENT ON COLUMN profiles.bio IS 'User biography describing their relationship with their pets';
