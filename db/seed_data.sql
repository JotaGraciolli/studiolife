-- Seed data gerado a partir de Alunos.csv e evaluations.csv
-- Execute este arquivo no SQL Editor do Supabase

BEGIN;

-- CLIENTS
INSERT INTO public.clients (name, phone, birth_date, start_date, monthly_fee, observations, status) VALUES ('Alda Hofman', '51998328939', '1949-07-12', NULL, 280.0, NULL, 'ativo');
INSERT INTO public.clients (name, phone, birth_date, start_date, monthly_fee, observations, status) VALUES ('Alzira Teixeira Bernardo', NULL, '1945-12-21', '2026-06-02', 200.0, NULL, 'ativo');
INSERT INTO public.clients (name, phone, birth_date, start_date, monthly_fee, observations, status) VALUES ('Ana Isabel dos Reis Tedesco', '51999261907', '1954-07-13', '2022-08-11', 280.0, NULL, 'ativo');
INSERT INTO public.clients (name, phone, birth_date, start_date, monthly_fee, observations, status) VALUES ('Ana Maria Rodrigues de Souza', '51981551016', '1961-01-15', '2026-03-16', 280.0, NULL, 'ativo');
INSERT INTO public.clients (name, phone, birth_date, start_date, monthly_fee, observations, status) VALUES ('Ana Paula Pinheiro dos Santos', '51998619450', '1974-06-05', '2026-06-04', 280.0, NULL, 'ativo');
INSERT INTO public.clients (name, phone, birth_date, start_date, monthly_fee, observations, status) VALUES ('Angelita dos Santos Ramos', '51999648515', '1960-02-01', '2022-04-11', 280.0, NULL, 'ativo');
INSERT INTO public.clients (name, phone, birth_date, start_date, monthly_fee, observations, status) VALUES ('Antônio Correia de Fraga', '51999834635', '1960-11-15', '2024-07-04', NULL, NULL, 'ativo');
INSERT INTO public.clients (name, phone, birth_date, start_date, monthly_fee, observations, status) VALUES ('Ariadne Furgarini Lucca', '51998067253', '1972-03-07', NULL, 280.0, NULL, 'ativo');
INSERT INTO public.clients (name, phone, birth_date, start_date, monthly_fee, observations, status) VALUES ('Arthur Furtudo Barcelos', '51996061495', '2001-06-15', '2026-07-27', 200.0, NULL, 'ativo');
INSERT INTO public.clients (name, phone, birth_date, start_date, monthly_fee, observations, status) VALUES ('Aurio Luiz da Silva Campos', NULL, '1978-07-10', '2026-01-21', NULL, NULL, 'inativo');
INSERT INTO public.clients (name, phone, birth_date, start_date, monthly_fee, observations, status) VALUES ('Bruna Genari Lemos', '51992614350', '1994-02-27', '2026-03-03', NULL, NULL, 'inativo');
INSERT INTO public.clients (name, phone, birth_date, start_date, monthly_fee, observations, status) VALUES ('Bruna Pereira Rigotte', '51991865093', '1988-09-10', '2025-01-28', NULL, NULL, 'inativo');
INSERT INTO public.clients (name, phone, birth_date, start_date, monthly_fee, observations, status) VALUES ('Camila Pereira de Fraga', '51999698832', '1987-05-29', '2025-09-08', 280.0, NULL, 'ativo');
INSERT INTO public.clients (name, phone, birth_date, start_date, monthly_fee, observations, status) VALUES ('Cristiane Araujo Cabral', '51998416494', '1982-01-05', '2026-02-05', NULL, NULL, 'inativo');
INSERT INTO public.clients (name, phone, birth_date, start_date, monthly_fee, observations, status) VALUES ('Cristiane Beatris Santos Pontes', '51997025812', '1976-07-05', '2025-05-13', NULL, NULL, 'inativo');
INSERT INTO public.clients (name, phone, birth_date, start_date, monthly_fee, observations, status) VALUES ('David Allan Tavares da Silva', '51995485739', '1991-10-10', '2026-03-30', 280.0, NULL, 'ativo');
INSERT INTO public.clients (name, phone, birth_date, start_date, monthly_fee, observations, status) VALUES ('Dailiany Orecho', '51982496719', '1989-08-20', '2026-01-29', NULL, NULL, 'ativo');
INSERT INTO public.clients (name, phone, birth_date, start_date, monthly_fee, observations, status) VALUES ('Edirene Nunes dos Santos', '51996815064', '1971-08-21', '2025-10-06', 280.0, NULL, 'ativo');
INSERT INTO public.clients (name, phone, birth_date, start_date, monthly_fee, observations, status) VALUES ('Eliane de Souza Bueno', '51998182513', '1980-10-17', NULL, NULL, NULL, 'inativo');
INSERT INTO public.clients (name, phone, birth_date, start_date, monthly_fee, observations, status) VALUES ('Eliziane Assis de Medeiros (Zane)', '51998243787', '1966-07-06', '2026-05-06', NULL, NULL, 'ativo');
INSERT INTO public.clients (name, phone, birth_date, start_date, monthly_fee, observations, status) VALUES ('Eraci de Andrade', '51997269082', '1951-08-22', NULL, 280.0, NULL, 'ativo');
INSERT INTO public.clients (name, phone, birth_date, start_date, monthly_fee, observations, status) VALUES ('Eva dos Santos Gomes', '51996684645', '1947-09-07', NULL, 180.0, NULL, 'ativo');
INSERT INTO public.clients (name, phone, birth_date, start_date, monthly_fee, observations, status) VALUES ('Evandro Rost de Borba', '51998106651', '1987-11-18', '2026-04-19', 280.0, NULL, 'ativo');
INSERT INTO public.clients (name, phone, birth_date, start_date, monthly_fee, observations, status) VALUES ('Evani Teresinha da Silva Ramos', '51996378817', '1963-02-28', NULL, 200.0, NULL, 'ativo');
INSERT INTO public.clients (name, phone, birth_date, start_date, monthly_fee, observations, status) VALUES ('Fabiola Modinger', '51999618202', '1988-03-05', '2026-04-07', 200.0, NULL, 'ativo');
INSERT INTO public.clients (name, phone, birth_date, start_date, monthly_fee, observations, status) VALUES ('Fernanda Coelho de Almeida', '51980324286', '1981-09-14', '2026-05-06', 280.0, NULL, 'ativo');
INSERT INTO public.clients (name, phone, birth_date, start_date, monthly_fee, observations, status) VALUES ('Fernanda Maria de Oliveira', '51986120145', '1997-06-22', '2026-03-05', NULL, NULL, 'inativo');
INSERT INTO public.clients (name, phone, birth_date, start_date, monthly_fee, observations, status) VALUES ('Geci Soares Bertina', '51996370441', '1946-02-24', '2025-01-16', 280.0, NULL, 'ativo');
INSERT INTO public.clients (name, phone, birth_date, start_date, monthly_fee, observations, status) VALUES ('Genilda Antonia da Silva Tomás', '51997109386', '1964-09-02', '2025-10-06', 280.0, NULL, 'ativo');
INSERT INTO public.clients (name, phone, birth_date, start_date, monthly_fee, observations, status) VALUES ('Gessica Lopes', '51997454305', '1990-06-13', '2025-07-14', NULL, NULL, 'inativo');
INSERT INTO public.clients (name, phone, birth_date, start_date, monthly_fee, observations, status) VALUES ('Gui Gerson do Canto (Brum)', '51999358013', '1950-05-17', '2022-07-28', NULL, NULL, 'ativo');
INSERT INTO public.clients (name, phone, birth_date, start_date, monthly_fee, observations, status) VALUES ('Iracema Oliveira dos Santos', '51996112700', '1965-06-16', '2025-02-27', 180.0, NULL, 'ativo');
INSERT INTO public.clients (name, phone, birth_date, start_date, monthly_fee, observations, status) VALUES ('Janaina Gomes da Silva Marques', '51995201891', '1992-04-06', '2026-03-09', NULL, NULL, 'ativo');
INSERT INTO public.clients (name, phone, birth_date, start_date, monthly_fee, observations, status) VALUES ('Jecy Maria Ramos da Rocha', '51997646971', '1937-07-05', '2025-04-16', 280.0, NULL, 'ativo');
INSERT INTO public.clients (name, phone, birth_date, start_date, monthly_fee, observations, status) VALUES ('Jorgina Oliveira dos Santos', '51996327993', '1941-09-15', '2023-08-15', 260.0, NULL, 'ativo');
INSERT INTO public.clients (name, phone, birth_date, start_date, monthly_fee, observations, status) VALUES ('Jucilene Oliveira da Silva', '51998247571', '1974-07-02', '2026-03-03', NULL, NULL, 'ativo');
INSERT INTO public.clients (name, phone, birth_date, start_date, monthly_fee, observations, status) VALUES ('Julia Fontes', '51997623226', '1998-03-02', '2026-04-08', 200.0, NULL, 'ativo');
INSERT INTO public.clients (name, phone, birth_date, start_date, monthly_fee, observations, status) VALUES ('Karla Gonsalves', '51989560505', '1964-06-05', '2026-02-10', 280.0, NULL, 'ativo');
INSERT INTO public.clients (name, phone, birth_date, start_date, monthly_fee, observations, status) VALUES ('Katia Kenes', '51998872913', '1972-07-19', '2022-10-19', 280.0, NULL, 'ativo');
INSERT INTO public.clients (name, phone, birth_date, start_date, monthly_fee, observations, status) VALUES ('Kazumi Brika', '51981263509', '1953-01-02', NULL, NULL, NULL, 'ativo');
INSERT INTO public.clients (name, phone, birth_date, start_date, monthly_fee, observations, status) VALUES ('Lisiane Bereta', '51998559995', '1980-08-22', NULL, 200.0, NULL, 'ativo');
INSERT INTO public.clients (name, phone, birth_date, start_date, monthly_fee, observations, status) VALUES ('Lisiane de Fraga Lima', '51999222268', '1992-11-24', '2025-04-08', 280.0, NULL, 'ativo');
INSERT INTO public.clients (name, phone, birth_date, start_date, monthly_fee, observations, status) VALUES ('Lourdes Costa Gonsalves', '51989600505', '1934-08-17', '2026-09-02', 200.0, NULL, 'ativo');
INSERT INTO public.clients (name, phone, birth_date, start_date, monthly_fee, observations, status) VALUES ('Lucia Maria Oliveira dos Santos', '51996327993', '1961-03-21', '2014-09-29', 260.0, NULL, 'ativo');
INSERT INTO public.clients (name, phone, birth_date, start_date, monthly_fee, observations, status) VALUES ('Luciane dos Santos', '51996951335', '1974-01-22', NULL, 280.0, NULL, 'ativo');
INSERT INTO public.clients (name, phone, birth_date, start_date, monthly_fee, observations, status) VALUES ('Lucimar Oliveira Lima', NULL, '1949-08-03', '2025-05-13', 280.0, NULL, 'ativo');
INSERT INTO public.clients (name, phone, birth_date, start_date, monthly_fee, observations, status) VALUES ('Luiza Beatriz de Borba Rocha', '51997264855', '1963-06-20', '2026-01-26', 280.0, NULL, 'ativo');
INSERT INTO public.clients (name, phone, birth_date, start_date, monthly_fee, observations, status) VALUES ('Lurdeselena Fraga Vargas', '51996126084', '1960-11-15', '2022-08-08', 280.0, NULL, 'ativo');
INSERT INTO public.clients (name, phone, birth_date, start_date, monthly_fee, observations, status) VALUES ('Maria Elena Silveira dos Santos', '51997813017', '1979-06-21', '2024-08-27', 280.0, NULL, 'ativo');
INSERT INTO public.clients (name, phone, birth_date, start_date, monthly_fee, observations, status) VALUES ('Maria Cristina Siqueira Borges (cris)', NULL, NULL, NULL, 280.0, NULL, 'ativo');
INSERT INTO public.clients (name, phone, birth_date, start_date, monthly_fee, observations, status) VALUES ('Maria Helena Gil Peixoto', '51999277151', '1952-02-13', '2024-08-19', 280.0, NULL, 'ativo');
INSERT INTO public.clients (name, phone, birth_date, start_date, monthly_fee, observations, status) VALUES ('Maria Inacia Migliavaca', '51996695017', '1946-05-01', '2025-08-14', 280.0, NULL, 'ativo');
INSERT INTO public.clients (name, phone, birth_date, start_date, monthly_fee, observations, status) VALUES ('Maria Luiza Schmitz (Neca)', '51997398969', '1958-02-09', '2015-09-09', 280.0, NULL, 'ativo');
INSERT INTO public.clients (name, phone, birth_date, start_date, monthly_fee, observations, status) VALUES ('Maria Margarida Nunes da Rosa', '51995277568', '1960-02-21', '2019-02-11', 280.0, NULL, 'ativo');
INSERT INTO public.clients (name, phone, birth_date, start_date, monthly_fee, observations, status) VALUES ('Marilene Oliveira da Silva', '51981199227', '1968-03-05', '2014-11-19', NULL, NULL, 'inativo');
INSERT INTO public.clients (name, phone, birth_date, start_date, monthly_fee, observations, status) VALUES ('Marilene Senti da Silva', '51982496719', '1953-09-23', '2026-01-28', 200.0, NULL, 'ativo');
INSERT INTO public.clients (name, phone, birth_date, start_date, monthly_fee, observations, status) VALUES ('Mariza Pereira Ramos', '51999485452', '1968-10-02', '2023-07-03', 280.0, NULL, 'ativo');
INSERT INTO public.clients (name, phone, birth_date, start_date, monthly_fee, observations, status) VALUES ('Meures Brito dos Santos', '51997129413', '1960-09-17', '2015-02-23', NULL, NULL, 'inativo');
INSERT INTO public.clients (name, phone, birth_date, start_date, monthly_fee, observations, status) VALUES ('Miguelina dos Santos Peixoto', '51996687044', '1963-09-29', '2023-03-28', 200.0, NULL, 'ativo');
INSERT INTO public.clients (name, phone, birth_date, start_date, monthly_fee, observations, status) VALUES ('Milena dos Santos Muniz', '51998619783', '2002-01-27', NULL, NULL, NULL, 'inativo');
INSERT INTO public.clients (name, phone, birth_date, start_date, monthly_fee, observations, status) VALUES ('Milton Costa Gonsalves', '51989600909', '1960-11-25', '2026-02-10', 200.0, NULL, 'ativo');
INSERT INTO public.clients (name, phone, birth_date, start_date, monthly_fee, observations, status) VALUES ('Neiva Maria Bombardieri Valentine', '51999590596', '1957-07-01', '2024-06-10', NULL, NULL, 'inativo');
INSERT INTO public.clients (name, phone, birth_date, start_date, monthly_fee, observations, status) VALUES ('Olga Tatiana Melegali Muniz', '51981246492', '1968-03-16', '2017-10-23', NULL, NULL, 'inativo');
INSERT INTO public.clients (name, phone, birth_date, start_date, monthly_fee, observations, status) VALUES ('Oneida Barcella', '51992335290', '1970-03-02', NULL, NULL, NULL, 'inativo');
INSERT INTO public.clients (name, phone, birth_date, start_date, monthly_fee, observations, status) VALUES ('Olisia Oliveira Shimith', '51998624028', '1947-05-24', NULL, 280.0, NULL, 'ativo');
INSERT INTO public.clients (name, phone, birth_date, start_date, monthly_fee, observations, status) VALUES ('Paulo Marques', '51999333608', '1970-06-14', '2026-01-10', 280.0, NULL, 'ativo');
INSERT INTO public.clients (name, phone, birth_date, start_date, monthly_fee, observations, status) VALUES ('Paulo Ricardo da Silva', '51997398793', '1959-06-19', '2020-11-12', 280.0, NULL, 'ativo');
INSERT INTO public.clients (name, phone, birth_date, start_date, monthly_fee, observations, status) VALUES ('Rafaela Lemes Speransa', '51995469100', '1982-01-25', '2025-04-15', 280.0, NULL, 'ativo');
INSERT INTO public.clients (name, phone, birth_date, start_date, monthly_fee, observations, status) VALUES ('Raquel Coelho de Almeida', '51996970999', '1982-11-30', '2026-04-06', 280.0, NULL, 'ativo');
INSERT INTO public.clients (name, phone, birth_date, start_date, monthly_fee, observations, status) VALUES ('Raquel de Castilhos Porcher', '51997231880', '1982-08-21', NULL, 280.0, NULL, 'ativo');
INSERT INTO public.clients (name, phone, birth_date, start_date, monthly_fee, observations, status) VALUES ('Renato Pinzon Niemeyr', '51998716797', '1953-06-19', '2026-02-05', 280.0, NULL, 'ativo');
INSERT INTO public.clients (name, phone, birth_date, start_date, monthly_fee, observations, status) VALUES ('Renato Silveira da Rocha', '51996138597', '1946-08-01', '2025-08-19', 280.0, NULL, 'ativo');
INSERT INTO public.clients (name, phone, birth_date, start_date, monthly_fee, observations, status) VALUES ('Rodrigo Fiorgarini Lucca', '11981004698', '1983-01-13', NULL, 280.0, NULL, 'ativo');
INSERT INTO public.clients (name, phone, birth_date, start_date, monthly_fee, observations, status) VALUES ('Rogerio', '51999736790', '1970-12-04', '2014-01-21', 280.0, NULL, 'ativo');
INSERT INTO public.clients (name, phone, birth_date, start_date, monthly_fee, observations, status) VALUES ('Rosa da Silva Pontes', '51998041089', '1952-01-15', '2022-10-04', 280.0, NULL, 'ativo');
INSERT INTO public.clients (name, phone, birth_date, start_date, monthly_fee, observations, status) VALUES ('Rosa Maria Gil Gomes', '51997356720', '1950-05-24', '2024-08-19', 280.0, NULL, 'ativo');
INSERT INTO public.clients (name, phone, birth_date, start_date, monthly_fee, observations, status) VALUES ('Rosalia Collares Borges', '51999870478', '1936-09-04', '2025-04-16', 280.0, NULL, 'ativo');
INSERT INTO public.clients (name, phone, birth_date, start_date, monthly_fee, observations, status) VALUES ('Sandro Gomes Pereira', '51999597202', '1976-04-07', '2026-03-14', 280.0, NULL, 'ativo');
INSERT INTO public.clients (name, phone, birth_date, start_date, monthly_fee, observations, status) VALUES ('Seli Hermina Shenkel', '51996527522', '1956-08-06', NULL, 200.0, NULL, 'ativo');
INSERT INTO public.clients (name, phone, birth_date, start_date, monthly_fee, observations, status) VALUES ('Seloi dos Santos Gomes', '51999157649', '1956-11-28', '2022-01-04', 200.0, NULL, 'ativo');
INSERT INTO public.clients (name, phone, birth_date, start_date, monthly_fee, observations, status) VALUES ('Silvia Regina de Oliveira Adam', '51998365595', '1966-04-03', '2026-01-08', NULL, NULL, 'inativo');
INSERT INTO public.clients (name, phone, birth_date, start_date, monthly_fee, observations, status) VALUES ('Simone Cunha Shimdt', '51995243601', '1972-08-27', '2025-02-12', 280.0, NULL, 'ativo');
INSERT INTO public.clients (name, phone, birth_date, start_date, monthly_fee, observations, status) VALUES ('Sirlei Maria da Silva', NULL, '1959-04-07', '2026-05-05', NULL, NULL, 'inativo');
INSERT INTO public.clients (name, phone, birth_date, start_date, monthly_fee, observations, status) VALUES ('Stênia Silva Souza', '51999940597', '1992-06-17', '2026-04-23', 280.0, NULL, 'ativo');
INSERT INTO public.clients (name, phone, birth_date, start_date, monthly_fee, observations, status) VALUES ('Sueli Andrade da Silva', '51998214985', '1956-05-19', '2018-09-17', 280.0, NULL, 'ativo');
INSERT INTO public.clients (name, phone, birth_date, start_date, monthly_fee, observations, status) VALUES ('Suzielen da Silva Lopes', '51998666448', '1993-05-27', '2024-03-07', 280.0, NULL, 'ativo');
INSERT INTO public.clients (name, phone, birth_date, start_date, monthly_fee, observations, status) VALUES ('Tailene de Souza Rocha', '51999935298', '1996-10-07', '2025-04-03', 280.0, NULL, 'ativo');
INSERT INTO public.clients (name, phone, birth_date, start_date, monthly_fee, observations, status) VALUES ('Terezinha da Silva Santos', '51995426879', '1953-04-20', NULL, 200.0, NULL, 'ativo');
INSERT INTO public.clients (name, phone, birth_date, start_date, monthly_fee, observations, status) VALUES ('Valdeci Nunes dos Santos', '51998795290', '1964-06-13', '2026-03-03', NULL, NULL, 'inativo');
INSERT INTO public.clients (name, phone, birth_date, start_date, monthly_fee, observations, status) VALUES ('Vandrieli Ferreira', '51995784548', '1997-05-24', '2026-04-08', 200.0, NULL, 'ativo');
INSERT INTO public.clients (name, phone, birth_date, start_date, monthly_fee, observations, status) VALUES ('Vera Elisete Pereira de Fraga', '51995321804', '1966-06-21', '2026-05-04', 200.0, NULL, 'ativo');
INSERT INTO public.clients (name, phone, birth_date, start_date, monthly_fee, observations, status) VALUES ('Vinicios Silva Garcias', '51995395678', '2010-04-28', '2025-09-29', 280.0, NULL, 'ativo');
INSERT INTO public.clients (name, phone, birth_date, start_date, monthly_fee, observations, status) VALUES ('Walderedo Braga', NULL, '1935-04-20', '2026-02-12', 280.0, NULL, 'ativo');
INSERT INTO public.clients (name, phone, birth_date, start_date, monthly_fee, observations, status) VALUES ('Walmiro Hilario Lucca', '51998067253', '1937-04-21', NULL, 280.0, NULL, 'ativo');

