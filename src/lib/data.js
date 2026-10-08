// Data contoh untuk mockup — bukan data asli.

// Akun contoh
export const akun = [
	{ id: 1, nama: 'Ahmad Akbar', username: 'ahmad.admin', role: 'admin', inisial: 'AA' },
	{ id: 4, nama: 'Dedi Gudang', username: 'dedi.gudang', role: 'gudang', inisial: 'DG' },
	{ id: 2, nama: 'Fajar Pratama', username: 'fajar.kurir', role: 'kurir', inisial: 'FP' },
	{ id: 5, nama: 'Aminah Pemasaran', username: 'aminah.pemasaran', role: 'pemasaran', inisial: 'AP' },
	{ id: 3, nama: 'Siti Keuangan', username: 'siti.keuangan', role: 'keuangan', inisial: 'SK' },
	// Akun MT = toko/outlet. majelisId menautkan akun ke data toko di `majelis`.
	{ id: 6, nama: 'Nurjanah', username: 'mt.alhidayah', role: 'mt', inisial: 'N', majelisId: 2 }
];

// Label tampilan untuk role yang singkatannya tidak pas di-capitalize ("Mt" -> "MT").
export const labelRole = (role) => (role === 'mt' ? 'MT' : role ? role[0].toUpperCase() + role.slice(1) : '');

// Hak akses per role
export const hakAkses = {
	admin: ['/dashboard', '/produk', '/stok', '/pembelian', '/penjualan', '/majelis', '/keuangan', '/laporan', '/pengguna'],
	kurir: ['/pengiriman', '/penjualan'],
	keuangan: ['/dashboard', '/keuangan', '/penjualan', '/pembelian', '/produk', '/stok', '/laporan'],
	gudang: ['/stok', '/pembelian', '/produk', '/penjualan', '/pengiriman', '/laporan'],
	pemasaran: ['/dashboard', '/penjualan', '/majelis', '/laporan'],
	// MT = toko/outlet: hanya kelola stok dan penjualan miliknya sendiri lewat /toko.
	mt: ['/toko']
};

// Izin aksi dipisahkan dari akses menu agar role yang hanya memantau tidak
// dapat mengubah data melalui halaman yang sama.
export const izin = {
	admin: { '*': 'kelola' },
	kurir: { pengiriman: 'kelola', penjualan: 'lihat' },
	keuangan: { dashboard: 'lihat', penjualan: 'lihat', pembelian: 'lihat', produk: 'lihat', stok: 'lihat', keuangan: 'kelola', laporan: 'keuangan' },
	gudang: { pembelian: 'kelola', produk: 'kelola', stok: 'kelola', penjualan: 'lihat', pengiriman: 'kelola', laporan: 'stok' },
	pemasaran: { dashboard: 'lihat', penjualan: 'kelola', majelis: 'kelola', laporan: 'penjualan' },
	mt: { toko: 'kelola' }
};

export const bolehKelola = (role, menu) => izin[role]?.['*'] === 'kelola' || izin[role]?.[menu] === 'kelola';

export const produk = [
	{ id: 1, kode: 'P-001', nama: 'Beras Premium 5 kg', satuan: 'karung', beli: 68000, jual: 75000, stok: 42, min: 10 },
	{ id: 2, kode: 'P-002', nama: 'Minyak Goreng 2 L', satuan: 'pouch', beli: 32000, jual: 36000, stok: 8, min: 12 },
	{ id: 3, kode: 'P-003', nama: 'Gula Pasir 1 kg', satuan: 'pack', beli: 16500, jual: 18500, stok: 55, min: 20 },
	{ id: 4, kode: 'P-004', nama: 'Telur Ayam Negeri 1 kg', satuan: 'kg', beli: 27000, jual: 30000, stok: 36, min: 10 },
	{ id: 5, kode: 'P-005', nama: 'Tepung Terigu 1 kg', satuan: 'pack', beli: 11000, jual: 13000, stok: 32, min: 10 },
	{ id: 6, kode: 'P-006', nama: 'Mi Instan Goreng isi 5', satuan: 'bungkus', beli: 13000, jual: 15000, stok: 48, min: 15 },
	{ id: 7, kode: 'P-007', nama: 'Teh Celup isi 25', satuan: 'box', beli: 6500, jual: 8000, stok: 4, min: 15 }
];

