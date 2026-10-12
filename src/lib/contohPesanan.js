// Data contoh pesanan marketplace untuk mockup: satu pesanan di tiap status supaya
// halaman Pesanan Saya (pembeli) dan Toko Saya (MT) langsung terisi. Hanya
// ditambahkan sekali per browser; pesanan asli pengguna tidak disentuh. Pesanan
// contoh versi lama (MP-CONTOH-*) diganti saat versi data naik.

import { inventori, simpanInventori } from './inventori.svelte.js';
import { notif, tambahNotifPasar } from './notif.svelte.js';

const KEY_ORDERS = 'uber-pokja:marketplace:orders';
const KEY_FLAG = 'uber-pokja:contoh-pesanan-v2';
const KEY_ULASAN = 'uber-pokja:marketplace:ulasan';

const MAJELIS_ID = 2; // MT Al-Hidayah (akun mt.alhidayah)
const TOKO = 'MT Al-Hidayah';

const barang = {
	beras: { id: '2-1', nama: 'Beras Premium 5 kg', satuan: 'karung', harga: 75000 },
	minyak: { id: '2-2', nama: 'Minyak Goreng 2 L', satuan: 'pouch', harga: 36000 },
	gula: { id: '2-3', nama: 'Gula Pasir 1 kg', satuan: 'pack', harga: 18500 }
};

const pembeli = {
	siti: { nama: 'Siti Aminah', hp: '081234567801', alamat: 'Kp. Situdaun RT 02/RW 05', kelurahan: 'Situdaun', kecamatan: 'Tenjolaya', kota: 'Kab. Bogor', provinsi: 'Jawa Barat', kodePos: '16370' },
	budi: { nama: 'Budi Santoso', hp: '081234567802', alamat: 'Jl. Raya Tapos No. 12', kelurahan: 'Tapos I', kecamatan: 'Tenjolaya', kota: 'Kab. Bogor', provinsi: 'Jawa Barat', kodePos: '16370' },
	rina: { nama: 'Rina Marlina', hp: '081234567803', alamat: 'Kp. Cibitung RT 01/RW 03', kelurahan: 'Cibitung Tengah', kecamatan: 'Tenjolaya', kota: 'Kab. Bogor', provinsi: 'Jawa Barat', kodePos: '16370' },
	hendra: { nama: 'Hendra Wijaya', hp: '081234567804', alamat: 'Perum Griya Asri Blok C4', kelurahan: 'Gunung Malang', kecamatan: 'Tenjolaya', kota: 'Kab. Bogor', provinsi: 'Jawa Barat', kodePos: '16370' },
	dewi: { nama: 'Dewi Lestari', hp: '081234567805', alamat: 'Kp. Gunung Mulya RT 04/RW 02', kelurahan: 'Gunung Mulya', kecamatan: 'Tenjolaya', kota: 'Kab. Bogor', provinsi: 'Jawa Barat', kodePos: '16370' },
	agus: { nama: 'Agus Salim', hp: '081234567806', alamat: 'Kp. Tapos II RT 03/RW 01', kelurahan: 'Tapos II', kecamatan: 'Tenjolaya', kota: 'Kab. Bogor', provinsi: 'Jawa Barat', kodePos: '16370' },
	yanti: { nama: 'Yanti Rahayu', hp: '081234567807', alamat: 'Kp. Situdaun RT 06/RW 05', kelurahan: 'Situdaun', kecamatan: 'Tenjolaya', kota: 'Kab. Bogor', provinsi: 'Jawa Barat', kodePos: '16370' }
};

const lalu = (menit) => new Date(Date.now() - menit * 60_000).toISOString();

const JALUR_TRANSFER = ['Menunggu pembayaran', 'Menunggu diproses', 'Dikemas', 'Dikirim', 'Selesai'];
const JALUR_COD = ['Menunggu diproses', 'Dikemas', 'Dikirim', 'Selesai'];