-- CONTACTS
-- contato do aluno: Alzira Teixeira Bernardo
INSERT INTO public.contacts (client_id, name, phone) VALUES ((SELECT id FROM public.clients WHERE name = 'Alzira Teixeira Bernardo' LIMIT 1), 'Bárbara Bernardo', '51995429862');
-- contato do aluno: David Allan Tavares da Silva
INSERT INTO public.contacts (client_id, name, phone) VALUES ((SELECT id FROM public.clients WHERE name = 'David Allan Tavares da Silva' LIMIT 1), 'Pai', '51997915697');
-- contato do aluno: Geci Soares Bertina
INSERT INTO public.contacts (client_id, name, phone) VALUES ((SELECT id FROM public.clients WHERE name = 'Geci Soares Bertina' LIMIT 1), 'Miranda', '51997142445');
-- contato do aluno: Jecy Maria Ramos da Rocha
INSERT INTO public.contacts (client_id, name, phone) VALUES ((SELECT id FROM public.clients WHERE name = 'Jecy Maria Ramos da Rocha' LIMIT 1), 'Débora', '51988457752');
-- contato do aluno: Lourdes Costa Gonsalves
INSERT INTO public.contacts (client_id, name, phone) VALUES ((SELECT id FROM public.clients WHERE name = 'Lourdes Costa Gonsalves' LIMIT 1), 'Karla', NULL);
-- contato do aluno: Rosalia Collares Borges
INSERT INTO public.contacts (client_id, name, phone) VALUES ((SELECT id FROM public.clients WHERE name = 'Rosalia Collares Borges' LIMIT 1), 'Marcelo', NULL);
-- contato do aluno: Valdeci Nunes dos Santos
INSERT INTO public.contacts (client_id, name, phone) VALUES ((SELECT id FROM public.clients WHERE name = 'Valdeci Nunes dos Santos' LIMIT 1), 'Neiva (Esposa)', '51996172613');
-- contato do aluno: Walderedo Braga
INSERT INTO public.contacts (client_id, name, phone) VALUES ((SELECT id FROM public.clients WHERE name = 'Walderedo Braga' LIMIT 1), 'Filho Leandro', NULL);

