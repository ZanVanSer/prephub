create table if not exists public.user_profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  role text not null default 'basic',
  status text not null default 'active',
  plan text not null default 'basic',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint user_profiles_role_check check (role in ('admin', 'basic')),
  constraint user_profiles_status_check check (status in ('active', 'disabled')),
  constraint user_profiles_plan_check check (plan in ('basic'))
);

create or replace function public.set_user_profiles_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists set_user_profiles_updated_at on public.user_profiles;

create trigger set_user_profiles_updated_at
before update on public.user_profiles
for each row
execute function public.set_user_profiles_updated_at();

alter table public.user_profiles enable row level security;

drop policy if exists "Users can read own profile" on public.user_profiles;

create policy "Users can read own profile"
on public.user_profiles
for select
to authenticated
using (auth.uid() = id);
