# PRD — Aplikasi UBER POKJA

### 1. Overview

Aplikasi berbasis web untuk membantu mengelola operasional **UBER (Usaha Bersama) POKJA Majelis Taklim Tenjolaya**, mulai dari pengadaan barang, stok, penjualan, hingga keuangan dan laporan. Aplikasi juga menyediakan marketplace sembako publik untuk menerima pesanan dari pembeli umum.

**Tech Stack**

* Svelte 5
* JavaScript
* Tailwind CSS
* Cloudflare

---

### 2. Tujuan

* Memudahkan pencatatan operasional usaha.
* Memantau stok dan transaksi.
* Mengelola data supplier dan Majelis Taklim.
* Memantau keuangan usaha.
* Menyediakan laporan sederhana.

---

### 3. Target User

* **Admin** — mengelola seluruh sistem.
* **Koordinator** — memantau operasional.
* **Keuangan** — mengelola transaksi keuangan.
* **Pengadaan/Gudang** — mengelola supplier, pembelian, dan stok.
* **Pemasaran** — mengelola Majelis Taklim dan penjualan.
* **Pembeli umum** — melihat katalog sembako tanpa login, dan login terlebih dahulu saat memesan untuk melengkapi data pribadi.

---

### 4. Fitur Utama

**Dashboard**

* Ringkasan omzet
* Penjualan
* Stok
* Pengeluaran
* Saldo

**Produk & Stok**

* Data produk sembako: beras, minyak goreng, gula, telur, tepung, mi, teh, dan produk kebutuhan harian lain
* Stok masuk/keluar
* Status stok

**Supplier & Pembelian**

* Data supplier
* Pencatatan pembelian
* Penerimaan barang

**Penjualan**

* Pencatatan transaksi
* Data pembeli/Majelis Taklim
* Status pembayaran

**Marketplace Publik**

* Katalog produk sembako yang dapat diakses tanpa login
* Pencarian dan filter kategori produk
* Informasi harga, satuan, dan ketersediaan stok
* Keranjang belanja dan pengaturan jumlah produk
* Form pesanan berisi nama, nomor WhatsApp, serta alamat/catatan
* Konfirmasi pesanan oleh pengelola melalui WhatsApp
* Pesanan yang dikonfirmasi dicatat sebagai penjualan dan mengurangi stok

**Majelis Taklim**

* Data Majelis Taklim
* Kontak
* Riwayat transaksi

**Keuangan**

* Modal
* Pemasukan
* Pengeluaran
* Saldo

**Laporan**

* Penjualan
* Pembelian
* Stok
* Keuangan

---

### 5. Alur Utama

```text
Modal
  ↓
Pembelian
  ↓
Stok
  ↓
Penjualan
  ↓
Pembayaran
  ↓
Keuangan
  ↓
Laporan
```

**Alur Marketplace**

```text
Pembeli umum
  ↓
Katalog sembako
  ↓
Keranjang & data pemesan
  ↓
Pesanan dikirim
  ↓
Konfirmasi pengelola via WhatsApp
  ↓
Penjualan & stok diperbarui
  ↓
Keuangan & laporan
```

---

### 6. MVP

Versi pertama fokus pada:

1. Login
2. Dashboard
3. Produk
4. Supplier
5. Pembelian
6. Stok
7. Penjualan
8. Majelis Taklim
9. Keuangan
10. Laporan
11. Marketplace sembako publik

---

### 7. Prinsip UI/UX

* Simple dan mudah digunakan.
* Responsive untuk desktop dan mobile.
* Input transaksi cepat.
* Informasi penting mudah ditemukan.
* Dashboard memberikan gambaran kondisi usaha secara singkat.
* Marketplace mudah digunakan pembeli umum, terutama dari layar ponsel.

---

### 8. Output

Aplikasi diharapkan menjadi **pusat pengelolaan data dan operasional UBER POKJA**, sehingga aktivitas usaha dapat tercatat, dipantau, dan dilaporkan dalam satu sistem.
