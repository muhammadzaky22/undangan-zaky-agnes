-- ZAKY & AGNES — FOTO WEBSITE VIA ADMIN
-- Jalankan sekali di Supabase SQL Editor agar foto yang disimpan dari admin.html
-- dapat dibaca secara publik oleh index.html melalui RPC yang aman.
-- Fungsi ini HANYA mengekspos key yang memang ditujukan untuk publik.

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
    'media_zaky','media_agnes','media_p0','media_p1','media_p2','media_p3','media_p4'
  ]::text[]);
$$;

revoke all on function public.get_public_wedding_settings() from public;
grant execute on function public.get_public_wedding_settings() to anon, authenticated;

-- Tidak perlu membuat Storage bucket: foto admin disimpan sebagai gambar terkompresi
-- di wedding_site_settings, sehingga tidak ada service-role key di frontend.
