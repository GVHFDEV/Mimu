-- Add health and biometric fields to pets table
ALTER TABLE pets ADD COLUMN IF NOT EXISTS sex TEXT CHECK (sex IN ('male', 'female'));
ALTER TABLE pets ADD COLUMN IF NOT EXISTS weight DECIMAL(5,2);
ALTER TABLE pets ADD COLUMN IF NOT EXISTS birth_date DATE;

-- Add comments for documentation
COMMENT ON COLUMN pets.sex IS 'Pet sex: male or female';
COMMENT ON COLUMN pets.weight IS 'Pet weight in kilograms';
COMMENT ON COLUMN pets.birth_date IS 'Pet birth date or approximate date';
