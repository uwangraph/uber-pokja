<script>
	// Wadah form standar aplikasi:
	//   HP (< 640px)      : sheet dari bawah (Drawer) — tombol Simpan mudah dijangkau jempol
	//   tablet & laptop   : modal di tengah
	// Isi panjang di-scroll di dalam wadah, judul & footer tetap terlihat.
	import { Drawer, Modal } from '@khwarizmi/svelte-ui';

	let { open = $bindable(false), title = '', description = '', size = 'md', onclose, children, footer } = $props();

	let hp = $state(false);
	$effect(() => {
		const mq = matchMedia('(max-width: 639px)');
		hp = mq.matches;
		const ubah = (e) => (hp = e.matches);
		mq.addEventListener('change', ubah);
		return () => mq.removeEventListener('change', ubah);
	});
</script>

{#if hp}
	<Drawer bind:open {title} {description} side="bottom" size="full" {onclose} {footer}>
		{@render children?.()}
	</Drawer>
{:else}
	<Modal bind:open {title} {description} {size} {onclose} {footer}>
		<div class="max-h-[65vh] overflow-y-auto overscroll-contain pr-1">
			{@render children?.()}
		</div>
	</Modal>
{/if}
