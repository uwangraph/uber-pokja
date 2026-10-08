<script>
	import { Button, Card, Modal, Select, DatePicker, Input, NumberInput, Table, showToast } from '@khwarizmi/svelte-ui';
	import PageHeader from '$lib/components/PageHeader.svelte';
	import Search from '$lib/components/Search.svelte';
	import Tabs from '$lib/components/Tabs.svelte';
	import Toolbar from '$lib/components/Toolbar.svelte';
	import Badge from '$lib/components/Badge.svelte';
	import Icon from '$lib/components/Icon.svelte';
	import Stat from '$lib/components/Stat.svelte';
	import Avatar from '$lib/components/Avatar.svelte';
	import { pembelian as dataPembelian, supplier, produk } from '$lib/data.js';
	import { rupiah, tanggal } from '$lib/format.js';
	import { browser } from '$app/environment';
	import { bolehKelola } from '$lib/data.js';

	// Salinan lokal supaya aksi "Terima barang" terlihat di mockup
	let pembelian = $state(dataPembelian.map((b) => ({ ...b })));

	let formOpen = $state(false);
	let role = $state('');
	const kelola = $derived(bolehKelola(role, 'pembelian'));
	$effect(() => {
		if (browser) role = JSON.parse(localStorage.getItem('user') ?? '{}').role ?? '';
	});
	let cari = $state('');
	let filter = $state('semua');
	const daftar = $derived(
		pembelian.filter(
			(b) =>
				(filter === 'semua' || (filter === 'belum' ? b.bayar !== 'Lunas' : b.status === filter)) &&
				(b.supplier + ' ' + b.no).toLowerCase().includes(cari.toLowerCase())
		)
	);
	let sup = $state(supplier[0].nama);
	let tgl = $state('2026-09-25');
	let bayar = $state('Lunas');
	let items = $state([{ produk: '1', qty: 10, harga: String(produk[0].beli) }]);
	const total = $derived(items.reduce((s, i) => s + i.qty * (+i.harga || 0), 0));

	const totalBeli = $derived(pembelian.reduce((s, b) => s + b.total, 0));
	const belumLunas = $derived(pembelian.filter((b) => b.bayar !== 'Lunas'));
	const menunggu = $derived(pembelian.filter((b) => b.status === 'Dipesan').length);

	const opsiSupplier = supplier.map((s) => ({ value: s.nama, label: s.nama }));
	const opsiProduk = produk.map((p) => ({ value: String(p.id), label: p.nama }));

	function isiHarga(it) {
		it.harga = String(produk.find((p) => String(p.id) === it.produk)?.beli ?? 0);
	}
	function bukaPembelian() {
		formOpen = true;
	}
	function simpan() {
		showToast({ tone: 'success', title: 'Pembelian tersimpan', description: `${sup} · ${rupiah(total)}` });
		items = [{ produk: '1', qty: 10, harga: String(produk[0].beli) }];
		formOpen = false;
	}
	function terima(b) {
		b.status = 'Diterima';
		showToast({ tone: 'success', title: 'Barang diterima', description: `${b.no} · stok otomatis bertambah` });
	}

	const kolom = [
		{ key: 'supplier', label: 'Supplier' },
		{ key: 'tgl', label: 'Tanggal' },
		{ key: 'total', label: 'Total', align: 'right' },
		{ key: 'status', label: 'Barang' },
		{ key: 'bayar', label: 'Bayar' },
		{ key: 'aksi', label: 'Aksi', align: 'right' }
	];
</script>

<svelte:head><title>Pembelian · UBER POKJA</title></svelte:head>

<PageHeader eyebrow="Transaksi" title="Pembelian" subtitle="Pengadaan barang dari supplier." />

<div class="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
	<Stat label="Pembelian bulan ini" value={rupiah(totalBeli)} hint="{pembelian.length} faktur" icon="receipt" />
	<Stat label="Menunggu diterima" value="{menunggu} faktur" hint="Barang belum datang" icon="truck" tone="gray" />
	<div class="sm:col-span-2 lg:col-span-1">
		<Stat label="Utang ke supplier" value={rupiah(belumLunas.reduce((s, b) => s + b.total, 0))} hint="{belumLunas.length} faktur belum lunas" icon="coins" tone="gold" />
	</div>
</div>



