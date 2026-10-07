<script>
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { Button, EmptyState } from '@khwarizmi/svelte-ui';
	import { ChevronLeft, Minus, Plus, ShoppingBag, Trash2 } from 'lucide-svelte';
	import { rupiah } from '$lib/format.js';
	import { tokoState, katalogToko } from '$lib/marketplace.svelte.js';

	const produk = $derived(katalogToko(tokoState.majelisId));
	let keranjang = $state({});
	let dipilih = $state({});
	let siap = $state(false);
	const baris = $derived(produk.filter((p) => keranjang[p.id]).map((p) => ({ ...p, qty: keranjang[p.id] })));
	const terpilih = $derived(baris.filter((p) => dipilih[p.id]));
	const total = $derived(terpilih.reduce((sum, p) => sum + p.qty * p.jual, 0));
	const jumlah = $derived(baris.reduce((sum, p) => sum + p.qty, 0));
	const semua = $derived(baris.length > 0 && baris.every((p) => dipilih[p.id]));

	onMount(() => {
		try {
			keranjang = JSON.parse(localStorage.getItem('uber-pokja:marketplace:cart') ?? '{}');
			dipilih = JSON.parse(localStorage.getItem('uber-pokja:marketplace:selected') ?? '{}');
		} catch {} finally { siap = true; }
	});
	$effect(() => {
		if (!siap) return;
		localStorage.setItem('uber-pokja:marketplace:cart', JSON.stringify(keranjang));
		window.dispatchEvent(new Event('keranjang-berubah'));
		localStorage.setItem('uber-pokja:marketplace:selected', JSON.stringify(dipilih));
	});
	function ubah(p, selisih) {
		const qty = Math.max(0, Math.min(p.stok, (keranjang[p.id] ?? 0) + selisih));
		if (qty) keranjang[p.id] = qty;
		else { delete keranjang[p.id]; delete dipilih[p.id]; }
		keranjang = { ...keranjang }; dipilih = { ...dipilih };
	}
</script>

<svelte:head><title>Keranjang · UBER Market</title></svelte:head>
<main class="min-h-dvh bg-[#faf9f5] px-4 py-5 text-slate-800 sm:px-6"><div class="mx-auto max-w-5xl">
	<a href="/marketplace" class="inline-flex items-center gap-1.5 text-sm font-black text-primary-700"><ChevronLeft size={18} /> Lanjut belanja</a>
	<header class="mt-6"><h1 class="text-2xl font-black">Keranjang belanja</h1><p class="mt-1 text-sm font-medium text-slate-500">Pilih produk dan atur jumlah sebelum checkout.</p></header>
	{#if baris.length}<div class="mt-7 grid gap-5 lg:grid-cols-[1fr_380px]"><section class="space-y-3 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5"><label class="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2.5 text-sm font-black"><span><input class="mr-2" type="checkbox" checked={semua} onchange={() => { for (const p of baris) dipilih[p.id] = !semua; dipilih = { ...dipilih }; }} />Pilih semua</span><span class="text-xs text-slate-400">{jumlah} item</span></label>{#each baris as p (p.id)}<article class="flex gap-3 border-b border-slate-100 py-4 last:border-0"><input class="mt-1 size-4" type="checkbox" checked={Boolean(dipilih[p.id])} onchange={() => { dipilih[p.id] = !dipilih[p.id]; dipilih = { ...dipilih }; }} aria-label="Pilih {p.nama}" /><div class="grid size-15 shrink-0 place-items-center rounded-2xl bg-primary-50 text-3xl">🛍️</div><div class="min-w-0 flex-1"><p class="font-black">{p.nama}</p><p class="num mt-1 text-sm font-bold text-primary-800">{rupiah(p.jual)} / {p.satuan}</p><div class="mt-3 flex items-center justify-between"><div class="flex items-center rounded-xl border border-slate-200"><button class="grid size-8 place-items-center" onclick={() => ubah(p, -1)} aria-label="Kurangi"><Minus size={15} /></button><span class="num min-w-8 text-center text-sm font-black">{p.qty}</span><button class="grid size-8 place-items-center" onclick={() => ubah(p, 1)} aria-label="Tambah"><Plus size={15} /></button></div><button class="text-slate-400 hover:text-red-600" onclick={() => ubah(p, -p.qty)} aria-label="Hapus"><Trash2 size={17} /></button></div></div></article>{/each}</section>
	<section class="h-fit rounded-3xl border border-slate-200 bg-white p-5 shadow-sm lg:sticky lg:top-5"><h2 class="font-black">Ringkasan belanja</h2><p class="mt-1 text-sm font-medium text-slate-500">{terpilih.length} produk dipilih</p><div class="mt-5 flex items-baseline justify-between border-t border-slate-200 pt-4"><span class="font-bold text-slate-500">Total</span><strong class="num text-2xl font-black text-primary-800">{rupiah(total)}</strong></div><a href="/marketplace/checkout" class="mt-5 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary-700 px-4 text-sm font-black text-white {terpilih.length ? '' : 'pointer-events-none opacity-50'}"><ShoppingBag size={17} /> Lanjut checkout</a></section></div>{:else}<div class="mt-12"><EmptyState icon={ShoppingBag} title="Keranjang masih kosong" description="Pilih produk dari katalog untuk mulai berbelanja." /><div class="mt-4 text-center"><Button onclick={() => goto('/marketplace')}>Jelajahi produk</Button></div></div>{/if}
</div></main>
