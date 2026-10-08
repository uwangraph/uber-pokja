// Action: toast di dalam elemen ini bisa digeser ke kiri/kanan untuk ditutup.
// Bekerja lewat event delegation, jadi komponen Toast library tidak perlu diubah;
// saat melewati ambang, tombol "Tutup" bawaan toast yang diklik.

const AMBANG = 80; // px

export function geserTutup(node) {
	let el = null;
	let awalX = 0;
	let dx = 0;

	function mulai(e) {
		const toast = e.target.closest('[role="status"]');
		if (!toast || e.target.closest('button')) return;
		el = toast;
		awalX = e.clientX;
		dx = 0;
		el.setPointerCapture?.(e.pointerId);
		el.style.transition = 'none';
	}
	function gerak(e) {
		if (!el) return;
		dx = e.clientX - awalX;
		el.style.transform = `translateX(${dx}px)`;
		el.style.opacity = String(Math.max(0.2, 1 - Math.abs(dx) / 240));
	}
	function selesai() {
		if (!el) return;
		const target = el;
		el = null;
		target.style.transition = 'transform 180ms ease, opacity 180ms ease';
		if (Math.abs(dx) > AMBANG) {
			target.style.transform = `translateX(${dx > 0 ? 120 : -120}%)`;
			target.style.opacity = '0';
			setTimeout(() => target.querySelector('button[aria-label="Tutup"]')?.click(), 160);
		} else {
			target.style.transform = '';
			target.style.opacity = '';
		}
	}

	node.addEventListener('pointerdown', mulai);
	node.addEventListener('pointermove', gerak);
	node.addEventListener('pointerup', selesai);
	node.addEventListener('pointercancel', selesai);
	return {
		destroy() {
			node.removeEventListener('pointerdown', mulai);
			node.removeEventListener('pointermove', gerak);
			node.removeEventListener('pointerup', selesai);
			node.removeEventListener('pointercancel', selesai);
		}
	};
}
