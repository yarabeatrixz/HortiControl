-- HortiLink · endurecimento de segurança (auditoria de 15/11/2026, docs/AUDITORIA-SEGURANCA.md)
-- Skills do Obsidian: audit-rls, audit-api-exposure, audit-rpc-functions.
--
-- 1. Tabelas, sequências e funções FUTURAS em public não recebem privilégio nenhum
--    para anon/authenticated (cada migration concede só o que precisa, de propósito).
-- 2. Limites de tamanho nos textos livres (evita inchar o banco pela API).
-- 3. Foto do produto: só imagem PNG/JPEG/WebP em base64 ou endereço https.
-- 4. Chave única da linha do tempo do pedido (o upsert da API usa order_id + label + at).

begin;

-- ---------------------------------------------------------------- 1. Privilégios padrão

alter default privileges for role postgres in schema public
  revoke all on tables from anon, authenticated;
alter default privileges for role postgres in schema public
  revoke all on sequences from anon, authenticated;
alter default privileges for role postgres in schema public
  revoke execute on functions from public, anon, authenticated;

-- Função do "RLS automático" do Supabase (gatilho de evento): ninguém do cliente a chama.
do $$
begin
  if exists (select 1 from pg_proc p join pg_namespace n on n.oid = p.pronamespace
             where n.nspname = 'public' and p.proname = 'rls_auto_enable') then
    execute 'revoke execute on function public.rls_auto_enable() from public, anon, authenticated';
  end if;
exception when insufficient_privilege then
  raise notice 'rls_auto_enable pertence ao Supabase; revogação ignorada';
end;
$$;

-- ---------------------------------------------------------------- 2. Limites de texto

alter table public.profiles
  add constraint profiles_name_tamanho check (length(name) <= 120),
  add constraint profiles_city_tamanho check (length(city) <= 80);

alter table public.stores
  add constraint stores_name_tamanho    check (length(name) <= 120),
  add constraint stores_address_tamanho check (length(address) <= 200),
  add constraint stores_city_tamanho    check (length(city) <= 80),
  add constraint stores_hours_tamanho   check (length(hours) <= 120);

alter table public.products
  add constraint products_name_tamanho check (length(name) <= 120);

alter table public.offers
  add constraint offers_city_tamanho check (length(city) <= 80);

alter table public.stock_movements
  add constraint stock_movements_note_tamanho check (length(note) <= 500);

alter table public.expenses
  add constraint expenses_description_tamanho check (length(description) <= 500);

-- ---------------------------------------------------------------- 3. Foto do produto

-- ~1 MB de imagem em base64 cabe em 1,4 milhão de caracteres.
alter table public.products
  add constraint products_photo_formato check (
    photo_url is null
    or (length(photo_url) <= 1400000
        and (photo_url ~ '^data:image/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+$'
             or photo_url ~ '^https://[^\s<>"]+$'))
  );

-- ---------------------------------------------------------------- 4. Linha do tempo

create unique index order_events_evento_unico on public.order_events (order_id, label, at);

commit;