export const statusStok = (p) => (p.stok === 0 ? 'habis' : p.stok <= p.min ? 'menipis' : 'aman');

export const supplier = [
	{ id: 1, nama: 'Toko Sembako Berkah', kontak: 'Pak Dedi', hp: '0812-1111-2222', alamat: 'Pasar Ciampea', produk: 'Beras, minyak, gula' },
	{ id: 2, nama: 'CV Pangan Sejahtera', kontak: 'Bu Rina', hp: '0813-3333-4444', alamat: 'Bogor Kota', produk: 'Telur, tepung, mi' },
	{ id: 3, nama: 'Grosir Pangan Amanah', kontak: 'Pak Hasan', hp: '0857-5555-6666', alamat: 'Dramaga', produk: 'Teh & kebutuhan harian' }
];

export const pembelian = [
	{ no: 'PB-0012', tgl: '2026-09-22', supplier: 'Toko Sembako Berkah', total: 2_720_000, status: 'Diterima' },
	{ no: 'PB-0011', tgl: '2026-09-18', supplier: 'CV Pangan Sejahtera', total: 1_900_000, status: 'Diterima' },
	{ no: 'PB-0010', tgl: '2026-09-15', supplier: 'Grosir Pangan Amanah', total: 1_100_000, status: 'Dipesan' }
];

