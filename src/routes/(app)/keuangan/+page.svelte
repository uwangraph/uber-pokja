<script>
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import FormSheet from '$lib/components/FormSheet.svelte';
	import { Button, Card, DescriptionList, Drawer, Input, Select, DatePicker, EmptyState, showToast } from '@khwarizmi/svelte-ui';
	import PageHeader from '$lib/components/PageHeader.svelte';
	import Badge from '$lib/components/Badge.svelte';
	import Icon from '$lib/components/Icon.svelte';
	import Tabs from '$lib/components/Tabs.svelte';
	import Search from '$lib/components/Search.svelte';
	import Toolbar from '$lib/components/Toolbar.svelte';
	import { kas as dataKas, ringkasan, penjualan, pembelian } from '$lib/data.js';
	import { rupiah, tanggal } from '$lib/format.js';
	import { browser } from '$app/environment';
	import { bolehKelola } from '$lib/data.js';

	// Salinan lokal supaya transaksi yang disimpan langsung muncul di daftar
	let kas = $state(dataKas.map((k) => ({ ...k })));

	let jenis = $state('keluar');
	let role = $state('');
	const kelola = $derived(bolehKelola(role, 'keuangan'));
	$effect(() => {
		if (browser) role = JSON.parse(localStorage.getItem('user') ?? '{}').role ?? '';
	});
	let filter = $state('semua');
	let cariKas = $state('');
	let jumlah = $state('');
	let ket = $state('');
	let tgl = $state('2026-09-25');
	let ubahTanggal = $state(false);
	// Form catat kas dibuka lewat tombol (bukan langsung tampil); ?catat=1 dari Dashboard.
	let catatOpen = $state(false);
	$effect(() => {
		if (browser && page.url.searchParams.get('catat') === '1') {
			catatOpen = true;
			const u = new URL(page.url);
			u.searchParams.delete('catat');
			history.replaceState(history.state, '', u);
		}
	});

	const tone = { masuk: 'green', keluar: 'red', modal: 'gray' };
	const opsiFilter = [
		{ value: 'semua', label: 'Semua' },
		{ value: 'masuk', label: 'Pemasukan' },
		{ value: 'keluar', label: 'Pengeluaran' },
		{ value: 'modal', label: 'Modal' }
	];
	const daftar = $derived(
		kas.filter((k) => (filter === 'semua' || k.jenis === filter) && (k.ket + ' ' + k.kategori).toLowerCase().includes(cariKas.toLowerCase()))
	);
	const opsiKategori = {
		masuk: ['Penjualan', 'Lainnya'],
		keluar: ['Operasional', 'Transport', 'Konsumsi', 'Lainnya'],
		modal: ['Setoran anggota', 'Hibah', 'Lainnya']
	};
	let kategori = $state('Operasional');
	const contohCatatan = { masuk: 'mis. Penjualan di pengajian', keluar: 'mis. Ongkos angkut barang', modal: 'mis. Setoran Ibu Aminah' };
	// Kategori mengikuti jenis transaksi yang dipilih
	$effect(() => {
		if (!opsiKategori[jenis].includes(kategori)) kategori = opsiKategori[jenis][0];
	});
	// Detail transaksi kas (dibuka dengan mengetuk baris)
	let detail = $state(null);
	let detailOpen = $state(false);
	const labelJenis = { masuk: 'Pemasukan', keluar: 'Pengeluaran', modal: 'Modal' };
	function bukaDetail(k) {
		detail = k;
		detailOpen = true;
	}
	// Transaksi yang berasal dari penjualan (PJ-) atau pembelian (PB-) ditautkan ke datanya.
	const rujukan = $derived.by(() => {
		const no = detail?.ket.match(/^(PJ|PB)-\d+/)?.[0];
		if (!no) return null;
		if (no.startsWith('PJ')) {
			const t = penjualan.find((x) => x.no === no);
			return t && { no, halaman: '/penjualan?tab=riwayat', label: 'Lihat di Penjualan', rincian: [{ label: 'Pembeli', value: t.pembeli }, { label: 'Jumlah barang', value: `${t.item} item` }, { label: 'Status', value: t.status }] };
		}
		const b = pembelian.find((x) => x.no === no);
		return b && { no, halaman: '/pembelian', label: 'Lihat di Pembelian', rincian: [{ label: 'Supplier', value: b.supplier }, { label: 'Status barang', value: b.status }] };
	});
	const labaKotor = ringkasan.omzetBulan - ringkasan.pengeluaranBulan;

	function simpan() {
		const nilai = +String(jumlah).replace(/\D/g, '');
		if (!nilai) {
			showToast({ tone: 'warning', title: 'Jumlah belum diisi', description: 'Masukkan jumlah transaksi terlebih dahulu.' });
			return;
		}
		kas.unshift({ tgl, jenis, kategori, ket: ket || kategori, jumlah: nilai });
		showToast({ tone: 'success', title: 'Transaksi kas tersimpan', description: `${kategori} · ${rupiah(nilai)}` });
		jumlah = '';
		ket = '';
		ubahTanggal = false;
		catatOpen = false;
	}
