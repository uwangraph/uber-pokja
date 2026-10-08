<script>
	import '../app.css';
	import { Toast } from '@khwarizmi/svelte-ui';
	let { children } = $props();
</script>

{@render children()}
<!-- Toast bawaan memakai `fixed right-4 w-full`, sehingga di HP melebar 100% layar
     lalu bergeser 1rem dan terpotong di kiri. Wadah ber-transform ini menjadi acuan
     posisinya (lebar layar dikurangi 2rem), jadi toast punya jarak 1rem di kiri-kanan
     tanpa menimpa CSS komponen. -->
<div class="pointer-events-none fixed top-[env(safe-area-inset-top)] right-0 left-8 z-400 transform-gpu">
	<Toast />
</div>
