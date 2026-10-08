<script>
	// Simulasi pembayaran transfer bank (virtual account). Tidak terhubung ke bank;
	// tombol "Simulasikan" mengubah status pesanan di localStorage.
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { Accordion, Alert, Button, EmptyState, showToast } from '@khwarizmi/svelte-ui';
	import { CheckCircle2, ChevronLeft, Clock, Copy, CreditCard, XCircle } from 'lucide-svelte';
	import { rupiah } from '$lib/format.js';
	import { bankVA, nomorVA, ubahPesanan, BATAS_BAYAR_MENIT } from '$lib/pembayaran.js';

	let order = $state(null);
	let bank = $state('bca');
	let sekarang = $state(Date.now());
	const batas = $derived(order ? new Date(order.dibuatPada).getTime() + BATAS_BAYAR_MENIT * 60_000 : 0);
	const sisa = $derived(Math.max(0, Math.floor((batas - sekarang) / 1000)));
	const waktu = $derived(`${String(Math.floor(sisa / 60)).padStart(2, '0')}:${String(sisa % 60).padStart(2, '0')}`);
	const bankAktif = $derived(bankVA.find((b) => b.id === bank));
	const va = $derived(order ? nomorVA(bankAktif, order.id) : '');
	const lunas = $derived(order?.status !== 'Menunggu pembayaran');

	onMount(() => {
		const id = page.url.searchParams.get('id');
		try { order = JSON.parse(localStorage.getItem('uber-pokja:marketplace:orders') ?? '[]').find((p) => p.id === id) ?? null; } catch {}
		if (order?.bank) bank = order.bank;
		const timer = setInterval(() => (sekarang = Date.now()), 1000);
		return () => clearInterval(timer);
	});
	// Waktu habis -> pesanan otomatis dibatalkan (simulasi).
	$effect(() => {
		if (order && !lunas && sisa === 0) {
			order = ubahPesanan(order.id, { status: 'Dibatalkan', alasanBatal: 'Batas waktu pembayaran habis' });
		}
	});

	function salin() {
		navigator.clipboard?.writeText(va.replace(/\s/g, ''));
		showToast({ tone: 'success', title: 'Nomor disalin', description: `Nomor VA ${bankAktif.nama} disalin.` });
	}
	function bayar() {
		ubahPesanan(order.id, { status: 'Menunggu diproses', bank, dibayarPada: new Date().toISOString() });
		showToast({ tone: 'success', title: 'Pembayaran berhasil', description: `${rupiah(order.total)} via VA ${bankAktif.nama}. Pesanan diteruskan ke Gudang.` });
		goto('/marketplace/pesanan');
	}
	function batalkan() {
		order = ubahPesanan(order.id, { status: 'Dibatalkan', alasanBatal: 'Dibatalkan pembeli' });
		showToast({ tone: 'info', title: 'Pesanan dibatalkan', description: 'Stok dikembalikan ke toko.' });
	}
</script>

