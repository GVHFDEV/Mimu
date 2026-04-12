# Instruções para Migração da Tabela health_events

## Passo 1: Acessar o Supabase Dashboard

1. Acesse https://supabase.com/dashboard
2. Selecione seu projeto Mimu
3. No menu lateral, clique em "SQL Editor"

## Passo 2: Executar a Migração

1. Clique em "New Query"
2. Copie todo o conteúdo do arquivo `supabase/migrations/009_create_health_events.sql`
3. Cole no editor SQL
4. Clique em "Run" (ou pressione Ctrl+Enter)

## Passo 3: Verificar a Criação

Execute esta query para verificar se a tabela foi criada:

```sql
SELECT * FROM health_events LIMIT 1;
```

Se não houver erro, a migração foi bem-sucedida!

## Passo 4: Testar a Aplicação

1. Execute `npm run dev` no terminal
2. Acesse http://localhost:3000/dashboard/health
3. Clique no botão "+" (FAB)
4. Clique em "Vacina", "Medicação" ou "Consulta"
5. Preencha o formulário e salve
6. Verifique se o evento aparece na timeline

## Troubleshooting

Se encontrar erro "relation health_events does not exist":
- Verifique se executou a migração no projeto correto
- Confirme que não há erros no SQL Editor

Se os eventos não aparecerem:
- Abra o Console do navegador (F12)
- Verifique se há erros relacionados a RLS (Row Level Security)
- Confirme que está logado com o usuário correto
