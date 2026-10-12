<script>
	import { page } from '$app/state';
	import { browser } from '$app/environment';
	import { Button, ConfirmModal, EmptyState, showToast } from '@khwarizmi/svelte-ui';
	import { PackageSearch } from 'lucide-svelte';
	import PageHeader from '$lib/components/PageHeader.svelte';
	import DetailPesanan from '$lib/components/DetailPesanan.svelte';
	import Icon from '$lib/components/Icon.svelte';
	import { aksiPesanan, jalankanAksi } from '$lib/pembayaran.js';

	let semua = $state([]);
	let user = $state(null);
	let batalAksi = $state(null);
	function muat() {
		try {
			semua = JSON.parse(localStorage.getItem('uber-pokja:marketplace:orders') ?? '[]');
			user = JSON.parse(localStorage.getItem('user') ?? 'null');
		} catch {}
	}
	$effect(() => {
		if (browser) muat();
	});
	// Hanya pesanan milik toko yang sedang login yang boleh dibuka.
	const order = $derived(semua.find((p) => p.id === page.params.id && p.majelisId === user?.majelisId));

	function jalankan(a) {
		const hasil = jalankanAksi(order, a, 'penjual');
		muat();
		showToast({ tone: a.status === 'Dibatalkan' ? 'info' : 'success', title: `Pesanan ${hasil.status.toLowerCase()}`, description: a.status === 'Dibatalkan' ? 'Stok dikembalikan ke toko.' : 'Pembeli diberi tahu lewat notifikasi.' });
	}
</script>

<svelte:head><title>Detail Pesanan · UBER POKJA</title></svelte:head>

<a href="/toko" class="mb-4 inline-flex items-center gap-1.5 text-sm font-black text-primary-700"><Icon name="chevron" class="size-4 rotate-180" strokeWidth={3} /> Kembali ke Toko Saya</a>
<div class="mx-auto max-w-2xl">
	<PageHeader eyebrow="Pesanan masuk" title="Detail pesanan" />
	{#if order}
		<DetailPesanan {order} sebagai="penjual">
			{#snippet aksi()}
				{#if order.status === 'Menunggu pembayaran'}
					<p class="rounded-2xl bg-amber-50 px-4 py-3 font-bold text-amber-800">Menunggu pembeli menyelesaikan pembayaran. Pesanan baru bisa diproses setelah dibayar.</p>
				{/if}
			{/snippet}
		</DetailPesanan>
		{#if aksiPesanan(order, 'penjual').length}
			<div class="sticky bottom-20 mt-5 flex flex-col gap-2 sm:flex-row-reverse lg:bottom-4">
				{#each aksiPesanan(order, 'penjual') as a}
					{#if a.status === 'Dibatalkan'}
						<Button variant="outline" onclick={() => (batalAksi = a)}>{a.label}</Button>
					{:else}
						<Button class="sm:flex-1" onclick={() => jalankan(a)}>{a.label}</Button>
					{/if}
				{/each}
			</div>
		{/if}
	{:else if semua.length || user}
		<EmptyState icon={PackageSearch} title="Pesanan tidak ditemukan" description="Pesanan ini tidak ada atau bukan milik tokomu.">
			<Button href="/toko" variant="outline">Kembali</Button>
		</EmptyState>
	{/if}
</div>

<ConfirmModal open={!!batalAksi} tone="danger" title="Batalkan pesanan?" message="Stok produk akan dikembalikan dan pembeli diberi tahu. Pesanan yang dibatalkan tidak bisa dilanjutkan." confirmLabel="Ya, batalkan" cancelLabel="Tidak" onconfirm={() => { jalankan(batalAksi); batalAksi = null; }} oncancel={() => (batalAksi = null)} />
