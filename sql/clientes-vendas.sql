-- =============================================================
-- TehivaTour — criação das tabelas clientes e vendas
-- Cole este script no Supabase → SQL Editor → New query → Run
-- É idempotente: pode rodar quantas vezes quiser.
-- =============================================================

create extension if not exists "uuid-ossp";

-- Clientes (cadastro reutilizado pelas vendas)
create table if not exists public.clientes (
  id uuid primary key default uuid_generate_v4(),
  nome text not null default '',
  cpf text,
  rg text,
  passaporte text,
  email text,
  telefone text,
  data_nascimento date,
  nacionalidade text,
  estado_civil text,
  profissao text,
  endereco text,
  numero text,
  complemento text,
  bairro text,
  cidade text,
  uf text,
  cep text,
  observacoes text,
  ativo boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Vendas (pacotes e turísticos já vendidos)
-- Cálculo por item: tarifa + percentual − desconto − abatimento + taxas
create table if not exists public.vendas (
  id uuid primary key default uuid_generate_v4(),
  numero text not null default '',
  cliente_id uuid references public.clientes (id) on delete set null,
  orcamento_id uuid references public.orcamentos (id) on delete set null,
  pacote_id uuid references public.pacotes (id) on delete set null,
  status text not null default 'aberta' check (status in ('aberta', 'parcial', 'paga', 'cancelada')),
  pacote_nome text,
  destino text,
  data_venda date,
  data_viagem date,
  data_retorno date,
  quantidade_pax integer not null default 1,
  itens jsonb not null default '[]'::jsonb,
  comissoes jsonb not null default '[]'::jsonb,
  valor_pago numeric not null default 0,
  forma_pagamento text,
  observacoes text not null default '',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Índices
create index if not exists idx_clientes_nome on public.clientes (nome);
create unique index if not exists idx_clientes_cpf on public.clientes (cpf)
  where cpf is not null and cpf <> '';
create index if not exists idx_vendas_cliente on public.vendas (cliente_id);
create index if not exists idx_vendas_status on public.vendas (status);
create index if not exists idx_vendas_data_viagem on public.vendas (data_viagem);

-- RLS: clientes e vendas são dados internos, só o admin autenticado acessa
alter table public.clientes enable row level security;
alter table public.vendas enable row level security;

drop policy if exists "clientes admin" on public.clientes;
drop policy if exists "vendas admin" on public.vendas;

create policy "clientes admin" on public.clientes
  for all to authenticated using (true) with check (true);
create policy "vendas admin" on public.vendas
  for all to authenticated using (true) with check (true);
