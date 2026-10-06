<script>
	import { Button, Card, Select, DatePicker, ToggleGroup, EmptyState, Table, showToast } from '@khwarizmi/svelte-ui';
	import { ShoppingCart, SearchX } from 'lucide-svelte';
	import PageHeader from '$lib/components/PageHeader.svelte';
	import Badge from '$lib/components/Badge.svelte';
	import Icon from '$lib/components/Icon.svelte';
	import Tabs from '$lib/components/Tabs.svelte';
	import Search from '$lib/components/Search.svelte';
	import Toolbar from '$lib/components/Toolbar.svelte';
	import Avatar from '$lib/components/Avatar.svelte';
	import { produk as dataProduk, majelis, penjualan as dataPenjualan } from '$lib/data.js';
	import { rupiah, tanggal } from '$lib/format.js';
	import { browser } from '$app/environment';
	import { bolehKelola } from '$lib/data.js';

	let tab = $state('baru');
	let role = $state('');
	let riwayatDimuat = $state(false);
	const kelolaPenjualan = $derived(bolehKelola(role, 'penjualan'));
	const pemasaran = $derived(role === 'pemasaran');
	const gudang = $derived(role === 'gudang');
	const keuangan = $derived(role === 'keuangan');

	// Buka tab tertentu lewat URL, mis. /penjualan?tab=riwayat
	$effect(() => {
		if (new URLSearchParams(location.search).get('tab') === 'riwayat') tab = 'riwayat';
	});
	let pembeli = $state('1');
	let tgl = $state('2026-09-25');
	let cari = $state('');
	// Salinan lokal agar stok dan riwayat langsung berubah setelah transaksi disimpan.
	let produk = $state(dataProduk.map((p) => ({ ...p })));
	let penjualan = $state(dataPenjualan.map((t) => ({ ...t })));
	$effect(() => {
		if (!browser || riwayatDimuat) return;
		role = JSON.parse(localStorage.getItem('user') ?? '{}').role ?? '';
		try {
			const tersimpan = JSON.parse(localStorage.getItem('uber-pokja:penjualan') ?? '[]');
			if (Array.isArray(tersimpan) && tersimpan.length) penjualan = tersimpan;
		} catch {}
		riwayatDimuat = true;
	});
	function simpanRiwayat() {
		if (browser) localStorage.setItem('uber-pokja:penjualan', JSON.stringify(penjualan));
	}
	let keranjang = $state({}); // id produk -> qty
	let status = $state('Lunas');
	let filter = $state('semua');
	let cariRiwayat = $state('');

	const opsiPembeli = [...majelis.map((m) => ({ value: String(m.id), label: m.nama })), { value: 'umum', label: 'Umum (non-anggota)' }];
	const tersedia = $derived(produk.filter((p) => p.nama.toLowerCase().includes(cari.toLowerCase())));
	const baris = $derived(produk.filter((p) => keranjang[p.id]).map((p) => ({ ...p, qty: keranjang[p.id] })));
	const total = $derived(baris.reduce((s, b) => s + b.qty * b.jual, 0));
	const jumlahItem = $derived(baris.reduce((s, b) => s + b.qty, 0));
	const keteranganBayar = $derived(status === 'Lunas' ? 'Pembayaran diterima penuh.' : 'Transaksi dicatat sebagai piutang.');
	const riwayat = $derived(
		penjualan.filter(
			(t) => (filter === 'semua' || t.status === filter) && (t.pembeli + ' ' + t.no).toLowerCase().includes(cariRiwayat.toLowerCase())
		)
	);

	function ubah(p, d) {
		const q = Math.min(p.stok, Math.max(0, (keranjang[p.id] ?? 0) + d));
		if (q === 0) delete keranjang[p.id];
		else keranjang[p.id] = q;
	}

	function simpan() {
		if (!baris.length) return;

		const pilihanPembeli = opsiPembeli.find((o) => o.value === pembeli);
		const nama = pembeli === 'umum' ? 'Umum' : pilihanPembeli?.label ?? 'Pembeli';
		const nomorTerakhir = Math.max(...penjualan.map((t) => Number(t.no.replace(/\D/g, ''))));
		const transaksi = {
			no: `PJ-${String(nomorTerakhir + 1).padStart(4, '0')}`,
			tgl,
			pembeli: nama,
			item: jumlahItem,
			total,
			status: pemasaran ? 'Menunggu diproses' : status,
			barang: baris.map((b) => ({ id: b.id, nama: b.nama, qty: b.qty }))
		};
		penjualan.unshift(transaksi);
		// Pesanan Pemasaran hanya dicatat. Stok berkurang nanti, ketika Gudang
		// mengonfirmasi barang sudah diserahkan.
		if (!pemasaran) {
			for (const barisKeranjang of baris) produk.find((item) => item.id === barisKeranjang.id).stok -= barisKeranjang.qty;
		}
		simpanRiwayat();
		showToast({ tone: 'success', title: pemasaran ? 'Pesanan dicatat' : 'Transaksi tersimpan', description: pemasaran ? `${transaksi.no} menunggu diproses Gudang.` : `${transaksi.no} · ${nama} · ${rupiah(total)}` });
		keranjang = {};
		tab = 'riwayat';
	}

	function serahkan(t) {
		for (const b of t.barang ?? []) {
			const p = produk.find((item) => item.id === b.id);
			if (p) p.stok = Math.max(0, p.stok - b.qty);
		}
		t.status = 'Menunggu pembayaran';
		simpanRiwayat();
		showToast({ tone: 'success', title: 'Barang diserahkan', description: `${t.no}: stok sudah dikurangi, menunggu verifikasi Keuangan.` });
	}
	function verifikasi(t) {
		t.status = 'Lunas';
		simpanRiwayat();
		showToast({ tone: 'success', title: 'Pembayaran diverifikasi', description: `${t.no} sudah masuk ke saldo kas.` });
	}
	const tone = { Lunas: 'green', 'Belum bayar': 'red', 'Menunggu diproses': 'gray', 'Menunggu pembayaran': 'amber' };
	const hitung = (s) => penjualan.filter((t) => t.status === s).length;
	const kolom = [
		{ key: 'pembeli', label: 'Pembeli' },
		{ key: 'tgl', label: 'Tanggal' },
		{ key: 'item', label: 'Item', align: 'right' },
		{ key: 'total', label: 'Total', align: 'right' },
		{ key: 'status', label: 'Status' },
		{ key: 'aksi', label: 'Aksi', align: 'right' }
	];
