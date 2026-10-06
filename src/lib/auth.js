import { goto } from '$app/navigation';
import { hakAkses } from './data.js';
import { nav } from './nav.js';

// Mockup: "login" hanya menyimpan akun contoh di localStorage.

export const beranda = (role) => nav.find((n) => hakAkses[role]?.includes(n.href))?.href ?? '/login';

export function masuk(user) {
	localStorage.setItem('user', JSON.stringify(user));
	goto(beranda(user.role));
}

export function keluar() {
	localStorage.removeItem('user');
	goto('/login');
}
