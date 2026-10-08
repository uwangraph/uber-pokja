// Notifikasi contoh untuk mockup. Status "sudah dibaca" hanya disimpan di memori.

import { hakAkses } from './data.js';

const awal = [
	{ id: 1, jenis: 'stok', icon: 'alert', tone: 'red', judul: 'Stok menipis', isi: 'Minyak Goreng 2 L sudah menipis. Segera buat pembelian.', waktu: '10 menit lalu', href: '/stok', baru: true },
	{ id: 2, jenis: 'penjualan', icon: 'cart', tone: 'brand', judul: 'Penjualan baru', isi: 'PJ-0231 · MT Al-Hidayah · Rp 612.000 (Lunas)', waktu: '1 jam lalu', href: '/penjualan?tab=riwayat', baru: true },
	{ id: 3, jenis: 'stok', icon: 'layers', tone: 'amber', judul: 'Stok menipis', isi: 'Minyak Goreng 2 L tersisa 8 pouch (minimum 12).', waktu: '3 jam lalu', href: '/stok', baru: true },
	{ id: 5, jenis: 'pembelian', icon: 'truck', tone: 'gray', judul: 'Barang belum diterima', isi: 'PB-0010 dari Grosir Pangan Amanah masih berstatus Dipesan.', waktu: '2 hari lalu', href: '/pembelian', baru: false },
	{ id: 6, jenis: 'stok', icon: 'layers', tone: 'amber', judul: 'Stok menipis', isi: 'Teh Celup isi 25 tersisa 4 box (minimum 15).', waktu: '3 hari lalu', href: '/stok', baru: false }
];

export const notif = $state({ list: awal });

// Notifikasi hanya relevan jika pemilik akses ke halaman tujuannya (href).
export const untukRole = (role) => notif.list.filter((n) => hakAkses[role]?.some((href) => n.href.startsWith(href)));

export const jumlahBaru = (role) => untukRole(role).filter((n) => n.baru).length;

export function tandaiDibaca(id) {
	const n = notif.list.find((x) => x.id === id);
	if (n) n.baru = false;
}

export function tandaiSemua(role) {
	untukRole(role).forEach((n) => (n.baru = false));
}

export const toneIcon = {
	red: 'bg-danger-soft text-danger',
	amber: 'bg-amber-soft text-amber-ink',
	brand: 'bg-brand-50 text-brand-700',
	gold: 'bg-gold-50 text-gold-700',
	gray: 'bg-ground text-muted'
};