-- TRAINING_DAYS
-- treino do aluno: Alda Hofman (terca)
INSERT INTO public.training_days (client_id, week_day, training_time) VALUES ((SELECT id FROM public.clients WHERE name = 'Alda Hofman' LIMIT 1), 'terca', '09:00:00');
-- treino do aluno: Alda Hofman (quinta)
INSERT INTO public.training_days (client_id, week_day, training_time) VALUES ((SELECT id FROM public.clients WHERE name = 'Alda Hofman' LIMIT 1), 'quinta', '09:00:00');
-- treino do aluno: Alzira Teixeira Bernardo (terca)
INSERT INTO public.training_days (client_id, week_day, training_time) VALUES ((SELECT id FROM public.clients WHERE name = 'Alzira Teixeira Bernardo' LIMIT 1), 'terca', '10:00:00');
-- treino do aluno: Ana Isabel dos Reis Tedesco (terca)
INSERT INTO public.training_days (client_id, week_day, training_time) VALUES ((SELECT id FROM public.clients WHERE name = 'Ana Isabel dos Reis Tedesco' LIMIT 1), 'terca', '07:00:00');
-- treino do aluno: Ana Isabel dos Reis Tedesco (quinta)
INSERT INTO public.training_days (client_id, week_day, training_time) VALUES ((SELECT id FROM public.clients WHERE name = 'Ana Isabel dos Reis Tedesco' LIMIT 1), 'quinta', '07:00:00');
-- treino do aluno: Ana Maria Rodrigues de Souza (terca)
INSERT INTO public.training_days (client_id, week_day, training_time) VALUES ((SELECT id FROM public.clients WHERE name = 'Ana Maria Rodrigues de Souza' LIMIT 1), 'terca', '10:00:00');
-- treino do aluno: Ana Maria Rodrigues de Souza (quinta)
INSERT INTO public.training_days (client_id, week_day, training_time) VALUES ((SELECT id FROM public.clients WHERE name = 'Ana Maria Rodrigues de Souza' LIMIT 1), 'quinta', '10:00:00');
-- treino do aluno: Ana Paula Pinheiro dos Santos (segunda)
INSERT INTO public.training_days (client_id, week_day, training_time) VALUES ((SELECT id FROM public.clients WHERE name = 'Ana Paula Pinheiro dos Santos' LIMIT 1), 'segunda', '17:00:00');
-- treino do aluno: Ana Paula Pinheiro dos Santos (quinta)
INSERT INTO public.training_days (client_id, week_day, training_time) VALUES ((SELECT id FROM public.clients WHERE name = 'Ana Paula Pinheiro dos Santos' LIMIT 1), 'quinta', '17:00:00');
-- treino do aluno: Angelita dos Santos Ramos (segunda)
INSERT INTO public.training_days (client_id, week_day, training_time) VALUES ((SELECT id FROM public.clients WHERE name = 'Angelita dos Santos Ramos' LIMIT 1), 'segunda', '17:00:00');
-- treino do aluno: Angelita dos Santos Ramos (quarta)
INSERT INTO public.training_days (client_id, week_day, training_time) VALUES ((SELECT id FROM public.clients WHERE name = 'Angelita dos Santos Ramos' LIMIT 1), 'quarta', '17:00:00');
-- treino do aluno: Antônio Correia de Fraga (terca)
INSERT INTO public.training_days (client_id, week_day, training_time) VALUES ((SELECT id FROM public.clients WHERE name = 'Antônio Correia de Fraga' LIMIT 1), 'terca', '15:00:00');
-- treino do aluno: Antônio Correia de Fraga (quarta)
INSERT INTO public.training_days (client_id, week_day, training_time) VALUES ((SELECT id FROM public.clients WHERE name = 'Antônio Correia de Fraga' LIMIT 1), 'quarta', '15:00:00');
-- treino do aluno: Antônio Correia de Fraga (sexta)
INSERT INTO public.training_days (client_id, week_day, training_time) VALUES ((SELECT id FROM public.clients WHERE name = 'Antônio Correia de Fraga' LIMIT 1), 'sexta', '15:00:00');
-- treino do aluno: Ariadne Furgarini Lucca (terca)
INSERT INTO public.training_days (client_id, week_day, training_time) VALUES ((SELECT id FROM public.clients WHERE name = 'Ariadne Furgarini Lucca' LIMIT 1), 'terca', '11:00:00');
-- treino do aluno: Ariadne Furgarini Lucca (quinta)
INSERT INTO public.training_days (client_id, week_day, training_time) VALUES ((SELECT id FROM public.clients WHERE name = 'Ariadne Furgarini Lucca' LIMIT 1), 'quinta', '11:00:00');
-- treino do aluno: Arthur Furtudo Barcelos (terca)
INSERT INTO public.training_days (client_id, week_day, training_time) VALUES ((SELECT id FROM public.clients WHERE name = 'Arthur Furtudo Barcelos' LIMIT 1), 'terca', '15:00:00');
-- treino do aluno: Camila Pereira de Fraga (segunda)
INSERT INTO public.training_days (client_id, week_day, training_time) VALUES ((SELECT id FROM public.clients WHERE name = 'Camila Pereira de Fraga' LIMIT 1), 'segunda', '18:00:00');
-- treino do aluno: Camila Pereira de Fraga (quinta)
INSERT INTO public.training_days (client_id, week_day, training_time) VALUES ((SELECT id FROM public.clients WHERE name = 'Camila Pereira de Fraga' LIMIT 1), 'quinta', '18:00:00');
-- treino do aluno: David Allan Tavares da Silva (segunda)
INSERT INTO public.training_days (client_id, week_day, training_time) VALUES ((SELECT id FROM public.clients WHERE name = 'David Allan Tavares da Silva' LIMIT 1), 'segunda', '15:00:00');
-- treino do aluno: David Allan Tavares da Silva (quarta)
INSERT INTO public.training_days (client_id, week_day, training_time) VALUES ((SELECT id FROM public.clients WHERE name = 'David Allan Tavares da Silva' LIMIT 1), 'quarta', '15:00:00');
-- treino do aluno: Edirene Nunes dos Santos (segunda)
INSERT INTO public.training_days (client_id, week_day, training_time) VALUES ((SELECT id FROM public.clients WHERE name = 'Edirene Nunes dos Santos' LIMIT 1), 'segunda', '08:00:00');
-- treino do aluno: Edirene Nunes dos Santos (quarta)
INSERT INTO public.training_days (client_id, week_day, training_time) VALUES ((SELECT id FROM public.clients WHERE name = 'Edirene Nunes dos Santos' LIMIT 1), 'quarta', '08:00:00');
-- treino do aluno: Eraci de Andrade (segunda)
INSERT INTO public.training_days (client_id, week_day, training_time) VALUES ((SELECT id FROM public.clients WHERE name = 'Eraci de Andrade' LIMIT 1), 'segunda', '15:00:00');
-- treino do aluno: Eraci de Andrade (quarta)
INSERT INTO public.training_days (client_id, week_day, training_time) VALUES ((SELECT id FROM public.clients WHERE name = 'Eraci de Andrade' LIMIT 1), 'quarta', '15:00:00');
-- treino do aluno: Eva dos Santos Gomes (quinta)
INSERT INTO public.training_days (client_id, week_day, training_time) VALUES ((SELECT id FROM public.clients WHERE name = 'Eva dos Santos Gomes' LIMIT 1), 'quinta', '15:00:00');
-- treino do aluno: Evandro Rost de Borba (terca)
INSERT INTO public.training_days (client_id, week_day, training_time) VALUES ((SELECT id FROM public.clients WHERE name = 'Evandro Rost de Borba' LIMIT 1), 'terca', '10:00:00');
-- treino do aluno: Evandro Rost de Borba (quinta)
INSERT INTO public.training_days (client_id, week_day, training_time) VALUES ((SELECT id FROM public.clients WHERE name = 'Evandro Rost de Borba' LIMIT 1), 'quinta', '16:00:00');
-- treino do aluno: Evani Teresinha da Silva Ramos (quinta)
INSERT INTO public.training_days (client_id, week_day, training_time) VALUES ((SELECT id FROM public.clients WHERE name = 'Evani Teresinha da Silva Ramos' LIMIT 1), 'quinta', '16:00:00');
-- treino do aluno: Fabiola Modinger (terca)
INSERT INTO public.training_days (client_id, week_day, training_time) VALUES ((SELECT id FROM public.clients WHERE name = 'Fabiola Modinger' LIMIT 1), 'terca', '08:00:00');
-- treino do aluno: Fernanda Coelho de Almeida (segunda)
INSERT INTO public.training_days (client_id, week_day, training_time) VALUES ((SELECT id FROM public.clients WHERE name = 'Fernanda Coelho de Almeida' LIMIT 1), 'segunda', '18:00:00');
-- treino do aluno: Fernanda Coelho de Almeida (quarta)
INSERT INTO public.training_days (client_id, week_day, training_time) VALUES ((SELECT id FROM public.clients WHERE name = 'Fernanda Coelho de Almeida' LIMIT 1), 'quarta', '18:00:00');
-- treino do aluno: Geci Soares Bertina (terca)
INSERT INTO public.training_days (client_id, week_day, training_time) VALUES ((SELECT id FROM public.clients WHERE name = 'Geci Soares Bertina' LIMIT 1), 'terca', '15:00:00');
-- treino do aluno: Geci Soares Bertina (quinta)
INSERT INTO public.training_days (client_id, week_day, training_time) VALUES ((SELECT id FROM public.clients WHERE name = 'Geci Soares Bertina' LIMIT 1), 'quinta', '15:00:00');
-- treino do aluno: Genilda Antonia da Silva Tomás (segunda)
INSERT INTO public.training_days (client_id, week_day, training_time) VALUES ((SELECT id FROM public.clients WHERE name = 'Genilda Antonia da Silva Tomás' LIMIT 1), 'segunda', '18:00:00');
-- treino do aluno: Genilda Antonia da Silva Tomás (quinta)
INSERT INTO public.training_days (client_id, week_day, training_time) VALUES ((SELECT id FROM public.clients WHERE name = 'Genilda Antonia da Silva Tomás' LIMIT 1), 'quinta', '18:00:00');
-- treino do aluno: Iracema Oliveira dos Santos (quinta)
INSERT INTO public.training_days (client_id, week_day, training_time) VALUES ((SELECT id FROM public.clients WHERE name = 'Iracema Oliveira dos Santos' LIMIT 1), 'quinta', '15:00:00');
-- treino do aluno: Jecy Maria Ramos da Rocha (terca)
INSERT INTO public.training_days (client_id, week_day, training_time) VALUES ((SELECT id FROM public.clients WHERE name = 'Jecy Maria Ramos da Rocha' LIMIT 1), 'terca', '16:00:00');
-- treino do aluno: Jecy Maria Ramos da Rocha (quinta)
INSERT INTO public.training_days (client_id, week_day, training_time) VALUES ((SELECT id FROM public.clients WHERE name = 'Jecy Maria Ramos da Rocha' LIMIT 1), 'quinta', '16:00:00');
-- treino do aluno: Jorgina Oliveira dos Santos (terca)
INSERT INTO public.training_days (client_id, week_day, training_time) VALUES ((SELECT id FROM public.clients WHERE name = 'Jorgina Oliveira dos Santos' LIMIT 1), 'terca', '11:00:00');
-- treino do aluno: Jorgina Oliveira dos Santos (quinta)
INSERT INTO public.training_days (client_id, week_day, training_time) VALUES ((SELECT id FROM public.clients WHERE name = 'Jorgina Oliveira dos Santos' LIMIT 1), 'quinta', '11:00:00');
-- treino do aluno: Julia Fontes (quarta)
INSERT INTO public.training_days (client_id, week_day, training_time) VALUES ((SELECT id FROM public.clients WHERE name = 'Julia Fontes' LIMIT 1), 'quarta', '16:00:00');
-- treino do aluno: Karla Gonsalves (terca)
INSERT INTO public.training_days (client_id, week_day, training_time) VALUES ((SELECT id FROM public.clients WHERE name = 'Karla Gonsalves' LIMIT 1), 'terca', '10:00:00');
-- treino do aluno: Karla Gonsalves (quarta)
INSERT INTO public.training_days (client_id, week_day, training_time) VALUES ((SELECT id FROM public.clients WHERE name = 'Karla Gonsalves' LIMIT 1), 'quarta', '15:00:00');
-- treino do aluno: Katia Kenes (segunda)
INSERT INTO public.training_days (client_id, week_day, training_time) VALUES ((SELECT id FROM public.clients WHERE name = 'Katia Kenes' LIMIT 1), 'segunda', '08:00:00');
-- treino do aluno: Katia Kenes (quarta)
INSERT INTO public.training_days (client_id, week_day, training_time) VALUES ((SELECT id FROM public.clients WHERE name = 'Katia Kenes' LIMIT 1), 'quarta', '08:00:00');
-- treino do aluno: Lisiane Bereta (segunda)
INSERT INTO public.training_days (client_id, week_day, training_time) VALUES ((SELECT id FROM public.clients WHERE name = 'Lisiane Bereta' LIMIT 1), 'segunda', '18:00:00');
-- treino do aluno: Lisiane Bereta (quarta)
INSERT INTO public.training_days (client_id, week_day, training_time) VALUES ((SELECT id FROM public.clients WHERE name = 'Lisiane Bereta' LIMIT 1), 'quarta', '18:00:00');
-- treino do aluno: Lisiane de Fraga Lima (terca)
INSERT INTO public.training_days (client_id, week_day, training_time) VALUES ((SELECT id FROM public.clients WHERE name = 'Lisiane de Fraga Lima' LIMIT 1), 'terca', '19:00:00');
-- treino do aluno: Lisiane de Fraga Lima (quinta)
INSERT INTO public.training_days (client_id, week_day, training_time) VALUES ((SELECT id FROM public.clients WHERE name = 'Lisiane de Fraga Lima' LIMIT 1), 'quinta', '19:00:00');
-- treino do aluno: Lourdes Costa Gonsalves (quarta)
INSERT INTO public.training_days (client_id, week_day, training_time) VALUES ((SELECT id FROM public.clients WHERE name = 'Lourdes Costa Gonsalves' LIMIT 1), 'quarta', '15:00:00');
-- treino do aluno: Lucia Maria Oliveira dos Santos (terca)
INSERT INTO public.training_days (client_id, week_day, training_time) VALUES ((SELECT id FROM public.clients WHERE name = 'Lucia Maria Oliveira dos Santos' LIMIT 1), 'terca', '11:00:00');
-- treino do aluno: Lucia Maria Oliveira dos Santos (quinta)
INSERT INTO public.training_days (client_id, week_day, training_time) VALUES ((SELECT id FROM public.clients WHERE name = 'Lucia Maria Oliveira dos Santos' LIMIT 1), 'quinta', '11:00:00');
-- treino do aluno: Luciane dos Santos (terca)
INSERT INTO public.training_days (client_id, week_day, training_time) VALUES ((SELECT id FROM public.clients WHERE name = 'Luciane dos Santos' LIMIT 1), 'terca', '15:00:00');
-- treino do aluno: Luciane dos Santos (quinta)
INSERT INTO public.training_days (client_id, week_day, training_time) VALUES ((SELECT id FROM public.clients WHERE name = 'Luciane dos Santos' LIMIT 1), 'quinta', '15:00:00');
-- treino do aluno: Lucimar Oliveira Lima (terca)
INSERT INTO public.training_days (client_id, week_day, training_time) VALUES ((SELECT id FROM public.clients WHERE name = 'Lucimar Oliveira Lima' LIMIT 1), 'terca', '19:00:00');
-- treino do aluno: Lucimar Oliveira Lima (quinta)
INSERT INTO public.training_days (client_id, week_day, training_time) VALUES ((SELECT id FROM public.clients WHERE name = 'Lucimar Oliveira Lima' LIMIT 1), 'quinta', '19:00:00');
-- treino do aluno: Luiza Beatriz de Borba Rocha (segunda)
INSERT INTO public.training_days (client_id, week_day, training_time) VALUES ((SELECT id FROM public.clients WHERE name = 'Luiza Beatriz de Borba Rocha' LIMIT 1), 'segunda', '08:00:00');
-- treino do aluno: Luiza Beatriz de Borba Rocha (quarta)
INSERT INTO public.training_days (client_id, week_day, training_time) VALUES ((SELECT id FROM public.clients WHERE name = 'Luiza Beatriz de Borba Rocha' LIMIT 1), 'quarta', '08:00:00');
-- treino do aluno: Lurdeselena Fraga Vargas (terca)
INSERT INTO public.training_days (client_id, week_day, training_time) VALUES ((SELECT id FROM public.clients WHERE name = 'Lurdeselena Fraga Vargas' LIMIT 1), 'terca', '11:00:00');
-- treino do aluno: Lurdeselena Fraga Vargas (quinta)
INSERT INTO public.training_days (client_id, week_day, training_time) VALUES ((SELECT id FROM public.clients WHERE name = 'Lurdeselena Fraga Vargas' LIMIT 1), 'quinta', '11:00:00');
-- treino do aluno: Maria Elena Silveira dos Santos (terca)
INSERT INTO public.training_days (client_id, week_day, training_time) VALUES ((SELECT id FROM public.clients WHERE name = 'Maria Elena Silveira dos Santos' LIMIT 1), 'terca', '10:00:00');
-- treino do aluno: Maria Elena Silveira dos Santos (quinta)
INSERT INTO public.training_days (client_id, week_day, training_time) VALUES ((SELECT id FROM public.clients WHERE name = 'Maria Elena Silveira dos Santos' LIMIT 1), 'quinta', '10:00:00');
-- treino do aluno: Maria Cristina Siqueira Borges (cris) (segunda)
INSERT INTO public.training_days (client_id, week_day, training_time) VALUES ((SELECT id FROM public.clients WHERE name = 'Maria Cristina Siqueira Borges (cris)' LIMIT 1), 'segunda', '08:00:00');
-- treino do aluno: Maria Cristina Siqueira Borges (cris) (quarta)
INSERT INTO public.training_days (client_id, week_day, training_time) VALUES ((SELECT id FROM public.clients WHERE name = 'Maria Cristina Siqueira Borges (cris)' LIMIT 1), 'quarta', '08:00:00');
-- treino do aluno: Maria Helena Gil Peixoto (terca)
INSERT INTO public.training_days (client_id, week_day, training_time) VALUES ((SELECT id FROM public.clients WHERE name = 'Maria Helena Gil Peixoto' LIMIT 1), 'terca', '10:00:00');
-- treino do aluno: Maria Helena Gil Peixoto (quinta)
INSERT INTO public.training_days (client_id, week_day, training_time) VALUES ((SELECT id FROM public.clients WHERE name = 'Maria Helena Gil Peixoto' LIMIT 1), 'quinta', '10:00:00');
-- treino do aluno: Maria Inacia Migliavaca (terca)
INSERT INTO public.training_days (client_id, week_day, training_time) VALUES ((SELECT id FROM public.clients WHERE name = 'Maria Inacia Migliavaca' LIMIT 1), 'terca', '15:00:00');
-- treino do aluno: Maria Inacia Migliavaca (quinta)
INSERT INTO public.training_days (client_id, week_day, training_time) VALUES ((SELECT id FROM public.clients WHERE name = 'Maria Inacia Migliavaca' LIMIT 1), 'quinta', '15:00:00');
-- treino do aluno: Maria Luiza Schmitz (Neca) (terca)
INSERT INTO public.training_days (client_id, week_day, training_time) VALUES ((SELECT id FROM public.clients WHERE name = 'Maria Luiza Schmitz (Neca)' LIMIT 1), 'terca', '09:00:00');
-- treino do aluno: Maria Luiza Schmitz (Neca) (quinta)
INSERT INTO public.training_days (client_id, week_day, training_time) VALUES ((SELECT id FROM public.clients WHERE name = 'Maria Luiza Schmitz (Neca)' LIMIT 1), 'quinta', '09:00:00');
-- treino do aluno: Maria Margarida Nunes da Rosa (terca)
INSERT INTO public.training_days (client_id, week_day, training_time) VALUES ((SELECT id FROM public.clients WHERE name = 'Maria Margarida Nunes da Rosa' LIMIT 1), 'terca', '09:00:00');
-- treino do aluno: Maria Margarida Nunes da Rosa (quinta)
INSERT INTO public.training_days (client_id, week_day, training_time) VALUES ((SELECT id FROM public.clients WHERE name = 'Maria Margarida Nunes da Rosa' LIMIT 1), 'quinta', '09:00:00');
-- treino do aluno: Marilene Senti da Silva (quarta)
INSERT INTO public.training_days (client_id, week_day, training_time) VALUES ((SELECT id FROM public.clients WHERE name = 'Marilene Senti da Silva' LIMIT 1), 'quarta', '16:00:00');
-- treino do aluno: Mariza Pereira Ramos (segunda)
INSERT INTO public.training_days (client_id, week_day, training_time) VALUES ((SELECT id FROM public.clients WHERE name = 'Mariza Pereira Ramos' LIMIT 1), 'segunda', '18:00:00');
-- treino do aluno: Mariza Pereira Ramos (quarta)
INSERT INTO public.training_days (client_id, week_day, training_time) VALUES ((SELECT id FROM public.clients WHERE name = 'Mariza Pereira Ramos' LIMIT 1), 'quarta', '18:00:00');
-- treino do aluno: Miguelina dos Santos Peixoto (terca)
INSERT INTO public.training_days (client_id, week_day, training_time) VALUES ((SELECT id FROM public.clients WHERE name = 'Miguelina dos Santos Peixoto' LIMIT 1), 'terca', '15:00:00');
-- treino do aluno: Milton Costa Gonsalves (terca)
INSERT INTO public.training_days (client_id, week_day, training_time) VALUES ((SELECT id FROM public.clients WHERE name = 'Milton Costa Gonsalves' LIMIT 1), 'terca', '10:00:00');
-- treino do aluno: Olisia Oliveira Shimith (terca)
INSERT INTO public.training_days (client_id, week_day, training_time) VALUES ((SELECT id FROM public.clients WHERE name = 'Olisia Oliveira Shimith' LIMIT 1), 'terca', '15:00:00');
-- treino do aluno: Olisia Oliveira Shimith (quinta)
INSERT INTO public.training_days (client_id, week_day, training_time) VALUES ((SELECT id FROM public.clients WHERE name = 'Olisia Oliveira Shimith' LIMIT 1), 'quinta', '15:00:00');
-- treino do aluno: Paulo Marques (segunda)
INSERT INTO public.training_days (client_id, week_day, training_time) VALUES ((SELECT id FROM public.clients WHERE name = 'Paulo Marques' LIMIT 1), 'segunda', '17:00:00');
-- treino do aluno: Paulo Marques (quarta)
INSERT INTO public.training_days (client_id, week_day, training_time) VALUES ((SELECT id FROM public.clients WHERE name = 'Paulo Marques' LIMIT 1), 'quarta', '17:00:00');
-- treino do aluno: Paulo Ricardo da Silva (segunda)
INSERT INTO public.training_days (client_id, week_day, training_time) VALUES ((SELECT id FROM public.clients WHERE name = 'Paulo Ricardo da Silva' LIMIT 1), 'segunda', '17:00:00');
-- treino do aluno: Paulo Ricardo da Silva (terca)
INSERT INTO public.training_days (client_id, week_day, training_time) VALUES ((SELECT id FROM public.clients WHERE name = 'Paulo Ricardo da Silva' LIMIT 1), 'terca', '17:00:00');
-- treino do aluno: Paulo Ricardo da Silva (quarta)
INSERT INTO public.training_days (client_id, week_day, training_time) VALUES ((SELECT id FROM public.clients WHERE name = 'Paulo Ricardo da Silva' LIMIT 1), 'quarta', '17:00:00');
-- treino do aluno: Rafaela Lemes Speransa (terca)
INSERT INTO public.training_days (client_id, week_day, training_time) VALUES ((SELECT id FROM public.clients WHERE name = 'Rafaela Lemes Speransa' LIMIT 1), 'terca', '08:00:00');
-- treino do aluno: Rafaela Lemes Speransa (quinta)
INSERT INTO public.training_days (client_id, week_day, training_time) VALUES ((SELECT id FROM public.clients WHERE name = 'Rafaela Lemes Speransa' LIMIT 1), 'quinta', '08:00:00');
-- treino do aluno: Raquel Coelho de Almeida (segunda)
INSERT INTO public.training_days (client_id, week_day, training_time) VALUES ((SELECT id FROM public.clients WHERE name = 'Raquel Coelho de Almeida' LIMIT 1), 'segunda', '18:00:00');
-- treino do aluno: Raquel Coelho de Almeida (quinta)
INSERT INTO public.training_days (client_id, week_day, training_time) VALUES ((SELECT id FROM public.clients WHERE name = 'Raquel Coelho de Almeida' LIMIT 1), 'quinta', '18:00:00');
-- treino do aluno: Raquel de Castilhos Porcher (terca)
INSERT INTO public.training_days (client_id, week_day, training_time) VALUES ((SELECT id FROM public.clients WHERE name = 'Raquel de Castilhos Porcher' LIMIT 1), 'terca', '17:00:00');
-- treino do aluno: Raquel de Castilhos Porcher (quinta)
INSERT INTO public.training_days (client_id, week_day, training_time) VALUES ((SELECT id FROM public.clients WHERE name = 'Raquel de Castilhos Porcher' LIMIT 1), 'quinta', '17:00:00');
-- treino do aluno: Renato Pinzon Niemeyr (segunda)
INSERT INTO public.training_days (client_id, week_day, training_time) VALUES ((SELECT id FROM public.clients WHERE name = 'Renato Pinzon Niemeyr' LIMIT 1), 'segunda', '17:00:00');
-- treino do aluno: Renato Pinzon Niemeyr (quarta)
INSERT INTO public.training_days (client_id, week_day, training_time) VALUES ((SELECT id FROM public.clients WHERE name = 'Renato Pinzon Niemeyr' LIMIT 1), 'quarta', '17:00:00');
-- treino do aluno: Renato Silveira da Rocha (segunda)
INSERT INTO public.training_days (client_id, week_day, training_time) VALUES ((SELECT id FROM public.clients WHERE name = 'Renato Silveira da Rocha' LIMIT 1), 'segunda', '16:00:00');
-- treino do aluno: Renato Silveira da Rocha (quarta)
INSERT INTO public.training_days (client_id, week_day, training_time) VALUES ((SELECT id FROM public.clients WHERE name = 'Renato Silveira da Rocha' LIMIT 1), 'quarta', '16:00:00');
-- treino do aluno: Rodrigo Fiorgarini Lucca (terca)
INSERT INTO public.training_days (client_id, week_day, training_time) VALUES ((SELECT id FROM public.clients WHERE name = 'Rodrigo Fiorgarini Lucca' LIMIT 1), 'terca', '11:00:00');
-- treino do aluno: Rodrigo Fiorgarini Lucca (quinta)
INSERT INTO public.training_days (client_id, week_day, training_time) VALUES ((SELECT id FROM public.clients WHERE name = 'Rodrigo Fiorgarini Lucca' LIMIT 1), 'quinta', '11:00:00');
-- treino do aluno: Rogerio (segunda)
INSERT INTO public.training_days (client_id, week_day, training_time) VALUES ((SELECT id FROM public.clients WHERE name = 'Rogerio' LIMIT 1), 'segunda', '17:00:00');
-- treino do aluno: Rogerio (quarta)
INSERT INTO public.training_days (client_id, week_day, training_time) VALUES ((SELECT id FROM public.clients WHERE name = 'Rogerio' LIMIT 1), 'quarta', '17:00:00');
-- treino do aluno: Rosa da Silva Pontes (terca)
INSERT INTO public.training_days (client_id, week_day, training_time) VALUES ((SELECT id FROM public.clients WHERE name = 'Rosa da Silva Pontes' LIMIT 1), 'terca', '10:00:00');
-- treino do aluno: Rosa da Silva Pontes (quinta)
INSERT INTO public.training_days (client_id, week_day, training_time) VALUES ((SELECT id FROM public.clients WHERE name = 'Rosa da Silva Pontes' LIMIT 1), 'quinta', '10:00:00');
-- treino do aluno: Rosa Maria Gil Gomes (terca)
INSERT INTO public.training_days (client_id, week_day, training_time) VALUES ((SELECT id FROM public.clients WHERE name = 'Rosa Maria Gil Gomes' LIMIT 1), 'terca', '10:00:00');
-- treino do aluno: Rosa Maria Gil Gomes (quinta)
INSERT INTO public.training_days (client_id, week_day, training_time) VALUES ((SELECT id FROM public.clients WHERE name = 'Rosa Maria Gil Gomes' LIMIT 1), 'quinta', '10:00:00');
-- treino do aluno: Rosalia Collares Borges (terca)
INSERT INTO public.training_days (client_id, week_day, training_time) VALUES ((SELECT id FROM public.clients WHERE name = 'Rosalia Collares Borges' LIMIT 1), 'terca', '16:00:00');
-- treino do aluno: Rosalia Collares Borges (quinta)
INSERT INTO public.training_days (client_id, week_day, training_time) VALUES ((SELECT id FROM public.clients WHERE name = 'Rosalia Collares Borges' LIMIT 1), 'quinta', '16:00:00');
-- treino do aluno: Sandro Gomes Pereira (terca)
INSERT INTO public.training_days (client_id, week_day, training_time) VALUES ((SELECT id FROM public.clients WHERE name = 'Sandro Gomes Pereira' LIMIT 1), 'terca', '18:00:00');
-- treino do aluno: Sandro Gomes Pereira (quinta)
INSERT INTO public.training_days (client_id, week_day, training_time) VALUES ((SELECT id FROM public.clients WHERE name = 'Sandro Gomes Pereira' LIMIT 1), 'quinta', '18:00:00');
-- treino do aluno: Seli Hermina Shenkel (segunda)
INSERT INTO public.training_days (client_id, week_day, training_time) VALUES ((SELECT id FROM public.clients WHERE name = 'Seli Hermina Shenkel' LIMIT 1), 'segunda', '16:00:00');
-- treino do aluno: Seloi dos Santos Gomes (segunda)
INSERT INTO public.training_days (client_id, week_day, training_time) VALUES ((SELECT id FROM public.clients WHERE name = 'Seloi dos Santos Gomes' LIMIT 1), 'segunda', '16:00:00');
-- treino do aluno: Simone Cunha Shimdt (segunda)
INSERT INTO public.training_days (client_id, week_day, training_time) VALUES ((SELECT id FROM public.clients WHERE name = 'Simone Cunha Shimdt' LIMIT 1), 'segunda', '08:00:00');
-- treino do aluno: Simone Cunha Shimdt (quarta)
INSERT INTO public.training_days (client_id, week_day, training_time) VALUES ((SELECT id FROM public.clients WHERE name = 'Simone Cunha Shimdt' LIMIT 1), 'quarta', '08:00:00');
-- treino do aluno: Stênia Silva Souza (segunda)
INSERT INTO public.training_days (client_id, week_day, training_time) VALUES ((SELECT id FROM public.clients WHERE name = 'Stênia Silva Souza' LIMIT 1), 'segunda', '08:00:00');
-- treino do aluno: Stênia Silva Souza (quarta)
INSERT INTO public.training_days (client_id, week_day, training_time) VALUES ((SELECT id FROM public.clients WHERE name = 'Stênia Silva Souza' LIMIT 1), 'quarta', '08:00:00');
-- treino do aluno: Sueli Andrade da Silva (terca)
INSERT INTO public.training_days (client_id, week_day, training_time) VALUES ((SELECT id FROM public.clients WHERE name = 'Sueli Andrade da Silva' LIMIT 1), 'terca', '07:00:00');
-- treino do aluno: Sueli Andrade da Silva (quinta)
INSERT INTO public.training_days (client_id, week_day, training_time) VALUES ((SELECT id FROM public.clients WHERE name = 'Sueli Andrade da Silva' LIMIT 1), 'quinta', '07:00:00');
-- treino do aluno: Suzielen da Silva Lopes (terca)
INSERT INTO public.training_days (client_id, week_day, training_time) VALUES ((SELECT id FROM public.clients WHERE name = 'Suzielen da Silva Lopes' LIMIT 1), 'terca', '11:00:00');
-- treino do aluno: Suzielen da Silva Lopes (quinta)
INSERT INTO public.training_days (client_id, week_day, training_time) VALUES ((SELECT id FROM public.clients WHERE name = 'Suzielen da Silva Lopes' LIMIT 1), 'quinta', '11:00:00');
-- treino do aluno: Tailene de Souza Rocha (terca)
INSERT INTO public.training_days (client_id, week_day, training_time) VALUES ((SELECT id FROM public.clients WHERE name = 'Tailene de Souza Rocha' LIMIT 1), 'terca', '18:00:00');
-- treino do aluno: Tailene de Souza Rocha (quinta)
INSERT INTO public.training_days (client_id, week_day, training_time) VALUES ((SELECT id FROM public.clients WHERE name = 'Tailene de Souza Rocha' LIMIT 1), 'quinta', '18:00:00');
-- treino do aluno: Terezinha da Silva Santos (terca)
INSERT INTO public.training_days (client_id, week_day, training_time) VALUES ((SELECT id FROM public.clients WHERE name = 'Terezinha da Silva Santos' LIMIT 1), 'terca', '10:00:00');
-- treino do aluno: Vandrieli Ferreira (quarta)
INSERT INTO public.training_days (client_id, week_day, training_time) VALUES ((SELECT id FROM public.clients WHERE name = 'Vandrieli Ferreira' LIMIT 1), 'quarta', '16:00:00');
-- treino do aluno: Vera Elisete Pereira de Fraga (segunda)
INSERT INTO public.training_days (client_id, week_day, training_time) VALUES ((SELECT id FROM public.clients WHERE name = 'Vera Elisete Pereira de Fraga' LIMIT 1), 'segunda', '16:00:00');
-- treino do aluno: Vinicios Silva Garcias (segunda)
INSERT INTO public.training_days (client_id, week_day, training_time) VALUES ((SELECT id FROM public.clients WHERE name = 'Vinicios Silva Garcias' LIMIT 1), 'segunda', '15:00:00');
-- treino do aluno: Vinicios Silva Garcias (quarta)
INSERT INTO public.training_days (client_id, week_day, training_time) VALUES ((SELECT id FROM public.clients WHERE name = 'Vinicios Silva Garcias' LIMIT 1), 'quarta', '15:00:00');
-- treino do aluno: Walderedo Braga (terca)
INSERT INTO public.training_days (client_id, week_day, training_time) VALUES ((SELECT id FROM public.clients WHERE name = 'Walderedo Braga' LIMIT 1), 'terca', '09:00:00');
-- treino do aluno: Walderedo Braga (quinta)
INSERT INTO public.training_days (client_id, week_day, training_time) VALUES ((SELECT id FROM public.clients WHERE name = 'Walderedo Braga' LIMIT 1), 'quinta', '09:00:00');
-- treino do aluno: Walmiro Hilario Lucca (terca)
INSERT INTO public.training_days (client_id, week_day, training_time) VALUES ((SELECT id FROM public.clients WHERE name = 'Walmiro Hilario Lucca' LIMIT 1), 'terca', '11:00:00');
-- treino do aluno: Walmiro Hilario Lucca (quinta)
INSERT INTO public.training_days (client_id, week_day, training_time) VALUES ((SELECT id FROM public.clients WHERE name = 'Walmiro Hilario Lucca' LIMIT 1), 'quinta', '11:00:00');

