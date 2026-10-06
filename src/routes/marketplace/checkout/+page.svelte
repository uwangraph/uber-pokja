<script>
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { Button, EmptyState, Select, showToast } from '@khwarizmi/svelte-ui';
	import { ChevronLeft, MapPin, ShoppingBag } from 'lucide-svelte';
	import { rupiah } from '$lib/format.js';
	import { majelis } from '$lib/data.js';
	import { tokoState, tokoAktif, katalogToko } from '$lib/marketplace.svelte.js';
	import { kurangiStokMT } from '$lib/inventori.svelte.js';

	const produk = $derived(katalogToko(tokoState.majelisId));
	const toko = $derived(tokoAktif());
	let keranjang = $state({});
	let dipilih = $state({});
	let pembeli = $state({ nama: '', hp: '', alamat: '', rtRw: '', kelurahan: '', kecamatan: '', kota: '', provinsi: '', kodePos: '' });
	let pengiriman = $state('antar');
	let pembayaran = $state('transfer');
	const baris = $derived(produk.filter((p) => keranjang[p.id] && dipilih[p.id]).map((p) => ({ ...p, qty: keranjang[p.id] })));
	const total = $derived(baris.reduce((sum, p) => sum + p.qty * p.jual, 0));
	const profilLengkap = $derived(Boolean(pembeli.nama.trim() && pembeli.hp.trim() && pembeli.alamat.trim()));
	const alamatTampil = $derived([pembeli.alamat, pembeli.rtRw && `RT/RW ${pembeli.rtRw}`, pembeli.kelurahan, pembeli.kecamatan, pembeli.kota, pembeli.provinsi, pembeli.kodePos].filter(Boolean).join(', '));
	const visual = { 1: '🍚', 2: '🫙', 3: '🧂', 4: '🥚', 5: '🌾', 6: '🍜', 7: '🍵' };

	onMount(() => {
		try {
			keranjang = JSON.parse(localStorage.getItem('uber-pokja:marketplace:cart') ?? '{}');
			dipilih = JSON.parse(localStorage.getItem('uber-pokja:marketplace:selected') ?? '{}');
			pembeli = { ...pembeli, ...JSON.parse(localStorage.getItem('uber-pokja:marketplace:buyer') ?? '{}') };
		} catch {}
	});
	function buatPesanan() {
		if (!baris.length || !pembeli.nama.trim() || !pembeli.hp.trim() || !pembeli.alamat.trim()) { showToast({ tone: 'warning', title: 'Checkout belum lengkap', description: 'Lengkapi data pengiriman sebelum membuat pesanan.' }); return; }
		let pesanan = [];
		try { pesanan = JSON.parse(localStorage.getItem('uber-pokja:marketplace:orders') ?? '[]'); } catch {}

		// Produk di keranjang bisa berasal dari toko (MT) berbeda-beda saat mode
		// "semua toko" — pesanan dipecah per toko agar tiap MT hanya melihat
		// pesanan miliknya dan stok yang dikurangi tepat sasaran.
		const perToko = Map.groupBy(baris, (p) => p.majelisId ?? tokoState.majelisId);
		let urutan = 0;
		let orderPertama = null;
		for (const [majelisId, barisToko] of perToko) {
			const tokoNama = barisToko[0]?.tokoNama ?? toko?.nama ?? majelis.find((m) => m.id === majelisId)?.nama ?? '';
			const order = { id: 'MP-' + Date.now() + (urutan++), dibuatPada: new Date().toISOString(), majelisId, tokoNama, pembeli: { ...pembeli }, items: barisToko.map((p) => ({ id: p.id, nama: p.nama, qty: p.qty, satuan: p.satuan, harga: p.jual })), total: barisToko.reduce((s, p) => s + p.qty * p.jual, 0), pengiriman, pembayaran, status: pembayaran === 'tunai' ? 'Menunggu diproses' : 'Menunggu pembayaran' };
			pesanan.unshift(order);
			orderPertama ??= order;
			// Pesanan langsung mengurangi stok titipan MT (bukan stok Gudang Pusat).
			for (const p of barisToko) kurangiStokMT(majelisId, p.id, p.qty);
		}
		for (const p of baris) { delete keranjang[p.id]; delete dipilih[p.id]; }
		localStorage.setItem('uber-pokja:marketplace:orders', JSON.stringify(pesanan));
		localStorage.setItem('uber-pokja:marketplace:cart', JSON.stringify(keranjang));
		localStorage.setItem('uber-pokja:marketplace:selected', JSON.stringify(dipilih));
		localStorage.setItem('uber-pokja:marketplace:buyer', JSON.stringify(pembeli));
		goto(pembayaran === 'transfer' ? `/marketplace/pembayaran?id=${encodeURIComponent(orderPertama.id)}` : '/marketplace/pesanan');
	}
</script>

