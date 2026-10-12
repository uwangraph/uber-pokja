// Helper marketplace publik: pemilihan toko (MT) dan baca katalog stok toko itu.
// MT berperan sebagai outlet — pembeli umum belanja dari stok titipan MT, bukan
// langsung dari Gudang Pusat.

import { browser } from '$app/environment';
import { majelis } from './data.js';
import { inventori } from './inventori.svelte.js';

const KEY_TOKO = 'uber-pokja:marketplace:toko';

export const tokoState = $state({ majelisId: muatTokoTersimpan() });

function muatTokoTersimpan() {
	if (!browser) return null;
	const v = parseInt(localStorage.getItem(KEY_TOKO) ?? '');
	return Number.isFinite(v) ? v : null;
}

export function pilihToko(majelisId) {
	tokoState.majelisId = majelisId;
	if (!browser) return;
	if (majelisId == null) localStorage.removeItem(KEY_TOKO);
	else localStorage.setItem(KEY_TOKO, String(majelisId));
}

export const tokoAktif = () => majelis.find((m) => m.id === tokoState.majelisId) ?? null;
export const tokoById = (majelisId) => majelis.find((m) => m.id === majelisId) ?? null;
export const jumlahProdukToko = (majelisId) => inventori.stokMajelis.filter((s) => s.majelisId === majelisId && s.stok > 0).length;

