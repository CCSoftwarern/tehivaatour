-- =============================================================
-- TehivaTour — contas bancárias e entradas das vendas
-- Cole no Supabase → SQL Editor → New query → Run
-- Idempotente: pode rodar quantas vezes quiser.
-- Depende de public.vendas (rode sql/clientes-vendas.sql antes).
-- =============================================================

create extension if not exists "uuid-ossp";

-- Contas bancárias que recebem as vendas
create table if not exists public.contas (
  id uuid primary key default uuid_generate_v4(),
  nome text not null default '',
  banco text,
  agencia text,
  numero text,
  tipo text not null default 'corrente' check (tipo in ('corrente', 'poupanca')),
  titular text,
  ativa boolean default true,
  observacoes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Entradas: cada pagamento parcial recebido de uma venda
create table if not exists public.entradas (
  id uuid primary key default uuid_generate_v4(),
  venda_id uuid not null references public.vendas (id) on delete cascade,
  valor numeric not null default 0,
  data date,
  conta_id uuid references public.contas (id) on delete set null,
  forma_pagamento text,
  observacoes text,
  created_at timestamptz default now()
);

-- Índices
create index if not exists idx_contas_ativa on public.contas (ativa);
create index if not exists idx_entradas_venda on public.entradas (venda_id);
create index if not exists idx_entradas_conta on public.entradas (conta_id);
create index if not exists idx_entradas_data on public.entradas (data);

-- RLS: dados financeiros internos, só o admin autenticado
alter table public.contas enable row level security;
alter table public.entradas enable row level security;

drop policy if exists "contas admin" on public.contas;
drop policy if exists "entradas admin" on public.entradas;

create policy "contas admin" on public.contas
  for all to authenticated using (true) with check (true);
create policy "entradas admin" on public.entradas
  for all to authenticated using (true) with check (true);

-- Migração opcional: as vendas já cadastradas viram uma entrada única
-- na conta escolhida. Rode apenas se quiser converter o valor_pago atual.
-- Troque 'CONTA_ID' pelo id da conta (select id, nome from public.contas).
--
-- insert into public.entradas (venda_id, valor, data, conta_id, forma_pagamento, observacoes)
-- select v.id, v.valor_pago, coalesce(v.data_venda, v.created_at::date),
--        'CONTA_ID', v.forma_pagamento, 'Convertido de valor_pago'
-- from public.vendas v
-- where v.valor_pago > 0
--   and not exists (select 1 from public.entradas e where e.venda_id = v.id);
