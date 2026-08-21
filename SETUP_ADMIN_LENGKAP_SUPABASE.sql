-- ZAKY & AGNES — SETUP ADMIN LENGKAP
-- Jalankan SEKALI di Supabase SQL Editor.
-- Aman untuk frontend: fungsi publik hanya mengekspos pengaturan yang memang harus terlihat tamu.

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
    'site_theme','site_content','music_url','music_title',
    'media_zaky','media_agnes','media_p0','media_p1','media_p2','media_p3','media_p4'
  ]::text[]);
$$;

revoke all on function public.get_public_wedding_settings() from public;
grant execute on function public.get_public_wedding_settings() to anon, authenticated;

-- Public Storage khusus media yang boleh diakses tamu (musik admin).
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('wedding-media','wedding-media',true,15728640,array['audio/mpeg','audio/mp4','audio/x-m4a','audio/ogg','audio/wav'])
on conflict (id) do update set public=true, file_size_limit=15728640,
allowed_mime_types=array['audio/mpeg','audio/mp4','audio/x-m4a','audio/ogg','audio/wav'];

-- Hanya wedding admin yang boleh menambah/mengganti/menghapus file di bucket.
drop policy if exists "Wedding admin read wedding-media" on storage.objects;
drop policy if exists "Wedding admin insert wedding-media" on storage.objects;
drop policy if exists "Wedding admin update wedding-media" on storage.objects;
drop policy if exists "Wedding admin delete wedding-media" on storage.objects;

create policy "Wedding admin read wedding-media" on storage.objects
for select to authenticated using (bucket_id='wedding-media' and public.is_wedding_admin());
create policy "Wedding admin insert wedding-media" on storage.objects
for insert to authenticated with check (bucket_id='wedding-media' and public.is_wedding_admin());
create policy "Wedding admin update wedding-media" on storage.objects
for update to authenticated using (bucket_id='wedding-media' and public.is_wedding_admin()) with check (bucket_id='wedding-media' and public.is_wedding_admin());
create policy "Wedding admin delete wedding-media" on storage.objects
for delete to authenticated using (bucket_id='wedding-media' and public.is_wedding_admin());

-- Tidak ada service-role key atau secret key di frontend.
