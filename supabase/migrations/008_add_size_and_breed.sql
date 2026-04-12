-- Add size and breed columns to pets table
-- Make birth_date nullable for pets with unknown birth dates

-- Add size column with constraint
ALTER TABLE pets ADD COLUMN IF NOT EXISTS size TEXT CHECK (size IN ('small', 'medium', 'large'));

-- Add breed column
ALTER TABLE pets ADD COLUMN IF NOT EXISTS breed TEXT;

-- Make birth_date nullable
ALTER TABLE pets ALTER COLUMN birth_date DROP NOT NULL;

-- Add column comments for documentation
COMMENT ON COLUMN pets.size IS 'Pet size: small, medium, or large';
COMMENT ON COLUMN pets.breed IS 'Pet breed name or "Sem Raça Definida (SRD)"';
COMMENT ON COLUMN pets.birth_date IS 'Pet birth date (optional)';