// Data Majelis Taklim (MT) se-Kecamatan Tenjolaya, diambil dari SIMPENAIS
// Kemenag (lihat src/lib/data/data-mt.json). Field transaksi/koordinat
// yang tidak tersedia di sumber asli diisi manual (koordinat beberapa entri
// di sumber mengandung kesalahan input lokasi jauh di luar Tenjolaya — baris
// itu dibiarkan tanpa lat/lng).
export const majelis = [
	{ id: 1, nama: 'MT Al-Barokah', desa: 'Situdaun', ketua: 'Oom', hp: '08588250736', transaksi: 0, lat: -6.62392, lng: 106.702282 },
	{ id: 2, nama: 'MT Al-Hidayah', desa: 'Situdaun', ketua: 'Nurjanah', hp: '085810438202', transaksi: 14, lat: -6.62318, lng: 106.700272 },
	{ id: 3, nama: 'MT Al-Ikhlas', desa: 'Tapos II', ketua: 'Ijah Nurjanah', hp: '085782241244', transaksi: 0, lat: -6.630003, lng: 106.693842 },
	{ id: 4, nama: 'MT Al-Ikhlas', desa: 'Situdaun', ketua: 'Siti Mariah', hp: '085817617202', transaksi: 11, lat: -6.621389, lng: 106.699916 },
	{ id: 5, nama: 'MT Al-Afiah', desa: 'Tapos I', ketua: 'Solehudin', hp: '087897334832', transaksi: 0, lat: -6.646406, lng: 106.694262 },
	{ id: 6, nama: 'MT Al Barkah', desa: 'Gunung Malang', ketua: 'Nunung Nurasiah', hp: '085819196717', transaksi: 0, lat: -6.658182, lng: 106.710956 },
	{ id: 7, nama: 'MT Al Barokah', desa: 'Situdaun', ketua: 'Hj Eti Sumiati', hp: '08872431022', transaksi: 0, lat: -6.628977, lng: 106.710988 },
	{ id: 8, nama: 'MT Al Barokah', desa: 'Gunung Malang', ketua: 'Hj. Dewi Kurnia., S.Pd.I', hp: '08161186720', transaksi: 0, lat: -6.654836, lng: 106.709658 },
	{ id: 9, nama: 'MT Al Fatah', desa: 'TENJOLAYA', ketua: 'Hj. Acih', hp: '', transaksi: 0 },
	{ id: 10, nama: 'MT Al Ghosasiyah', desa: 'Gunung Mulya', ketua: 'Engkom', hp: '085723750939', transaksi: 0, lat: -6.631332, lng: 106.707593 },
	{ id: 11, nama: 'MT Al Hidayah Arrussy', desa: 'Cibitung Tengah', ketua: 'Siti Maharoh S Pd I', hp: '085771549221', transaksi: 6, lat: -6.626414, lng: 106.695724 },
	{ id: 12, nama: 'MT Al Hikmah', desa: 'Tapos II', ketua: 'Hj. Lilis', hp: '03893021751', transaksi: 0, lat: -6.636642, lng: 106.694122 },
	{ id: 13, nama: 'MT Al Ikhlas', desa: 'Gunung Mulya', ketua: 'Yuyun', hp: '085782052542', transaksi: 0, lat: -6.639623, lng: 106.709545 },
	{ id: 14, nama: 'MT Al Iklas', desa: 'Situdaun', ketua: 'Yayan Mulyanah', hp: '0895391705562', transaksi: 0 },
	{ id: 15, nama: 'MT Al Istiqomah', desa: 'TENJOLAYA', ketua: 'Nrlaelah', hp: '', transaksi: 0 },
	{ id: 16, nama: 'MT Al Istiqomah', desa: 'TENJOLAYA', ketua: 'Dra N Nurlaelah', hp: '', transaksi: 0 },
	{ id: 17, nama: 'MT Al-Muhajirin', desa: 'Situdaun', ketua: 'Hj Dedeh', hp: '08989443137', transaksi: 0, lat: -6.609575, lng: 106.71094 },
	{ id: 18, nama: 'MT Al-Djufri Rahman', desa: 'TENJOLAYA', ketua: 'Hj Ii Sutirah,  S.Ag', hp: '', transaksi: 0 },
	{ id: 19, nama: 'MT Al-Hidayah', desa: 'Tapos II', ketua: 'Ena Hendarwati', hp: '085771124599', transaksi: 0, lat: -6.629293, lng: 106.686655 },
	{ id: 20, nama: 'MT Al-Ikhlas', desa: 'TENJOLAYA', ketua: 'Hj. Sami Karsih', hp: '', transaksi: 0 },
	{ id: 21, nama: 'MT Al-Ikhlas', desa: 'Situdaun', ketua: 'Icah Sutisna', hp: '085921895109', transaksi: 0, lat: -6.615959, lng: 106.70866 },
	{ id: 22, nama: 'MT Alhidayah', desa: 'Situdaun', ketua: 'Lilis Sumiati', hp: '088902013149', transaksi: 0, lat: -6.62951, lng: 106.707086 },
	{ id: 23, nama: 'MT Alzami Bani Ahmad', desa: 'TENJOLAYA', ketua: 'Pahmi Murtado', hp: '', transaksi: 0 },
	{ id: 24, nama: 'MT An-Na\'Im', desa: 'Gunung Malang', ketua: 'Aan', hp: '085695432008', transaksi: 0, lat: -6.665748, lng: 106.711761 },
	{ id: 25, nama: 'MT An-Nur', desa: 'Situdaun', ketua: 'Nurlela', hp: '085795311156', transaksi: 0, lat: -6.629459, lng: 106.705016 },
	{ id: 26, nama: 'MT Ar Rahman', desa: 'TENJOLAYA', ketua: 'Asih', hp: '', transaksi: 0 },
	{ id: 27, nama: 'MT Asy\' Syakur', desa: 'Tapos II', ketua: 'Eneng Sarti', hp: '085773103448', transaksi: 0, lat: -6.631825, lng: 106.693865 },
	{ id: 28, nama: 'MT Asyafaah', desa: 'Tapos II', ketua: 'Hj. Aisyah', hp: '085697290172', transaksi: 0, lat: -6.632431, lng: 106.68895 },
	{ id: 29, nama: 'MT At-Taqwa', desa: 'Situdaun', ketua: 'Idah', hp: '088291028044', transaksi: 0, lat: -6.619055, lng: 106.705195 },
	{ id: 30, nama: 'MT At-Taubah', desa: 'Gunung Mulya', ketua: 'Marwah', hp: '085710494757', transaksi: 0, lat: -6.639176, lng: 106.707003 },
	{ id: 31, nama: 'MT Attaawun', desa: 'Tapos II', ketua: 'Juju', hp: '085772896343', transaksi: 0, lat: -6.636185, lng: 106.689875 },
	{ id: 32, nama: 'MT Attaqwa', desa: 'Situdaun', ketua: 'Nyai', hp: '081585475845', transaksi: 0, lat: -6.628244, lng: 106.712689 },
	{ id: 33, nama: 'MT Baitul Makmur', desa: 'Gunung Malang', ketua: 'Ustzdzh. Susilawati', hp: '085715662471', transaksi: 0, lat: -6.659215, lng: 106.714454 },
	{ id: 34, nama: 'MT Baitussolihin', desa: 'Tapos II', ketua: 'Hj. Fatimah', hp: '085691244070', transaksi: 0, lat: -6.637005, lng: 106.693242 },
	{ id: 35, nama: 'MT Darul Muminin', desa: 'Tapos I', ketua: 'Yenih, Sh', hp: '088223814852', transaksi: 0, lat: -6.659903, lng: 106.704385 },
	{ id: 36, nama: 'MT Darussa\'Adah', desa: 'Situdaun', ketua: 'Ulan', hp: '081617266351', transaksi: 0, lat: -6.618938, lng: 106.706997 },
	{ id: 37, nama: 'MT Darussalam', desa: 'Situdaun', ketua: 'Ustadzah Uum Umiati', hp: '081211360632', transaksi: 0, lat: -6.60641, lng: 106.711825 },
	{ id: 38, nama: 'MT Darussalam', desa: 'Tapos II', ketua: 'Enung Nur\'Aini', hp: '085813129710', transaksi: 0 },
	{ id: 39, nama: 'MT Fatahilah', desa: 'TENJOLAYA', ketua: 'Nurhayati', hp: '', transaksi: 0 },
	{ id: 40, nama: 'MT Hidayatul Furqon', desa: 'Situdaun', ketua: 'Siti Aminah', hp: '085890282252', transaksi: 0, lat: -6.628252, lng: 106.712716 },
	{ id: 41, nama: 'MT Husnul Maab', desa: 'TENJOLAYA', ketua: 'Husaeni', hp: '', transaksi: 0 },
	{ id: 42, nama: 'MT Husnul Maab', desa: 'TENJOLAYA', ketua: 'Nunung', hp: '', transaksi: 0 },
	{ id: 43, nama: 'MT Khoerul Ummah', desa: 'Tapos II', ketua: 'Siti Hamidah S,Pd.I', hp: '085782768363', transaksi: 0, lat: -6.639765, lng: 106.688882 },
	{ id: 44, nama: 'MT Khoerul Ummah', desa: 'TENJOLAYA', ketua: 'Abdul Kodir', hp: '', transaksi: 0 },
	{ id: 45, nama: 'MT Miftahuddin', desa: 'TENJOLAYA', ketua: 'Zaenuddin', hp: '', transaksi: 0 },
	{ id: 46, nama: 'MT Miftahul Huda', desa: 'TENJOLAYA', ketua: 'Abdul Rouf', hp: '085814168834', transaksi: 17, lat: -6.629586, lng: 106.694258 },
	{ id: 47, nama: 'MT Miftahulkhoer', desa: 'Tapos I', ketua: 'Ustadzah Dedeh', hp: '083831035164', transaksi: 0, lat: -6.658342, lng: 106.703532 },
	{ id: 48, nama: 'MT Miftahussa\'Adah', desa: 'Tapos I', ketua: 'Ust. Cicih', hp: '088808581311', transaksi: 0, lat: -6.658384, lng: 106.703526 },
	{ id: 49, nama: 'MT Miftahussalam', desa: 'Tapos I', ketua: 'Ustadzah Maspupah', hp: '082115130281', transaksi: 0, lat: -6.660643, lng: 106.698384 },
	{ id: 50, nama: 'MT Misbahul Huda', desa: 'Tapos II', ketua: 'Susanti Alawiyah', hp: '085715715967', transaksi: 0, lat: -6.629912, lng: 106.696779 },
	{ id: 51, nama: 'MT Nurul Ahkam', desa: 'Situdaun', ketua: 'Mohammad Acep Junaedi Abdillah', hp: '085892853159', transaksi: 0, lat: -6.615277, lng: 106.706193 },
	{ id: 52, nama: 'MT Nurul Amin', desa: 'Tapos I', ketua: 'Asih', hp: '085910280581', transaksi: 0, lat: -6.643929, lng: 106.689982 },
	{ id: 53, nama: 'MT Nurul Anwar', desa: 'Situdaun', ketua: 'Saci Selawati', hp: '08158723532', transaksi: 0, lat: -6.6266, lng: 106.70453 },
	{ id: 54, nama: 'MT Nurul Falah', desa: 'Situdaun', ketua: 'Aryani', hp: '089636209742', transaksi: 0, lat: -6.61839, lng: 106.71167 },
	{ id: 55, nama: 'MT Nurul Falah', desa: 'Tapos II', ketua: 'Tika Kurniasih', hp: '085781296261', transaksi: 0, lat: -6.631146, lng: 106.692979 },
	{ id: 56, nama: 'MT Nurul Falah', desa: 'TENJOLAYA', ketua: 'Acoh', hp: '', transaksi: 0 },
	{ id: 57, nama: 'MT Nurul Hidayah', desa: 'Tapos II', ketua: 'Elis Komalasari', hp: '085893818813', transaksi: 0, lat: -6.643785, lng: 106.696043 },
	{ id: 58, nama: 'MT Nurul Hidayah', desa: 'Gunung Mulya', ketua: 'Uti', hp: '085814213271', transaksi: 0, lat: -6.633406, lng: 106.708742 },
	{ id: 59, nama: 'MT Nurul Hidayah', desa: 'Gunung Malang', ketua: 'Ustadzah Nurhayani', hp: '088298647224', transaksi: 9, lat: -6.664352, lng: 106.710902 },
	{ id: 60, nama: 'MT Nurul Hikmah', desa: 'Tapos I', ketua: 'Rohayati', hp: '085773108336', transaksi: 0, lat: -6.662071, lng: 106.698854 },
	{ id: 61, nama: 'MT Nurul Huda', desa: 'Gunung Mulya', ketua: 'Ibu Encih', hp: '085778507351', transaksi: 0, lat: -6.647994, lng: 106.704712 },
	{ id: 62, nama: 'MT Nurul Ihsan', desa: 'Tapos II', ketua: 'Iti Maryati', hp: '085778536510', transaksi: 0, lat: -6.642682, lng: 106.69595 },
	{ id: 63, nama: 'MT Nurul Ikhlas', desa: 'Gunung Malang', ketua: 'Ustadzah Ati', hp: '08588635731', transaksi: 0, lat: -6.651521, lng: 106.71499 },
	{ id: 64, nama: 'MT Nurul Ikhwan', desa: 'Tapos II', ketua: 'Oon Suherti', hp: '0838-11688008', transaksi: 0, lat: -6.640057, lng: 106.694943 },
	{ id: 65, nama: 'MT Nurul Ikhwan', desa: 'Cibitung Tengah', ketua: 'Siti Rukoyah', hp: '085894113550', transaksi: 0, lat: -6.617142, lng: 106.700892 },
	{ id: 66, nama: 'MT Nurul Iman', desa: 'Gunung Mulya', ketua: 'Hj Imas', hp: '081401794093', transaksi: 0 },
	{ id: 67, nama: 'MT Nurul Islam', desa: 'Gunung Mulya', ketua: 'Yuyun', hp: '0881011354139', transaksi: 0, lat: -6.633409, lng: 106.70864 },
	{ id: 68, nama: 'MT Nurul Muhibbin', desa: 'Tapos II', ketua: 'Siti Juabedah', hp: '085719418807', transaksi: 0, lat: -6.642268, lng: 106.690137 },
	{ id: 69, nama: 'MT Sirojul Huda', desa: 'Situdaun', ketua: 'Nyai Maryati', hp: '085211318697', transaksi: 0, lat: -6.628248, lng: 106.708608 },
	{ id: 70, nama: 'MT Sirojul Qori Al-Mubtadi', desa: 'Tapos II', ketua: 'Siti Hapsoh, S. Ag.', hp: '08159287821', transaksi: 0, lat: -6.631089, lng: 106.690805 }
];

