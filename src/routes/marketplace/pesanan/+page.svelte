<script>
	import { onMount } from 'svelte';
	import { ChevronLeft, PackageCheck, Truck } from 'lucide-svelte';
	import { EmptyState, Tabs } from '@khwarizmi/svelte-ui';
	import { rupiah } from '$lib/format.js';

	let pesanan = $state([]);
	let tab = $state('Semua');
	const tabs = ['Semua', 'Belum Bayar', 'Dikemas', 'Dikirim', 'Selesai', 'Dibatalkan'];
	const statusTampil = (p) => (p.pembayaran === 'tunai' && p.status === 'Menunggu pembayaran' ? 'Menunggu diproses' : p.status);
	const kategori = (p) => {
		const status = statusTampil(p);
		if (status === 'Menunggu pembayaran') return 'Belum Bayar';
		if (status === 'Menunggu diproses' || status === 'Dikemas') return 'Dikemas';
		return status;
	};
	const daftar = $derived(pesanan.filter((p) => tab === 'Semua' || kategori(p) === tab));
	onMount(() => {
		try { pesanan = JSON.parse(localStorage.getItem('uber-pokja:marketplace:orders') ?? '[]'); } catch {}
	});
</script>

<svelte:head><title>Pesanan Saya · UBER Market</title></svelte:head>

<main class="min-h-dvh bg-[#faf9f5] px-4 py-5 text-slate-800 sm:px-6"><div class="mx-auto max-w-2xl">
	<a href="/marketplace" class="inline-flex items-center gap-1.5 text-sm font-black text-primary-700"><ChevronLeft size={18} /> Kembali ke beranda</a>
	<header class="mt-6"><h1 class="text-2xl font-black">Pesanan saya</h1><p class="mt-1 text-sm font-medium text-slate-500">Lacak pembayaran, proses Gudang, dan pengiriman.</p></header>
	{#if pesanan.length}
		<div class="mt-6 overflow-x-auto pb-2">
			<Tabs tabs={tabs.map((item) => ({ value: item, label: item }))} bind:value={tab} ariaLabel="Filter status pesanan" />
		</div>
		<section class="mt-5 space-y-3">{#each daftar as p (p.id)}{@const status = statusTampil(p)}<article class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"><div class="flex items-start justify-between gap-3"><div><p class="font-black">{p.id}</p><p class="mt-1 text-xs font-bold text-slate-400">{new Date(p.dibuatPada).toLocaleDateString('id-ID', { dateStyle: 'medium' })}{p.tokoNama ? ` · ${p.tokoNama}` : ''}</p></div><span class="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-black text-amber-800">{status}</span></div><p class="mt-4 text-sm font-bold text-slate-600">{p.items.map((i) => `${i.nama} × ${i.qty}`).join(', ')}</p><div class="mt-3 rounded-xl {p.pembayaran === 'tunai' ? 'bg-emerald-50 text-emerald-900' : 'bg-amber-50 text-amber-900'} px-3 py-2.5 text-sm"><p class="font-black">{p.pembayaran === 'tunai' ? 'Bayar tunai' : 'Pembayaran transfer'}</p>{#if p.pembayaran === 'tunai'}<p class="mt-1 font-medium">Bayar <strong class="num">{rupiah(p.total)}</strong> saat mengambil pesanan di UBER POKJA.</p>{:else}<p class="mt-1 font-medium">Silakan hubungi Chat bantuan untuk mendapatkan instruksi rekening dan mengonfirmasi pembayaran.</p><a href="/marketplace/chat" class="mt-2 inline-block font-black text-primary-700">Buka Chat bantuan →</a>{/if}</div><div class="mt-4 flex items-center justify-between border-t border-slate-100 pt-3"><span class="flex items-center gap-1.5 text-xs font-bold text-slate-400"><Truck size={14} /> {p.pengiriman === 'ambil' ? 'Ambil di UBER POKJA' : 'Diantar ke alamat'}</span><strong class="num text-primary-800">{rupiah(p.total)}</strong></div></article>{:else}<div class="rounded-2xl border border-dashed border-slate-300 bg-white p-7 text-center text-sm font-bold text-slate-400">Tidak ada pesanan dengan status {tab}.</div>{/each}</section>
	{:else}<div class="mt-12"><EmptyState icon={PackageCheck} title="Belum ada pesanan" description="Pesanan yang dibuat di UBER Market akan muncul di sini." /></div>{/if}
</div></main>
