-- Migration: cria a tabela categories e alinha a tabela offers
-- Rode este arquivo no SQL Editor do Supabase (Dashboard > SQL Editor > New query)

-- 1) Tabela de categorias
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  icon text,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

-- 2) Seed das categorias que já existiam no front-end (idempotente)
insert into public.categories (name, slug, icon) values
  ('Eletrônicos', 'eletronicos', 'Cpu'),
  ('Casa', 'casa', 'Home'),
  ('Cozinha', 'cozinha', 'ChefHat'),
  ('Ferramentas', 'ferramentas', 'Wrench'),
  ('Beleza', 'beleza', 'Sparkles'),
  ('Informática', 'informatica', 'Laptop'),
  ('Celulares', 'celulares', 'Smartphone'),
  ('Games', 'games', 'Gamepad2'),
  ('Esporte', 'esporte', 'Dumbbell'),
  ('Moda', 'moda', 'Shirt'),
  ('Brinquedos', 'brinquedos', 'ToyBrick'),
  ('Automotivo', 'automotivo', 'Car'),
  ('Pet', 'pet', 'PawPrint')
on conflict (slug) do nothing;

-- 3) Colunas novas na tabela offers
alter table public.offers
  add column if not exists category_id uuid references public.categories(id),
  add column if not exists slug text,
  add column if not exists tags text[] not null default '{}';

-- 4) slug único (múltiplos NULL são permitidos por um índice único no Postgres,
--    então isso não quebra linhas antigas que ainda não tiverem slug preenchido)
create unique index if not exists offers_slug_key on public.offers (slug);

-- 5) Índice para acelerar filtro por categoria no site público
create index if not exists offers_category_id_idx on public.offers (category_id);

-- Observação: RLS continua desabilitada na tabela offers, conforme configuração atual do projeto.