// Stok titipan di tiap MT (outlet) — terpisah dari stok Gudang Pusat di `produk`.
// Bertambah saat Gudang mengirim barang ke MT, berkurang saat MT menjual ke pembeli umum.
export const stokMajelis = [
	{ majelisId: 2, produkId: 1, nama: 'Beras Premium 5 kg', satuan: 'karung', jual: 75000, stok: 10 },
	{ majelisId: 2, produkId: 2, nama: 'Minyak Goreng 2 L', satuan: 'pouch', jual: 36000, stok: 6 },
	{ majelisId: 2, produkId: 3, nama: 'Gula Pasir 1 kg', satuan: 'pack', jual: 18500, stok: 15 }
];

export const penjualan = [
	{ no: 'PJ-0231', tgl: '2026-09-25', pembeli: 'MT Al-Hidayah', item: 6, total: 612000, status: 'Lunas' },
	{ no: 'PJ-0230', tgl: '2026-09-24', pembeli: 'MT Nurul Iman', item: 4, total: 350000, status: 'Lunas' },
	{ no: 'PJ-0229', tgl: '2026-09-24', pembeli: 'Umum', item: 2, total: 111000, status: 'Lunas' },
	{ no: 'PJ-0228', tgl: '2026-09-23', pembeli: 'MT Al Hidayah Arrussy', item: 3, total: 250000, status: 'Lunas' },
	{ no: 'PJ-0227', tgl: '2026-09-22', pembeli: 'MT Miftahul Huda', item: 8, total: 945000, status: 'Lunas' }
];

