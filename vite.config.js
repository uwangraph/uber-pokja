import { sveltekit } from '@sveltejs/kit/vite';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [tailwindcss(), sveltekit()],
	// Khwarizmi UI dikirim sebagai file .svelte mentah: saat SSR di mode dev,
	// paket ini harus diproses Vite, bukan diimpor langsung oleh Node.
	ssr: {
		noExternal: ['@khwarizmi/svelte-ui']
	}
});
