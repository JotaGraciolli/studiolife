# StudioLife Pilates

Aplicação web para gerenciamento de estúdio de pilates.

## Funcionalidades

- **Dashboard**: total de alunos ativos e acesso rápido às principais telas.
- **Cadastro de Alunos**: crie, edite e remova alunos.
- **Cadastro de Avaliações**: registre medidas corporais dos alunos.
- **Movimentação Financeira**: controle entradas e saídas do estúdio.
- **Lista de Presença**: registre presença, ausência e reposição de aulas.

## Tecnologias

- React 19 + Vite 6
- React Router DOM
- Tailwind CSS 4
- Supabase
- Deploy no Netlify

## Configuração do Supabase

1. Crie um projeto em [https://supabase.com](https://supabase.com).
2. No SQL Editor, execute o conteúdo do arquivo `db/TABLES_SCHEMA.sql` para criar as tabelas.
3. Copie a **Project URL** e a **anon public** API key do menu Settings > API.

## Autenticação

O app usa o Supabase Auth com email e senha.

1. No Supabase, acesse **Authentication > Providers** e mantenha **Email** habilitado.
2. Crie um usuário em **Authentication > Users** (ou permita signup pela aplicação).
3. Execute o script `db/rls_policies.sql` no SQL Editor para ativar RLS nas tabelas e permitir acesso apenas a usuários autenticados.

> Se preferir desabilitar a confirmação de email, vá em **Authentication > Providers > Email** e desligue **Confirm email**.

## Seed de dados

Para popular o banco com os dados dos arquivos CSV:

1. Certifique-se de que `Alunos.csv` e `evaluations.csv` estejam na raiz do projeto.
2. Execute:

```bash
python db/generate_inserts.py
```

3. Cole o conteúdo gerado em `db/seed_data.sql` no SQL Editor do Supabase.

## Desenvolvimento local

```bash
npm install
```

Crie um arquivo `.env` na raiz do projeto com as variáveis do Supabase:

```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anon-publica
```

Inicie o servidor de desenvolvimento:

```bash
npm run dev
```

## Build

```bash
npm run build
```

## Deploy no Netlify

1. Envie o código para um repositório Git (GitHub, GitLab ou Bitbucket).
2. No Netlify, clique em **Add new site** > **Import an existing project**.
3. Escolha o repositório.
4. Configure as variáveis de ambiente em **Site settings > Environment variables**:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
5. O arquivo `netlify.toml` já configura o comando de build (`npm run build`) e o diretório de publicação (`dist`).

## Estrutura

```
src/
  components/     # Layout, Loading, PageHeader, etc.
  pages/          # Dashboard, Clients, Evaluations, Financial, Attendance
  services/       # Cliente Supabase
  App.jsx         # Rotas da aplicação
  main.jsx        # Ponto de entrada
```

## Schema do banco

Veja `db/TABLES_SCHEMA.sql`.
