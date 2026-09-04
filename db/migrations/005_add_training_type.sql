-- Migração: tipos de aula (Padrão, Reposição, Experimental) para os dias de treino
-- Execute este script no SQL Editor do Supabase (é idempotente)

-- 0. Garante a coluna id e a chave primária em training_days
--    (a tabela pode ter sido recriada sem eles ao adicionar o vínculo de tipo)
ALTER TABLE public.training_days
  ADD COLUMN IF NOT EXISTS id uuid NOT NULL DEFAULT gen_random_uuid();

UPDATE public.training_days SET id = gen_random_uuid() WHERE id IS NULL;

ALTER TABLE public.training_days
  DROP CONSTRAINT IF EXISTS training_days_pkey;

ALTER TABLE public.training_days
  ADD CONSTRAINT training_days_pkey PRIMARY KEY (id);

-- 1. Cria a tabela de tipos de aula
CREATE TABLE IF NOT EXISTS public.training_type (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  type text,
  CONSTRAINT training_type_pkey PRIMARY KEY (id)
);

-- 2. Habilita Row Level Security
ALTER TABLE public.training_type ENABLE ROW LEVEL SECURITY;

-- 3. Política de acesso para usuários autenticados
DROP POLICY IF EXISTS "Allow authenticated full access" ON public.training_type;
CREATE POLICY "Allow authenticated full access" ON public.training_type
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 4. Adiciona a coluna de vínculo em training_days (se ainda não existir)
ALTER TABLE public.training_days
  ADD COLUMN IF NOT EXISTS training_type_id uuid;

ALTER TABLE public.training_days
  DROP CONSTRAINT IF EXISTS training_days_training_type_id_fkey;

ALTER TABLE public.training_days
  ADD CONSTRAINT training_days_training_type_id_fkey
  FOREIGN KEY (training_type_id) REFERENCES public.training_type(id);

-- 5. Popula os três tipos de aula (não duplica se já existirem)
INSERT INTO public.training_type (type)
SELECT type_name
FROM (VALUES ('Padrão'), ('Reposição'), ('Experimental')) AS v(type_name)
WHERE NOT EXISTS (
  SELECT 1 FROM public.training_type tt WHERE tt.type = v.type_name
);

-- 6. Migra dados legados: dias provisórios passam a apontar para "Reposição"
UPDATE public.training_days td
SET training_type_id = tt.id
FROM public.training_type tt
WHERE td.training_type_id IS NULL
  AND td.provisional = true
  AND tt.type = 'Reposição';

-- 7. Demais dias sem tipo apontam para "Padrão"
UPDATE public.training_days td
SET training_type_id = tt.id
FROM public.training_type tt
WHERE td.training_type_id IS NULL
  AND tt.type = 'Padrão';
