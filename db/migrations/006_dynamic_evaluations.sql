-- Migração: avaliações dinâmicas com múltiplos tipos
-- Tipos e campos de cada avaliação passam a ser definidos em tabelas,
-- e os valores registrados em JSON (jsonb) na tabela evaluations.
-- Execute este script no SQL Editor do Supabase (é idempotente).

-- 1. Tipos de avaliação
CREATE TABLE IF NOT EXISTS public.evaluation_type (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  name text NOT NULL,
  CONSTRAINT evaluation_type_pkey PRIMARY KEY (id)
);

ALTER TABLE public.evaluation_type ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow authenticated full access" ON public.evaluation_type;
CREATE POLICY "Allow authenticated full access" ON public.evaluation_type
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 2. Campos de cada tipo de avaliação (template)
CREATE TABLE IF NOT EXISTS public.evaluation_type_field (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  evaluation_type_id uuid NOT NULL REFERENCES public.evaluation_type(id) ON DELETE CASCADE,
  field_key text NOT NULL,
  label text NOT NULL,
  unit text,
  data_type text NOT NULL DEFAULT 'number',
  sort_order integer NOT NULL DEFAULT 0,
  CONSTRAINT evaluation_type_field_pkey PRIMARY KEY (id),
  CONSTRAINT evaluation_type_field_key_unique UNIQUE (evaluation_type_id, field_key)
);

ALTER TABLE public.evaluation_type_field ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow authenticated full access" ON public.evaluation_type_field;
CREATE POLICY "Allow authenticated full access" ON public.evaluation_type_field
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 3. evaluations ganha o tipo e a coluna JSON para os valores
ALTER TABLE public.evaluations
  ADD COLUMN IF NOT EXISTS evaluation_type_id uuid REFERENCES public.evaluation_type(id);

ALTER TABLE public.evaluations
  ADD COLUMN IF NOT EXISTS data jsonb;

-- 4. Tipo legado para absorver as avaliações antropométricas já cadastradas
-- (uuid fixo para a migration poder ser reexecutada sem duplicar)
INSERT INTO public.evaluation_type (id, name)
VALUES ('a0eebc00-1111-4111-8111-111111111111', 'Avaliação Antropométrica')
ON CONFLICT (id) DO NOTHING;

UPDATE public.evaluations
SET evaluation_type_id = 'a0eebc00-1111-4111-8111-111111111111'
WHERE evaluation_type_id IS NULL;

-- 5. Campos do tipo legado (espelham as colunas antigas de evaluations)
INSERT INTO public.evaluation_type_field (evaluation_type_id, field_key, label, unit, sort_order)
SELECT 'a0eebc00-1111-4111-8111-111111111111', field_key, label, unit, sort_order
FROM (VALUES
  ('weight', 'Peso', 'kg', 1),
  ('height', 'Altura', 'm', 2),
  ('torax', 'Tórax', 'cm', 3),
  ('waist', 'Cintura', 'cm', 4),
  ('abdomen', 'Abdômen', 'cm', 5),
  ('hip', 'Quadril', 'cm', 6),
  ('forearm_left', 'Antebraço Esq', 'cm', 7),
  ('forearm_right', 'Antebraço Dir', 'cm', 8),
  ('arm_left', 'Braço Esq', 'cm', 9),
  ('arm_right', 'Braço Dir', 'cm', 10),
  ('thigh_left', 'Coxa Esq', 'cm', 11),
  ('thigh_right', 'Coxa Dir', 'cm', 12),
  ('calf_left', 'Panturrilha Esq', 'cm', 13),
  ('calf_right', 'Panturrilha Dir', 'cm', 14)
) AS v(field_key, label, unit, sort_order)
WHERE NOT EXISTS (
  SELECT 1 FROM public.evaluation_type_field etf
  WHERE etf.evaluation_type_id = 'a0eebc00-1111-4111-8111-111111111111'
    AND etf.field_key = v.field_key
);

-- 6. Migra os valores das colunas antigas para o JSON (mantém as colunas por precaução)
UPDATE public.evaluations
SET data = jsonb_strip_nulls(jsonb_build_object(
  'weight', weight,
  'height', height,
  'torax', torax,
  'waist', waist,
  'abdomen', abdomen,
  'hip', hip,
  'forearm_left', forearm_left,
  'forearm_right', forearm_right,
  'arm_left', arm_left,
  'arm_right', arm_right,
  'thigh_left', thigh_left,
  'thigh_right', thigh_right,
  'calf_left', calf_left,
  'calf_right', calf_right
))
WHERE data IS NULL;