// Jarak garis lurus antar dua koordinat (rumus Haversine), hasil dalam km.
function jarakKm(lat1, lng1, lat2, lng2) {
	const R = 6371;
	const dLat = ((lat2 - lat1) * Math.PI) / 180;
	const dLng = ((lng2 - lng1) * Math.PI) / 180;
	const a = Math.sin(dLat / 2) ** 2 + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
	return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// Daftar MT diurutkan dari yang terdekat ke lokasi pembeli, masing-masing
// dengan field `jarakKm` terlampir. Dipakai fitur "Cari toko terdekat".
export const tokoTerdekat = (lat, lng) =>
	majelis
		.map((m) => ({ ...m, jarakKm: jarakKm(lat, lng, m.lat, m.lng) }))
		.sort((a, b) => a.jarakKm - b.jarakKm);

// Kategori produk marketplace. Produk katalog pusat punya kategori bawaan;
// produk milik toko memilih sendiri saat ditambahkan.
export const kategoriList = ['Bahan Pokok', 'Protein & Segar', 'Makanan & Minuman', 'Kebutuhan Rumah', 'Lainnya'];
const KATEGORI_BAWAAN = { 1: 'Bahan Pokok', 2: 'Bahan Pokok', 3: 'Bahan Pokok', 4: 'Protein & Segar', 5: 'Bahan Pokok', 6: 'Makanan & Minuman', 7: 'Makanan & Minuman' };
export const kategoriDari = (p) => p?.kategori ?? KATEGORI_BAWAAN[p?.produkId] ?? 'Lainnya';

const DESKRIPSI_BAWAAN = {
	1: 'Beras premium pulen dan wangi, cocok untuk konsumsi harian keluarga. Dikemas 5 kg.',
	2: 'Minyak goreng kemasan 2 liter, jernih dan tidak mudah berbusa. Cocok untuk menggoreng dan menumis.',
	3: 'Gula pasir putih bersih, kemasan 1 kg. Larut sempurna untuk minuman dan kue.',
	4: 'Telur ayam negeri segar, dijual per kilogram. Pilihan protein hemat untuk keluarga.',
	5: 'Tepung terigu serbaguna 1 kg untuk gorengan, kue, dan olahan mi.',
	6: 'Mi instan goreng isi 5 bungkus. Praktis untuk stok di rumah.',
	7: 'Teh celup isi 25 kantong. Aroma harum, cocok untuk teman bersantai.'
};

// Harga setelah diskon dibulatkan ke ratusan terdekat.
export const hargaDiskon = (harga, diskon = 0) => (diskon > 0 ? Math.round((harga * (100 - diskon)) / 100 / 100) * 100 : harga);

// Baris stok MT -> produk marketplace. `jual` sudah harga setelah diskon, jadi
// seluruh keranjang/checkout otomatis memakai harga promo; `hargaAsli` untuk coretan.
function petakan(s) {
	const toko = majelis.find((m) => m.id === s.majelisId);
	const diskon = s.diskon || 0;
	return {
		id: `${s.majelisId}-${s.produkId}`,
		majelisId: s.majelisId,
		produkId: s.produkId,
		tokoNama: toko?.nama ?? '',
		nama: s.nama,
		satuan: s.satuan,
		jual: hargaDiskon(s.jual, diskon),
		hargaAsli: s.jual,
		diskon,
		unggulan: !!s.unggulan,
		kategori: kategoriDari(s),
		deskripsi: s.deskripsi || DESKRIPSI_BAWAAN[s.produkId] || '',
		stok: s.stok,
		min: 3,
		foto: s.foto,
		fotos: s.fotos
	};
}

// Katalog produk marketplace, mirip katalog multi-seller (tiap produk tetap
// menampilkan toko asalnya). Tanpa `majelisId`, mengembalikan gabungan stok
// dari semua MT — dengan `majelisId`, hanya produk toko itu (seller page).
// Id baris selalu "majelisId-produkId" di kedua mode, supaya keranjang tidak
// berubah skema id saat pembeli pindah antara "semua toko" dan satu toko.
// Produk unggulan ditaruh di depan.
export function katalogToko(majelisId = null) {
	return inventori.stokMajelis
		.filter((s) => s.stok > 0 && (majelisId == null || s.majelisId === majelisId))
		.map(petakan)
		.sort((a, b) => Number(b.unggulan) - Number(a.unggulan));
}

// Satu produk by id katalog, termasuk yang stoknya habis (untuk halaman detail).
export const produkById = (id) => {
	const s = inventori.stokMajelis.find((x) => `${x.majelisId}-${x.produkId}` === id);
	return s ? petakan(s) : null;
};

// ---- Keranjang (localStorage, dipakai halaman detail produk & pesan ulang) ----
const KEY_CART = 'uber-pokja:marketplace:cart';
const KEY_PILIH = 'uber-pokja:marketplace:selected';
const bacaJson = (k) => {
	try {
		return JSON.parse(localStorage.getItem(k) ?? '{}');
	} catch {
		return {};
	}
};

// Tambah ke keranjang (dibatasi stok) dan tandai dipilih. Mengembalikan jumlah akhir.
export function tambahKeKeranjang(p, qty = 1) {
	const cart = bacaJson(KEY_CART);
	const pilih = bacaJson(KEY_PILIH);
	const akhir = Math.min(p.stok, (cart[p.id] ?? 0) + qty);
	if (akhir <= 0) return 0;
	cart[p.id] = akhir;
	pilih[p.id] = true;
	localStorage.setItem(KEY_CART, JSON.stringify(cart));
	localStorage.setItem(KEY_PILIH, JSON.stringify(pilih));
	window.dispatchEvent(new Event('keranjang-berubah'));
	return akhir;
}

// Pesan ulang: masukkan item pesanan lama ke keranjang selama stoknya masih ada.
export function pesanUlang(order) {
	let ditambah = 0;
	let dilewati = 0;
	for (const i of order.items) {
		const p = produkById(i.id);
		if (p && p.stok > 0 && tambahKeKeranjang(p, i.qty)) ditambah++;
		else dilewati++;
	}
	return { ditambah, dilewati };
}

// Emoji produk per produkId (id katalog berformat "majelisId-produkId").
const EMOJI = { 1: '🍚', 2: '🫙', 3: '🧂', 4: '🥚', 5: '🌾', 6: '🍜', 7: '🍵' };
// Foto produk: unggahan toko, atau foto bawaan di /static/produk untuk produk katalog pusat.
export function fotoSemua(p) {
	if (p?.fotos?.length) return p.fotos;
	if (p?.foto) return [p.foto];
	return Number.isInteger(p?.produkId) && p.produkId >= 1 && p.produkId <= 7 ? [`/produk/${p.produkId}.jpg`] : [];
}
export const fotoProduk = (p) => fotoSemua(p)[0] ?? null;
export const emojiProduk = (p) => EMOJI[p?.produkId ?? p?.id] ?? '🛍️';
