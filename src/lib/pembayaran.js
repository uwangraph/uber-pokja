// Simulasi pembayaran marketplace: transfer bank (virtual account) dan COD.
// Belum terhubung ke bank/payment gateway; semua status disimpan di localStorage.
import { kembalikanStokMT } from './inventori.svelte.js';
import { tambahNotifPasar } from './notif.svelte.js';
import { rupiah } from './format.js';

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

// Item pesanan menyimpan id katalog "majelisId-produkId"; stok MT dicari dengan produkId saja.
export const produkIdItem = (item, majelisId) => item.produkId ?? String(item.id).replace(new RegExp(`^${majelisId}-`), '');

export const nomorVA = (bank, orderId) => {
	const angka = orderId.replace(/\D/g, '').slice(-10).padStart(10, '0');
	return `${bank.prefix} ${angka.slice(0, 5)} ${angka.slice(5)}`;
};

function baca() {
	try { return JSON.parse(localStorage.getItem(KEY) ?? '[]'); } catch { return []; }
}

const hrefPenjual = (p) => `/toko/pesanan/${encodeURIComponent(p.id)}`;
const hrefPembeli = (p) => `/marketplace/pesanan/${encodeURIComponent(p.id)}`;
const ringkas = (p) => p.items.map((i) => `${i.nama} × ${i.qty}`).join(', ');

// Notifikasi untuk MT saat ada pesanan baru dari pembeli umum.
export function notifPesananBaru(p) {
	tambahNotifPasar({ untuk: 'penjual', majelisId: p.majelisId, judul: 'Pesanan baru', isi: `${p.pembeli?.nama} memesan ${ringkas(p)} (${p.pembayaran === 'cod' ? 'COD' : 'transfer'}).`, href: hrefPenjual(p), tone: 'brand', icon: 'cart' });
}

// Notifikasi otomatis tiap status pesanan berubah. `oleh` = pihak yang mengubah,
// supaya yang menerima notifikasi adalah pihak lawannya.
function notifPerubahan(p, statusBaru, { baruDibayar, oleh }) {
	const kePembeli = (judul, isi, tone = 'brand', icon = 'truck') => tambahNotifPasar({ untuk: 'pembeli', judul, isi, href: hrefPembeli(p), tone, icon });
	const kePenjual = (judul, isi, tone = 'brand', icon = 'cart') => tambahNotifPasar({ untuk: 'penjual', majelisId: p.majelisId, judul, isi, href: hrefPenjual(p), tone, icon });
	if (baruDibayar && oleh !== 'penjual') kePenjual('Pembayaran diterima', `${p.id} sudah dibayar ${rupiah(p.total)}. Segera proses pesanan.`, 'gold', 'wallet');
	if (statusBaru === 'Dikemas') kePembeli('Pesanan sedang dikemas', `${p.id} dari ${p.tokoNama} sedang disiapkan.`, 'brand', 'layers');
	else if (statusBaru === 'Dikirim') kePembeli(p.pengiriman === 'ambil' ? 'Pesanan siap diambil' : 'Pesanan dikirim', `${p.id} ${p.pengiriman === 'ambil' ? 'siap diambil di toko' : 'sedang diantar ke alamatmu'}.`, 'brand', 'truck');
	else if (statusBaru === 'Selesai') {
		if (oleh !== 'pembeli') kePembeli('Pesanan selesai', `${p.id} selesai. Beri ulasan untuk produknya, ya.`, 'gold', 'check');
		if (oleh !== 'penjual') kePenjual('Pesanan selesai', `${p.id} sudah diterima pembeli.`, 'gold', 'check');
	} else if (statusBaru === 'Dibatalkan') {
		if (oleh !== 'pembeli') kePembeli('Pesanan dibatalkan', `${p.id}: ${p.alasanBatal ?? 'dibatalkan'}.`, 'red', 'alert');
		if (oleh !== 'penjual') kePenjual('Pesanan dibatalkan', `${p.id}: ${p.alasanBatal ?? 'dibatalkan'}.`, 'red', 'alert');
	}
}

// Ubah satu pesanan; mengembalikan pesanan yang sudah diperbarui. Perubahan status
// dicatat ke riwayat dan memicu notifikasi ke pihak lawan.
export function ubahPesanan(id, perubahan, oleh = 'sistem') {
	const semua = baca();
	const p = semua.find((x) => x.id === id);
	if (!p) return null;
	const batalBaru = perubahan.status === 'Dibatalkan' && p.status !== 'Dibatalkan';
	const statusBerubah = perubahan.status && perubahan.status !== p.status;
	const baruDibayar = Boolean(perubahan.dibayarPada) && !p.dibayarPada;
	Object.assign(p, perubahan);
	if (statusBerubah) (p.riwayat ??= []).push({ status: p.status, t: new Date().toISOString() });
	if (batalBaru) for (const i of p.items) kembalikanStokMT(p.majelisId, produkIdItem(i, p.majelisId), i.qty);
	localStorage.setItem(KEY, JSON.stringify(semua));
	if (statusBerubah || baruDibayar) notifPerubahan(p, statusBerubah ? p.status : null, { baruDibayar, oleh });
	return { ...p };
}

// Tombol aksi yang tersedia di halaman detail, menurut status dan pihak yang melihat.
export function aksiPesanan(p, sebagai) {
	if (!p) return [];
	const aksi = [];
	if (sebagai === 'penjual') {
		if (p.status === 'Menunggu diproses') aksi.push({ label: 'Proses & kemas pesanan', status: 'Dikemas', utama: true });
		if (p.status === 'Dikemas') aksi.push({ label: p.pengiriman === 'ambil' ? 'Siap diambil' : 'Kirim pesanan', status: 'Dikirim', utama: true });
		if (p.status === 'Dikirim') aksi.push({ label: p.pengiriman === 'ambil' ? 'Sudah diambil pembeli' : 'Tandai selesai', status: 'Selesai', utama: true });
		if (['Menunggu pembayaran', 'Menunggu diproses', 'Dikemas'].includes(p.status)) aksi.push({ label: 'Batalkan pesanan', status: 'Dibatalkan', alasan: 'Dibatalkan penjual' });
	} else {
		if (p.status === 'Dikirim') aksi.push({ label: 'Pesanan diterima', status: 'Selesai', utama: true });
		if (['Menunggu diproses'].includes(p.status) && !p.dibayarPada) aksi.push({ label: 'Batalkan pesanan', status: 'Dibatalkan', alasan: 'Dibatalkan pembeli' });
	}
	return aksi;
}

// Jalankan aksi dari aksiPesanan(). COD otomatis lunas saat pesanan selesai.
export function jalankanAksi(p, aksi, sebagai) {
	const perubahan = { status: aksi.status };
	if (aksi.alasan) perubahan.alasanBatal = aksi.alasan;
	if (aksi.status === 'Selesai' && !p.dibayarPada) perubahan.dibayarPada = new Date().toISOString();
	return ubahPesanan(p.id, perubahan, sebagai);
}
