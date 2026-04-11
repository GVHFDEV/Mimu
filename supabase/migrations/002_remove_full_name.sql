-- Migration para remover o campo full_name (se você já executou a migration anterior)
-- Execute este script APENAS se você já tinha criado a tabela profiles com o campo full_name

-- Remove a coluna full_name se ela existir
ALTER TABLE profiles DROP COLUMN IF EXISTS full_name;
