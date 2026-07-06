import csv
from datetime import datetime
import os
import re

CSV_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'Alunos.csv')
EVALUATIONS_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'evaluations.csv')
OUTPUT_PATH = os.path.join(os.path.dirname(__file__), 'seed_data.sql')

WEEK_DAYS = {
    'SEG': 'segunda',
    'TER': 'terca',
    'QUA': 'quarta',
    'QUI': 'quinta',
    'SEX': 'sexta',
}


def parse_date(value):
    value = (value or '').strip()
    if not value:
        return None
    try:
        return datetime.strptime(value, '%d/%m/%Y').strftime('%Y-%m-%d')
    except ValueError:
        return None


def parse_evaluation_date(value):
    value = (value or '').strip()
    if not value:
        return None
    # tenta dd/mm/yyyy
    for fmt in ['%d/%m/%Y', '%d/%m/%y']:
        try:
            dt = datetime.strptime(value, fmt)
            if dt.year < 100:
                dt = dt.replace(year=dt.year + 2000)
            return dt.strftime('%Y-%m-%d')
        except ValueError:
            continue
    # tenta dd/mm sem ano
    try:
        dt = datetime.strptime(value, '%d/%m')
        dt = dt.replace(year=datetime.now().year)
        return dt.strftime('%Y-%m-%d')
    except ValueError:
        return None


def parse_money(value):
    value = (value or '').strip().replace(',', '.')
    if not value:
        return None
    try:
        return float(value)
    except ValueError:
        return None


def clean_phone(value):
    value = (value or '').strip()
    # remove caracteres nao numericos, exceto + no inicio
    if not value:
        return None
    digits = re.sub(r'\D', '', value)
    return digits if digits else None


def escape_sql(value, numeric=False):
    if value is None:
        return 'NULL'
    if numeric:
        return str(value)
    text = str(value).replace("'", "''")
    return f"'{text}'"


def parse_float(value):
    value = (value or '').strip().replace(',', '.')
    if not value:
        return None
    try:
        return float(value)
    except ValueError:
        return None


