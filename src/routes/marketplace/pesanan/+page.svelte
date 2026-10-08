<script>
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { Banknote, ChevronLeft, CreditCard, PackageCheck, Truck } from 'lucide-svelte';
	import { Button, EmptyState, Tabs, showToast } from '@khwarizmi/svelte-ui';
	import Badge from '$lib/components/Badge.svelte';
	import { rupiah } from '$lib/format.js';
	import { bankVA, isCOD, ubahPesanan } from '$lib/pembayaran.js';

	let pesanan = $state([]);
	let tab = $state('Semua');
	const tabs = ['Semua', 'Belum Bayar', 'Dikemas', 'Dikirim', 'Selesai', 'Dibatalkan'];
	const kategori = (p) => {
		if (p.status === 'Menunggu pembayaran') return 'Belum Bayar';
		if (p.status === 'Menunggu diproses' || p.status === 'Dikemas') return 'Dikemas';
		return p.status;
	};
	const tone = { 'Belum Bayar': 'amber', Dikemas: 'blue', Dikirim: 'blue', Selesai: 'green', Dibatalkan: 'red' };
	const daftar = $derived(pesanan.filter((p) => tab === 'Semua' || kategori(p) === tab));
	const namaBank = (id) => bankVA.find((b) => b.id === id)?.nama ?? '';

	function muat() {
		try { pesanan = JSON.parse(localStorage.getItem('uber-pokja:marketplace:orders') ?? '[]'); } catch {}
	}
	onMount(muat);

	// Simulasi COD: kurir/petugas menerima uang tunai saat barang diserahkan.
	function simulasiCOD(p) {
		ubahPesanan(p.id, { status: 'Selesai', dibayarPada: new Date().toISOString() });
		muat();
		showToast({ tone: 'success', title: 'COD selesai', description: `${rupiah(p.total)} diterima tunai. Pesanan selesai.` });
	}
</script>

<svelte:head><title>Pesanan Saya · UBER Market</title></svelte:head>

<main class="px-4 py-5 text-slate-800 sm:px-6"><div class="mx-auto max-w-2xl">
	<a href="/marketplace" class="inline-flex items-center gap-1.5 text-sm font-black text-primary-700"><ChevronLeft size={18} /> Kembali ke beranda</a>
	<header class="mt-6"><h1 class="text-2xl font-black">Pesanan saya</h1><p class="mt-1 text-sm font-medium text-slate-500">Lacak pembayaran, proses Gudang, dan pengiriman.</p></header>
	{#if pesanan.length}
		<div class="mt-6 overflow-x-auto pb-2">
			<Tabs tabs={tabs.map((item) => ({ value: item, label: item }))} bind:value={tab} ariaLabel="Filter status pesanan" />
		</div>
		<section class="mt-5 space-y-3">
			{#each daftar as p (p.id)}
				{@const kat = kategori(p)}
				{@const cod = isCOD(p)}
				<article class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
					<div class="flex items-start justify-between gap-3">
						<div class="min-w-0">
							<p class="truncate font-black">{p.id}</p>
							<p class="mt-1 text-xs font-bold text-slate-400">{new Date(p.dibuatPada).toLocaleDateString('id-ID', { dateStyle: 'medium' })}{p.tokoNama ? ` · ${p.tokoNama}` : ''}</p>
						</div>
						<div class="shrink-0"><Badge tone={tone[kat]}>{kat}</Badge></div>
					</div>
					<p class="mt-4 text-sm font-bold text-slate-600">{p.items.map((i) => `${i.nama} × ${i.qty}`).join(', ')}</p>

					<!-- Info pembayaran per metode & status -->
					<div class="mt-3 rounded-xl px-3 py-2.5 text-sm {p.status === 'Dibatalkan' ? 'bg-red-50 text-red-900' : cod ? 'bg-emerald-50 text-emerald-900' : 'bg-primary-50 text-primary-900'}">
						<p class="flex items-center gap-1.5 font-black">
							{#if cod}<Banknote size={16} /> Bayar di tempat (COD){:else}<CreditCard size={16} /> Transfer Virtual Account{/if}
						</p>
						<p class="mt-1 font-medium">
							{#if p.status === 'Dibatalkan'}
								{p.alasanBatal ?? 'Pesanan dibatalkan.'}
							{:else if p.dibayarPada}
								Lunas{cod ? ' (tunai)' : ` via VA ${namaBank(p.bank)}`} · {new Date(p.dibayarPada).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}
							{:else if cod}
								Siapkan <strong class="num">{rupiah(p.total)}</strong>, bayar ke {p.pengiriman === 'ambil' ? 'petugas saat mengambil pesanan' : 'kurir saat pesanan tiba'}.
							{:else}
								Menunggu pembayaran <strong class="num">{rupiah(p.total)}</strong>.
							{/if}
						</p>
					</div>

					<div class="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-3">
						<span class="flex items-center gap-1.5 text-xs font-bold text-slate-400"><Truck size={14} /> {p.pengiriman === 'ambil' ? 'Ambil di UBER POKJA' : 'Diantar ke alamat'} · <strong class="num text-primary-800">{rupiah(p.total)}</strong></span>
						{#if p.status === 'Menunggu pembayaran'}
							<Button size="sm" onclick={() => goto(`/marketplace/pembayaran?id=${encodeURIComponent(p.id)}`)}>Bayar sekarang</Button>
						{:else if cod && !p.dibayarPada && p.status !== 'Dibatalkan'}
							<Button size="sm" variant="outline" onclick={() => simulasiCOD(p)}>Simulasi: terima & bayar</Button>
						{/if}
					</div>
				</article>
			{:else}
				<div class="rounded-2xl border border-dashed border-slate-300 bg-white p-7 text-center text-sm font-bold text-slate-400">Tidak ada pesanan dengan status {tab}.</div>
			{/each}
		</section>
	{:else}
		<div class="mt-12"><EmptyState icon={PackageCheck} title="Belum ada pesanan" description="Pesanan yang dibuat di UBER Market akan muncul di sini." /></div>
	{/if}
</div></main>
