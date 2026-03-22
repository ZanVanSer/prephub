create table if not exists public.role_configs (
  role text primary key,
  plan text not null default 'basic',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint role_configs_role_check check (role in ('admin', 'basic')),
  constraint role_configs_plan_check check (plan in ('basic'))
);

create table if not exists public.role_module_access (
  role text not null,
  module_id text not null,
  primary key (role, module_id),
  constraint role_module_access_role_check check (role in ('admin', 'basic'))
);

create or replace function public.set_role_configs_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists set_role_configs_updated_at on public.role_configs;

create trigger set_role_configs_updated_at
before update on public.role_configs
for each row
execute function public.set_role_configs_updated_at();

alter table public.role_configs enable row level security;
alter table public.role_module_access enable row level security;

insert into public.role_configs (role, plan)
values
  ('basic', 'basic'),
  ('admin', 'basic')
on conflict (role) do nothing;

insert into public.role_module_access (role, module_id)
values
  ('basic', 'image-prep'),
  ('basic', 'mj-tool'),
  ('basic', 'settings'),
  ('admin', 'image-prep'),
  ('admin', 'mj-tool'),
  ('admin', 'settings'),
  ('admin', 'admin')
on conflict (role, module_id) do nothing;
