# Verificação da Tabela health_events Existente

A tabela `health_events` já existe no seu banco de dados. Vamos verificar se ela tem a estrutura correta.

## Passo 1: Verificar Estrutura Atual

Execute esta query no SQL Editor do Supabase:

```sql
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'health_events'
ORDER BY ordinal_position;
```

## Passo 2: Verificar RLS Policies

Execute esta query para ver as policies:

```sql
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename = 'health_events';
```

## Passo 3: Verificar Índices

```sql
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename = 'health_events';
```

## Se a Estrutura Estiver Correta

Se a tabela já tem todas as colunas necessárias (id, pet_id, type, title, date, description, veterinarian, notes, created_at, updated_at) e as RLS policies, você pode pular a migração e ir direto para testar a aplicação!

## Se Precisar Recriar a Tabela

Se a estrutura estiver diferente, execute:

```sql
-- CUIDADO: Isso vai apagar todos os dados existentes
DROP TABLE IF EXISTS health_events CASCADE;

-- Depois execute o conteúdo completo de 009_create_health_events.sql
```

## Teste Rápido

Para testar se está funcionando, tente inserir um evento manualmente:

```sql
INSERT INTO health_events (pet_id, type, title, date, description)
VALUES (
    'SEU_PET_ID_AQUI',
    'vaccine',
    'Teste',
    '2026-04-12',
    'Teste de inserção'
);
```

Substitua `SEU_PET_ID_AQUI` pelo ID de um dos seus pets (você pode pegar com `SELECT id FROM pets LIMIT 1;`)