<svelte:head><title>Checkout · UBER Market</title></svelte:head>
<main class="min-h-dvh bg-[#faf9f5] px-4 py-5 text-slate-800 sm:px-6"><div class="mx-auto max-w-5xl">
	<a href="/marketplace/keranjang" class="inline-flex items-center gap-1.5 text-sm font-black text-primary-700"><ChevronLeft size={18} /> Kembali ke keranjang</a>
	<header class="mt-6"><p class="text-xs font-black tracking-widest text-primary-600 uppercase">Langkah terakhir</p><h1 class="mt-1 text-2xl font-black">Checkout</h1><p class="mt-1 text-sm font-medium text-slate-500">Lengkapi pengiriman dan metode pembayaran pesanan.</p></header>
	{#if baris.length}
		<div class="mt-7 grid gap-5 lg:grid-cols-[1fr_380px]">
			<div class="space-y-5">
				<section class="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
					<div class="flex items-start justify-between gap-3"><div><h2 class="font-black">Alamat pengiriman</h2><p class="mt-1 text-sm font-medium text-slate-500">Diambil otomatis dari Profil customer.</p></div><MapPin class="text-primary-700" size={20} /></div>
					{#if profilLengkap}
						<div class="mt-5 rounded-2xl bg-primary-50 p-4"><div class="flex items-start justify-between gap-3"><div><p class="font-black text-primary-950">{pembeli.nama} <span class="font-medium text-primary-700">· {pembeli.hp}</span></p><p class="mt-2 text-sm leading-6 font-medium text-primary-900">{alamatTampil}</p></div><a href="/marketplace/profil" class="shrink-0 text-sm font-black text-primary-700">Ubah</a></div></div>
					{:else}
						<div class="mt-5 rounded-2xl border border-dashed border-amber-300 bg-amber-50 p-4"><p class="font-black text-amber-950">Data penerima belum lengkap</p><p class="mt-1 text-sm font-medium text-amber-900">Lengkapi nama, nomor WhatsApp, dan alamat utama di Profil sebelum melanjutkan.</p><a href="/marketplace/profil" class="mt-3 inline-block text-sm font-black text-primary-700">Lengkapi profil →</a></div>
					{/if}
					<div class="mt-5"><Select label="Metode pengiriman" options={[{ value: 'antar', label: 'Diantar ke alamat' }, { value: 'ambil', label: 'Ambil di UBER POKJA' }]} bind:value={pengiriman} /></div>
				</section>
				<section class="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
					<div class="flex items-center justify-between border-b border-slate-100 px-5 py-4"><div><h2 class="font-black">Produk pesanan</h2><p class="mt-1 text-sm font-medium text-slate-500">Dijual dan diproses oleh UBER Market.</p></div><a href="/marketplace/keranjang" class="text-sm font-black text-primary-700">Ubah</a></div>
					{#each baris as p}
						<article class="flex gap-3 border-b border-slate-100 px-5 py-4 last:border-0"><span class="grid size-16 shrink-0 place-items-center rounded-2xl bg-primary-50 text-3xl">{visual[p.id] ?? '🛍️'}</span><div class="min-w-0 flex-1"><p class="font-black text-slate-800">{p.nama}</p><p class="num mt-1 text-sm font-bold text-slate-400">{rupiah(p.jual)} / {p.satuan}</p><div class="mt-3 flex justify-between gap-3 text-sm"><span class="font-bold text-slate-500">Jumlah: {p.qty}</span><strong class="num text-primary-800">{rupiah(p.qty * p.jual)}</strong></div></div></article>
					{/each}
					<div class="bg-slate-50 px-5 py-3 text-sm font-bold text-slate-500">Pengiriman: <span class="text-slate-800">{pengiriman === 'antar' ? 'Diantar ke alamat' : 'Ambil di UBER POKJA'}</span></div>
				</section>
				<section class="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><h2 class="font-black">Metode pembayaran</h2><div class="mt-4"><Select label="Pilih pembayaran" options={[{ value: 'transfer', label: 'Transfer bank' }, { value: 'tunai', label: 'Tunai saat pengambilan' }]} bind:value={pembayaran} /></div>{#if pembayaran === 'tunai'}<p class="mt-4 rounded-xl bg-emerald-50 px-3 py-3 text-sm font-bold text-emerald-900">Bayar tunai saat mengambil pesanan di UBER POKJA.</p>{:else}<p class="mt-4 rounded-xl bg-amber-50 px-3 py-3 text-sm font-bold text-amber-900">Instruksi rekening dan konfirmasi pembayaran tersedia melalui Chat bantuan setelah pesanan dibuat.</p>{/if}</section>
			</div>
			<section class="h-fit rounded-3xl border border-slate-200 bg-white p-5 shadow-sm lg:sticky lg:top-5"><h2 class="font-black">Ringkasan pembayaran</h2><p class="mt-1 text-sm font-medium text-slate-500">Pastikan pesanan sudah benar.</p><div class="mt-5 flex justify-between border-t border-slate-200 pt-4"><span class="font-bold text-slate-500">Total produk</span><strong class="num text-xl font-black text-primary-800">{rupiah(total)}</strong></div><p class="mt-2 text-xs font-bold text-slate-400">Biaya pengiriman akan dikonfirmasi sesuai alamat atau metode pengambilan.</p><Button fullWidth size="lg" class="mt-5" onclick={buatPesanan}><ShoppingBag size={17} /> Buat pesanan</Button></section>
		</div>
	{:else}<div class="mt-12"><EmptyState icon={MapPin} title="Belum ada produk untuk checkout" description="Pilih produk di Keranjang terlebih dahulu." /><div class="mt-4 text-center"><Button onclick={() => goto('/marketplace/keranjang')}>Buka keranjang</Button></div></div>{/if}
</div></main>
