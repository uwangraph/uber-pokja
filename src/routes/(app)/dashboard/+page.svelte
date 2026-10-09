<script>
	import { browser } from '$app/environment';
	import { goto } from '$app/navigation';
	import { Button, Card, Progress, Table } from '@khwarizmi/svelte-ui';
	import Stat from '$lib/components/Stat.svelte';
	import Badge from '$lib/components/Badge.svelte';
	import Avatar from '$lib/components/Avatar.svelte';
	import PageHeader from '$lib/components/PageHeader.svelte';
	import Icon from '$lib/components/Icon.svelte';
	import { ringkasan, omzetMingguan, penjualan, produk, statusStok } from '$lib/data.js';
	import { rupiah, tanggal } from '$lib/format.js';

	let user = $state(null);
	$effect(() => {
		if (browser) {
			const stored = localStorage.getItem('user');
			if (stored) user = JSON.parse(stored);
		}
	});

	const namaDepan = $derived(user?.nama.split(' ')[0] ?? '');
	const skala = 3_000_000; // batas atas sumbu grafik
	const garis = [3, 2, 1, 0];
	const tinggi = 176; // tinggi area batang (px)
	const terakhir = omzetMingguan.length - 1;
	const peringatan = produk.filter((p) => statusStok(p) !== 'aman');
	const tone = { Lunas: 'green' };
	const persenModal = Math.round((ringkasan.saldo / ringkasan.modal) * 100);

	const kolom = [
		{ key: 'pembeli', label: 'Pembeli' },
		{ key: 'tgl', label: 'Tanggal' },
		{ key: 'total', label: 'Total', align: 'right' },
		{ key: 'status', label: 'Status' }
	];
</script>

<svelte:head><title>Dashboard · UBER POKJA</title></svelte:head>