</script>

<svelte:head><title>Penjualan · UBER POKJA</title></svelte:head>

<PageHeader eyebrow="Transaksi" title="Penjualan" subtitle={pemasaran ? 'Catat pesanan. Stok berkurang setelah Gudang menyerahkan barang.' : 'Pantau pesanan, penyerahan barang, dan pembayaran.'} />

{#if kelolaPenjualan}
	<div class="mb-5">
		<Tabs
			bind:value={tab}
			ariaLabel="Mode penjualan"
			items={[
				{ value: 'baru', label: pemasaran ? 'Pesanan baru' : 'Transaksi baru' },
				{ value: 'riwayat', label: 'Riwayat', count: penjualan.length }
			]}
		/>
	</div>
{:else}
	<div class="mb-5"><h2 class="font-black">Riwayat transaksi</h2></div>
{/if}

{#if tab === 'baru' && kelolaPenjualan}
	<div class="grid gap-5 pb-20 lg:grid-cols-[1fr_380px] lg:pb-0">
		<!-- Pilih produk -->
		<Card padding="none" class="@container p-4 sm:p-5">
			<div class="flex flex-wrap items-center justify-between gap-3">
				<div>
					<p class="text-xs font-black tracking-widest text-primary-600 uppercase">Langkah 1</p>
					<h2 class="mt-0.5 font-black">Pilih produk</h2>
				</div>
				<Search bind:value={cari} placeholder="Cari produk…" class="w-full @md:w-64" />
			</div>
			<p class="mt-2 text-sm font-bold text-slate-400">Tekan tambah, lalu atur jumlahnya sesuai pesanan.</p>

			<!-- Jumlah kolom mengikuti lebar area produk, bukan lebar layar -->
			{#if tersedia.length}
				<ul class="mt-4 grid gap-3 @lg:grid-cols-2 @3xl:grid-cols-3">
					{#each tersedia as p (p.id)}
						{@const qty = keranjang[p.id] ?? 0}
						{@const habis = p.stok === 0}
						<li
							class="flex flex-col rounded-2xl border p-4 transition {qty
								? 'border-primary-400 bg-primary-50 shadow-[0_3px_0_0_var(--primary-300)]'
								: 'border-slate-200 bg-white shadow-[0_3px_0_0_#E2E8F0]'} {habis ? 'opacity-55' : ''}"
						>
							<p class="text-sm leading-snug font-black text-slate-800">{p.nama}</p>
							<div class="mt-1.5 flex flex-1 flex-wrap items-start gap-x-2 gap-y-1">
								<p class="num text-xs leading-5 font-bold text-slate-400">Stok {p.stok} {p.satuan}</p>
								{#if habis}<Badge tone="red">Habis</Badge>{:else if p.stok <= p.min}<Badge tone="amber">Menipis</Badge>{/if}
							</div>
							<p class="num mt-3 text-base font-black whitespace-nowrap">{rupiah(p.jual)}</p>
							<div class="mt-3">
								{#if qty}
									<div class="flex items-center justify-between gap-1 rounded-2xl border border-slate-200 bg-white p-1">
										<Button variant="ghost" size="icon-sm" aria-label="Kurangi {p.nama}" onclick={() => ubah(p, -1)}><Icon name="minus" class="size-4" strokeWidth={3} /></Button>
										<span class="num text-sm font-black">{qty} <span class="font-bold text-slate-400">{p.satuan}</span></span>
										<Button size="icon-sm" aria-label="Tambah {p.nama}" disabled={qty >= p.stok} onclick={() => ubah(p, 1)}><Icon name="plus" class="size-4" strokeWidth={3} /></Button>
									</div>
								{:else}
									<Button variant="outline" size="sm" fullWidth disabled={habis} onclick={() => ubah(p, 1)} aria-label="Tambah {p.nama}">
										<Icon name="plus" class="size-4" strokeWidth={3} /> Tambah
									</Button>
								{/if}
							</div>
						</li>
					{/each}
				</ul>
			{:else}
				<EmptyState class="mt-4" icon={SearchX} title="Produk tidak ditemukan" description={`Tidak ada produk yang cocok dengan "${cari}".`} />
			{/if}
		</Card>

		<!-- Ringkasan -->
		<Card padding="none" class="h-fit overflow-hidden lg:sticky lg:top-24">
			<div id="ringkasan" class="space-y-4 p-5">
				<div>
					<p class="text-xs font-black tracking-widest text-primary-600 uppercase">Langkah 2</p>
					<h2 class="mt-0.5 font-black">{pemasaran ? 'Detail pesanan' : 'Detail transaksi'}</h2>
				</div>
				<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
					<Select label="Pembeli" options={opsiPembeli} bind:value={pembeli} />
					<DatePicker label="Tanggal" bind:value={tgl} />
				</div>
			</div>

			<div class="border-t border-slate-200 bg-slate-50 p-5">
				<div class="flex items-center justify-between">
					<div>
						<p class="text-xs font-black tracking-widest text-primary-600 uppercase">Langkah 3</p>
						<h2 class="mt-0.5 font-black">Keranjang</h2>
					</div>
					<span class="num text-xs font-black text-slate-500">{jumlahItem} item</span>
				</div>
				{#if baris.length === 0}
					<div class="mt-3 flex flex-col items-center rounded-2xl border border-dashed border-slate-300 p-5 text-center">
						<ShoppingCart size={22} strokeWidth={2} class="text-slate-300" />
						<p class="mt-2 text-sm font-bold text-slate-400">Belum ada produk dipilih.</p>
					</div>
				{:else}
					<ul class="mt-3 space-y-2 text-sm">
						{#each baris as b}
							<li class="rounded-xl border border-slate-200 bg-white p-3">
								<div class="flex items-start justify-between gap-3">
									<p class="min-w-0 truncate font-black text-slate-700">{b.nama}</p>
									<span class="num shrink-0 font-black">{rupiah(b.qty * b.jual)}</span>
								</div>
								<div class="mt-2 flex items-center justify-between">
									<div class="flex items-center rounded-xl border border-slate-200">
										<Button variant="ghost" size="icon-sm" aria-label="Kurangi {b.nama}" onclick={() => ubah(b, -1)}><Icon name="minus" class="size-3.5" strokeWidth={3} /></Button>
										<span class="num min-w-8 text-center text-xs font-black">{b.qty}</span>
										<Button variant="ghost" size="icon-sm" aria-label="Tambah {b.nama}" disabled={b.qty >= b.stok} onclick={() => ubah(b, 1)}><Icon name="plus" class="size-3.5" strokeWidth={3} /></Button>
									</div>
									<span class="text-xs font-bold text-slate-400">{rupiah(b.jual)} / {b.satuan}</span>
								</div>
							</li>
						{/each}
					</ul>
				{/if}
				<div class="mt-4 flex items-baseline justify-between border-t border-slate-200 pt-4">
					<span class="text-sm font-bold text-slate-400">Total</span>
					<span class="num text-2xl font-black tracking-tight">{rupiah(total)}</span>
				</div>
			</div>

			<div class="space-y-3 border-t border-slate-200 p-5">
				{#if !pemasaran}<div>
					<p class="text-xs font-black tracking-widest text-primary-600 uppercase">Langkah 4</p>
					<h2 class="mt-0.5 font-black">Pembayaran</h2>
					<p class="mt-1 text-sm font-bold text-slate-400">{keteranganBayar}</p>
				</div>{/if}
				{#if !pemasaran}<ToggleGroup
					bind:value={status}
					size="sm"
				class="toggle-penuh w-full"
					items={[
						{ value: 'Lunas', label: 'Lunas' },
						{ value: 'Belum bayar', label: 'Belum bayar' }
					]}
				/>{/if}
				<p class="flex items-center gap-1.5 text-xs font-bold text-slate-400"><Icon name="info" class="size-3.5" /> {pemasaran ? 'Stok berkurang setelah Gudang menyerahkan barang.' : 'Penjualan langsung langsung mengurangi stok.'}</p>
				<Button fullWidth size="lg" class="mt-2" disabled={!baris.length} onclick={simpan}><Icon name="check" class="size-4" strokeWidth={3} /> {pemasaran ? 'Simpan pesanan' : 'Simpan transaksi'}</Button>
			</div>
		</Card>
	</div>

	<!-- Bar total (HP) -->
	{#if baris.length}
		<div class="fixed inset-x-3 bottom-[calc(4.5rem+env(safe-area-inset-bottom))] z-20 flex items-center justify-between gap-3 rounded-2xl border border-brand-900 bg-brand-800 p-3 pl-4 text-white shadow-pop lg:hidden">
			<div class="leading-tight">
				<p class="num text-xs font-bold text-brand-100">{jumlahItem} item</p>
				<p class="num font-black">{rupiah(total)}</p>
			</div>
			<Button variant="warning" size="sm" onclick={() => document.getElementById('ringkasan')?.scrollIntoView({ behavior: 'smooth' })}>Lanjut bayar</Button>
		</div>
	{/if}
{:else}
	{#snippet sel(row, col)}
		{#if col.key === 'pembeli'}
			<div class="flex items-center gap-3">
				<Avatar nama={row.pembeli} size="size-8" />
				<div><p class="font-black text-slate-800">{row.pembeli}</p><p class="text-xs font-bold text-slate-400">{row.no}</p></div>
			</div>
		{:else if col.key === 'tgl'}
			<span class="whitespace-nowrap text-slate-500">{tanggal(row.tgl)}</span>
		{:else if col.key === 'item'}
			<span class="num">{row.item}</span>
		{:else if col.key === 'total'}
			<span class="num font-black whitespace-nowrap">{rupiah(row.total)}</span>
		{:else if col.key === 'status'}
			<Badge tone={tone[row.status]}>{row.status}</Badge>
		{:else if row.status === 'Menunggu diproses' && (gudang || role === 'admin')}
			<Button variant="outline" size="xs" onclick={() => serahkan(row)}>Serahkan barang</Button>
		{:else if row.status === 'Menunggu pembayaran' && (keuangan || role === 'admin')}
			<Button variant="outline" size="xs" onclick={() => verifikasi(row)}>Verifikasi bayar</Button>
		{:else}<span class="text-slate-300">–</span>
		{/if}
	{/snippet}

	<Toolbar>
		{#snippet search()}
			<Search bind:value={cariRiwayat} id="cari-riwayat" placeholder="Cari pembeli atau no…" />
		{/snippet}
		{#snippet filters()}
			<Tabs
				bind:value={filter}
				ariaLabel="Filter status pembayaran"
				items={[
					{ value: 'semua', label: 'Semua', count: penjualan.length },
					{ value: 'Lunas', label: 'Lunas', count: hitung('Lunas') },
					{ value: 'Belum bayar', label: 'Belum bayar', count: hitung('Belum bayar') }
				]}
			/>
		{/snippet}
		{#snippet action()}
			<Button variant="outline" onclick={() => showToast({ tone: 'info', title: 'Mengunduh riwayat', description: 'Riwayat penjualan September 2026 (.xlsx)' })}>
				<Icon name="download" class="size-4" /> Unduh
			</Button>
		{/snippet}
	</Toolbar>

	<div class="hidden md:block">
		<Table columns={kolom} rows={riwayat} cell={sel} pageSize={10} emptyText="Tidak ada transaksi yang cocok." />
	</div>
	<Card padding="none" class="overflow-hidden md:hidden">
		<ul class="divide-y divide-slate-100">
			{#each riwayat as t}
				<li class="flex items-center gap-3 px-4 py-3.5">
					<Avatar nama={t.pembeli} />
					<div class="min-w-0 flex-1">
						<p class="truncate text-sm font-black">{t.pembeli}</p>
						<p class="text-xs font-bold text-muted">{t.no} · {tanggal(t.tgl)}</p>
					</div>
					<div class="flex flex-col items-end gap-1">
						<p class="num text-sm font-black">{rupiah(t.total)}</p>
						<Badge tone={tone[t.status]}>{t.status}</Badge>
						{#if t.status === 'Menunggu diproses' && (gudang || role === 'admin')}<Button variant="outline" size="xs" onclick={() => serahkan(t)}>Serahkan</Button>{/if}
						{#if t.status === 'Menunggu pembayaran' && (keuangan || role === 'admin')}<Button variant="outline" size="xs" onclick={() => verifikasi(t)}>Verifikasi</Button>{/if}
					</div>
				</li>
			{/each}
		</ul>
	</Card>
{/if}

<style>
	/* ToggleGroup satu baris penuh: tiap pilihan sama lebar, tidak turun baris */
	:global(.toggle-penuh) {
		flex-wrap: nowrap;
	}
	:global(.toggle-penuh > button) {
		flex: 1 1 0;
		min-width: 0;
		padding-inline: 0.5rem;
		white-space: nowrap;
	}
</style>
