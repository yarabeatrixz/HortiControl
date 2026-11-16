-- HortiLink · permissões da API (service_role)
--
-- Achado no primeiro teste ponta a ponta com o projeto real (16/11/2026): a API
-- recebia "permission denied for table ..." em todas as tabelas. Projetos novos do
-- Supabase não concedem mais nada automaticamente em public, e a 0001 só
-- configurava anon/authenticated. O RLS é ignorado pela service_role, mas o GRANT não.
--
-- A service_role só existe no servidor (backend/.env); o cliente (anon/authenticated)
-- continua só com SELECT limitado pela 0001 e pelo RLS.

begin;

grant usage on schema public to service_role;

grant select, insert, update, delete on all tables in schema public to service_role;
grant usage, select on all sequences in schema public to service_role;

-- Tabelas e sequências futuras criadas pelas migrations (dono: postgres).
alter default privileges for role postgres in schema public
  grant select, insert, update, delete on tables to service_role;
alter default privileges for role postgres in schema public
  grant usage, select on sequences to service_role;

commit;
