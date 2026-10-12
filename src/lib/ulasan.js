// Ulasan produk marketplace (disimpan lokal). Satu ulasan per produk per pesanan.
const KEY = 'uber-pokja:marketplace:ulasan';

export function bacaUlasan() {
	try {
		return JSON.parse(localStorage.getItem(KEY) ?? '[]');
	} catch {
		return [];
	}
}

// produkKey = id katalog "majelisId-produkId".
export const ulasanProduk = (produkKey) => bacaUlasan().filter((u) => u.produkKey === produkKey).sort((a, b) => b.t.localeCompare(a.t));

export function ringkasRating(daftar) {
	if (!daftar.length) return { rata: 0, jumlah: 0 };
	return { rata: daftar.reduce((s, u) => s + u.rating, 0) / daftar.length, jumlah: daftar.length };
}

// Peta produkKey -> { rata, jumlah } untuk seluruh katalog sekaligus.
export function petaRating() {
	const peta = {};
	for (const [k, daftar] of Map.groupBy(bacaUlasan(), (u) => u.produkKey)) peta[k] = ringkasRating(daftar);
	return peta;
}

export const sudahDiulas = (orderId, produkKey) => bacaUlasan().some((u) => u.orderId === orderId && u.produkKey === produkKey);

export function simpanUlasan({ orderId, produkKey, nama, rating, teks, pembeli }) {
	const semua = bacaUlasan();
	if (semua.some((u) => u.orderId === orderId && u.produkKey === produkKey)) return false;
	semua.push({ id: `UL-${Date.now()}`, orderId, produkKey, nama, rating, teks: teks.trim(), pembeli, t: new Date().toISOString() });
	localStorage.setItem(KEY, JSON.stringify(semua));
	return true;
}
