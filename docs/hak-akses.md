# Hak Akses per Peran

Sumber: `hakAkses` dan `izin` di [src/lib/data.js](../src/lib/data.js).
"Kelola" = boleh mengubah data, "Lihat" = hanya baca.

| Peran | Menu yang terlihat | Izin |
| --- | --- | --- |
| Admin | Dashboard, Produk, Stok, Pembelian, Penjualan, Majelis, Keuangan, Laporan, Pengguna | Kelola semua |
| Kurir | Pengiriman, Penjualan | Pengiriman: kelola · Penjualan: lihat |
| Keuangan | Dashboard, Keuangan, Penjualan, Pembelian, Produk, Stok, Laporan | Keuangan: kelola · lainnya: lihat · Laporan: keuangan |
| Gudang | Stok, Pembelian, Produk, Penjualan, Pengiriman, Laporan | Pembelian, Produk, Stok, Pengiriman: kelola · Penjualan: lihat · Laporan: stok |
| Pemasaran | Dashboard, Penjualan, Majelis, Laporan | Penjualan, Majelis: kelola · Dashboard: lihat · Laporan: penjualan |
| MT | Toko Saya | Toko: kelola (saat ini hanya bisa melihat, belum ada aksi) |

Pembeli umum tidak perlu login dan hanya memakai halaman `/marketplace`.

## Catatan

- Login masih mockup: memilih akun contoh, disimpan di localStorage, tanpa kata sandi.
- Membuka menu di luar hak akses mengarahkan pengguna kembali ke beranda perannya.
