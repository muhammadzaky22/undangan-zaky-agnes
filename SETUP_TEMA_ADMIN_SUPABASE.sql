-- ZAKY & AGNES — AKTIVASI TEMA WEBSITE VIA ADMIN
-- Jalankan SEKALI di Supabase SQL Editor setelah upload versi tema.
-- Fungsi publik hanya mengekspos pengaturan yang memang aman untuk tamu.

create or replace function public.get_public_wedding_settings()
returns table(setting_key text, setting_value jsonb)
language sql
stable
security definer
set search_path = public
as $$
  select s.key::text as setting_key, s.value::jsonb as setting_value
  from public.wedding_site_settings s
  where s.key = any (array[
    'maintenance_mode','maintenance_enabled',
    'event_day_mode','after_wedding_mode',
    'public_announcement','announcement',
    'contact_zaky','contact_agnes','contact_family','family_whatsapp',
    'live_stream_url','stream_url',
    'site_theme',
    'media_zaky','media_agnes','media_p0','media_p1','media_p2','media_p3','media_p4'
  ]::text[]);
$$;

revoke all on function public.get_public_wedding_settings() from public;
grant execute on function public.get_public_wedding_settings() to anon, authenticated;

-- Selesai. Tidak ada API key rahasia atau Storage bucket tambahan yang dibutuhkan.
