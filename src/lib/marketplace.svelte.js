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

// Katalog produk marketplace, mirip katalog multi-seller (tiap produk tetap
// menampilkan toko asalnya). Tanpa `majelisId`, mengembalikan gabungan stok
// dari semua MT — dengan `majelisId`, hanya produk toko itu (seller page).
// Id baris selalu "majelisId-produkId" di kedua mode, supaya keranjang tidak
// berubah skema id saat pembeli pindah antara "semua toko" dan satu toko.
export function katalogToko(majelisId = null) {
	return inventori.stokMajelis
		.filter((s) => s.stok > 0 && (majelisId == null || s.majelisId === majelisId))
		.map((s) => {
			const toko = majelis.find((m) => m.id === s.majelisId);
			return { id: `${s.majelisId}-${s.produkId}`, majelisId: s.majelisId, produkId: s.produkId, tokoNama: toko?.nama ?? '', nama: s.nama, satuan: s.satuan, jual: s.jual, stok: s.stok, min: 3 };
		});
}

// Emoji produk per produkId (id katalog berformat "majelisId-produkId").
const EMOJI = { 1: '🍚', 2: '🫙', 3: '🧂', 4: '🥚', 5: '🌾', 6: '🍜', 7: '🍵' };
export const emojiProduk = (p) => EMOJI[p?.produkId ?? p?.id] ?? '🛍️';
