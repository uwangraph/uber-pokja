<script>
	import { onMount } from 'svelte';
	import { Button } from '@khwarizmi/svelte-ui';
	import { Bell, CheckCheck, ChevronLeft, PackageCheck, RotateCcw, Tag } from 'lucide-svelte';

	const STORAGE_KEY = 'uber-pokja:marketplace:notifications-read';
	let sudahDibaca = $state({});
	const dibaca = (id) => Boolean(sudahDibaca[id]);
	const tandaiDibaca = (id) => {
		sudahDibaca = { ...sudahDibaca, [id]: true };
		localStorage.setItem(STORAGE_KEY, JSON.stringify(sudahDibaca));
	};
	const tandaiSemua = () => {
		sudahDibaca = { pesanan: true, promo: true };
		localStorage.setItem(STORAGE_KEY, JSON.stringify(sudahDibaca));
	};
	const tandaiBelumDibaca = (id) => {
		const statusBerikutnya = { ...sudahDibaca };
		delete statusBerikutnya[id];
		sudahDibaca = statusBerikutnya;
		localStorage.setItem(STORAGE_KEY, JSON.stringify(sudahDibaca));
	};
	onMount(() => {
		try { sudahDibaca = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}'); } catch {}
	});
</script>

<svelte:head><title>Notifikasi · UBER Market</title></svelte:head>

<main class="min-h-dvh bg-[#faf9f5] px-4 py-5 text-slate-800 sm:px-6">
	<div class="mx-auto max-w-2xl">
		<a href="/marketplace" class="inline-flex items-center gap-1.5 text-sm font-black text-primary-700"><ChevronLeft size={18} /> Kembali ke beranda</a>
		<header class="mt-6 flex items-center gap-3"><span class="grid size-12 place-items-center rounded-2xl bg-primary-100 text-primary-700"><Bell size={22} /></span><div class="min-w-0 flex-1"><h1 class="text-2xl font-black">Notifikasi</h1><p class="text-sm font-medium text-slate-500">Info pesanan dan promo terbaru.</p></div><Button variant="outline" size="sm" class="shrink-0         " onclick={tandaiSemua}><CheckCheck size={16} /><span class="hidden sm:inline">Tandai semua</span><span class="sm:hidden">Semua</span></Button></header>
		<section class="mt-7 space-y-3">
			<article class="rounded-2xl border border-primary-200 bg-white p-4  {dibaca('pesanan') ? 'opacity-75' : ''}"><div class="flex gap-3"><PackageCheck class="mt-0.5 shrink-0 text-primary-700" size={20} /><div class="min-w-0 flex-1"><div class="flex items-start justify-between gap-3"><div class="flex min-w-0 items-center gap-2"><p class="font-black">Pesanan mudah dilacak</p>{#if !dibaca('pesanan')}<span class="inline-flex shrink-0 items-center gap-1 rounded-full bg-primary-100 px-2 py-0.5 text-[10px] font-black text-primary-800"><i class="size-1.5 rounded-full bg-primary-600"></i> Baru</span>{/if}</div>{#if dibaca('pesanan')}<Button variant="outline" size="xs" class="shrink-0         " onclick={() => tandaiBelumDibaca('pesanan')}><RotateCcw size={13} /> Belum dibaca</Button>{:else}<Button variant="outline" size="xs" class="shrink-0         " onclick={() => tandaiDibaca('pesanan')}>Tandai dibaca</Button>{/if}</div><p class="mt-1 text-sm leading-6 text-slate-600">Lihat perkembangan pembayaran, proses Gudang, dan pengiriman dari halaman Pesanan.</p><a href="/marketplace/pesanan" class="mt-3 inline-block text-sm font-black text-primary-700">Lihat pesanan →</a></div></div></article>
			<article class="rounded-2xl border border-amber-200 bg-amber-50 p-4  {dibaca('promo') ? 'opacity-75' : ''}"><div class="flex gap-3"><Tag class="mt-0.5 shrink-0 text-amber-700" size={20} /><div class="min-w-0 flex-1"><div class="flex items-start justify-between gap-3"><div class="flex min-w-0 items-center gap-2"><p class="font-black text-amber-950">Promo minyak goreng</p>{#if !dibaca('promo')}<span class="inline-flex shrink-0 items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-black text-amber-800"><i class="size-1.5 rounded-full bg-amber-600"></i> Baru</span>{/if}</div>{#if dibaca('promo')}<Button variant="outline" size="xs" class="shrink-0         " onclick={() => tandaiBelumDibaca('promo')}><RotateCcw size={13} /> Belum dibaca</Button>{:else}<Button variant="outline" size="xs" class="shrink-0         " onclick={() => tandaiDibaca('promo')}>Tandai dibaca</Button>{/if}</div><p class="mt-1 text-sm leading-6 text-amber-900">Nantikan paket hemat kebutuhan harian dari UBER Market.</p></div></div></article>
		</section>
	</div>
</main>
