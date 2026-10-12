<script>
	import { Button, Rating, Textarea, showToast } from '@khwarizmi/svelte-ui';
	import { bacaUlasan, simpanUlasan } from '$lib/ulasan.js';
	import { fotoProduk } from '$lib/marketplace.svelte.js';

	// Ulasan per produk setelah pesanan selesai: sudah diulas -> tampil, belum -> form.
	let { order } = $props();
	let versi = $state(0);
	let draf = $state({}); // itemId -> { rating, teks }

	const ulasanItem = (itemId) => (versi, bacaUlasan().find((u) => u.orderId === order.id && u.produkKey === itemId));
	const dr = (id) => (draf[id] ??= { rating: 5, teks: '' });

	function kirim(i) {
		const d = dr(i.id);
		if (!simpanUlasan({ orderId: order.id, produkKey: i.id, nama: i.nama, rating: d.rating, teks: d.teks, pembeli: order.pembeli?.nama?.replace(/(\S+)\s+(\S).*/, '$1 $2.') ?? 'Pembeli' })) return;
		versi++;
		showToast({ tone: 'success', title: 'Terima kasih atas ulasanmu', description: i.nama });
	}
</script>

<section class="mt-5">
	<h2 class="mb-2 text-xs font-black tracking-widest text-slate-400 uppercase">Ulasan produk</h2>
	<ul class="space-y-3">
		{#each order.items as i}
			{@const u = ulasanItem(i.id)}
			<li class="rounded-2xl border border-slate-200 bg-white p-4">
				<p class="font-black text-slate-800">{i.nama}</p>
				{#if u}
					<div class="mt-1.5"><Rating value={u.rating} readonly size={16} /></div>
					{#if u.teks}<p class="mt-1.5 text-sm font-medium text-slate-600">{u.teks}</p>{/if}
					<p class="mt-1.5 text-xs font-bold text-slate-400">Ulasanmu sudah terkirim.</p>
				{:else}
					<div class="mt-2"><Rating bind:value={() => dr(i.id).rating, (v) => (dr(i.id).rating = v)} size={26} /></div>
					<div class="mt-3"><Textarea rows={2} maxlength={200} placeholder="Ceritakan kualitas produk & pengirimannya (opsional)" bind:value={() => dr(i.id).teks, (v) => (dr(i.id).teks = v)} /></div>
					<Button size="sm" class="mt-3" onclick={() => kirim(i)}>Kirim ulasan</Button>
				{/if}
			</li>
		{/each}
	</ul>
</section>
