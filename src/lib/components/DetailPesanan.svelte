<script>
	import Badge from '$lib/components/Badge.svelte';
	import { rupiah } from '$lib/format.js';
	import { bankVA, isCOD } from '$lib/pembayaran.js';

	// Isi halaman detail pesanan, dipakai penjual (Toko Saya) dan pembeli (marketplace).
	let { order, sebagai = 'penjual', aksi } = $props();

	const waktu = (iso) => new Date(iso).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' });
	const namaBank = (id) => bankVA.find((b) => b.id === id)?.nama ?? '';
	const alamat = (b) => [b?.alamat, b?.rtRw && `RT/RW ${b.rtRw}`, b?.kelurahan, b?.kecamatan, b?.kota, b?.provinsi, b?.kodePos].filter(Boolean).join(', ');
	const tone = (st) => (st === 'Selesai' ? 'green' : st === 'Dibatalkan' ? 'red' : st === 'Dikirim' || st === 'Dikemas' ? 'blue' : 'amber');

	const cod = $derived(isCOD(order));
	const batal = $derived(order.status === 'Dibatalkan');
	// Tahap pesanan; COD tidak punya tahap "Dibayar" (bayar saat barang diterima).
	const tahap = $derived(cod ? ['Dibuat', 'Dikemas', 'Dikirim', 'Selesai'] : ['Dibuat', 'Dibayar', 'Dikemas', 'Dikirim', 'Selesai']);
	const posisi = $derived.by(() => {
		if (order.status === 'Selesai') return tahap.length - 1;
		if (order.status === 'Dikirim') return tahap.indexOf('Dikirim');
		if (order.status === 'Dikemas') return tahap.indexOf('Dikemas');
		return !cod && order.dibayarPada ? 1 : 0;
	});
	const waktuTahap = (t) => {
		const iso = t === 'Dibuat' ? order.dibuatPada : t === 'Dibayar' ? order.dibayarPada : order.riwayat?.find((r) => r.status === t)?.t;
		return iso ? new Date(iso).toLocaleString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : '';
	};
</script>

<div class="space-y-5 text-sm">
	<section class="rounded-2xl border border-slate-200 bg-white p-4">
		<div class="flex items-start justify-between gap-3">
			<div class="min-w-0">
				<p class="text-xs font-black tracking-widest text-slate-400 uppercase">No. pesanan</p>
				<p class="mt-0.5 truncate text-base font-black">{order.id}</p>
				<p class="mt-0.5 text-xs font-bold text-slate-400">Dibuat {waktu(order.dibuatPada)}</p>
			</div>
			<Badge tone={tone(order.status)}>{order.status}</Badge>
		</div>
		{#if batal}
			<p class="mt-4 rounded-xl bg-red-50 px-3 py-2.5 font-bold text-red-700">{order.alasanBatal ?? 'Pesanan dibatalkan.'}</p>
		{:else}
			<ol class="mt-5 flex" aria-label="Tahap pesanan">
				{#each tahap as t, i}
					<li class="relative flex-1 text-center">
						{#if i > 0}<span class="absolute top-2.5 right-1/2 h-0.5 w-full {i <= posisi ? 'bg-primary-500' : 'bg-slate-200'}"></span>{/if}
						<span class="relative mx-auto grid size-5 place-items-center rounded-full text-[10px] font-black {i <= posisi ? 'bg-primary-600 text-white' : 'bg-slate-200 text-slate-400'}">{i <= posisi ? '✓' : i + 1}</span>
						<span class="mt-1.5 block text-[11px] font-black {i <= posisi ? 'text-primary-700' : 'text-slate-400'}">{t}</span>
						<span class="num block text-[10px] leading-tight font-bold text-slate-400">{i <= posisi ? waktuTahap(t) : ''}</span>
					</li>
				{/each}
			</ol>
		{/if}
	</section>

	<section>
		<h2 class="mb-2 text-xs font-black tracking-widest text-slate-400 uppercase">{order.pengiriman === 'ambil' ? 'Pengambilan' : 'Alamat pengiriman'}</h2>
		<div class="rounded-2xl border border-slate-200 bg-white p-4">
			<p class="font-black text-slate-800">{order.pembeli?.nama}</p>
			<a href="tel:{order.pembeli?.hp}" class="num mt-0.5 block font-bold text-primary-700">{order.pembeli?.hp}</a>
			<p class="mt-2 font-medium text-slate-500">{order.pengiriman === 'ambil' ? `Diambil sendiri di ${order.tokoNama || 'toko'}` : alamat(order.pembeli)}</p>
		</div>
	</section>

	<section>
		<h2 class="mb-2 text-xs font-black tracking-widest text-slate-400 uppercase">{sebagai === 'pembeli' && order.tokoNama ? order.tokoNama : 'Barang dipesan'}</h2>
		<ul class="divide-y divide-slate-100 overflow-hidden rounded-2xl border border-slate-200 bg-white">
			{#each order.items as i}
				<li class="flex items-center justify-between gap-3 px-4 py-3">
					<div class="min-w-0">
						<p class="truncate font-black text-slate-800">{i.nama}</p>
						<p class="num text-xs font-bold text-slate-400">{i.qty} {i.satuan} × {rupiah(i.harga)}</p>
					</div>
					<span class="num shrink-0 font-black">{rupiah(i.qty * i.harga)}</span>
				</li>
			{/each}
			<li class="flex items-center justify-between bg-slate-50 px-4 py-3 font-black">
				<span>Total pesanan</span><span class="num text-primary-800">{rupiah(order.total)}</span>
			</li>
		</ul>
	</section>

	<section>
		<h2 class="mb-2 text-xs font-black tracking-widest text-slate-400 uppercase">Pembayaran</h2>
		<dl class="space-y-2 rounded-2xl border border-slate-200 bg-white p-4">
			<div class="flex justify-between gap-3"><dt class="font-bold text-slate-500">Metode</dt><dd class="text-right font-black">{cod ? 'Bayar di tempat (COD)' : `Transfer VA${order.bank ? ' ' + namaBank(order.bank) : ''}`}</dd></div>
			<div class="flex justify-between gap-3"><dt class="font-bold text-slate-500">Status</dt><dd class="text-right font-black {order.dibayarPada ? 'text-primary-700' : batal ? 'text-slate-500' : 'text-amber-600'}">{order.dibayarPada ? 'Lunas' : batal ? 'Tidak dibayar' : 'Belum dibayar'}</dd></div>
			{#if order.dibayarPada}
				<div class="flex justify-between gap-3"><dt class="font-bold text-slate-500">Dibayar pada</dt><dd class="text-right font-black">{waktu(order.dibayarPada)}</dd></div>
			{/if}
			<div class="flex justify-between gap-3"><dt class="font-bold text-slate-500">Pengiriman</dt><dd class="text-right font-black">{order.pengiriman === 'ambil' ? 'Ambil di toko' : 'Diantar ke alamat'}</dd></div>
		</dl>
	</section>

	{@render aksi?.()}
</div>