def main():
    clients_sql = []
    contacts_sql = []
    training_days_sql = []
    evaluations_sql = []

    with open(CSV_PATH, encoding='utf-8-sig', newline='') as f:
        reader = csv.DictReader(f)
        for row in reader:
            name = (row.get('Nome') or '').strip()
            if not name:
                continue

            phone = clean_phone(row.get('Telefone'))
            birth_date = parse_date(row.get('Data_Nasc.'))
            start_date = parse_date(row.get('Data_Inicio'))
            monthly_fee = parse_money(row.get('Valor'))
            observations = (row.get('Observações') or '').strip() or None
            status = (row.get('Status') or '').strip().lower() or 'ativo'

            clients_sql.append(
                f"INSERT INTO public.clients (name, phone, birth_date, start_date, monthly_fee, observations, status) VALUES ("
                f"{escape_sql(name)}, {escape_sql(phone)}, {escape_sql(birth_date)}, "
                f"{escape_sql(start_date)}, {escape_sql(monthly_fee, numeric=True)}, {escape_sql(observations)}, {escape_sql(status)});"
            )

            contact_name = (row.get('Contato') or '').strip() or None
            contact_phone = clean_phone(row.get('Telefone do contato'))
            if contact_name or contact_phone:
                # Associa ao cliente pelo nome, pois ainda nao temos o UUID
                contacts_sql.append(
                    f"-- contato do aluno: {name}\n"
                    f"INSERT INTO public.contacts (client_id, name, phone) VALUES ("
                    f"(SELECT id FROM public.clients WHERE name = {escape_sql(name)} LIMIT 1), "
                    f"{escape_sql(contact_name)}, {escape_sql(contact_phone)});"
                )

            for col, week_day in WEEK_DAYS.items():
                time_value = (row.get(col) or '').strip()
                if time_value:
                    # garante formato HH:MM
                    try:
                        t = datetime.strptime(time_value, '%H:%M').strftime('%H:%M:%S')
                        training_days_sql.append(
                            f"-- treino do aluno: {name} ({week_day})\n"
                            f"INSERT INTO public.training_days (client_id, week_day, training_time) VALUES ("
                            f"(SELECT id FROM public.clients WHERE name = {escape_sql(name)} LIMIT 1), "
                            f"{escape_sql(week_day)}, {escape_sql(t)});"
                        )
                    except ValueError:
                        pass

    if os.path.exists(EVALUATIONS_PATH):
        with open(EVALUATIONS_PATH, encoding='utf-8-sig', newline='') as f:
            reader = csv.DictReader(f)
            for row in reader:
                name = (row.get('Nome') or '').strip()
                if not name:
                    continue

                eval_date = parse_evaluation_date(row.get('Data'))
                weight = parse_float(row.get('Peso_kg'))
                height = parse_float(row.get('Altura_cm'))
                torax = parse_float(row.get('Torax'))
                waist = parse_float(row.get('Cintura'))
                abdomen = parse_float(row.get('Abdome'))
                hip = parse_float(row.get('Quadril'))
                forearm_right = parse_float(row.get('Antebraco_D'))
                forearm_left = parse_float(row.get('Antebraco_E'))
                arm_right = parse_float(row.get('Braco_D'))
                arm_left = parse_float(row.get('Braco_E'))
                thigh_right = parse_float(row.get('Coxas_D'))
                thigh_left = parse_float(row.get('Coxas_E'))
                calf_right = parse_float(row.get('Panturrilha_D'))
                calf_left = parse_float(row.get('Panturrilha_E'))

                # so insere se tiver pelo menos um campo preenchido alem do nome/data
                values = [weight, height, torax, waist, abdomen, hip,
                          forearm_right, forearm_left, arm_right, arm_left,
                          thigh_right, thigh_left, calf_right, calf_left]
                if not any(v is not None for v in values):
                    continue

                created_at_sql = f"{escape_sql(eval_date)}::timestamp with time zone" if eval_date else "CURRENT_TIMESTAMP"
                evaluations_sql.append(
                    f"-- avaliacao do aluno: {name}\n"
                    f"INSERT INTO public.evaluations (client_id, created_at, weight, height, torax, waist, abdomen, hip, "
                    f"forearm_left, forearm_right, arm_left, arm_right, thigh_left, thigh_right, calf_left, calf_right) VALUES ("
                    f"(SELECT id FROM public.clients WHERE name = {escape_sql(name)} LIMIT 1), "
                    f"{created_at_sql}, {escape_sql(weight, numeric=True)}, {escape_sql(height, numeric=True)}, "
                    f"{escape_sql(torax, numeric=True)}, {escape_sql(waist, numeric=True)}, {escape_sql(abdomen, numeric=True)}, "
                    f"{escape_sql(hip, numeric=True)}, {escape_sql(forearm_left, numeric=True)}, {escape_sql(forearm_right, numeric=True)}, "
                    f"{escape_sql(arm_left, numeric=True)}, {escape_sql(arm_right, numeric=True)}, "
                    f"{escape_sql(thigh_left, numeric=True)}, {escape_sql(thigh_right, numeric=True)}, "
                    f"{escape_sql(calf_left, numeric=True)}, {escape_sql(calf_right, numeric=True)});"
                )

    with open(OUTPUT_PATH, 'w', encoding='utf-8') as f:
        f.write("-- Seed data gerado a partir de Alunos.csv e evaluations.csv\n")
        f.write("-- Execute este arquivo no SQL Editor do Supabase\n\n")
        f.write("BEGIN;\n\n")

        f.write("-- CLIENTS\n")
        for stmt in clients_sql:
            f.write(stmt + "\n")

        f.write("\n-- CONTACTS\n")
        for stmt in contacts_sql:
            f.write(stmt + "\n")

        f.write("\n-- TRAINING_DAYS\n")
        for stmt in training_days_sql:
            f.write(stmt + "\n")

        if evaluations_sql:
            f.write("\n-- EVALUATIONS\n")
            for stmt in evaluations_sql:
                f.write(stmt + "\n")

        f.write("\nCOMMIT;\n")

    print(f"Arquivo gerado: {OUTPUT_PATH}")
    print(f"Clientes: {len(clients_sql)}")
    print(f"Contatos: {len(contacts_sql)}")
    print(f"Dias de treino: {len(training_days_sql)}")
    print(f"Avaliacoes: {len(evaluations_sql)}")


if __name__ == '__main__':
    main()
