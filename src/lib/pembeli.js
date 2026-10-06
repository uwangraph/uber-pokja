// Mockup: "login" pembeli marketplace hanya menandai sesi di localStorage.
// Data pribadi pembeli disimpan di kunci `buyer` (dipakai checkout dan profil).

const KEY_SESI = 'uber-pokja:marketplace:session';
const KEY_PEMBELI = 'uber-pokja:marketplace:buyer';

export function sudahMasukPembeli() {
	try {
		return localStorage.getItem(KEY_SESI) === '1';
	} catch {
		return false;
	}
}

export function masukPembeli(data) {
	let lama = {};
	try { lama = JSON.parse(localStorage.getItem(KEY_PEMBELI) ?? '{}'); } catch {}
	localStorage.setItem(KEY_PEMBELI, JSON.stringify({ ...lama, ...data }));
	localStorage.setItem(KEY_SESI, '1');
}

export function keluarPembeli() {
	localStorage.removeItem(KEY_SESI);
}

// Alamat tujuan setelah login; hanya path internal marketplace yang diterima.
export const tujuanAman = (next) => (next?.startsWith('/marketplace') && !next.startsWith('//') ? next : '/marketplace');
export const urlMasuk = (next) => `/marketplace/masuk?next=${encodeURIComponent(next)}`;
