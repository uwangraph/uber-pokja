export const nav = [
	{ href: '/dashboard', label: 'Dashboard', icon: 'home', group: 'Utama' },
	{ href: '/toko', label: 'Toko Saya', icon: 'box', group: 'Utama' },
	{ href: '/penjualan', label: 'Penjualan', icon: 'cart', group: 'Transaksi' },
	{ href: '/pengiriman', label: 'Pengiriman', icon: 'truck', group: 'Transaksi' },
	{ href: '/pembelian', label: 'Pembelian', icon: 'receipt', group: 'Transaksi' },
	{ href: '/produk', label: 'Produk', icon: 'box', group: 'Inventori' },
	{ href: '/stok', label: 'Stok', icon: 'layers', group: 'Inventori' },
	{ href: '/majelis', label: 'Majelis Taklim', icon: 'users', group: 'Relasi' },
	{ href: '/keuangan', label: 'Keuangan', icon: 'wallet', group: 'Keuangan' },
	{ href: '/laporan', label: 'Laporan', icon: 'chart', group: 'Keuangan' },
	{ href: '/pengguna', label: 'Pengguna', icon: 'users', group: 'Administrasi' }
];

// Menu yang diutamakan di bottom bar HP (maks. 4, sisanya lewat tombol Menu)
export const navMobile = ['/dashboard', '/toko', '/penjualan', '/pengiriman', '/stok', '/keuangan', '/pembelian', '/majelis', '/produk', '/laporan'];