</script>

<svelte:head><title>Keuangan · UBER POKJA</title></svelte:head>

<PageHeader eyebrow="Keuangan" title="Keuangan" subtitle="Modal, pemasukan, pengeluaran, dan saldo kas.">
	{#snippet actions()}
		<Button variant="outline" onclick={() => goto('/laporan')}><Icon name="file" class="size-4" /> Laporan</Button>
		{#if kelola}<Button onclick={() => (catatOpen = true)}><Icon name="plus" class="size-4" strokeWidth={3} /> Catat kas</Button>{/if}
	{/snippet}
</PageHeader>

<!-- Ringkasan -->
<section class="dots-bg overflow-hidden rounded-2xl border border-brand-900 bg-brand-800 text-white shadow-[0_6px_0_0_var(--color-brand-900)]">
	<div class="grid gap-6 p-6 sm:p-7 xl:grid-cols-[1.2fr_2fr] xl:items-center">
		<div>
			<p class="text-xs font-black tracking-widest text-brand-100 uppercase">Saldo kas saat ini</p>
			<p class="num mt-2 text-4xl font-black tracking-tight">{rupiah(ringkasan.saldo)}</p>
			<p class="mt-2 text-sm font-bold text-brand-100">Selisih bulan ini <span class="num font-black text-gold-400">+{rupiah(labaKotor)}</span></p>
		</div>
		<dl class="grid gap-px overflow-hidden rounded-2xl bg-white/10 sm:grid-cols-3">
			{#each [['Modal', ringkasan.modal, 'coins'], ['Masuk', ringkasan.omzetBulan, 'arrowDown'], ['Keluar', ringkasan.pengeluaranBulan, 'arrowUp']] as [l, v, ic]}
				<div class="flex items-center justify-between gap-3 bg-brand-800/60 px-4 py-3 sm:block sm:p-4">
					<dt class="flex items-center gap-1.5 text-xs font-bold text-brand-100"><Icon name={ic} class="size-3.5" strokeWidth={2.5} />{l}</dt>
					<dd class="num text-sm font-black whitespace-nowrap sm:mt-1.5 sm:text-base">{rupiah(v)}</dd>
				</div>
			{/each}
		</dl>
	</div>
</section>

<!-- Form catat kas: sheet bawah di HP, modal di laptop. Hanya Admin & Keuangan. -->
{#if kelola}
	<FormSheet bind:open={catatOpen} title="Catat transaksi kas" description="Pemasukan, pengeluaran, atau setoran modal.">
		<div class="space-y-4">
			<Tabs items={[
					{ value: 'masuk', label: 'Masuk' },
					{ value: 'keluar', label: 'Keluar' },
					{ value: 'modal', label: 'Modal' }
				]} bind:value={jenis} fill ariaLabel="Jenis transaksi" />
			<Input label="Jumlah" prefix="Rp" inputmode="numeric" placeholder="0" bind:value={jumlah} />
			<Select label="Kategori" options={opsiKategori[jenis].map((k) => ({ value: k, label: k }))} bind:value={kategori} />
			<Input label="Catatan (opsional)" placeholder={contohCatatan[jenis]} bind:value={ket} />
			<!-- Tanggal biasanya hari ini: cukup baris kecil, pemilih tanggal muncul bila diubah -->
			{#if ubahTanggal}
				<DatePicker label="Tanggal" bind:value={tgl} />
			{:else}
				<p class="flex items-center gap-1.5 text-sm font-bold text-slate-500">
					<Icon name="calendar" class="size-4" /> {tanggal(tgl)}
					<Button variant="link" size="sm" onclick={() => (ubahTanggal = true)}>Ubah</Button>
				</p>
			{/if}
		</div>
		{#snippet footer()}
			<div class="grid w-full grid-cols-[auto_1fr] gap-2 sm:flex sm:justify-end">
				<Button variant="outline" onclick={() => (catatOpen = false)}>Batal</Button>
				<Button onclick={simpan}><Icon name="check" class="size-4" strokeWidth={3} /> Simpan</Button>
			</div>
		{/snippet}
	</FormSheet>
{/if}

<div class="mt-5">
	<!-- Arus kas -->
	<Card padding="none" class="overflow-hidden">
		<div class="px-5 pt-5 sm:px-6">
			<h2 class="font-black">Arus kas</h2>
			<p class="mt-0.5 mb-4 text-sm font-bold text-slate-400">Transaksi terbaru</p>
			<Toolbar>
				{#snippet search()}
					<Search bind:value={cariKas} id="cari-kas" placeholder="Cari keterangan…" />
				{/snippet}
				{#snippet filters()}
					<!-- Wrapper Tabs otomatis jadi dropdown di HP (lebih dari 3 pilihan) -->
					<Tabs bind:value={filter} ariaLabel="Filter arus kas" items={opsiFilter} />
				{/snippet}
			</Toolbar>
		</div>
		{#if daftar.length}
			<ul class="divide-y divide-slate-100 border-t border-slate-100">
				{#each daftar as k}
					{@const keluar = k.jenis === 'keluar'}
					<li>
					<button type="button" class="flex w-full items-center gap-3 px-5 py-3.5 text-left transition hover:bg-slate-50 active:bg-slate-100 sm:px-6" onclick={() => bukaDetail(k)} aria-label="Detail {k.ket}">
						<span class="grid size-10 shrink-0 place-items-center rounded-xl border {keluar ? 'border-red-200 bg-red-50 text-red-600' : k.jenis === 'modal' ? 'border-amber-200 bg-amber-50 text-amber-600' : 'border-emerald-200 bg-emerald-50 text-emerald-600'}">
							<Icon name={keluar ? 'arrowUp' : k.jenis === 'modal' ? 'coins' : 'arrowDown'} class="size-4" strokeWidth={2.5} />
						</span>
						<div class="min-w-0 flex-1">
							<p class="truncate text-sm font-black">{k.ket}</p>
							<p class="mt-1 flex flex-wrap items-center gap-2 text-xs font-bold text-slate-400">{tanggal(k.tgl)} <Badge tone={tone[k.jenis]}>{k.kategori}</Badge></p>
						</div>
						<p class="num shrink-0 text-sm font-black {keluar ? 'text-red-600' : 'text-emerald-600'}">{keluar ? '−' : '+'}{rupiah(k.jumlah)}</p>
						<Icon name="chevron" class="size-4 shrink-0 text-slate-300" />
					</button>
					</li>
				{/each}
			</ul>
		{:else}
			<div class="border-t border-slate-100 p-5"><EmptyState title="Belum ada transaksi" description="Transaksi dengan jenis ini akan muncul di sini." /></div>
		{/if}
	</Card>
</div>

<!-- Detail transaksi kas: sheet dari bawah (nyaman di HP) -->
<Drawer bind:open={detailOpen} title="Detail transaksi" description={detail ? labelJenis[detail.jenis] : ''} side="bottom" size="md">
	{#if detail}
		{@const keluar = detail.jenis === 'keluar'}
		<div class="rounded-2xl p-4 text-center {keluar ? 'bg-red-50' : detail.jenis === 'modal' ? 'bg-amber-50' : 'bg-emerald-50'}">
			<p class="text-xs font-black tracking-widest text-slate-500 uppercase">Jumlah</p>
			<p class="num mt-1 text-3xl font-black {keluar ? 'text-red-600' : 'text-emerald-700'}">{keluar ? '−' : '+'}{rupiah(detail.jumlah)}</p>
		</div>
		<DescriptionList
			class="mt-4"
			orientation="row"
			items={[
				{ label: 'Keterangan', value: detail.ket },
				{ label: 'Kategori', value: detail.kategori },
				{ label: 'Tanggal', value: new Date(detail.tgl).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) },
				...(rujukan ? [{ label: 'No. referensi', value: rujukan.no }, ...rujukan.rincian] : [])
			]}
		/>
	{/if}
	{#snippet footer()}
		<div class="grid w-full gap-2 {rujukan ? 'grid-cols-2' : ''}">
			<Button variant="outline" onclick={() => (detailOpen = false)}>Tutup</Button>
			{#if rujukan}<Button onclick={() => goto(rujukan.halaman)}>{rujukan.label}</Button>{/if}
		</div>
	{/snippet}
</Drawer>
