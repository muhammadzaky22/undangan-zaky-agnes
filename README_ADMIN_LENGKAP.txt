ZAKY & AGNES — ADMIN LENGKAP

VERSI INI MENAMBAHKAN PENGATURAN DARI HP UNTUK:
- Nama mempelai dan keterangan orang tua
- Teks pembukaan, pesan personal tamu, dan penutup
- Tanggal/jam acara + countdown + kalender
- Nama lokasi, alamat/query, link Google Maps dan rute
- Maksimal tamu dan deadline RSVP
- Foto website
- 12 tema premium
- Musik: upload audio dari HP ke Supabase Storage atau URL audio
- Love Story (4 bagian)
- Rekening hadiah (2 rekening + tampil/sembunyikan)
- Live streaming + kontak WhatsApp
- Font, warna aksen, mode/kecepatan animasi
- Tampilkan/sembunyikan bagian website
- Urutan bagian website
- Ucapan, Wedding Pass, konfirmasi hadiah on/off
- Maintenance Mode, Event Day Mode, After Wedding Mode
- RSVP, moderasi ucapan, foto tamu, analytics, reminder WA, backup, offline check-in

SETUP SEKALI:
1. Upload semua file ZIP ini ke root GitHub Pages.
2. Buka Supabase > SQL Editor.
3. Jalankan SETUP_ADMIN_LENGKAP_SUPABASE.sql satu kali.
4. Buka https://zakyagnes.my.id/admin.html
5. Login admin dan ubah isi yang diinginkan.

CATATAN MUSIK:
- musik.mp3 di ZIP tetap menjadi musik bawaan/fallback.
- Upload musik dari admin disimpan di bucket public wedding-media.
- Autoplay audio tetap mengikuti kebijakan browser; pada beberapa HP audio mulai setelah interaksi pertama tamu.

KEAMANAN:
- Publishable/anon key di frontend memang untuk client publik.
- Service-role key TIDAK disimpan di HTML.
- Perubahan admin tetap membutuhkan login dan fungsi is_wedding_admin().


DAFTAR TAMU PERSONAL
- Kelola nama tamu langsung dari admin.html.
- Setiap tamu mendapat token/link unik.
- Sapaan, WhatsApp, kategori, dan kuota RSVP bisa diatur per tamu.
- Copy Link, Kirim WhatsApp, QR personal, edit, hapus, import CSV, dan export CSV tersedia.
- Status Belum Dikirim / Dikirim / Dibuka / RSVP dapat dipantau.
- Jalankan SETUP_DAFTAR_TAMU_SUPABASE.sql sekali untuk mengaktifkan fitur ini.
