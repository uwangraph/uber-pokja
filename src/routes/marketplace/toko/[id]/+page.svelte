<script>
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { Button, Badge, EmptyState, SearchInput, showToast } from '@khwarizmi/svelte-ui';
	import { ChevronLeft, MapPin, Phone, SearchX, ShoppingBag, Store } from 'lucide-svelte';
	import { rupiah } from '$lib/format.js';
	import { tokoById, katalogToko, pilihToko } from '$lib/marketplace.svelte.js';

	const majelisId = $derived(parseInt(page.params.id));
	const toko = $derived(tokoById(majelisId));
	const produkToko = $derived(katalogToko(majelisId));
	let cari = $state('');
	const daftar = $derived(produkToko.filter((p) => p.nama.toLowerCase().includes(cari.toLowerCase())));

	const visualProduk = { 1: '🍚', 2: '🫙', 3: '🧂', 4: '🥚', 5: '🌾', 6: '🍜', 7: '🍵' };
	const visual = (p) => visualProduk[p.produkId] ?? '🛍️';

	let keranjang = $state({});
	let dipilih = $state({});
	let storageSiap = $state(false);
	$effect(() => {
		try {
			keranjang = JSON.parse(localStorage.getItem('uber-pokja:marketplace:cart') ?? '{}');
			dipilih = JSON.parse(localStorage.getItem('uber-pokja:marketplace:selected') ?? '{}');
		} catch {}
		storageSiap = true;
	});
	function simpan() {
		if (!storageSiap) return;
		localStorage.setItem('uber-pokja:marketplace:cart', JSON.stringify(keranjang));
		window.dispatchEvent(new Event('keranjang-berubah'));
		localStorage.setItem('uber-pokja:marketplace:selected', JSON.stringify(dipilih));
	}
	function tambah(p) {
		if (!p.stok) {
			showToast({ tone: 'warning', title: 'Stok produk habis', description: 'Silakan pilih produk lain.' });
			return;
		}
		const qty = Math.min(p.stok, (keranjang[p.id] ?? 0) + 1);
		keranjang[p.id] = qty;
		dipilih[p.id] = true;
		simpan();
		showToast({ tone: 'success', title: 'Ditambahkan ke keranjang', description: `${p.nama} · ${qty} ${p.satuan}` });
	}

	function belanjaDariToko() {
		pilihToko(majelisId);
		goto('/marketplace');
	}
</script>

<svelte:head><title>{toko?.nama ?? 'Toko'} · UBER Market</title></svelte:head>

{#if toko}
	<main class="min-h-dvh bg-[#faf9f5] px-4 py-5 text-slate-800 sm:px-6">
		<div class="mx-auto max-w-5xl">
			<a href="/marketplace" class="inline-flex items-center gap-1.5 text-sm font-black text-primary-700"><ChevronLeft size={18} /> Kembali ke marketplace</a>

			<header class="mt-6 overflow-hidden rounded-3xl bg-linear-to-br from-primary-900 to-primary-700 p-6 text-white shadow-sm sm:p-8">
				<div class="flex flex-wrap items-center gap-4">
					<span class="grid size-16 shrink-0 place-items-center rounded-3xl bg-white/15 ring-1 ring-white/20"><Store size={28} /></span>
					<div class="min-w-0 flex-1">
						<h1 class="text-2xl font-black">{toko.nama}</h1>
						<p class="mt-1 flex items-center gap-1.5 text-sm font-medium text-primary-100"><MapPin size={14} /> Desa {toko.desa}</p>
						<p class="mt-1 flex items-center gap-1.5 text-sm font-medium text-primary-100"><Phone size={14} /> {toko.hp}</p>
					</div>
					<Button variant="warning" class="!bg-none !bg-gold-400 !text-brand-900 shrink-0" onclick={belanjaDariToko}><ShoppingBag size={16} /> Belanja dari toko ini</Button>
				</div>
			</header>

			<section class="mt-7">
				<div class="flex flex-wrap items-end justify-between gap-4">
					<div>
						<h2 class="text-xl font-black tracking-tight">Produk dari {toko.nama}</h2>
						<p class="mt-1 text-sm text-slate-500">Stok titipan Gudang Pusat yang dijual toko ini.</p>
					</div>
					<p class="rounded-full bg-white px-3 py-1.5 text-xs font-bold text-slate-500 ring-1 ring-slate-200">{daftar.length} produk</p>
				</div>

				<div class="mt-5"><SearchInput bind:value={cari} aria-label="Cari produk di toko ini" placeholder="Cari produk di toko ini..." class="w-full sm:max-w-md" /></div>

				{#if daftar.length}
					<div class="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
						{#each daftar as p (p.id)}
							{@const qty = keranjang[p.id] ?? 0}
							{@const habis = p.stok === 0}
							<article class="flex flex-col overflow-hidden rounded-[1.5rem] border border-[#e8e9df] bg-white shadow-[0_6px_0_#e2e8f0]">
								<div class="grid aspect-[4/2.65] place-items-center bg-primary-50 text-6xl">{visual(p)}</div>
								<div class="flex flex-1 flex-col p-4 sm:p-5">
									<h3 class="min-h-11 text-[15px] leading-snug font-black text-slate-800">{p.nama}</h3>
									<div class="mt-2 flex items-center justify-between gap-2">
										<p class="text-xs font-medium text-slate-500">Stok {p.stok} {p.satuan}</p>
										{#if habis}<Badge tone="red">Habis</Badge>{:else if p.stok <= p.min}<Badge tone="amber">Terbatas</Badge>{/if}
									</div>
									<div class="mt-4 flex items-baseline gap-1"><p class="num text-xl font-black tracking-tight text-brand-800">{rupiah(p.jual)}</p><span class="text-xs font-medium text-slate-400">/ {p.satuan}</span></div>
									<Button fullWidth class="mt-4" variant="outline" disabled={habis} onclick={() => tambah(p)}><ShoppingBag size={16} /> {habis ? 'Stok habis' : qty ? `Di keranjang (${qty})` : 'Tambah ke keranjang'}</Button>
								</div>
							</article>
						{/each}
					</div>
				{:else}
					<EmptyState class="mt-10" icon={SearchX} title="Belum ada produk" description="Toko ini belum punya stok atau produknya tidak cocok dengan pencarian." />
				{/if}
			</section>
		</div>
	</main>
{:else}
	<main class="flex min-h-dvh items-center justify-center bg-[#faf9f5] px-4">
		<EmptyState icon={Store} title="Toko tidak ditemukan" description="Toko yang Anda cari tidak tersedia." />
	</main>
{/if}
