-- HortiLink · esquema inicial (fase 2)
-- Espelha packages/dominio/src/tipos.ts (colunas em snake_case).
--
-- Segurança (skills audit-rls / audit-policies):
--   • RLS ligado e FORÇADO em todas as tabelas.
--   • `anon` não tem acesso a nada; `authenticated` só recebe o que precisa.
--   • O cliente (navegador) só LÊ. Toda escrita passa pela API, que roda as
--     regras de @hortilink/dominio e grava com a service_role (que ignora o RLS).
--     Assim ninguém altera preço, estoque ou status pelo DevTools (Auditoria ALTA-002).

begin;

-- ---------------------------------------------------------------- Tipos

create type public.perfil as enum ('produtor', 'comprador', 'loja');
create type public.origem as enum ('offer', 'product');
create type public.status_pedido as enum (
  'Aguardando pagamento', 'Pago', 'Entregue na loja', 'Pronto para retirada', 'Retirado', 'Cancelado'
);
create type public.status_proposta as enum ('Aguardando fornecedor', 'Aceita', 'Recusada');
create type public.evento_pedido as enum (
  'Pedido realizado', 'Proposta aceita', 'Pagamento aprovado',
  'Produto entregue na loja', 'Pronto para retirada', 'Retirado'
);
create type public.metodo_pagamento as enum ('Pix', 'Cartão de crédito');
create type public.tipo_movimento as enum ('Entrada', 'Perda');
create type public.tipo_despesa as enum ('Custo', 'Investimento');

-- ---------------------------------------------------------------- Tabelas

-- Perfil público de cada usuário do Supabase Auth (a senha fica só no Auth).
create table public.profiles (
  id         uuid primary key references auth.users (id) on delete cascade,
  role       public.perfil not null,
  name       text not null check (length(trim(name)) > 0),
  city       text not null check (length(trim(city)) > 0),
  email      text not null,
  created_at timestamptz not null default now()
);

-- Ponto de coleta da loja parceira (um por usuário com perfil loja).
create table public.stores (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null unique references public.profiles (id) on delete cascade,
  name        text not null check (length(trim(name)) > 0),
  address     text not null check (length(trim(address)) > 0),
  city        text not null check (length(trim(city)) > 0),
  hours       text not null check (length(trim(hours)) > 0),
  distance_km numeric(6, 1)
);

-- Pontos onde o produtor aceita retirada de produtos do catálogo.
create table public.producer_pickup_stores (
  producer_id uuid not null references public.profiles (id) on delete cascade,
  store_id    uuid not null references public.stores (id) on delete cascade,
  primary key (producer_id, store_id)
);

create table public.products (
  id           uuid primary key default gen_random_uuid(),
  producer_id  uuid not null references public.profiles (id) on delete cascade,
  name         text not null check (length(trim(name)) > 0),
  category     text not null check (category in ('Frutas', 'Verduras', 'Legumes', 'Raízes', 'Grãos', 'Temperos', 'Laticínios')),
  unit         text not null check (unit in ('kg','g','t','L','mL','un','mç','dz','cx','sc','saco','bdj','cumb','eng','pct','fd','pt','pç','tb','lt','bag')),
  price        numeric(12, 2) not null check (price > 0),
  quantity     numeric(12, 2) not null check (quantity >= 0),
  min_quantity numeric(12, 2) not null default 0 check (min_quantity >= 0),
  photo_url    text,
  created_at   timestamptz not null default now()
);

create table public.offers (
  id                uuid primary key default gen_random_uuid(),
  producer_id       uuid not null references public.profiles (id) on delete cascade,
  product_id        uuid not null references public.products (id) on delete cascade,
  quantity          numeric(12, 2) not null check (quantity >= 0),
  promotional_price numeric(12, 2) not null check (promotional_price > 0),
  city              text not null check (length(trim(city)) > 0),
  validity_days     integer not null check (validity_days > 0),
  created_at        timestamptz not null default now(),
  ended_at          timestamptz
);

create table public.offer_stores (
  offer_id uuid not null references public.offers (id) on delete cascade,
  store_id uuid not null references public.stores (id) on delete cascade,
  primary key (offer_id, store_id)
);

