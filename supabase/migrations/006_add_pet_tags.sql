-- Add tags column to pets table for temperament/personality traits
ALTER TABLE pets ADD COLUMN IF NOT EXISTS tags TEXT[];

-- Add comment for documentation
COMMENT ON COLUMN pets.tags IS 'Array of temperament tags (playful, lazy, stubborn, protective, sociable, foodie)';
