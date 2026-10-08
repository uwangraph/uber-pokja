// Simulasi pembayaran marketplace: transfer bank (virtual account) dan COD.
// Belum terhubung ke bank/payment gateway; semua status disimpan di localStorage.
import { kembalikanStokMT } from './inventori.svelte.js';

const KEY = 'uber-pokja:marketplace:orders';

export const BATAS_BAYAR_MENIT = 60;

// Prefix VA fiktif per bank (bukan nomor sungguhan).
export const bankVA = [
	{ id: 'bca', nama: 'BCA', kode: '014', prefix: '3901' },
	{ id: 'bri', nama: 'BRI', kode: '002', prefix: '2626' },
	{ id: 'mandiri', nama: 'Mandiri', kode: '008', prefix: '8908' },
	{ id: 'bsi', nama: 'BSI', kode: '451', prefix: '9001' }
];

export const metodeBayar = [
	{ value: 'transfer', label: 'Transfer bank (Virtual Account)' },
	{ value: 'cod', label: 'Bayar di tempat (COD / tunai)' }
];

// Pesanan lama masih bisa memakai 'tunai'; perlakukan sama dengan COD.
export const isCOD = (p) => p?.pembayaran === 'cod' || p?.pembayaran === 'tunai';

export const nomorVA = (bank, orderId) => {
	const angka = orderId.replace(/\D/g, '').slice(-10).padStart(10, '0');
	return `${bank.prefix} ${angka.slice(0, 5)} ${angka.slice(5)}`;
};

function baca() {
	try { return JSON.parse(localStorage.getItem(KEY) ?? '[]'); } catch { return []; }
}

// Ubah satu pesanan; mengembalikan pesanan yang sudah diperbarui.
export function ubahPesanan(id, perubahan) {
	const semua = baca();
	const p = semua.find((x) => x.id === id);
	if (!p) return null;
	const batalBaru = perubahan.status === 'Dibatalkan' && p.status !== 'Dibatalkan';
	Object.assign(p, perubahan);
	if (batalBaru) for (const i of p.items) kembalikanStokMT(p.majelisId, i.id, i.qty);
	localStorage.setItem(KEY, JSON.stringify(semua));
	return { ...p };
}
