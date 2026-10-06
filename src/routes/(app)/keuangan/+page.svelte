<script>
	import { goto } from '$app/navigation';
	import { Button, Card, ToggleGroup, Input, Select, DatePicker, EmptyState, showToast } from '@khwarizmi/svelte-ui';
	import PageHeader from '$lib/components/PageHeader.svelte';
	import Badge from '$lib/components/Badge.svelte';
	import Icon from '$lib/components/Icon.svelte';
	import Tabs from '$lib/components/Tabs.svelte';
	import Search from '$lib/components/Search.svelte';
	import Toolbar from '$lib/components/Toolbar.svelte';
	import { kas as dataKas, ringkasan } from '$lib/data.js';
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

	const tone = { masuk: 'green', keluar: 'red', modal: 'gray' };
	const daftar = $derived(
		kas.filter((k) => (filter === 'semua' || k.jenis === filter) && (k.ket + ' ' + k.kategori).toLowerCase().includes(cariKas.toLowerCase()))
	);
	const opsiKategori = {
		masuk: ['Penjualan', 'Pelunasan piutang', 'Lainnya'],
		keluar: ['Operasional', 'Transport', 'Konsumsi', 'Lainnya'],
		modal: ['Setoran anggota', 'Hibah', 'Lainnya']
	};
	let kategori = $state('Operasional');
	// Kategori mengikuti jenis transaksi yang dipilih
	$effect(() => {
		if (!opsiKategori[jenis].includes(kategori)) kategori = opsiKategori[jenis][0];
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
	}
</script>

<svelte:head><title>Keuangan · UBER POKJA</title></svelte:head>

<PageHeader eyebrow="Keuangan" title="Keuangan" subtitle="Modal, pemasukan, pengeluaran, dan saldo kas.">
	{#snippet actions()}
		<Button variant="outline" onclick={() => goto('/laporan')}><Icon name="file" class="size-4" /> Laporan keuangan</Button>
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

<div class="mt-5 grid gap-5 xl:grid-cols-[380px_1fr]">
	<!-- Form hanya untuk Admin dan Keuangan; role lain melihat arus kas. -->
	{#if kelola}<Card padding="lg" class="h-fit xl:sticky xl:top-24">
		<h2 class="font-black">Catat transaksi kas</h2>
		<div class="mt-4 space-y-4">
			<ToggleGroup
				bind:value={jenis}
				size="sm"
				class="toggle-penuh w-full"
				items={[
					{ value: 'masuk', label: 'Pemasukan' },
					{ value: 'keluar', label: 'Pengeluaran' },
					{ value: 'modal', label: 'Modal' }
				]}
			/>
			<Input label="Jumlah" prefix="Rp" inputmode="numeric" placeholder="0" bind:value={jumlah} />
			<Select label="Kategori" options={opsiKategori[jenis].map((k) => ({ value: k, label: k }))} bind:value={kategori} />
			<Input label="Keterangan" placeholder="mis. Ongkos angkut barang" bind:value={ket} />
			<DatePicker label="Tanggal" bind:value={tgl} />
			<Button fullWidth size="lg" onclick={simpan}><Icon name="check" class="size-4" strokeWidth={3} /> Simpan</Button>
		</div>
	</Card>{/if}

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
					<Tabs
						bind:value={filter}
						ariaLabel="Filter arus kas"
						items={[
							{ value: 'semua', label: 'Semua' },
							{ value: 'masuk', label: 'Masuk' },
							{ value: 'keluar', label: 'Keluar' },
							{ value: 'modal', label: 'Modal' }
						]}
					/>
				{/snippet}
			</Toolbar>
		</div>
		{#if daftar.length}
			<ul class="divide-y divide-slate-100 border-t border-slate-100">
				{#each daftar as k}
					{@const keluar = k.jenis === 'keluar'}
					<li class="flex items-center gap-3 px-5 py-3.5 transition hover:bg-slate-50 sm:px-6">
						<span class="grid size-10 shrink-0 place-items-center rounded-xl border {keluar ? 'border-red-200 bg-red-50 text-red-600' : k.jenis === 'modal' ? 'border-amber-200 bg-amber-50 text-amber-600' : 'border-emerald-200 bg-emerald-50 text-emerald-600'}">
							<Icon name={keluar ? 'arrowUp' : k.jenis === 'modal' ? 'coins' : 'arrowDown'} class="size-4" strokeWidth={2.5} />
						</span>
						<div class="min-w-0 flex-1">
							<p class="truncate text-sm font-black">{k.ket}</p>
							<p class="mt-1 flex flex-wrap items-center gap-2 text-xs font-bold text-slate-400">{tanggal(k.tgl)} <Badge tone={tone[k.jenis]}>{k.kategori}</Badge></p>
						</div>
						<p class="num shrink-0 text-sm font-black {keluar ? 'text-red-600' : 'text-emerald-600'}">{keluar ? '−' : '+'}{rupiah(k.jumlah)}</p>
					</li>
				{/each}
			</ul>
		{:else}
			<div class="border-t border-slate-100 p-5"><EmptyState title="Belum ada transaksi" description="Transaksi dengan jenis ini akan muncul di sini." /></div>
		{/if}
	</Card>
</div>

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
