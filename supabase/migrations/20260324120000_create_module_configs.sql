create table if not exists public.module_configs (
  module_id text primary key,
  is_enabled boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create or replace function public.set_module_configs_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists set_module_configs_updated_at on public.module_configs;

create trigger set_module_configs_updated_at
before update on public.module_configs
for each row
execute function public.set_module_configs_updated_at();

alter table public.module_configs enable row level security;

insert into public.module_configs (module_id, is_enabled)
values
  ('dashboard', true),
  ('image-prep', true),
  ('mj-tool', true),
  ('settings', true),
  ('admin', true)
on conflict (module_id) do nothing;
