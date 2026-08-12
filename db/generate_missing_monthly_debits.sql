-- Gera débitos mensais faltantes para alunos ativos no mês corrente.
-- Para cada aluno ativo com mensalidade definida, verifica se já existe um
-- registro negativo (débito) na tabela financial para o mês corrente.
-- Se não existir, cria o registro com amount = -monthly_fee.

WITH current_month_label AS (
  SELECT
    CASE extract(month FROM now())
      WHEN 1 THEN 'Jan/' || extract(year FROM now())
      WHEN 2 THEN 'Fev/' || extract(year FROM now())
      WHEN 3 THEN 'Mar/' || extract(year FROM now())
      WHEN 4 THEN 'Abr/' || extract(year FROM now())
      WHEN 5 THEN 'Mai/' || extract(year FROM now())
      WHEN 6 THEN 'Jun/' || extract(year FROM now())
      WHEN 7 THEN 'Jul/' || extract(year FROM now())
      WHEN 8 THEN 'Ago/' || extract(year FROM now())
      WHEN 9 THEN 'Set/' || extract(year FROM now())
      WHEN 10 THEN 'Out/' || extract(year FROM now())
      WHEN 11 THEN 'Nov/' || extract(year FROM now())
      WHEN 12 THEN 'Dez/' || extract(year FROM now())
    END AS month
),
current_month AS (
  INSERT INTO month_end_closing (month)
  SELECT month FROM current_month_label
  ON CONFLICT (month) DO UPDATE SET month = EXCLUDED.month
  RETURNING id
),
active_clients AS (
  SELECT id, monthly_fee
  FROM clients
  WHERE status = 'ativo'
    AND monthly_fee IS NOT NULL
    AND monthly_fee > 0
),
existing_debits AS (
  SELECT f.client_id
  FROM financial f
  JOIN current_month cm ON f.month_id = cm.id
  WHERE f.amount < 0
)
INSERT INTO financial (client_id, month_id, amount)
SELECT ac.id, cm.id, -ac.monthly_fee
FROM active_clients ac
CROSS JOIN current_month cm
LEFT JOIN existing_debits ed ON ed.client_id = ac.id
WHERE ed.client_id IS NULL;
