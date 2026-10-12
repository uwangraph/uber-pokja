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
	const s = inventori.stokMajelis.find((x) => x.majelisId === majelisId && String(x.produkId) === String(produkId));
	if (!s || qty <= 0 || qty > s.stok) return false;
	s.stok -= qty;
	simpanInventori();
	return true;
}

// Kembalikan stok MT saat pesanan marketplace dibatalkan.
export function kembalikanStokMT(majelisId, produkId, qty) {
	const s = inventori.stokMajelis.find((x) => x.majelisId === majelisId && String(x.produkId) === String(produkId));
	if (!s || qty <= 0) return false;
	s.stok += qty;
	simpanInventori();
	return true;
}

// Produk milik toko (MT) sendiri, bukan titipan Gudang Pusat. Disimpan sebagai
// baris stok MT dengan produkId unik, sehingga langsung tampil di marketplace.
export function tambahProdukMT(majelisId, { nama, satuan, jual, stok, fotos = [], ...tambahan }) {
	const produkId = `mt${majelisId}-${Date.now()}`;
	inventori.stokMajelis.push({ majelisId, produkId, nama, satuan, jual, stok, fotos, ...tambahan, milikToko: true });
	simpanInventori();
	return produkId;
}

// Ubah nama/satuan/harga/stok baris stok milik toko.
export function ubahProdukMT(majelisId, produkId, data) {
	const s = inventori.stokMajelis.find((x) => x.majelisId === majelisId && x.produkId === produkId);
	if (!s) return false;
	Object.assign(s, data);
	simpanInventori();
	return true;
}

// Hapus produk milik toko sendiri (titipan Gudang Pusat tidak bisa dihapus).
export function hapusProdukMT(majelisId, produkId) {
	const i = inventori.stokMajelis.findIndex((x) => x.majelisId === majelisId && x.produkId === produkId && x.milikToko);
	if (i < 0) return false;
	inventori.stokMajelis.splice(i, 1);
	simpanInventori();
	return true;
}
