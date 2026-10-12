<script>
	import { ChevronLeft, ChevronRight } from 'lucide-svelte';

	// Galeri foto produk: geser (swipe) di HP, panah & titik di layar besar.
	let { fotos = [], alt = '', class: cls = '', href = null } = $props();
	let el = $state();
	let aktif = $state(0);

	function onscroll() {
		if (el) aktif = Math.round(el.scrollLeft / el.clientWidth);
	}
	function ke(i) {
		el?.scrollTo({ left: i * el.clientWidth, behavior: 'smooth' });
	}
</script>

<div class="group relative size-full overflow-hidden {cls}">
	<div bind:this={el} {onscroll} class="scroll-tipis flex size-full snap-x snap-mandatory overflow-x-auto overscroll-x-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
		{#each fotos as f, i}
			{#if href}
				<a {href} class="size-full shrink-0 snap-center" draggable="false" tabindex="-1" aria-label="Lihat detail {alt}"><img src={f} alt="{alt}{fotos.length > 1 ? ` (${i + 1}/${fotos.length})` : ''}" loading={i ? 'lazy' : undefined} draggable="false" class="size-full object-cover" /></a>
			{:else}
				<img src={f} alt="{alt}{fotos.length > 1 ? ` (${i + 1}/${fotos.length})` : ''}" loading={i ? 'lazy' : undefined} draggable="false" class="size-full shrink-0 snap-center object-cover" />
			{/if}
		{/each}
	</div>
	{#if fotos.length > 1}
		{#if aktif > 0}
			<button type="button" aria-label="Foto sebelumnya" onclick={() => ke(aktif - 1)} class="absolute top-1/2 left-1.5 hidden size-7 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-slate-700 shadow-sm group-hover:grid"><ChevronLeft size={16} strokeWidth={2.5} /></button>
		{/if}
		{#if aktif < fotos.length - 1}
			<button type="button" aria-label="Foto berikutnya" onclick={() => ke(aktif + 1)} class="absolute top-1/2 right-1.5 hidden size-7 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-slate-700 shadow-sm group-hover:grid"><ChevronRight size={16} strokeWidth={2.5} /></button>
		{/if}
		<div class="pointer-events-none absolute inset-x-0 bottom-2 flex justify-center gap-1">
			{#each fotos as _, i}
				<span class="h-1.5 rounded-full bg-white shadow-sm transition-all {i === aktif ? 'w-4' : 'w-1.5 opacity-60'}"></span>
			{/each}
		</div>
	{/if}
</div>
