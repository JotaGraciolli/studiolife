-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.clients (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  name text,
  phone text,
  birth_date date,
  start_date date,
  monthly_fee real,
  observations text,
  status text,
  CONSTRAINT clients_pkey PRIMARY KEY (id)
);
CREATE TABLE public.evaluations (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  client_id uuid,
  weight real,
  height real,
  torax real,
  waist real,
  abdomen real,
  hip real,
  forearm_left real,
  forearm_right real,
  arm_left real,
  arm_right real,
  thigh_left real,
  thigh_right real,
  calf_left real,
  calf_right real,
  CONSTRAINT evaluations_pkey PRIMARY KEY (id),
  CONSTRAINT evaluations_client_id_fkey FOREIGN KEY (client_id) REFERENCES public.clients(id)
);
CREATE TABLE public.contacts (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  client_id uuid,
  name text,
  phone text,
  CONSTRAINT contacts_pkey PRIMARY KEY (id),
  CONSTRAINT contacts_client_id_fkey FOREIGN KEY (client_id) REFERENCES public.clients(id)
);
CREATE TABLE public.training_days (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  client_id uuid,
  week_day text,
  training_time time without time zone,
  CONSTRAINT training_days_pkey PRIMARY KEY (id),
  CONSTRAINT training_days_client_id_fkey FOREIGN KEY (client_id) REFERENCES public.clients(id)
);
CREATE TABLE public.financial (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  client_id uuid,
  amount real,
  CONSTRAINT financial_pkey PRIMARY KEY (id),
  CONSTRAINT financial_client_id_fkey FOREIGN KEY (client_id) REFERENCES public.clients(id)
);
CREATE TABLE public.attendance (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  client_id uuid,
  status text,
  CONSTRAINT attendance_pkey PRIMARY KEY (id),
  CONSTRAINT attendance_client_id_fkey FOREIGN KEY (client_id) REFERENCES public.clients(id)
);