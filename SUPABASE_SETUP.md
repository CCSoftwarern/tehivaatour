# Setup do Supabase

Guia passo a passo para conectar o site da TehivaTour ao Supabase.

## 1. Criar o projeto

1. Acesse [supabase.com](https://supabase.com) e faça login.
2. Crie um novo projeto (região próxima dos seus clientes, ex: São Paulo).
3. Anote a **Project URL** e a **anon public key** (Project Settings → API).

## 2. Criar as tabelas e políticas

No painel do Supabase, abra **SQL Editor** → **New query** e cole o script abaixo:

```sql
-- =============================================================
-- TehivaTour — schema e RLS
-- =============================================================

create extension if not exists "uuid-ossp";

-- Configurações gerais do site (chave/valor)
create table if not exists public.configuracoes (
  chave text primary key,
  valor text not null default ''
);

-- Imagens de fundo do banner principal (carrossel)
create table if not exists public.hero_imagens (
  id uuid primary key default uuid_generate_v4(),
  url text not null,
  ordem integer default 0,
  ativo boolean default true,
  created_at timestamptz default now()
);

-- Promoções
create table if not exists public.promocoes (
  id uuid primary key default uuid_generate_v4(),
  titulo_pt text not null,
  titulo_en text not null,
  descricao_pt text,
  descricao_en text,
  preco numeric,
  preco_promocional numeric,
  imagem text,
  slug text,
  destaque boolean default false,
  ativo boolean default true,
  inicio timestamptz,
  vencimento timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Pacotes / cruzeiros / seguros
create table if not exists public.pacotes (
  id uuid primary key default uuid_generate_v4(),
  categoria text not null default 'pacote' check (categoria in ('pacote', 'cruzeiro', 'seguro')),
  titulo_pt text not null,
  titulo_en text not null,
  descricao_pt text,
  descricao_en text,
  destino_pt text,
  destino_en text,
  duracao_pt text,
  duracao_en text,
  preco numeric,
  imagem text,
  slug text unique,
  ativo boolean default true,
  vencimento timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Serviços / diferenciais
create table if not exists public.servicos (
  id uuid primary key default uuid_generate_v4(),
  icone text,
  titulo_pt text not null,
  titulo_en text not null,
  descricao_pt text,
  descricao_en text,
  imagem text,
  ordem integer default 0,
  ativo boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Mensagens do formulário de contato
create table if not exists public.contatos (
  id uuid primary key default uuid_generate_v4(),
  nome text not null,
  email text,
  telefone text,
  mensagem text not null,
  status text default 'nova' check (status in ('nova', 'lida', 'arquivada')),
  created_at timestamptz default now()
);

-- =============================================================
-- Índices
-- =============================================================
create index if not exists idx_promocoes_vencimento on public.promocoes (vencimento);
create index if not exists idx_promocoes_ativo on public.promocoes (ativo);
create index if not exists idx_pacotes_slug on public.pacotes (slug);
create index if not exists idx_pacotes_categoria on public.pacotes (categoria);
create index if not exists idx_servicos_ordem on public.servicos (ordem);

-- =============================================================
-- RLS
-- =============================================================
alter table public.configuracoes enable row level security;
alter table public.hero_imagens enable row level security;
alter table public.promocoes enable row level security;
alter table public.pacotes enable row level security;
alter table public.servicos enable row level security;
alter table public.contatos enable row level security;

-- Público (site): só leitura
create policy "config leitura publica" on public.configuracoes
  for select using (true);
create policy "hero leitura publica" on public.hero_imagens
  for select using (true);
create policy "promocoes leitura publica" on public.promocoes
  for select using (true);
create policy "pacotes leitura publica" on public.pacotes
  for select using (true);
create policy "servicos leitura publica" on public.servicos
  for select using (true);

-- Formulário de contato: qualquer um pode enviar mensagem
create policy "contatos podem inserir" on public.contatos
  for insert with check (true);

-- Autenticados (admin): escrita em tudo
create policy "config admin escrita" on public.configuracoes
  for all to authenticated using (true) with check (true);
create policy "hero admin escrita" on public.hero_imagens
  for all to authenticated using (true) with check (true);
create policy "promocoes admin escrita" on public.promocoes
  for all to authenticated using (true) with check (true);
create policy "pacotes admin escrita" on public.pacotes
  for all to authenticated using (true) with check (true);
create policy "servicos admin escrita" on public.servicos
  for all to authenticated using (true) with check (true);
create policy "contatos admin escrita" on public.contatos
  for all to authenticated using (true) with check (true);

-- =============================================================
-- Storage (bucket público de imagens)
-- =============================================================
insert into storage.buckets (id, name, public)
values ('imagens', 'imagens', true)
on conflict (id) do update set public = true;

alter table storage.objects enable row level security;

drop policy if exists "imagens leitura publica" on storage.objects;
drop policy if exists "imagens upload autenticado" on storage.objects;
drop policy if exists "imagens update autenticado" on storage.objects;
drop policy if exists "imagens delete autenticado" on storage.objects;

create policy "imagens leitura publica" on storage.objects
  for select using (bucket_id = 'imagens');
create policy "imagens upload autenticado" on storage.objects
  for insert to authenticated with check (bucket_id = 'imagens');
create policy "imagens update autenticado" on storage.objects
  for update to authenticated using (bucket_id = 'imagens') with check (bucket_id = 'imagens');
create policy "imagens delete autenticado" on storage.objects
  for delete to authenticated using (bucket_id = 'imagens');
```

> **Importante:** o storage precisar ter RLS. Se o bucket ainda não existir, o
> insert acima o cria. Verifique em **Storage** que o bucket `imagens` está
> **Public** (caso não esteja, rode o insert acima ou marque manualmente).

## 3. Criar o usuário admin

Em **Authentication → Users → Add user**, crie o usuário com o e-mail/senha do
admin.

## 4. Configurar variáveis de ambiente

Na raiz do projeto, copie `.env.local.example` para `.env.local`:

```bash
cp .env.local.example .env.local
```

E preencha:

```env
NEXT_PUBLIC_SUPABASE_URL=https://SEU-PROJETO.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=SUA_ANON_KEY
```

> A anon key fica em **Project Settings → API**.
> **Nunca** use a `service_role` key no site público.

Reinicie o servidor (`npm run dev`) após salvar o `.env.local`.

## 5. Acessar o admin

- Abra `http://localhost:3000/pt/admin/login`
- Entre com o e-mail/senha criados no passo 3.
- No admin você gerencia: promoções, pacotes, serviços, mensagens e o tema do
  site (cores e textos).

## 6. Deploy

No Vercel / Netlify, adicione as duas variáveis de ambiente do passo 4 e faça o
deploy. O `npm run build` passa mesmo sem as variáveis — o site usa um tema
padrão enquanto não houver dados.