// `akhir`: status terakhir pesanan. Pesanan dibatalkan memakai `batalSetelah`
// (status sebelum dibatalkan). Riwayat dan waktu bayar disusun mundur dari `menitLalu`.
function pesanan(no, menitLalu, siapa, daftar, { akhir, batalSetelah, pembayaran = 'transfer', pengiriman = 'antar', bank, alasanBatal }) {
	const items = daftar.map(([k, qty]) => ({ ...barang[k], qty }));
	const jalur = pembayaran === 'cod' ? JALUR_COD : JALUR_TRANSFER;
	const sampai = akhir === 'Dibatalkan' ? jalur.indexOf(batalSetelah) : jalur.indexOf(akhir);
	const status = jalur.slice(0, sampai + 1);
	if (akhir === 'Dibatalkan') status.push('Dibatalkan');
	const langkah = Math.min(240, menitLalu / status.length);
	const riwayat = status.map((st, i) => ({ status: st, t: lalu(menitLalu - i * langkah) }));
	const waktuDari = (st) => riwayat.find((r) => r.status === st)?.t;
	const dibayarPada = pembayaran === 'cod' ? (akhir === 'Selesai' ? waktuDari('Selesai') : undefined) : waktuDari('Menunggu diproses');
	return {
		id: `MP-CONTOH-${String(no).padStart(2, '0')}`,
		dibuatPada: lalu(menitLalu),
		majelisId: MAJELIS_ID,
		tokoNama: TOKO,
		pembeli: pembeli[siapa],
		items,
		total: items.reduce((s, i) => s + i.qty * i.harga, 0),
		pengiriman,
		pembayaran,
		status: akhir,
		riwayat,
		...(bank ? { bank } : {}),
		...(dibayarPada ? { dibayarPada } : {}),
		...(alasanBatal ? { alasanBatal } : {})
	};
}

const CONTOH = () => [
	pesanan(1, 12, 'siti', [['beras', 1], ['gula', 2]], { akhir: 'Menunggu pembayaran' }),
	pesanan(2, 90, 'budi', [['minyak', 2]], { pembayaran: 'cod', akhir: 'Menunggu diproses' }),
	pesanan(3, 300, 'rina', [['beras', 2], ['minyak', 1]], { akhir: 'Dikemas', bank: 'bca' }),
	pesanan(4, 1500, 'hendra', [['gula', 3]], { akhir: 'Dikirim', bank: 'bri' }),
	pesanan(5, 4300, 'dewi', [['beras', 1], ['minyak', 2], ['gula', 1]], { akhir: 'Selesai', bank: 'mandiri' }),
	pesanan(6, 7200, 'agus', [['minyak', 1]], { pembayaran: 'cod', pengiriman: 'ambil', akhir: 'Selesai' }),
	pesanan(7, 10000, 'yanti', [['beras', 1]], { akhir: 'Dibatalkan', batalSetelah: 'Menunggu pembayaran', alasanBatal: 'Batas waktu pembayaran habis' }),
	pesanan(8, 14400, 'budi', [['gula', 1], ['minyak', 1]], { akhir: 'Dibatalkan', batalSetelah: 'Dikemas', bank: 'bca', alasanBatal: 'Dibatalkan penjual' }),
	// Penjualan selesai beberapa hari terakhir (untuk grafik omzet & produk terlaris)
	pesanan(9, 1700, 'siti', [['beras', 2], ['gula', 2]], { akhir: 'Selesai', bank: 'bca' }),
	pesanan(10, 3600, 'rina', [['minyak', 3]], { pembayaran: 'cod', akhir: 'Selesai' }),
	pesanan(11, 5000, 'hendra', [['beras', 3]], { akhir: 'Selesai', bank: 'bri' }),
	pesanan(12, 6500, 'agus', [['gula', 4], ['minyak', 1]], { akhir: 'Selesai', bank: 'mandiri' }),
	pesanan(13, 8000, 'dewi', [['beras', 1], ['gula', 3]], { akhir: 'Selesai', bank: 'bca' }),
	pesanan(14, 9300, 'siti', [['minyak', 2], ['beras', 1]], { akhir: 'Selesai', bank: 'bca' })
];

