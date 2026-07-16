-- Habilita RLS em todas as tabelas
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.training_days ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.diagnoses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.restrictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.month_end_closing ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contract_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.address ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_contracts ENABLE ROW LEVEL SECURITY;

-- Remove policies antigas caso existam (para evitar duplicatas ao reexecutar)
DROP POLICY IF EXISTS "Allow authenticated full access" ON public.clients;
DROP POLICY IF EXISTS "Allow authenticated full access" ON public.contacts;
DROP POLICY IF EXISTS "Allow authenticated full access" ON public.training_days;
DROP POLICY IF EXISTS "Allow authenticated full access" ON public.evaluations;
DROP POLICY IF EXISTS "Allow authenticated full access" ON public.financial;
DROP POLICY IF EXISTS "Allow authenticated full access" ON public.attendance;
DROP POLICY IF EXISTS "Allow authenticated full access" ON public.diagnoses;
DROP POLICY IF EXISTS "Allow authenticated full access" ON public.restrictions;
DROP POLICY IF EXISTS "Allow authenticated full access" ON public.medications;
DROP POLICY IF EXISTS "Allow authenticated full access" ON public.month_end_closing;
DROP POLICY IF EXISTS "Allow authenticated full access" ON public.message_templates;
DROP POLICY IF EXISTS "Allow authenticated full access" ON public.contract_settings;
DROP POLICY IF EXISTS "Allow authenticated full access" ON public.address;
DROP POLICY IF EXISTS "Allow authenticated full access" ON public.client_contracts;

-- Cria policies permitindo qualquer usuario autenticado
CREATE POLICY "Allow authenticated full access" ON public.clients
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow authenticated full access" ON public.contacts
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow authenticated full access" ON public.training_days
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow authenticated full access" ON public.evaluations
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow authenticated full access" ON public.financial
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow authenticated full access" ON public.attendance
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow authenticated full access" ON public.diagnoses
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow authenticated full access" ON public.restrictions
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow authenticated full access" ON public.medications
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow authenticated full access" ON public.month_end_closing
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow authenticated full access" ON public.message_templates
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow authenticated full access" ON public.contract_settings
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow authenticated full access" ON public.address
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow authenticated full access" ON public.client_contracts
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Bucket para armazenar contratos assinados dos alunos
INSERT INTO storage.buckets (id, name, public)
VALUES ('signed-contracts', 'signed-contracts', false)
ON CONFLICT (id) DO NOTHING;

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

-- Bucket para armazenar o modelo de contrato
INSERT INTO storage.buckets (id, name, public)
VALUES ('contracts', 'contracts', false)
ON CONFLICT (id) DO NOTHING;

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