export const kas = [
	{ tgl: '2026-09-25', jenis: 'masuk', kategori: 'Penjualan', ket: 'PJ-0231 MT Al-Hidayah', jumlah: 612000 },
	{ tgl: '2026-09-24', jenis: 'masuk', kategori: 'Penjualan', ket: 'PJ-0229 Umum', jumlah: 111000 },
	{ tgl: '2026-09-23', jenis: 'keluar', kategori: 'Operasional', ket: 'Ongkos angkut barang', jumlah: 75000 },
	{ tgl: '2026-09-22', jenis: 'keluar', kategori: 'Pembelian', ket: 'PB-0012 Toko Sembako Berkah', jumlah: 2720000 },
	{ tgl: '2026-09-20', jenis: 'modal', kategori: 'Modal', ket: 'Setoran modal anggota', jumlah: 3000000 }
];

export const ringkasan = {
	omzetBulan: 8_450_000,
	transaksiBulan: 38,
	pengeluaranBulan: 6_320_000,
	saldo: 4_870_000,
	modal: 15_000_000
};

// Omzet per minggu (bulan berjalan) untuk grafik batang sederhana
export const omzetMingguan = [
	{ label: 'Mg 1', nilai: 1_850_000 },
	{ label: 'Mg 2', nilai: 2_400_000 },
	{ label: 'Mg 3', nilai: 2_130_000 },
	{ label: 'Mg 4', nilai: 2_070_000 }
];
