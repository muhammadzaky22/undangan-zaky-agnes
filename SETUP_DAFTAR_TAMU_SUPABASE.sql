-- ZAKY & AGNES — SETUP DAFTAR TAMU PERSONAL
-- Jalankan sekali di Supabase SQL Editor setelah setup admin utama berhasil.
-- Fitur: link personal, kuota per tamu, status dikirim/dibuka, dan pengelolaan tamu dari admin.html.

create table if not exists public.wedding_guests (
  id uuid primary key default gen_random_uuid(),
  token text not null unique default lower(substr(replace(gen_random_uuid()::text, '-', ''), 1, 18)),
  name text not null,
  salutation text not null default 'Bapak/Ibu',
  phone text,
  category text,
  max_guests integer not null default 2 check (max_guests between 1 and 50),
  notes text,
  active boolean not null default true,
  status text not null default 'not_sent' check (status in ('not_sent','sent')),
  sent_at timestamptz,
  first_opened_at timestamptz,
  last_opened_at timestamptz,
  open_count integer not null default 0 check (open_count >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists wedding_guests_name_idx on public.wedding_guests (lower(name));
create index if not exists wedding_guests_category_idx on public.wedding_guests (category);
create index if not exists wedding_guests_sent_at_idx on public.wedding_guests (sent_at desc);
create index if not exists wedding_guests_opened_at_idx on public.wedding_guests (last_opened_at desc);

alter table public.wedding_guests enable row level security;

revoke all on table public.wedding_guests from anon;
revoke all on table public.wedding_guests from public;
grant select, insert, update, delete on table public.wedding_guests to authenticated;

drop policy if exists "Wedding admin select guests" on public.wedding_guests;
drop policy if exists "Wedding admin insert guests" on public.wedding_guests;
drop policy if exists "Wedding admin update guests" on public.wedding_guests;
drop policy if exists "Wedding admin delete guests" on public.wedding_guests;

create policy "Wedding admin select guests" on public.wedding_guests
for select to authenticated using (public.is_wedding_admin());

create policy "Wedding admin insert guests" on public.wedding_guests
for insert to authenticated with check (public.is_wedding_admin());

create policy "Wedding admin update guests" on public.wedding_guests
for update to authenticated using (public.is_wedding_admin()) with check (public.is_wedding_admin());

create policy "Wedding admin delete guests" on public.wedding_guests
for delete to authenticated using (public.is_wedding_admin());

-- Publik hanya boleh mengetahui data minimum jika memiliki token undangan yang benar.
-- Nomor WhatsApp, kategori, catatan, dan daftar tamu keseluruhan tidak diekspos.
create or replace function public.get_guest_invitation(p_token text)
returns table(
  token text,
  name text,
  salutation text,
  max_guests integer
)
language sql
stable
security definer
set search_path = public
as $$
  select g.token, g.name, g.salutation, g.max_guests
  from public.wedding_guests g
  where g.token = nullif(trim(p_token), '')
    and g.active = true
  limit 1;
$$;

revoke all on function public.get_guest_invitation(text) from public;
grant execute on function public.get_guest_invitation(text) to anon, authenticated;

-- Mencatat bahwa link personal telah dibuka tanpa mengekspos tabel tamu.
create or replace function public.mark_guest_invitation_opened(p_token text)
returns boolean
language plpgsql
volatile
security definer
set search_path = public
as $$
declare
  v_found boolean := false;
begin
  update public.wedding_guests
     set first_opened_at = coalesce(first_opened_at, now()),
         last_opened_at = now(),
         open_count = least(coalesce(open_count, 0) + 1, 2147483647),
         updated_at = now()
   where token = nullif(trim(p_token), '')
     and active = true;
  v_found := found;
  return v_found;
end;
$$;

revoke all on function public.mark_guest_invitation_opened(text) from public;
grant execute on function public.mark_guest_invitation_opened(text) to anon, authenticated;

-- Verifikasi singkat setelah RUN:
-- select count(*) from public.wedding_guests;
-- Hasil 0 berarti setup berhasil dan daftar tamu masih kosong.
