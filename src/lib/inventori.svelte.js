// Store stok bersama (Gudang Pusat + titipan MT) untuk mockup. Disimpan di
// localStorage supaya transfer stok di satu halaman terlihat di halaman lain
// tanpa backend sungguhan.

import { browser } from '$app/environment';
import { produk as produkAwal, stokMajelis as stokMajelisAwal } from './data.js';

const KEY_PRODUK = 'uber-pokja:produk';
const KEY_STOK_MT = 'uber-pokja:stokMajelis';

function muat(key, awal) {
	if (!browser) return structuredClone(awal);
	try {
		const tersimpan = JSON.parse(localStorage.getItem(key) ?? 'null');
		if (Array.isArray(tersimpan) && tersimpan.length) return tersimpan;
	} catch {}
	return structuredClone(awal);
}

export const inventori = $state({
	produk: muat(KEY_PRODUK, produkAwal),
	stokMajelis: muat(KEY_STOK_MT, stokMajelisAwal)
});

export function simpanInventori() {
	if (!browser) return;
	localStorage.setItem(KEY_PRODUK, JSON.stringify(inventori.produk));
	localStorage.setItem(KEY_STOK_MT, JSON.stringify(inventori.stokMajelis));
}

// Kirim stok dari Gudang Pusat ke titipan MT. Mengurangi stok pusat,
// menambah (atau membuat) baris stok MT tujuan.
export function kirimStokKeMT(produkId, majelisId, qty) {
	const p = inventori.produk.find((x) => x.id === produkId);
	if (!p || qty <= 0 || qty > p.stok) return false;

	p.stok -= qty;
	const existing = inventori.stokMajelis.find((s) => s.majelisId === majelisId && s.produkId === produkId);
	if (existing) existing.stok += qty;
	else inventori.stokMajelis.push({ majelisId, produkId, nama: p.nama, satuan: p.satuan, jual: p.jual, stok: qty });

	simpanInventori();
	return true;
}

// Kurangi stok MT saat terjual ke pembeli umum (marketplace).
export function kurangiStokMT(majelisId, produkId, qty) {
	const s = inventori.stokMajelis.find((x) => x.majelisId === majelisId && x.produkId === produkId);
	if (!s || qty <= 0 || qty > s.stok) return false;
	s.stok -= qty;
	simpanInventori();
	return true;
}
