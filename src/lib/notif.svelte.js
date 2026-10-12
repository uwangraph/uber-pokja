// Notifikasi contoh untuk mockup. Status "sudah dibaca" hanya disimpan di memori.

import { browser } from '$app/environment';
import { hakAkses } from './data.js';

const awal = [
	{ id: 1, jenis: 'stok', icon: 'alert', tone: 'red', judul: 'Stok menipis', isi: 'Minyak Goreng 2 L sudah menipis. Segera buat pembelian.', waktu: '10 menit lalu', href: '/stok', baru: true },
	{ id: 2, jenis: 'penjualan', icon: 'cart', tone: 'brand', judul: 'Penjualan baru', isi: 'PJ-0231 · MT Al-Hidayah · Rp 612.000 (Lunas)', waktu: '1 jam lalu', href: '/penjualan?tab=riwayat', baru: true },
	{ id: 3, jenis: 'stok', icon: 'layers', tone: 'amber', judul: 'Stok menipis', isi: 'Minyak Goreng 2 L tersisa 8 pouch (minimum 12).', waktu: '3 jam lalu', href: '/stok', baru: true },
	{ id: 5, jenis: 'pembelian', icon: 'truck', tone: 'gray', judul: 'Barang belum diterima', isi: 'PB-0010 dari Grosir Pangan Amanah masih berstatus Dipesan.', waktu: '2 hari lalu', href: '/pembelian', baru: false },
	{ id: 6, jenis: 'stok', icon: 'layers', tone: 'amber', judul: 'Stok menipis', isi: 'Teh Celup isi 25 tersisa 4 box (minimum 15).', waktu: '3 hari lalu', href: '/stok', baru: false }
];

// Notifikasi marketplace (pesanan masuk untuk MT, status pesanan untuk pembeli)
// disimpan di localStorage supaya bertahan antar sesi.
const KEY_PASAR = 'uber-pokja:pasar:notif';
function muatPasar() {
	if (!browser) return [];
	try {
		return JSON.parse(localStorage.getItem(KEY_PASAR) ?? '[]');
	} catch {
		return [];
	}
}

export const notif = $state({ list: awal, pasar: muatPasar() });

function simpanPasar() {
	if (browser) localStorage.setItem(KEY_PASAR, JSON.stringify(notif.pasar.slice(0, 60)));
}

// untuk: 'penjual' (dengan majelisId toko) atau 'pembeli'.
export function tambahNotifPasar({ untuk, majelisId = null, judul, isi, href, tone = 'brand', icon = 'cart', t = new Date().toISOString(), baru = true }) {
	notif.pasar.push({ id: `ps-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, untuk, majelisId, judul, isi, href, tone, icon, t, baru });
	notif.pasar.sort((a, b) => b.t.localeCompare(a.t));
	simpanPasar();
}

export const notifPembeli = () => notif.pasar.filter((n) => n.untuk === 'pembeli');
export const jumlahBaruPembeli = () => notifPembeli().filter((n) => n.baru).length;
export function tandaiSemuaPembeli() {
	notifPembeli().forEach((n) => (n.baru = false));
	simpanPasar();
}

// Notifikasi hanya relevan jika pemilik akses ke halaman tujuannya (href).
// Akun MT juga menerima notifikasi pesanan marketplace untuk tokonya.
export function untukRole(role, majelisId = null) {
	const dasar = notif.list.filter((n) => hakAkses[role]?.some((href) => n.href.startsWith(href)));
	const pasar = role === 'mt' ? notif.pasar.filter((n) => n.untuk === 'penjual' && n.majelisId === majelisId) : [];
	return [...pasar, ...dasar];
}

export const jumlahBaru = (role, majelisId = null) => untukRole(role, majelisId).filter((n) => n.baru).length;

export function tandaiDibaca(id) {
	const n = notif.list.find((x) => x.id === id) ?? notif.pasar.find((x) => x.id === id);
	if (n) n.baru = false;
	simpanPasar();
}

export function tandaiSemua(role, majelisId = null) {
	untukRole(role, majelisId).forEach((n) => (n.baru = false));
	simpanPasar();
}

// "5 menit lalu", "kemarin", dst. dari timestamp ISO.
export function waktuRelatif(iso) {
	const menit = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60000));
	if (menit < 1) return 'Baru saja';
	if (menit < 60) return `${menit} menit lalu`;
	if (menit < 1440) return `${Math.floor(menit / 60)} jam lalu`;
	if (menit < 2880) return 'Kemarin';
	return `${Math.floor(menit / 1440)} hari lalu`;
}

export const toneIcon = {
	red: 'bg-danger-soft text-danger',
	amber: 'bg-amber-soft text-amber-ink',
	brand: 'bg-brand-50 text-brand-700',
	gold: 'bg-gold-50 text-gold-700',
	gray: 'bg-ground text-muted'
};
