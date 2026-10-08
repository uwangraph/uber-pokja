<script>
	import { browser } from '$app/environment';
	import { Card, Progress, EmptyState } from '@khwarizmi/svelte-ui';
	import { PackageSearch } from 'lucide-svelte';
	import PageHeader from '$lib/components/PageHeader.svelte';
	import Badge from '$lib/components/Badge.svelte';
	import Stat from '$lib/components/Stat.svelte';
	import { majelis, penjualan } from '$lib/data.js';
	import { inventori } from '$lib/inventori.svelte.js';
	import { rupiah } from '$lib/format.js';

	let user = $state(null);
	let pesananMasuk = $state([]);
	$effect(() => {
		if (browser) {
			const stored = localStorage.getItem('user');
			if (stored) user = JSON.parse(stored);
			try {
				pesananMasuk = JSON.parse(localStorage.getItem('uber-pokja:marketplace:orders') ?? '[]');
			} catch {}
		}
	});

	const toko = $derived(majelis.find((m) => m.id === user?.majelisId));
	const stok = $derived(inventori.stokMajelis.filter((s) => s.majelisId === user?.majelisId));
	const nilaiStok = $derived(stok.reduce((s, b) => s + b.stok * b.jual, 0));
	const transaksiToko = $derived(penjualan.filter((t) => t.pembeli === toko?.nama));
	const pesananToko = $derived(pesananMasuk.filter((p) => p.majelisId === user?.majelisId));
	const statusnya = (s) => (s.stok === 0 ? 'habis' : s.stok <= 5 ? 'menipis' : 'aman');
	const toneStok = { aman: 'green', menipis: 'amber', habis: 'red' };
	const labelStok = { aman: 'Aman', menipis: 'Menipis', habis: 'Habis' };
</script>

<svelte:head><title>Toko Saya · UBER POKJA</title></svelte:head>

<PageHeader eyebrow="Toko" title={toko?.nama ?? 'Toko Saya'} subtitle="Stok titipan dari Gudang Pusat dan penjualan ke pembeli umum." />

<div class="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
	<Stat label="Jenis produk" value="{stok.length} produk" hint="Dititipkan Gudang Pusat" icon="box" />
	<Stat label="Nilai stok" value={rupiah(nilaiStok)} hint="Perkiraan harga jual" icon="layers" tone="gray" />
</div>

<h2 class="mt-8 mb-3 text-lg font-black">Stok di toko saya</h2>
{#if stok.length}
	<Card padding="none" class="overflow-hidden">
		<ul class="divide-y divide-slate-100">
			{#each stok as s}
				{@const status = statusnya(s)}
				<li class="flex items-center justify-between gap-4 p-4">
					<div class="min-w-0 flex-1">
						<p class="truncate font-black text-slate-800">{s.nama}</p>
						<p class="num mt-0.5 text-xs font-bold text-slate-400">{s.stok} {s.satuan} · {rupiah(s.jual)} / {s.satuan}</p>
						<div class="mt-2 max-w-48"><Progress value={Math.min(100, (s.stok / 20) * 100)} tone={toneStok[status]} size="sm" label="Stok {s.nama}" /></div>
					</div>
					<Badge tone={toneStok[status]}>{labelStok[status]}</Badge>
				</li>
			{/each}
		</ul>
	</Card>
{:else}
	<EmptyState icon={PackageSearch} title="Belum ada stok" description="Gudang Pusat belum mengirim barang ke toko ini." />
{/if}

<h2 class="mt-8 mb-3 text-lg font-black">Pesanan dari pembeli umum</h2>
{#if pesananToko.length}
	<Card padding="none" class="overflow-hidden">
		<ul class="divide-y divide-slate-100">
			{#each pesananToko as p}
				<li class="flex items-center justify-between gap-4 p-4 text-sm">
					<div class="min-w-0 flex-1">
						<p class="font-black text-slate-800">{p.id}</p>
						<p class="truncate text-xs font-bold text-slate-400">{p.pembeli?.nama} · {p.items.map((i) => `${i.nama} × ${i.qty}`).join(', ')}</p>
					</div>
					<div class="flex shrink-0 items-center gap-3">
						<span class="num font-black">{rupiah(p.total)}</span>
						<Badge tone="amber">{p.status}</Badge>
					</div>
				</li>
			{/each}
		</ul>
	</Card>
{:else}
	<EmptyState icon={PackageSearch} title="Belum ada pesanan" description="Pesanan dari pembeli umum lewat marketplace akan muncul di sini." />
{/if}

<h2 class="mt-8 mb-3 text-lg font-black">Penjualan terakhir</h2>
{#if transaksiToko.length}
	<Card padding="none" class="overflow-hidden">
		<ul class="divide-y divide-slate-100">
			{#each transaksiToko as t}
				<li class="flex items-center justify-between gap-4 p-4 text-sm">
					<div>
						<p class="font-black text-slate-800">{t.no}</p>
						<p class="text-xs font-bold text-slate-400">{t.tgl} · {t.item} item</p>
					</div>
					<div class="flex items-center gap-3">
						<span class="num font-black">{rupiah(t.total)}</span>
						<Badge tone={t.status === 'Lunas' ? 'green' : 'red'}>{t.status}</Badge>
					</div>
				</li>
			{/each}
		</ul>
	</Card>
{:else}
	<EmptyState icon={PackageSearch} title="Belum ada penjualan" description="Transaksi toko ini akan muncul di sini." />
{/if}