<PageHeader eyebrow="September 2026" title="Assalamu'alaikum, {namaDepan}" subtitle="Berikut ringkasan kondisi usaha bulan ini.">
	{#snippet actions()}
		<Button variant="outline" onclick={() => goto('/laporan')}><Icon name="download" class="size-4" /> Laporan</Button>
		<Button onclick={() => goto('/penjualan?tab=baru')}><Icon name="plus" class="size-4" strokeWidth={3} /> Penjualan baru</Button>
	{/snippet}
</PageHeader>

<div class="grid gap-4 xl:grid-cols-3">
	<!-- Kartu saldo -->
	<section class="dots-bg relative overflow-hidden rounded-2xl border border-brand-900 bg-brand-800 p-6 text-white shadow-[0_6px_0_0_var(--color-brand-900)]">
		<div class="flex items-center justify-between">
			<p class="text-xs font-black tracking-widest text-brand-100 uppercase">Saldo kas</p>
			<span class="rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-black text-brand-100">Per hari ini</span>
		</div>
		<p class="num mt-3 text-[32px] leading-none font-black tracking-tight">{rupiah(ringkasan.saldo)}</p>
		<div class="mt-6">
			<div class="mb-2 flex justify-between text-xs font-bold text-brand-100">
				<span>Dari modal {rupiah(ringkasan.modal)}</span>
				<span class="num font-black text-white">{persenModal}%</span>
			</div>
			<div>
				<Progress value={persenModal} tone="amber" size="sm" label="Saldo dari modal" />
			</div>
		</div>
		<div class="mt-6 grid grid-cols-2 gap-3 border-t border-white/10 pt-5">
			<Button variant="secondary" onclick={() => goto('/keuangan?catat=1')}>Catat kas</Button>
			<Button variant="secondary" onclick={() => goto('/pembelian?baru=1')}>Stok masuk</Button>
		</div>
	</section>

	<div class="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 xl:col-span-2">
		<Stat label="Omzet bulan ini" value={rupiah(ringkasan.omzetBulan)} hint="{ringkasan.transaksiBulan} transaksi" icon="trendUp" />
		<Stat label="Pengeluaran" value={rupiah(ringkasan.pengeluaranBulan)} hint="Beli + operasional" icon="receipt" tone="gray" />
		<Stat label="Stok kritis" value="{peringatan.length} produk" hint="Menipis atau habis" icon="alert" tone="red" />
	</div>
</div>

<div class="mt-5 grid gap-5 xl:grid-cols-3">
	<!-- Grafik omzet -->
	<Card padding="lg" class="xl:col-span-2">
		<div class="flex flex-wrap items-start justify-between gap-2">
			<div>
				<h2 class="font-black">Omzet per minggu</h2>
				<p class="mt-0.5 text-sm font-bold text-muted">Total <span class="num font-black text-ink">{rupiah(ringkasan.omzetBulan)}</span> bulan ini</p>
			</div>
			<Badge>September 2026</Badge>
		</div>

		<div class="relative mt-6 h-56 pl-9">
			{#each garis as g}
				<div class="absolute inset-x-0 flex items-center gap-2" style="bottom: {24 + (g / 3) * tinggi - 6}px">
					<span class="num w-7 text-right text-[11px] font-bold text-slate-400">{g ? g + 'jt' : '0'}</span>
					<span class="h-px flex-1 {g ? 'border-t border-dashed border-slate-200' : 'bg-slate-200'}"></span>
				</div>
			{/each}
			<div class="relative flex h-full items-end gap-3 pb-6 sm:gap-6">
				{#each omzetMingguan as m, i}
					<div class="group relative flex h-full flex-1 flex-col items-center justify-end">
						<span class="num mb-1.5 rounded-md px-1.5 py-0.5 text-[11px] font-black {i === terakhir ? 'bg-slate-800 text-white' : 'text-slate-400'}">
							{(m.nilai / 1e6).toLocaleString('id-ID', { maximumFractionDigits: 1 })} jt
						</span>
						<div
							class="w-full max-w-14 rounded-t-xl transition {i === terakhir ? 'bg-linear-to-b from-primary-400 to-primary-600' : 'bg-primary-200 group-hover:bg-primary-300'}"
							style="height: {(m.nilai / skala) * tinggi}px"
						></div>
						<span class="absolute -bottom-6 text-xs font-bold text-slate-400">{m.label}</span>
					</div>
				{/each}
			</div>
		</div>
	</Card>

	<!-- Stok -->
	<Card padding="lg" class="flex flex-col">
		<div class="flex items-center justify-between gap-2">
			<h2 class="font-black">Stok kritis</h2>
			<Button variant="link" size="sm" onclick={() => goto('/stok')}>Lihat semua</Button>
		</div>
		<ul class="mt-4 space-y-4">
			{#each peringatan as p}
				{@const habis = statusStok(p) === 'habis'}
				<li>
					<div class="flex items-start justify-between gap-3">
						<div class="min-w-0">
							<p class="truncate text-sm font-black">{p.nama}</p>
							<p class="num text-xs font-bold text-muted">Sisa {p.stok} {p.satuan} · minimum {p.min}</p>
						</div>
						<Badge tone={habis ? 'red' : 'amber'}>{habis ? 'Habis' : 'Menipis'}</Badge>
					</div>
					<Progress value={Math.max(3, Math.min(100, (p.stok / p.min) * 100))} tone={habis ? 'red' : 'amber'} size="sm" label="Sisa stok {p.nama}" class="mt-2" />
				</li>
			{/each}
		</ul>
		<Button variant="outline" fullWidth class="mt-6" onclick={() => goto('/pembelian?baru=1')}>Buat pembelian</Button>
	</Card>
</div>

<!-- Penjualan terakhir -->
{#snippet sel(row, col)}
	{#if col.key === 'pembeli'}
		<div class="flex items-center gap-3">
			<Avatar nama={row.pembeli} size="size-8" />
			<div><p class="font-black text-slate-800">{row.pembeli}</p><p class="text-xs font-bold text-slate-400">{row.no}</p></div>
		</div>
	{:else if col.key === 'tgl'}
		<span class="whitespace-nowrap text-slate-500">{tanggal(row.tgl)}</span>
	{:else if col.key === 'total'}
		<span class="num font-black whitespace-nowrap">{rupiah(row.total)}</span>
	{:else}
		<Badge tone={tone[row.status]}>{row.status}</Badge>
	{/if}
{/snippet}

<section class="mt-8">
	<div class="mb-3 flex items-end justify-between gap-3">
		<div>
			<h2 class="text-lg font-black">Penjualan terakhir</h2>
			<p class="text-sm font-bold text-muted">5 transaksi terbaru</p>
		</div>
		<Button variant="outline" size="sm" onclick={() => goto('/penjualan?tab=riwayat')}>Semua</Button>
	</div>

	<!-- Tabel (tablet & desktop) -->
	<div class="hidden md:block">
		<Table columns={kolom} rows={penjualan} cell={sel} />
	</div>

	<!-- Daftar (HP) -->
	<Card padding="none" class="overflow-hidden md:hidden">
		<ul class="divide-y divide-slate-100">
			{#each penjualan as t}
				<li class="flex items-center gap-3 px-4 py-3.5">
					<Avatar nama={t.pembeli} />
					<div class="min-w-0 flex-1">
						<p class="truncate text-sm font-black">{t.pembeli}</p>
						<p class="text-xs font-bold text-muted">{t.no} · {tanggal(t.tgl)}</p>
					</div>
					<div class="flex flex-col items-end gap-1">
						<p class="num text-sm font-black">{rupiah(t.total)}</p>
						<Badge tone={tone[t.status]}>{t.status}</Badge>
					</div>
				</li>
			{/each}
		</ul>
	</Card>
</section>
