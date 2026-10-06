// Halaman toko per-MT bergantung pada data stok yang bisa berubah (transfer
// stok, penjualan) dan jumlah MT terlalu banyak untuk di-crawl statis saat
// build — dilayani sebagai halaman dinamis, bukan di-prerender.
export const prerender = false;
