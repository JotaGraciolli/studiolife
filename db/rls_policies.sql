-- Habilita RLS em todas as tabelas
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.training_days ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;

-- Remove policies antigas caso existam (para evitar duplicatas ao reexecutar)
DROP POLICY IF EXISTS "Allow authenticated full access" ON public.clients;
DROP POLICY IF EXISTS "Allow authenticated full access" ON public.contacts;
DROP POLICY IF EXISTS "Allow authenticated full access" ON public.training_days;
DROP POLICY IF EXISTS "Allow authenticated full access" ON public.evaluations;
DROP POLICY IF EXISTS "Allow authenticated full access" ON public.financial;
DROP POLICY IF EXISTS "Allow authenticated full access" ON public.attendance;

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
