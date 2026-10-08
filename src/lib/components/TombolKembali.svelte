<script>
	// Tombol kembali khusus HP untuk halaman tanpa bottom nav (Profil, Notifikasi).
	// Kalau halaman dibuka langsung dari URL, kembali ke beranda sesuai peran.
	import { goto } from '$app/navigation';
	import { Button } from '@khwarizmi/svelte-ui';
	import Icon from './Icon.svelte';
	import { beranda } from '../auth.js';

	function kembali() {
		if (history.length > 1) return history.back();
		let role;
		try { role = JSON.parse(localStorage.getItem('user') ?? 'null')?.role; } catch {}
		goto(beranda(role));
	}
</script>

<Button variant="ghost" size="sm" class="mb-3 -ml-2 lg:hidden" onclick={kembali}><Icon name="chevron" class="size-4 rotate-180" /> Kembali</Button>