create table public.proposals (
  id          uuid primary key default gen_random_uuid(),
  type        public.origem not null,
  source_id   uuid not null,
  producer_id uuid not null references public.profiles (id),
  buyer_id    uuid not null references public.profiles (id),
  product_id  uuid not null references public.products (id),
  quantity    numeric(12, 2) not null check (quantity > 0),
  unit_price  numeric(12, 2) not null check (unit_price > 0),
  store_id    uuid not null references public.stores (id),
  status      public.status_proposta not null default 'Aguardando fornecedor',
  created_at  timestamptz not null default now()
);

create sequence public.order_number_seq;

create table public.orders (
  id             uuid primary key default gen_random_uuid(),
  order_number   text not null unique default ('#HL-' || lpad(nextval('public.order_number_seq')::text, 6, '0')),
  type           public.origem not null,
  source_id      uuid not null,
  producer_id    uuid not null references public.profiles (id),
  buyer_id       uuid not null references public.profiles (id),
  product_id     uuid not null references public.products (id),
  quantity       numeric(12, 2) not null check (quantity > 0),
  unit_price     numeric(12, 2) not null check (unit_price > 0),
  store_id       uuid not null references public.stores (id),
  status         public.status_pedido not null default 'Aguardando pagamento',
  proposal_id    uuid unique references public.proposals (id),
  payment_method public.metodo_pagamento,
  created_at     timestamptz not null default now(),
  accepted_at    timestamptz,
  paid_at        timestamptz,
  delivered_at   timestamptz
);

-- Linha do tempo do pedido (pedido.timeline no domínio).
create table public.order_events (
  id       bigint generated always as identity primary key,
  order_id uuid not null references public.orders (id) on delete cascade,
  label    public.evento_pedido not null,
  at       timestamptz not null default now()
);

create table public.stock_movements (
  id          uuid primary key default gen_random_uuid(),
  type        public.tipo_movimento not null,
  producer_id uuid not null references public.profiles (id) on delete cascade,
  product_id  uuid not null references public.products (id) on delete cascade,
  quantity    numeric(12, 2) not null check (quantity > 0),
  unit_cost   numeric(12, 2) check (unit_cost >= 0),
  reason      text check (reason in ('Estragou / passou do ponto', 'Avaria no transporte', 'Pragas ou clima', 'Sobra não vendida', 'Outro')),
  note        text not null default '',
  created_at  timestamptz not null default now(),
  -- Entrada tem custo e não tem motivo; perda tem motivo e não tem custo.
  check ((type = 'Entrada' and unit_cost is not null and reason is null)
      or (type = 'Perda' and reason is not null and unit_cost is null))
);

create table public.expenses (
  id          uuid primary key default gen_random_uuid(),
  producer_id uuid not null references public.profiles (id) on delete cascade,
  type        public.tipo_despesa not null,
  description text not null check (length(trim(description)) > 0),
  amount      numeric(12, 2) not null check (amount > 0),
  created_at  timestamptz not null default now()
);

-- Índices das buscas mais comuns (por dono e por relação).
create index on public.products (producer_id);
create index on public.offers (producer_id);
create index on public.offers (product_id);
create index on public.orders (buyer_id);
create index on public.orders (producer_id);
create index on public.orders (store_id);
create index on public.order_events (order_id);
create index on public.proposals (buyer_id);
create index on public.proposals (producer_id);
create index on public.stock_movements (producer_id);
create index on public.expenses (producer_id);

-- ---------------------------------------------------------------- Perfil automático no cadastro

-- Cria o profile a partir dos metadados do signup (role, name, city).
-- SECURITY DEFINER é necessário para gravar em public a partir do schema auth;
-- search_path vazio evita sequestro de nomes (skill audit-rpc-functions).
create function public.criar_perfil_do_usuario()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, role, name, city, email)
  values (
    new.id,
    (new.raw_user_meta_data ->> 'role')::public.perfil,
    coalesce(new.raw_user_meta_data ->> 'name', ''),
    coalesce(new.raw_user_meta_data ->> 'city', ''),
    new.email
  );
  return new;
