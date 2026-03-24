insert into public.module_configs (module_id, is_enabled)
values ('background-remover', true)
on conflict (module_id) do nothing;

insert into public.role_module_access (role, module_id)
values
  ('basic', 'background-remover'),
  ('admin', 'background-remover')
on conflict (role, module_id) do nothing;
