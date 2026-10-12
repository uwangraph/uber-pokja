<script>
	import { onMount } from 'svelte';
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { ChevronLeft, MessageSquareText, Minus, PackageSearch, Plus, ShoppingBag, Store } from 'lucide-svelte';
	import { Badge, Button, EmptyState, Rating, showToast } from '@khwarizmi/svelte-ui';
	import FotoSlider from '$lib/components/FotoSlider.svelte';
	import { rupiah } from '$lib/format.js';
	import { emojiProduk, fotoSemua, produkById, tambahKeKeranjang } from '$lib/marketplace.svelte.js';
	import { ringkasRating, ulasanProduk } from '$lib/ulasan.js';
	import { sudahMasukPembeli, urlMasuk } from '$lib/pembeli.js';

	const p = $derived(produkById(page.params.id));
	let qty = $state(1);
	let ulasan = $state([]);
	onMount(() => {
		ulasan = ulasanProduk(page.params.id);
	});
	const rating = $derived(ringkasRating(ulasan));
	const fotos = $derived(p ? fotoSemua(p) : []);

	function keKeranjang() {
		const akhir = tambahKeKeranjang(p, qty);
		showToast({ tone: 'success', title: 'Ditambahkan ke keranjang', description: `${p.nama} · ${akhir} ${p.satuan}` });
	}
	function beliSekarang() {
		if (!sudahMasukPembeli()) {
			showToast({ tone: 'info', title: 'Masuk dulu untuk memesan' });
			return goto(urlMasuk(`/marketplace/produk/${p.id}`));
		}
		tambahKeKeranjang(p, qty);
		goto('/marketplace/checkout');
	}
	const tanggalUlasan = (iso) => new Date(iso).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
</script>

<svelte:head><title>{p?.nama ?? 'Produk'} · UBER Market</title></svelte:head>

<main class="px-4 py-5 text-slate-800 sm:px-6"><div class="mx-auto max-w-5xl">
	<a href="/marketplace" class="inline-flex items-center gap-1.5 text-sm font-black text-primary-700"><ChevronLeft size={18} /> Kembali ke katalog</a>
	{#if p}
		<div class="mt-5 grid gap-6 md:grid-cols-2 md:gap-8">
			<div class="aspect-square overflow-hidden rounded-3xl border border-[#e8e9df] bg-primary-50">
				{#if fotos.length}
					<FotoSlider {fotos} alt={p.nama} />
				{:else}
					<div class="grid size-full place-items-center text-8xl">{emojiProduk(p)}</div>
				{/if}
			</div>

			<div class="min-w-0">
				<div class="flex flex-wrap items-center gap-2">
					<span class="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-black text-slate-600">{p.kategori}</span>
					{#if p.unggulan}<Badge tone="amber">Unggulan</Badge>{/if}
				</div>
				<h1 class="mt-2 text-2xl leading-tight font-black">{p.nama}</h1>
				<div class="mt-2 flex items-center gap-2 text-sm font-bold text-slate-500">
					{#if rating.jumlah}
						<Rating value={rating.rata} readonly size={16} />
						<span class="num font-black text-slate-700">{rating.rata.toFixed(1)}</span><span>· {rating.jumlah} ulasan</span>
					{:else}
						<span>Belum ada ulasan</span>
					{/if}
				</div>

				<div class="mt-4 rounded-2xl bg-primary-50 px-4 py-3.5">
					<div class="flex flex-wrap items-baseline gap-x-2">
						<p class="num text-3xl font-black tracking-tight text-brand-800">{rupiah(p.jual)}</p>
						<span class="text-sm font-bold text-slate-500">/ {p.satuan}</span>
						{#if p.diskon}
							<span class="num text-sm font-bold text-slate-400 line-through">{rupiah(p.hargaAsli)}</span>
							<Badge tone="red">-{p.diskon}%</Badge>
						{/if}
					</div>
				</div>

				<a href="/marketplace/toko/{p.majelisId}" class="mt-4 inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-black text-slate-600 hover:bg-primary-50 hover:text-primary-700"><Store size={13} /> {p.tokoNama}</a>
				<p class="mt-3 text-sm font-bold {p.stok ? 'text-slate-500' : 'text-red-600'}">{p.stok ? `Stok tersisa ${p.stok} ${p.satuan}` : 'Stok habis'}</p>

				{#if p.deskripsi}
					<h2 class="mt-5 text-xs font-black tracking-widest text-slate-400 uppercase">Deskripsi</h2>
					<p class="mt-1.5 text-sm leading-relaxed font-medium whitespace-pre-line text-slate-600">{p.deskripsi}</p>
				{/if}

				<div class="mt-6 flex items-center gap-3">
					<div class="flex items-center gap-1 rounded-2xl border border-slate-200 bg-slate-50 p-1">
						<Button variant="ghost" size="icon-sm" aria-label="Kurangi" disabled={qty <= 1} onclick={() => (qty = Math.max(1, qty - 1))}><Minus size={15} /></Button>
						<span class="num min-w-8 text-center font-black">{qty}</span>
						<Button variant="ghost" size="icon-sm" aria-label="Tambah" disabled={qty >= p.stok} onclick={() => (qty = Math.min(p.stok, qty + 1))}><Plus size={15} /></Button>
					</div>
					<p class="num ml-auto text-sm font-black text-slate-500">Subtotal <span class="text-base text-brand-800">{rupiah(qty * p.jual)}</span></p>
				</div>
				<div class="mt-4 grid grid-cols-2 gap-2">
					<Button variant="outline" disabled={!p.stok} onclick={keKeranjang}><ShoppingBag size={16} /> Keranjang</Button>
					<Button disabled={!p.stok} onclick={beliSekarang}>Beli sekarang</Button>
				</div>
			</div>
		</div>

		<section class="mt-10">
			<h2 class="flex items-center gap-2 text-lg font-black"><MessageSquareText size={19} /> Ulasan pembeli {#if rating.jumlah}<span class="text-sm font-bold text-slate-400">({rating.jumlah})</span>{/if}</h2>
			{#if ulasan.length}
				<ul class="mt-4 divide-y divide-slate-100 overflow-hidden rounded-2xl border border-slate-200 bg-white">
					{#each ulasan as u (u.id)}
						<li class="p-4">
							<div class="flex items-center justify-between gap-3">
								<p class="text-sm font-black">{u.pembeli}</p>
								<span class="text-xs font-bold text-slate-400">{tanggalUlasan(u.t)}</span>
							</div>
							<div class="mt-1"><Rating value={u.rating} readonly size={14} /></div>
							{#if u.teks}<p class="mt-1.5 text-sm font-medium text-slate-600">{u.teks}</p>{/if}
						</li>
					{/each}
				</ul>
			{:else}
				<p class="mt-3 rounded-2xl border border-dashed border-slate-300 bg-white p-5 text-center text-sm font-bold text-slate-400">Belum ada ulasan. Jadilah yang pertama setelah pesananmu selesai.</p>
			{/if}
		</section>
	{:else}
		<div class="mt-12"><EmptyState icon={PackageSearch} title="Produk tidak ditemukan" description="Produk ini tidak ada atau sudah dihapus toko."><Button href="/marketplace" variant="outline">Ke katalog</Button></EmptyState></div>
	{/if}
</div></main>