end;
$$;

revoke execute on function public.criar_perfil_do_usuario() from public, anon, authenticated;

create trigger ao_criar_usuario
  after insert on auth.users
  for each row execute function public.criar_perfil_do_usuario();

-- ---------------------------------------------------------------- Permissões (grants)

revoke all on all tables in schema public from anon, authenticated;
revoke all on all sequences in schema public from anon, authenticated;

-- Leitura do que o app mostra para quem está logado.
grant select on public.stores, public.producer_pickup_stores, public.products,
                public.offers, public.offer_stores, public.orders, public.order_events,
                public.proposals, public.stock_movements, public.expenses
  to authenticated;
-- profiles: só colunas públicas (o e-mail não é exposto a outros usuários).
grant select (id, role, name, city) on public.profiles to authenticated;
-- Nenhum INSERT/UPDATE/DELETE para anon ou authenticated: escritas só pela API.

-- ---------------------------------------------------------------- RLS

alter table public.profiles               enable row level security;
alter table public.stores                 enable row level security;
alter table public.producer_pickup_stores enable row level security;
alter table public.products               enable row level security;
alter table public.offers                 enable row level security;
alter table public.offer_stores           enable row level security;
alter table public.proposals              enable row level security;
alter table public.orders                 enable row level security;
alter table public.order_events           enable row level security;
alter table public.stock_movements        enable row level security;
alter table public.expenses               enable row level security;

alter table public.profiles               force row level security;
alter table public.stores                 force row level security;
alter table public.producer_pickup_stores force row level security;
alter table public.products               force row level security;
alter table public.offers                 force row level security;
alter table public.offer_stores           force row level security;
alter table public.proposals              force row level security;
alter table public.orders                 force row level security;
alter table public.order_events           force row level security;
alter table public.stock_movements        force row level security;
alter table public.expenses               force row level security;

-- ---------------------------------------------------------------- Policies
-- `(select auth.uid())` é avaliado uma vez por consulta (recomendação do Supabase).

-- Só policies de SELECT: sem grant de escrita, nenhuma escrita do cliente passa.

-- Perfis: nomes e cidades aparecem nos catálogos (colunas limitadas pelo grant).
create policy "perfis visiveis para usuarios logados" on public.profiles
  for select to authenticated using (true);

-- Lojas e pontos de retirada: aparecem para escolher onde retirar.
create policy "lojas visiveis para usuarios logados" on public.stores
  for select to authenticated using (true);
create policy "pontos de retirada visiveis" on public.producer_pickup_stores
  for select to authenticated using (true);

-- Catálogo: todos os logados veem os produtos.
create policy "catalogo visivel para usuarios logados" on public.products
  for select to authenticated using (true);

-- Ofertas: todos veem (a tela filtra as ativas).
create policy "ofertas visiveis para usuarios logados" on public.offers
  for select to authenticated using (true);
create policy "pontos das ofertas visiveis" on public.offer_stores
  for select to authenticated using (true);

-- Pedidos: comprador, produtor e a loja do ponto de retirada.
create policy "envolvidos veem o pedido" on public.orders
  for select to authenticated
  using (
    buyer_id = (select auth.uid())
    or producer_id = (select auth.uid())
    or store_id in (select s.id from public.stores s where s.user_id = (select auth.uid()))
  );
create policy "envolvidos veem a linha do tempo" on public.order_events
  for select to authenticated
  using (order_id in (select o.id from public.orders o));  -- herda o filtro de orders

-- Propostas: comprador e produtor.
create policy "envolvidos veem a proposta" on public.proposals
  for select to authenticated
  using (buyer_id = (select auth.uid()) or producer_id = (select auth.uid()));

-- Estoque e financeiro: só o próprio produtor.
create policy "produtor ve suas movimentacoes" on public.stock_movements
  for select to authenticated using (producer_id = (select auth.uid()));
create policy "produtor ve suas despesas" on public.expenses
  for select to authenticated using (producer_id = (select auth.uid()));

commit;
