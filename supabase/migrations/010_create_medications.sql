-- Script para criar tabela medications
-- Execute este script completo no SQL Editor do Supabase

-- Criar a tabela medications
CREATE TABLE medications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_id UUID NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  dose TEXT NOT NULL,
  frequency TEXT NOT NULL,
  is_continuous BOOLEAN NOT NULL DEFAULT false,
  start_date DATE NOT NULL,
  end_date DATE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE medications ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their pets' medications" ON medications;
DROP POLICY IF EXISTS "Users can insert medications for their pets" ON medications;
DROP POLICY IF EXISTS "Users can update their pets' medications" ON medications;
DROP POLICY IF EXISTS "Users can delete their pets' medications" ON medications;

-- Create RLS Policies
CREATE POLICY "Users can view their pets' medications"
  ON medications FOR SELECT
  USING (owner_id = auth.uid());

CREATE POLICY "Users can insert medications for their pets"
  ON medications FOR INSERT
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Users can update their pets' medications"
  ON medications FOR UPDATE
  USING (owner_id = auth.uid());

CREATE POLICY "Users can delete their pets' medications"
  ON medications FOR DELETE
  USING (owner_id = auth.uid());

-- Create indexes for performance
CREATE INDEX medications_pet_id_idx ON medications(pet_id);
CREATE INDEX medications_owner_id_idx ON medications(owner_id);
CREATE INDEX medications_start_date_idx ON medications(start_date DESC);

-- Add comments
COMMENT ON TABLE medications IS 'Medications and treatments for pets';
COMMENT ON COLUMN medications.is_continuous IS 'Whether the medication is continuous (no end date)';
COMMENT ON COLUMN medications.start_date IS 'Date when the medication started';
COMMENT ON COLUMN medications.end_date IS 'Date when the medication ends (null if continuous)';

-- Verificar se foi criado corretamente
SELECT 'Tabela medications criada com sucesso!' as status;
SELECT COUNT(*) as total_policies FROM pg_policies WHERE tablename = 'medications';
