ZAKY & AGNES — FINAL ROOT GITHUB + DOMAIN zakyagnes.my.id
=========================================================

DOMAIN UTAMA
https://zakyagnes.my.id/

ADMIN
https://zakyagnes.my.id/admin.html

CARA UPLOAD DARI HP KE ROOT REPOSITORY GITHUB
Upload semua file di ZIP ini langsung ke repository undangan-zaky-agnes.
JANGAN membuat folder baru di dalam repository. File index.html harus terlihat langsung di halaman utama repository.

FILE UTAMA YANG DI-UPLOAD
- index.html
- admin.html
- CNAME
- manifest.webmanifest
- sw.js
- offline.html
- maintenance.html
- icon-192.png
- icon-512.png
- social-preview.jpg
- qr-undangan-zaky-agnes.png
- robots.txt
- sitemap.xml
- FINAL_CHECKLIST.txt

MUSIK
Website tetap mencari file bernama: musik.mp3
File audio asli tidak ada di paket yang diperiksa, jadi tidak dibuat audio pengganti.
Jika musik.mp3 SUDAH ADA di repository GitHub, jangan hapus file tersebut ketika meng-upload paket final ini.
Jika belum ada, upload MP3 milik Anda sendiri dengan nama persis musik.mp3 ke root repository.
Browser tetap dapat membatasi autoplay; tombol musik akan menjadi fallback setelah tamu membuka undangan.

DATA ACARA YANG DIKUNCI
- Muhammad Zaky Khairy & Agnes Viannisa
- Minggu, 7 Februari 2027
- Akad Nikah: 08.00 WITA – selesai
- Resepsi: 11.00 WITA – selesai
- Lokasi: Gas Alam Badak 1, Muara Badak, Kalimantan Timur
- Kalender digital: keseluruhan acara 08.00–23.59 WITA, dengan rangkaian Akad 08.00 dan Resepsi 11.00 pada halaman undangan.

DOMAIN / DNS GITHUB PAGES
1. File CNAME harus berisi tepat: zakyagnes.my.id
2. GitHub > repository undangan-zaky-agnes > Settings > Pages > Custom domain: zakyagnes.my.id
3. DNS apex (@) A records GitHub Pages:
   185.199.108.153
   185.199.109.153
   185.199.110.153
   185.199.111.153
4. CNAME untuk www harus menuju langsung ke:
   muhammadzaky22.github.io
   Jangan tambahkan /undangan-zaky-agnes pada nilai CNAME.
5. Setelah DNS stabil dan sertifikat tersedia, aktifkan Enforce HTTPS di GitHub Pages.

LIVE STREAMING
Dashboard admin sekarang memiliki kolom Live Streaming.
Masuk ke /admin.html > Pengaturan > isi URL YouTube/Zoom > Simpan Pengaturan.
Undangan akan membaca key public live_stream_url dari wedding_site_settings melalui fungsi get_public_wedding_settings.
Jika URL sudah tersimpan tetapi bagian Live Streaming tidak muncul, pastikan fungsi get_public_wedding_settings di Supabase mengizinkan/mengembalikan key live_stream_url sebagai pengaturan publik.

SUPABASE
- Frontend menggunakan Supabase publishable key, bukan service-role key.
- Jangan pernah menaruh service_role / secret key di index.html atau admin.html.
- Jangan upload file SQL atau credential rahasia ke GitHub.
- RSVP/jumlah hadir membutuhkan fungsi dan policy Supabase yang sudah dipasang pada project Anda.

PERUBAHAN FINAL YANG SUDAH DITERAPKAN
- Struktur ZIP dibuat tanpa folder pembungkus; index.html berada di root ZIP.
- Penulisan lokasi diseragamkan menjadi Gas Alam Badak 1, Muara Badak.
- Google Calendar, ICS, metadata Event, dan tampilan acara diselaraskan untuk tanggal 7 Februari 2027.
- Google Calendar menggunakan zona waktu Asia/Makassar.
- DNS README untuk www diperbaiki menjadi muhammadzaky22.github.io.
- Admin mendapat pengaturan Live Streaming.
- Live Streaming tetap punya fallback meta za-stream-url.
- Service Worker cache version dinaikkan agar update lebih cepat terbaca setelah deploy.
- Desain, nama mempelai, nama orang tua, RSVP, Wedding Pass, galeri, dan fitur utama dipertahankan.


=== FITUR FOTO WEBSITE DARI ADMIN ===
1. Jalankan SETUP_FOTO_ADMIN_SUPABASE.sql satu kali di Supabase SQL Editor.
2. Buka https://zakyagnes.my.id/admin.html dan login sebagai wedding admin.
3. Pilih tab Foto Website.
4. Pilih JPG/PNG/WEBP dari HP lalu tekan Simpan Foto.
5. Sistem otomatis mengompres foto sebelum menyimpannya agar undangan tetap ringan.
6. Tekan Pakai Bawaan kapan saja untuk kembali ke foto asli yang tertanam di index.html.

Catatan: fitur ini tidak membutuhkan Supabase Storage bucket tambahan dan tidak menggunakan service-role key di browser.


ADMIN TEMA WEBSITE
-------------------
Versi ini memiliki 12 tema premium yang dapat diganti dari admin.html.
Jalankan SETUP_TEMA_ADMIN_SUPABASE.sql sekali agar site_theme dapat dibaca publik.
Tema tidak mengubah data RSVP, foto, musik, Supabase, atau domain.
