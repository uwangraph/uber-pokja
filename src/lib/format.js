export const rupiah = (n) => 'Rp ' + Math.round(n).toLocaleString('id-ID');
export const tanggal = (s) =>
	new Date(s).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });

// Inisial untuk avatar: "MT Al-Hidayah" -> "AH", "Umum" -> "UM"
export const inisial = (nama) => {
	const kata = nama.replace(/^(MT|CV|PT)\s+/, '').split(/[\s-]+/).filter(Boolean);
	return (kata.length > 1 ? kata[0][0] + kata[1][0] : kata[0].slice(0, 2)).toUpperCase();
};