<svelte:head><title>Pembayaran · UBER Market</title></svelte:head>
<main class="px-4 py-5 text-slate-800 sm:px-6"><div class="mx-auto max-w-md">
	<a href="/marketplace/pesanan" class="inline-flex items-center gap-1.5 text-sm font-black text-primary-700"><ChevronLeft size={18} /> Kembali ke pesanan</a>
	{#if order}
		<header class="mt-6 text-center">
			<span class="mx-auto grid size-14 place-items-center rounded-2xl bg-primary-100 text-primary-700"><CreditCard size={26} /></span>
			<p class="mt-4 text-xs font-black tracking-widest text-primary-700 uppercase">UBER Pay · Simulasi</p>
			<h1 class="mt-1 text-2xl font-black">{order.status === 'Dibatalkan' ? 'Pesanan dibatalkan' : lunas ? 'Pembayaran diterima' : 'Selesaikan pembayaran'}</h1>
			<p class="mt-2 text-sm font-medium text-slate-500">Pesanan {order.id}</p>
		</header>

		<section class="mt-6 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
			<div class="bg-primary-800 px-5 py-4 text-white">
				<p class="text-xs font-bold text-primary-100">Total pembayaran</p>
				<p class="num mt-1 text-3xl font-black">{rupiah(order.total)}</p>
			</div>

			<div class="space-y-5 p-5">
				{#if order.status === 'Dibatalkan'}
					<Alert tone="danger" title="Pesanan dibatalkan">{order.alasanBatal ?? 'Pesanan tidak dilanjutkan.'}</Alert>
					<Button fullWidth onclick={() => goto('/marketplace')}>Belanja lagi</Button>
				{:else if lunas}
					<Alert tone="success" title="Lunas">Dibayar via VA {bankVA.find((b) => b.id === order.bank)?.nama ?? ''}. Pesanan sedang diproses Gudang.</Alert>
					<Button fullWidth onclick={() => goto('/marketplace/pesanan')}>Lihat pesanan</Button>
				{:else}
					<div>
						<p class="mb-2 text-sm font-black">Pilih bank</p>
						<div class="grid grid-cols-4 gap-2">
							{#each bankVA as b}
								<Button size="sm" variant={bank === b.id ? 'default' : 'outline'} onclick={() => (bank = b.id)}>{b.nama}</Button>
							{/each}
						</div>
					</div>

					<div class="rounded-2xl border border-dashed border-primary-300 bg-primary-50 p-4">
						<p class="text-xs font-black tracking-widest text-primary-700 uppercase">Virtual account {bankAktif.nama}</p>
						<div class="mt-2 flex items-center justify-between gap-2">
							<strong class="num text-xl tracking-wider text-primary-950">{va}</strong>
							<Button variant="outline" size="icon" onclick={salin} aria-label="Salin nomor"><Copy size={17} /></Button>
						</div>
						<p class="mt-1 text-xs font-bold text-primary-800">a.n. UBER POKJA Tenjolaya</p>
					</div>

					<div class="flex items-center justify-between text-sm">
						<span class="flex items-center gap-1.5 font-bold text-slate-500"><Clock size={16} /> Bayar sebelum</span>
						<strong class="num {sisa < 300 ? 'text-red-600' : 'text-slate-800'}">{waktu}</strong>
					</div>

					<Accordion
						items={[
							{ value: 'mbanking', title: `m-Banking ${bankAktif.nama}`, content: `Buka aplikasi ${bankAktif.nama} → Transfer → Virtual Account → masukkan ${va.replace(/\s/g, '')} → periksa nama & nominal ${rupiah(order.total)} → konfirmasi dengan PIN.` },
							{ value: 'atm', title: `ATM ${bankAktif.nama}`, content: `Masukkan kartu & PIN → Transaksi lainnya → Transfer → Virtual Account → masukkan ${va.replace(/\s/g, '')} → konfirmasi.` },
							{ value: 'lain', title: 'Dari bank lain', content: `Pilih Transfer antarbank → kode bank ${bankAktif.kode} → nomor ${va.replace(/\s/g, '')} → nominal ${rupiah(order.total)}.` }
						]}
					/>

					<Alert tone="warning" title="Mode simulasi">Tidak ada uang yang benar-benar ditransfer. Gunakan tombol di bawah untuk mencoba alurnya.</Alert>

					<div class="grid gap-2">
						<Button fullWidth size="lg" onclick={bayar}><CheckCircle2 size={18} /> Simulasikan pembayaran berhasil</Button>
						<Button fullWidth variant="outline" onclick={batalkan}><XCircle size={17} /> Batalkan pesanan</Button>
					</div>
				{/if}
			</div>
		</section>
	{:else}
		<div class="mt-16"><EmptyState title="Pesanan tidak ditemukan" description="Kembali ke halaman Pesanan untuk memilih pesanan yang valid." /></div>
	{/if}
</div></main>
