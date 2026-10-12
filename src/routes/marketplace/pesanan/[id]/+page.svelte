<script>
	import { onMount } from 'svelte';
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { ChevronLeft, PackageSearch } from 'lucide-svelte';
	import { Button, ConfirmModal, EmptyState, showToast } from '@khwarizmi/svelte-ui';
	import DetailPesanan from '$lib/components/DetailPesanan.svelte';
	import UlasanPesanan from '$lib/components/UlasanPesanan.svelte';
	import { aksiPesanan, jalankanAksi } from '$lib/pembayaran.js';
	import { pesanUlang } from '$lib/marketplace.svelte.js';

	let order = $state(null);
	let siap = $state(false);
	let batalAksi = $state(null);
	function muat() {
		try { order = JSON.parse(localStorage.getItem('uber-pokja:marketplace:orders') ?? '[]').find((p) => p.id === page.params.id) ?? null; } catch {}
		siap = true;
	}
	onMount(muat);

	const aksi = $derived(aksiPesanan(order, 'pembeli'));
	function jalankan(a) {
		const hasil = jalankanAksi(order, a, 'pembeli');
		muat();
		showToast({ tone: a.status === 'Dibatalkan' ? 'info' : 'success', title: a.status === 'Selesai' ? 'Pesanan diterima' : 'Pesanan dibatalkan', description: a.status === 'Selesai' ? 'Terima kasih! Jangan lupa beri ulasan.' : 'Stok dikembalikan ke toko.' });
	}
	function ulang() {
		const { ditambah, dilewati } = pesanUlang(order);
		if (!ditambah) return showToast({ tone: 'warning', title: 'Produk tidak tersedia', description: 'Semua barang pada pesanan ini sedang habis.' });
		showToast({ tone: 'success', title: 'Ditambahkan ke keranjang', description: dilewati ? `${ditambah} produk masuk, ${dilewati} produk habis.` : `${ditambah} produk dari pesanan ini.` });
		goto('/marketplace/keranjang');
	}
</script>

<svelte:head><title>Detail Pesanan · UBER Market</title></svelte:head>

<main class="px-4 py-5 text-slate-800 sm:px-6"><div class="mx-auto max-w-2xl">
	<a href="/marketplace/pesanan" class="inline-flex items-center gap-1.5 text-sm font-black text-primary-700"><ChevronLeft size={18} /> Kembali ke pesanan</a>
	<header class="mt-6 mb-5"><h1 class="text-2xl font-black">Detail pesanan</h1></header>
	{#if order}
		<DetailPesanan {order} sebagai="pembeli" />
		{#if order.status === 'Selesai'}<UlasanPesanan {order} />{/if}
		<div class="mt-5 flex flex-col gap-2 sm:flex-row-reverse">
			{#if order.status === 'Menunggu pembayaran'}
				<Button class="sm:flex-1" onclick={() => goto(`/marketplace/pembayaran?id=${encodeURIComponent(order.id)}`)}>Bayar sekarang</Button>
			{/if}
			{#each aksi as a}
				{#if a.status === 'Dibatalkan'}
					<Button variant="outline" onclick={() => (batalAksi = a)}>{a.label}</Button>
				{:else}
					<Button class="sm:flex-1" onclick={() => jalankan(a)}>{a.label}</Button>
				{/if}
			{/each}
			{#if order.status === 'Selesai' || order.status === 'Dibatalkan'}
				<Button class="sm:flex-1" variant={order.status === 'Selesai' ? 'outline' : 'default'} onclick={ulang}>Pesan lagi</Button>
			{/if}
		</div>
	{:else if siap}
		<EmptyState icon={PackageSearch} title="Pesanan tidak ditemukan" description="Pesanan ini tidak ada di perangkat ini.">
			<Button href="/marketplace/pesanan" variant="outline">Lihat semua pesanan</Button>
		</EmptyState>
	{/if}
</div></main>

<ConfirmModal open={!!batalAksi} tone="danger" title="Batalkan pesanan?" message="Stok dikembalikan ke toko. Pesanan yang dibatalkan tidak bisa dilanjutkan." confirmLabel="Ya, batalkan" cancelLabel="Tidak" onconfirm={() => { jalankan(batalAksi); batalAksi = null; }} oncancel={() => (batalAksi = null)} />
