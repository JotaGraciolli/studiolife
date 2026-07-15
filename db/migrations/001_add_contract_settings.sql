-- Migração: cria tabela e storage para o modelo de contrato
-- Execute este script no SQL Editor do Supabase

-- 1. Cria a tabela de metadados do contrato
CREATE TABLE IF NOT EXISTS public.contract_settings (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  file_name text,
  file_path text,
  file_size integer,
  content_type text,
  CONSTRAINT contract_settings_pkey PRIMARY KEY (id)
);

-- 2. Habilita Row Level Security
ALTER TABLE public.contract_settings ENABLE ROW LEVEL SECURITY;

-- 3. Cria política de acesso para usuários autenticados
DROP POLICY IF EXISTS "Allow authenticated full access" ON public.contract_settings;
CREATE POLICY "Allow authenticated full access" ON public.contract_settings
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 4. Cria o bucket no Storage para armazenar o arquivo
INSERT INTO storage.buckets (id, name, public)
VALUES ('contracts', 'contracts', false)
ON CONFLICT (id) DO NOTHING;

-- 5. Políticas de acesso ao bucket de contratos
DROP POLICY IF EXISTS "Allow authenticated select contracts" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated insert contracts" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated update contracts" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated delete contracts" ON storage.objects;

CREATE POLICY "Allow authenticated select contracts" ON storage.objects
  FOR SELECT TO authenticated USING (bucket_id = 'contracts');

CREATE POLICY "Allow authenticated insert contracts" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'contracts');

CREATE POLICY "Allow authenticated update contracts" ON storage.objects
  FOR UPDATE TO authenticated USING (bucket_id = 'contracts') WITH CHECK (bucket_id = 'contracts');

CREATE POLICY "Allow authenticated delete contracts" ON storage.objects
  FOR DELETE TO authenticated USING (bucket_id = 'contracts');
