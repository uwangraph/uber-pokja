<script>
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { Button, EmptyState, showToast } from '@khwarizmi/svelte-ui';
	import { CheckCircle2, ChevronLeft, Copy, CreditCard, ShieldCheck } from 'lucide-svelte';
	import { rupiah } from '$lib/format.js';

	let order = $state(null);
	let sisa = $state(15 * 60);
	const waktu = $derived(`${String(Math.floor(sisa / 60)).padStart(2, '0')}:${String(sisa % 60).padStart(2, '0')}`);
	const va = $derived(order ? `8808 ${order.id.replace(/\D/g, '').slice(-10).padStart(10, '0')}` : '');
	onMount(() => {
		const id = page.url.searchParams.get('id');
		try { order = JSON.parse(localStorage.getItem('uber-pokja:marketplace:orders') ?? '[]').find((p) => p.id === id) ?? null; } catch {}
		const timer = setInterval(() => { if (sisa > 0) sisa -= 1; }, 1000);
		return () => clearInterval(timer);
	});
	function salin() { navigator.clipboard?.writeText(va); showToast({ tone: 'success', title: 'Nomor disalin', description: 'Nomor virtual account disalin ke clipboard.' }); }
	function bayar() {
		let pesanan = [];
		try { pesanan = JSON.parse(localStorage.getItem('uber-pokja:marketplace:orders') ?? '[]'); } catch {}
		const p = pesanan.find((item) => item.id === order.id);
		if (p) { p.status = 'Menunggu diproses'; p.paymentStatus = 'verified'; p.dibayarPada = new Date().toISOString(); localStorage.setItem('uber-pokja:marketplace:orders', JSON.stringify(pesanan)); }
		showToast({ tone: 'success', title: 'Pembayaran berhasil', description: 'Pesanan diteruskan ke Gudang untuk diproses.' });
		goto('/marketplace/pesanan');
	}
</script>

<svelte:head><title>Pembayaran · UBER Market</title></svelte:head>
<main class="min-h-dvh bg-[#f7faf7] px-4 py-5 text-slate-800 sm:px-6"><div class="mx-auto max-w-md">
	<a href="/marketplace/pesanan" class="inline-flex items-center gap-1.5 text-sm font-black text-primary-700"><ChevronLeft size={18} /> Kembali ke pesanan</a>
	{#if order}<header class="mt-7 text-center"><span class="mx-auto grid size-14 place-items-center rounded-2xl bg-primary-100 text-primary-700"><CreditCard size={26} /></span><p class="mt-4 text-xs font-black tracking-widest text-primary-700 uppercase">UBER Pay · Simulasi</p><h1 class="mt-1 text-2xl font-black">Selesaikan pembayaran</h1><p class="mt-2 text-sm font-medium text-slate-500">Pesanan {order.id}</p></header>
		<section class="mt-7 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm"><div class="bg-primary-800 px-5 py-4 text-white"><p class="text-xs font-bold text-primary-100">Total pembayaran</p><p class="num mt-1 text-3xl font-black">{rupiah(order.total)}</p></div><div class="p-5"><div class="flex items-center justify-between"><div><p class="font-black">Transfer Virtual Account</p><p class="mt-1 text-sm font-medium text-slate-500">UBER Market Bank (simulasi)</p></div><span class="rounded-lg bg-slate-100 px-2 py-1 text-xs font-black text-slate-600">Demo</span></div><div class="mt-5 rounded-2xl border border-dashed border-primary-300 bg-primary-50 p-4"><p class="text-xs font-black tracking-widest text-primary-700 uppercase">Nomor virtual account</p><div class="mt-2 flex items-center justify-between gap-2"><strong class="num text-xl tracking-wider text-primary-950">{va}</strong><button class="grid size-9 place-items-center rounded-xl bg-white text-primary-700 shadow-sm" onclick={salin} aria-label="Salin nomor"><Copy size={17} /></button></div></div><div class="mt-5 flex items-center justify-between text-sm"><span class="font-bold text-slate-500">Selesaikan dalam</span><strong class="num text-red-600">{waktu}</strong></div><p class="mt-4 flex gap-2 rounded-xl bg-amber-50 p-3 text-xs leading-5 font-medium text-amber-900"><ShieldCheck class="shrink-0" size={17} />Ini adalah gateway pembayaran simulasi. Tidak ada uang yang benar-benar ditransfer.</p><Button fullWidth size="lg" class="mt-5" onclick={bayar}><CheckCircle2 size={18} /> Simulasikan pembayaran berhasil</Button></div></section>
	{:else}<div class="mt-16"><EmptyState title="Pesanan tidak ditemukan" description="Kembali ke halaman Pesanan untuk memilih pesanan yang valid." /></div>{/if}
</div></main>
