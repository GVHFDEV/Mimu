-- Add XP and level fields to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS xp INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS level INTEGER DEFAULT 1;

COMMENT ON COLUMN profiles.xp IS 'Total experience points earned';
COMMENT ON COLUMN profiles.level IS 'Current user level (1-10)';