const ULASAN = [
	['MP-CONTOH-09', '2-1', 5, 'Berasnya pulen dan bersih, pengiriman cepat. Pasti beli lagi.', 'Siti A.', 1500],
	['MP-CONTOH-09', '2-3', 4, 'Gulanya bagus, kemasan rapi.', 'Siti A.', 1500],
	['MP-CONTOH-10', '2-2', 5, 'Minyak jernih, harga bersahabat.', 'Rina M.', 3400],
	['MP-CONTOH-11', '2-1', 5, 'Mantap, stok selalu ada dan bisa ambil cepat.', 'Hendra W.', 4800],
	['MP-CONTOH-12', '2-3', 4, 'Sesuai deskripsi.', 'Agus S.', 6300],
	['MP-CONTOH-12', '2-2', 3, 'Kemasan agak penyok tapi isinya aman.', 'Agus S.', 6300],
	['MP-CONTOH-13', '2-1', 4, 'Beras enak, hanya pengantaran agak sore.', 'Dewi L.', 7800],
	['MP-CONTOH-14', '2-2', 5, 'Langganan di sini, selalu puas.', 'Siti A.', 9100]
].map(([orderId, produkKey, rating, teks, pembeli, menit], i) => ({ id: `UL-CONTOH-${i + 1}`, orderId, produkKey, nama: '', rating, teks, pembeli, t: lalu(menit) }));

export function isiContohPesanan() {
	try {
		if (localStorage.getItem(KEY_FLAG)) return;
		const ada = JSON.parse(localStorage.getItem(KEY_ORDERS) ?? '[]').filter((a) => !a.id.startsWith('MP-CONTOH-'));
		const contoh = CONTOH();
		localStorage.setItem(KEY_ORDERS, JSON.stringify([...ada, ...contoh].sort((a, b) => b.dibuatPada.localeCompare(a.dibuatPada))));

		// Ulasan contoh (nama produk diambil dari barang pada pesanan).
		const namaProduk = Object.fromEntries(Object.values(barang).map((b) => [b.id, b.nama]));
		const lama = JSON.parse(localStorage.getItem(KEY_ULASAN) ?? '[]').filter((u) => !u.id.startsWith('UL-CONTOH-'));
		localStorage.setItem(KEY_ULASAN, JSON.stringify([...lama, ...ULASAN.map((u) => ({ ...u, nama: namaProduk[u.produkKey] }))]));

		// Promo & produk unggulan contoh di toko ini (hanya kalau belum pernah diatur).
		for (const s of inventori.stokMajelis.filter((x) => x.majelisId === MAJELIS_ID)) {
			if (s.produkId === 3 && s.diskon === undefined) s.diskon = 10;
			if (s.produkId === 1 && s.unggulan === undefined) s.unggulan = true;
		}
		simpanInventori();

		// Notifikasi contoh: pesanan baru & pembayaran masuk (MT), status pesanan (pembeli).
		notif.pasar = notif.pasar.filter((n) => !n.href?.includes('MP-CONTOH-'));
		const p = (no) => contoh.find((c) => c.id === `MP-CONTOH-${String(no).padStart(2, '0')}`);
		const ringkas = (o) => o.items.map((i) => `${i.nama} × ${i.qty}`).join(', ');
		const hrefJ = (o) => `/toko/pesanan/${o.id}`;
		const hrefB = (o) => `/marketplace/pesanan/${o.id}`;
		tambahNotifPasar({ untuk: 'penjual', majelisId: MAJELIS_ID, judul: 'Pesanan baru', isi: `${p(1).pembeli.nama} memesan ${ringkas(p(1))} (transfer).`, href: hrefJ(p(1)), t: p(1).dibuatPada });
		tambahNotifPasar({ untuk: 'penjual', majelisId: MAJELIS_ID, judul: 'Pesanan baru', isi: `${p(2).pembeli.nama} memesan ${ringkas(p(2))} (COD).`, href: hrefJ(p(2)), t: p(2).dibuatPada });
		tambahNotifPasar({ untuk: 'penjual', majelisId: MAJELIS_ID, judul: 'Pembayaran diterima', isi: `${p(3).id} sudah dibayar. Segera proses pesanan.`, href: hrefJ(p(3)), tone: 'gold', icon: 'wallet', t: p(3).riwayat[1].t });
		tambahNotifPasar({ untuk: 'pembeli', judul: 'Pesanan dikirim', isi: `${p(4).id} sedang diantar ke alamatmu.`, href: hrefB(p(4)), t: p(4).riwayat.at(-1).t });
		tambahNotifPasar({ untuk: 'pembeli', judul: 'Pesanan sedang dikemas', isi: `${p(3).id} dari ${TOKO} sedang disiapkan.`, href: hrefB(p(3)), icon: 'layers', t: p(3).riwayat.at(-1).t });

		localStorage.setItem(KEY_FLAG, '1');
	} catch {}
}
