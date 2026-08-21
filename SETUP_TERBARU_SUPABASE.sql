-- ZAKY & AGNES — UPGRADE PILIHAN 1,3,6,8,9,10,12
-- Jalankan SEKALI di Supabase SQL Editor setelah setup admin + daftar tamu sebelumnya berhasil.
-- Upgrade database yang diperlukan terutama untuk NAMA ANGGOTA ROMBONGAN.
-- Fitur backup, template WA, funnel, smart reminder, optimasi aset, dan session lock berada di file website/admin.

begin;

-- 1) Nama anggota rombongan yang dapat dipersiapkan oleh admin pada setiap undangan personal.
alter table public.wedding_guests
  add column if not exists companion_names text[] not null default '{}'::text[];

-- 2) Nama anggota yang benar-benar dikonfirmasi saat RSVP.
alter table public.rsvps
  add column if not exists companion_names text[] not null default '{}'::text[];

-- 3) RPC publik dengan token undangan hanya mengembalikan data minimum.
-- Karena return type bertambah companion_names, fungsi lama perlu dibuat ulang.
drop function if exists public.get_guest_invitation(text);
create function public.get_guest_invitation(p_token text)
returns table(
  token text,
  name text,
  salutation text,
  max_guests integer,
  companion_names text[]
)
language sql
stable
security definer
set search_path = public
as $$
  select
    g.token,
    g.name,
    g.salutation,
    g.max_guests,
    coalesce(g.companion_names, '{}'::text[])
  from public.wedding_guests g
  where g.token = nullif(trim(p_token), '')
    and g.active = true
  limit 1;
$$;

revoke all on function public.get_guest_invitation(text) from public;
grant execute on function public.get_guest_invitation(text) to anon, authenticated;

-- 4) Simpan nama rombongan berdasarkan edit_token RSVP yang rahasia/tidak mudah ditebak.
create or replace function public.save_rsvp_companions(
  p_edit_token text,
  p_companion_names text[]
)
returns boolean
language plpgsql
volatile
security definer
set search_path = public
as $$
declare
  v_names text[];
  v_found boolean := false;
begin
  if nullif(trim(p_edit_token), '') is null or length(trim(p_edit_token)) < 12 then
    return false;
  end if;

  select coalesce(array_agg(x.name order by x.ord), '{}'::text[])
    into v_names
  from (
    select left(trim(u.name), 80) as name, u.ord
    from unnest(coalesce(p_companion_names, '{}'::text[])) with ordinality as u(name, ord)
    where nullif(trim(u.name), '') is not null
    order by u.ord
    limit 49
  ) x;

  update public.rsvps r
     set companion_names = coalesce(v_names, '{}'::text[])
   where r.edit_token::text = trim(p_edit_token);

  v_found := found;
  return v_found;
end;
$$;

revoke all on function public.save_rsvp_companions(text,text[]) from public;
grant execute on function public.save_rsvp_companions(text,text[]) to anon, authenticated;

-- 5) Tamu dapat memuat kembali nama rombongan saat mengedit RSVP dari perangkat yang sama.
create or replace function public.get_rsvp_companions(p_edit_token text)
returns text[]
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(r.companion_names, '{}'::text[])
  from public.rsvps r
  where nullif(trim(p_edit_token), '') is not null
    and length(trim(p_edit_token)) >= 12
    and r.edit_token::text = trim(p_edit_token)
  limit 1;
$$;

revoke all on function public.get_rsvp_companions(text) from public;
grant execute on function public.get_rsvp_companions(text) to anon, authenticated;

-- Index tambahan ringan untuk dashboard/filter admin.
create index if not exists wedding_guests_status_idx on public.wedding_guests (status);
create index if not exists wedding_guests_active_idx on public.wedding_guests (active);

commit;

-- Verifikasi setelah RUN:
-- select column_name from information_schema.columns
-- where table_schema='public' and table_name in ('wedding_guests','rsvps') and column_name='companion_names';
-- Harus tampil 2 baris.