-- EVALUATIONS
-- avaliacao do aluno: Lucia Maria Oliveira dos Santos
INSERT INTO public.evaluations (client_id, created_at, weight, height, torax, waist, abdomen, hip, forearm_left, forearm_right, arm_left, arm_right, thigh_left, thigh_right, calf_left, calf_right) VALUES ((SELECT id FROM public.clients WHERE name = 'Lucia Maria Oliveira dos Santos' LIMIT 1), CURRENT_TIMESTAMP, 56.5, 1.59, NULL, 77.0, 84.0, 97.0, 24.0, 24.0, 27.0, 27.0, 51.0, 52.0, 32.0, 33.0);
-- avaliacao do aluno: Luciane dos Santos
INSERT INTO public.evaluations (client_id, created_at, weight, height, torax, waist, abdomen, hip, forearm_left, forearm_right, arm_left, arm_right, thigh_left, thigh_right, calf_left, calf_right) VALUES ((SELECT id FROM public.clients WHERE name = 'Luciane dos Santos' LIMIT 1), CURRENT_TIMESTAMP, NULL, 1.69, 93.0, 77.0, 90.0, 104.0, 23.0, 24.0, 30.0, 30.0, 57.0, 60.0, 38.0, 37.0);
-- avaliacao do aluno: Luciane dos Santos
INSERT INTO public.evaluations (client_id, created_at, weight, height, torax, waist, abdomen, hip, forearm_left, forearm_right, arm_left, arm_right, thigh_left, thigh_right, calf_left, calf_right) VALUES ((SELECT id FROM public.clients WHERE name = 'Luciane dos Santos' LIMIT 1), '2015-08-11'::timestamp with time zone, NULL, 1.69, 98.0, 77.0, 90.0, 105.0, 24.0, 24.0, 31.0, 31.0, 61.0, 61.0, 39.0, 39.0);
-- avaliacao do aluno: Luciane dos Santos
INSERT INTO public.evaluations (client_id, created_at, weight, height, torax, waist, abdomen, hip, forearm_left, forearm_right, arm_left, arm_right, thigh_left, thigh_right, calf_left, calf_right) VALUES ((SELECT id FROM public.clients WHERE name = 'Luciane dos Santos' LIMIT 1), '2026-08-23'::timestamp with time zone, NULL, 1.69, 95.0, 78.0, 90.0, 105.0, 24.0, 24.0, 28.0, 28.0, 61.0, 61.0, 39.0, 39.0);
-- avaliacao do aluno: Maria Luiza Schmitz (Neca)
INSERT INTO public.evaluations (client_id, created_at, weight, height, torax, waist, abdomen, hip, forearm_left, forearm_right, arm_left, arm_right, thigh_left, thigh_right, calf_left, calf_right) VALUES ((SELECT id FROM public.clients WHERE name = 'Maria Luiza Schmitz (Neca)' LIMIT 1), CURRENT_TIMESTAMP, NULL, NULL, 91.0, 76.0, 83.0, 101.0, 26.0, 26.0, 29.0, 30.0, 56.0, 56.0, 38.0, 38.0);
-- avaliacao do aluno: Maria Luiza Schmitz (Neca)
INSERT INTO public.evaluations (client_id, created_at, weight, height, torax, waist, abdomen, hip, forearm_left, forearm_right, arm_left, arm_right, thigh_left, thigh_right, calf_left, calf_right) VALUES ((SELECT id FROM public.clients WHERE name = 'Maria Luiza Schmitz (Neca)' LIMIT 1), CURRENT_TIMESTAMP, NULL, NULL, 91.0, 76.0, 88.0, 101.0, 26.0, 26.0, 29.0, 29.0, 56.0, 56.0, 38.0, 38.0);
-- avaliacao do aluno: Marilene Oliveira da Silva
INSERT INTO public.evaluations (client_id, created_at, weight, height, torax, waist, abdomen, hip, forearm_left, forearm_right, arm_left, arm_right, thigh_left, thigh_right, calf_left, calf_right) VALUES ((SELECT id FROM public.clients WHERE name = 'Marilene Oliveira da Silva' LIMIT 1), '2015-11-24'::timestamp with time zone, 56.8, NULL, 90.0, 76.0, 79.0, 95.0, 24.0, 24.0, 27.0, 27.0, 52.0, 51.0, 36.0, 35.0);
-- avaliacao do aluno: Marilene Oliveira da Silva
INSERT INTO public.evaluations (client_id, created_at, weight, height, torax, waist, abdomen, hip, forearm_left, forearm_right, arm_left, arm_right, thigh_left, thigh_right, calf_left, calf_right) VALUES ((SELECT id FROM public.clients WHERE name = 'Marilene Oliveira da Silva' LIMIT 1), CURRENT_TIMESTAMP, 56.8, NULL, 92.0, 73.0, 78.0, 97.0, 24.0, 24.0, 29.0, 29.0, 55.0, 55.0, 35.0, 35.0);
-- avaliacao do aluno: Meures Brito dos Santos
INSERT INTO public.evaluations (client_id, created_at, weight, height, torax, waist, abdomen, hip, forearm_left, forearm_right, arm_left, arm_right, thigh_left, thigh_right, calf_left, calf_right) VALUES ((SELECT id FROM public.clients WHERE name = 'Meures Brito dos Santos' LIMIT 1), '2026-08-15'::timestamp with time zone, 60.8, 1.63, 96.0, 83.0, 87.0, 95.0, 23.0, 23.0, 26.0, 26.0, 44.0, 44.0, 34.0, 33.0);
-- avaliacao do aluno: Meures Brito dos Santos
INSERT INTO public.evaluations (client_id, created_at, weight, height, torax, waist, abdomen, hip, forearm_left, forearm_right, arm_left, arm_right, thigh_left, thigh_right, calf_left, calf_right) VALUES ((SELECT id FROM public.clients WHERE name = 'Meures Brito dos Santos' LIMIT 1), CURRENT_TIMESTAMP, 60.8, 1.63, 96.0, 78.0, 83.0, 89.0, 23.0, 23.0, 26.0, 26.0, 46.0, 46.0, 34.0, 33.0);
-- avaliacao do aluno: Olga Tatiana Melegali Muniz
INSERT INTO public.evaluations (client_id, created_at, weight, height, torax, waist, abdomen, hip, forearm_left, forearm_right, arm_left, arm_right, thigh_left, thigh_right, calf_left, calf_right) VALUES ((SELECT id FROM public.clients WHERE name = 'Olga Tatiana Melegali Muniz' LIMIT 1), CURRENT_TIMESTAMP, 90.0, NULL, 106.0, 97.0, 108.0, 122.0, 27.0, 27.0, 34.0, 34.0, 69.0, 68.0, 41.0, 41.0);
-- avaliacao do aluno: Rogerio
INSERT INTO public.evaluations (client_id, created_at, weight, height, torax, waist, abdomen, hip, forearm_left, forearm_right, arm_left, arm_right, thigh_left, thigh_right, calf_left, calf_right) VALUES ((SELECT id FROM public.clients WHERE name = 'Rogerio' LIMIT 1), CURRENT_TIMESTAMP, 105.0, 1.9, 104.0, 93.0, 106.0, 116.0, 29.0, 30.0, 32.0, 34.0, 62.0, 64.0, 43.0, 42.0);
-- avaliacao do aluno: Rogerio
INSERT INTO public.evaluations (client_id, created_at, weight, height, torax, waist, abdomen, hip, forearm_left, forearm_right, arm_left, arm_right, thigh_left, thigh_right, calf_left, calf_right) VALUES ((SELECT id FROM public.clients WHERE name = 'Rogerio' LIMIT 1), CURRENT_TIMESTAMP, 105.0, 1.9, 104.0, 92.0, 105.0, 116.0, 29.0, 30.0, 32.0, 34.0, 59.0, 59.0, 43.0, 42.0);
-- avaliacao do aluno: Sandro Gomes Pereira
INSERT INTO public.evaluations (client_id, created_at, weight, height, torax, waist, abdomen, hip, forearm_left, forearm_right, arm_left, arm_right, thigh_left, thigh_right, calf_left, calf_right) VALUES ((SELECT id FROM public.clients WHERE name = 'Sandro Gomes Pereira' LIMIT 1), CURRENT_TIMESTAMP, NULL, NULL, NULL, 88.0, NULL, NULL, NULL, NULL, 31.0, 32.0, 53.0, 53.0, NULL, NULL);
-- avaliacao do aluno: Sueli Andrade da Silva
INSERT INTO public.evaluations (client_id, created_at, weight, height, torax, waist, abdomen, hip, forearm_left, forearm_right, arm_left, arm_right, thigh_left, thigh_right, calf_left, calf_right) VALUES ((SELECT id FROM public.clients WHERE name = 'Sueli Andrade da Silva' LIMIT 1), CURRENT_TIMESTAMP, NULL, NULL, 121.0, 110.0, 122.0, 120.0, 27.0, 28.0, 36.0, 36.0, 59.0, 60.0, 37.0, 38.0);

COMMIT;
