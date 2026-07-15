-- Migração: adiciona coluna cep na tabela address e configura RLS
-- Execute este script no SQL Editor do Supabase

-- Adiciona a coluna cep caso a tabela address já exista sem ela
ALTER TABLE public.address ADD COLUMN IF NOT EXISTS cep text;

-- Habilita Row Level Security
ALTER TABLE public.address ENABLE ROW LEVEL SECURITY;

-- Cria política de acesso para usuários autenticados
DROP POLICY IF EXISTS "Allow authenticated full access" ON public.address;
CREATE POLICY "Allow authenticated full access" ON public.address
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
