# UBER POKJA

Aplikasi web untuk mengelola operasional **UBER (Usaha Bersama) POKJA Majelis Taklim Tenjolaya**: pengadaan barang, stok, penjualan, pengiriman, keuangan, dan laporan. Aplikasi juga menyediakan **marketplace publik** tempat pembeli umum memesan dari toko (Majelis Taklim) terdekat.

**Live:** https://uber-pokja.pages.dev

> Status: **mockup**. Data contoh disimpan di browser (localStorage), login hanya memilih akun contoh tanpa kata sandi, dan belum terhubung ke database.

---

## Daftar dokumen

| Dokumen | Isi |
| --- | --- |
| [PRD.md](PRD.md) | Kebutuhan produk: tujuan, pengguna, fitur, alur, MVP, prinsip UI/UX |
| [uber-pokja.md](uber-pokja.md) | Timeline program Usaha Bersama, dari pembentukan sampai launching penjualan perdana |
| [hak-akses.md](hak-akses.md) | Menu dan izin tiap peran |

---

## Peran pengguna

| Peran | Fokus |
| --- | --- |
| Admin | Mengelola seluruh sistem |
| Kurir | Pengiriman pesanan |
| Keuangan | Transaksi, kas, dan laporan keuangan |
| Gudang | Produk, pembelian, dan stok |
| Pemasaran | Majelis Taklim dan penjualan |
| MT | Toko/outlet: melihat stok titipan, pesanan, dan penjualan tokonya sendiri |
| Pembeli umum | Melihat katalog marketplace tanpa login; login diperlukan saat memesan untuk melengkapi data pribadi |

Rincian menu dan izin ada di [hak-akses.md](hak-akses.md).

## Fitur

**Aplikasi internal** (setelah login)

- Dashboard: omzet, penjualan, stok, pengeluaran, saldo
- Produk dan stok sembako
- Pembelian dari supplier
- Penjualan dan pengiriman
- Data Majelis Taklim (70 MT se-Tenjolaya)
- Keuangan dan laporan
- Manajemen pengguna dan notifikasi
- Toko Saya (khusus akun MT)

**Marketplace publik** (`/marketplace`)

- Pencarian toko terdekat, katalog per toko
- Keranjang, masuk & lengkapi data pribadi (wajib saat memesan), checkout, pembayaran, alamat
- Pesanan, chat, notifikasi, dan profil pembeli

## Teknologi

| Bagian | Pilihan |
| --- | --- |
| Framework | SvelteKit 2 + Svelte 5 |
| Styling | Tailwind CSS 4 |
| Komponen UI | `@khwarizmi/svelte-ui` |
| Hosting | Cloudflare Pages (`@sveltejs/adapter-cloudflare`) |
| Skema database (rencana) | Cloudflare D1, lihat [migrations/](../migrations/) |

## Struktur proyek

```text
src/
├── routes/
│   ├── (app)/          Halaman internal (dashboard, produk, stok, dst.)
│   ├── marketplace/    Marketplace publik
│   ├── login/          Pilih akun contoh (internal)
│   └── preview/        Daftar tautan semua halaman
└── lib/
    ├── data.js         Akun contoh, hak akses, data awal
    ├── data/           Data Majelis Taklim (JSON)
    ├── nav.js          Menu navigasi
    ├── auth.js         Login/logout mockup
    └── components/     Komponen bersama
migrations/             Skema SQL D1
docs/                   Dokumentasi
```

## Menjalankan di lokal

```sh
npm install
npm run dev        # server pengembangan
npm run build      # build produksi
npm run deploy     # build + deploy ke Cloudflare Pages
```

Untuk mencoba tiap peran, buka `/login` lalu pilih akun contoh.