{#snippet sel(row, col)}
	{#if col.key === 'supplier'}
		<div class="flex items-center gap-3">
			<Avatar nama={row.supplier} size="size-8" />
			<div><p class="font-black whitespace-nowrap text-slate-800">{row.supplier}</p><p class="text-xs font-bold text-slate-400">{row.no}</p></div>
		</div>
	{:else if col.key === 'tgl'}
		<span class="whitespace-nowrap text-slate-500">{tanggal(row.tgl)}</span>
	{:else if col.key === 'total'}
		<span class="num font-black whitespace-nowrap">{rupiah(row.total)}</span>
	{:else if col.key === 'status'}
		<Badge tone={row.status === 'Diterima' ? 'green' : 'gray'}>{row.status}</Badge>
	{:else if col.key === 'bayar'}
		<Badge tone={row.bayar === 'Lunas' ? 'green' : 'amber'}>{row.bayar}</Badge>
	{:else if row.status === 'Dipesan' && kelola}
		<Button variant="outline" size="xs" onclick={() => terima(row)}>Terima barang</Button>
	{:else}
		<span class="text-slate-300" aria-label="Tidak ada aksi">–</span>
	{/if}
{/snippet}

<section class="mt-8">
	<h2 class="mb-3 text-lg font-black">Daftar pembelian</h2>
	<Toolbar>
		{#snippet search()}
			<Search bind:value={cari} placeholder="Cari supplier atau no…" />
		{/snippet}
		{#snippet filters()}
			<Tabs
				bind:value={filter}
				ariaLabel="Filter status pembelian"
				items={[
					{ value: 'semua', label: 'Semua', count: pembelian.length },
					{ value: 'Dipesan', label: 'Dipesan', count: pembelian.filter((b) => b.status === 'Dipesan').length },
					{ value: 'Diterima', label: 'Diterima', count: pembelian.filter((b) => b.status === 'Diterima').length },
					{ value: 'belum', label: 'Belum lunas', count: belumLunas.length }
				]}
			/>
		{/snippet}
		{#snippet action()}
			{#if kelola}<Button onclick={bukaPembelian}>
				<Icon name="plus" class="size-4" strokeWidth={3} />
				<span class="hidden xl:inline">Pembelian baru</span>
				<span class="xl:hidden">Baru</span>
			</Button>{/if}
		{/snippet}
	</Toolbar>

	{#if kelola}<Modal bind:open={formOpen} title="Pembelian baru" description="Stok bertambah otomatis saat barang ditandai diterima." size="lg">
			<div class="max-h-[65svh] overflow-y-auto overscroll-contain pr-1">
				<div class="grid grid-cols-2 gap-4 sm:grid-cols-3">
					<div class="col-span-2 sm:col-span-1"><Select label="Supplier" options={opsiSupplier} bind:value={sup} /></div>
					<DatePicker label="Tanggal" bind:value={tgl} />
					<Select label="Pembayaran" options={[{ value: 'Lunas', label: 'Lunas' }, { value: 'Tempo', label: 'Tempo / belum lunas' }]} bind:value={bayar} />
				</div>
	
				<p class="mt-6 mb-2 ml-1 text-xs font-black tracking-widest text-slate-400 uppercase">Barang</p>
				<div class="space-y-3">
					{#each items as it, i}
						<div class="grid items-end gap-3 rounded-2xl border border-slate-200 bg-slate-50/60 p-3 sm:grid-cols-[1fr_130px_170px_auto]">
							<Select label="Produk" options={opsiProduk} bind:value={it.produk} onChange={() => isiHarga(it)} />
							<NumberInput label="Qty" min={1} bind:value={it.qty} />
							<Input label="Harga satuan" prefix="Rp" inputmode="numeric" bind:value={it.harga} />
							<div class="flex items-center justify-between gap-3 sm:flex-col sm:items-end sm:justify-end sm:pb-1">
								<span class="num text-sm font-black whitespace-nowrap">{rupiah(it.qty * (+it.harga || 0))}</span>
								<Button variant="ghost" size="icon-sm" aria-label="Hapus baris {i + 1}" disabled={items.length === 1} onclick={() => items.splice(i, 1)}>
									<Icon name="trash" class="size-4" />
								</Button>
							</div>
						</div>
					{/each}
				</div>
				<Button variant="outline" size="sm" class="mt-3" onclick={() => items.push({ produk: '1', qty: 1, harga: String(produk[0].beli) })}>
					<Icon name="plus" class="size-4" strokeWidth={3} /> Tambah barang
				</Button>
			</div>
			{#snippet footer()}
				<div class="flex w-full flex-wrap items-center justify-between gap-3">
					<p class="text-sm font-bold text-slate-400">Total <span class="num ml-2 text-xl font-black text-ink">{rupiah(total)}</span></p>
					<div class="flex gap-2">
						<Button variant="outline" onclick={() => (formOpen = false)}>Batal</Button>
						<Button onclick={simpan}>Simpan pembelian</Button>
					</div>
				</div>
			{/snippet}
	</Modal>{/if}

	<div class="hidden md:block">
		<Table columns={kolom} rows={daftar} cell={sel} emptyText="Tidak ada pembelian yang cocok." />
	</div>
	<Card padding="none" class="overflow-hidden md:hidden">
		<ul class="divide-y divide-slate-100">
			{#each daftar as b}
				<li class="px-4 py-4">
					<div class="flex items-center gap-3">
						<Avatar nama={b.supplier} />
						<div class="min-w-0 flex-1">
							<p class="truncate text-sm font-black">{b.supplier}</p>
							<p class="text-xs font-bold text-slate-400">{b.no} · {tanggal(b.tgl)}</p>
						</div>
						<p class="num text-sm font-black">{rupiah(b.total)}</p>
					</div>
					<div class="mt-3 flex flex-wrap items-center gap-2 pl-13">
						<Badge tone={b.status === 'Diterima' ? 'green' : 'gray'}>{b.status}</Badge>
						<Badge tone={b.bayar === 'Lunas' ? 'green' : 'amber'}>{b.bayar}</Badge>
						{#if b.status === 'Dipesan' && kelola}<Button variant="outline" size="xs" class="ml-auto" onclick={() => terima(b)}>Terima barang</Button>{/if}
					</div>
				</li>
			{/each}
		</ul>
	</Card>
</section>
