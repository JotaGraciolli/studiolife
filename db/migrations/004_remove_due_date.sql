-- Migração: remove a coluna due_date da tabela clients
-- Execute este script no SQL Editor do Supabase

ALTER TABLE public.clients DROP COLUMN IF EXISTS due_date;
