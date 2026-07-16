-- Migração: cria tabela e storage para contratos assinados vinculados aos alunos
-- Execute este script no SQL Editor do Supabase

-- 1. Cria a tabela de contratos assinados
CREATE TABLE IF NOT EXISTS public.client_contracts (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  client_id uuid,
  file_name text,
  file_path text,
  file_size integer,
  content_type text,
  CONSTRAINT client_contracts_pkey PRIMARY KEY (id),
  CONSTRAINT client_contracts_client_id_fkey FOREIGN KEY (client_id) REFERENCES public.clients(id)
);

-- 2. Habilita Row Level Security
ALTER TABLE public.client_contracts ENABLE ROW LEVEL SECURITY;

-- 3. Política de acesso para usuários autenticados
DROP POLICY IF EXISTS "Allow authenticated full access" ON public.client_contracts;
CREATE POLICY "Allow authenticated full access" ON public.client_contracts
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 4. Cria o bucket no Storage para armazenar contratos assinados
INSERT INTO storage.buckets (id, name, public)
VALUES ('signed-contracts', 'signed-contracts', false)
ON CONFLICT (id) DO NOTHING;

-- 5. Políticas de acesso ao bucket de contratos assinados
DROP POLICY IF EXISTS "Allow authenticated select signed-contracts" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated insert signed-contracts" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated update signed-contracts" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated delete signed-contracts" ON storage.objects;

CREATE POLICY "Allow authenticated select signed-contracts" ON storage.objects
  FOR SELECT TO authenticated USING (bucket_id = 'signed-contracts');

CREATE POLICY "Allow authenticated insert signed-contracts" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'signed-contracts');

CREATE POLICY "Allow authenticated update signed-contracts" ON storage.objects
  FOR UPDATE TO authenticated USING (bucket_id = 'signed-contracts') WITH CHECK (bucket_id = 'signed-contracts');

CREATE POLICY "Allow authenticated delete signed-contracts" ON storage.objects
  FOR DELETE TO authenticated USING (bucket_id = 'signed-contracts');
