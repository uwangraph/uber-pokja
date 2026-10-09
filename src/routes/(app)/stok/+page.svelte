<script>
	import { goto } from '$app/navigation';
	import { Button, Card, Progress, Timeline, Select, NumberInput, showToast } from '@khwarizmi/svelte-ui';
	import PageHeader from '$lib/components/PageHeader.svelte';
	import FormSheet from '$lib/components/FormSheet.svelte';
	import Stat from '$lib/components/Stat.svelte';
	import Icon from '$lib/components/Icon.svelte';
	import { statusStok, majelis } from '$lib/data.js';
	import { inventori, kirimStokKeMT } from '$lib/inventori.svelte.js';
	import { tanggal } from '$lib/format.js';
	import { browser } from '$app/environment';
	import { bolehKelola } from '$lib/data.js';

	const ringkasStok = [
		{ key: 'aman', label: 'Aman', icon: 'check', warna: 'bg-emerald-50 text-emerald-600' },
		{ key: 'menipis', label: 'Menipis', icon: 'alert', warna: 'bg-amber-50 text-amber-600' },
		{ key: 'habis', label: 'Habis', icon: 'x', warna: 'bg-red-50 text-red-600' }
	];
	let role = $state('');
	const kelola = $derived(bolehKelola(role, 'stok'));
	$effect(() => {
		if (browser) role = JSON.parse(localStorage.getItem('user') ?? '{}').role ?? '';
	});

	const produk = $derived(inventori.produk);

	let kirimOpen = $state(false);
	let tujuan = $state('');
	let produkKirim = $state('');
	let qtyKirim = $state(1);
	const maksKirim = $derived(produk.find((p) => p.id === parseInt(produkKirim))?.stok ?? 0);

	function bukaKirim() {
		tujuan = String(majelis[0]?.id ?? '');
		produkKirim = String(produk[0]?.id ?? '');
		qtyKirim = 1;
		kirimOpen = true;
	}
	function kirimKeMT() {
		const p = produk.find((x) => x.id === parseInt(produkKirim));
		const majelisId = parseInt(tujuan);
		const qty = Math.min(qtyKirim, p?.stok ?? 0);
		if (!p || !majelisId || !kirimStokKeMT(p.id, majelisId, qty)) return;

		const nama = majelis.find((m) => m.id === majelisId)?.nama ?? 'MT';
		showToast({ tone: 'success', title: 'Stok dikirim ke MT', description: `${qty} ${p.satuan} ${p.nama} ke ${nama}.` });
		kirimOpen = false;
	}

	const hitung = (s) => produk.filter((p) => statusStok(p) === s).length;
	const urut = $derived([...produk].sort((a, b) => a.stok / a.min - b.stok / b.min));
	const mutasi = [
		{ tgl: '2026-09-25', produk: 'Beras Premium 5 kg', jenis: 'keluar', qty: 4, ref: 'PJ-0231' },
		{ tgl: '2026-09-24', produk: 'Minyak Goreng 2 L', jenis: 'keluar', qty: 6, ref: 'PJ-0230' },
		{ tgl: '2026-09-22', produk: 'Gula Pasir 1 kg', jenis: 'masuk', qty: 40, ref: 'PB-0012' },
		{ tgl: '2026-09-22', produk: 'Beras Premium 5 kg', jenis: 'masuk', qty: 20, ref: 'PB-0012' },
		{ tgl: '2026-09-20', produk: 'Teh Celup isi 25', jenis: 'penyesuaian', qty: -2, ref: 'Rusak' }
	];
	const label = { masuk: 'Stok masuk', keluar: 'Stok keluar', penyesuaian: 'Penyesuaian' };
	const toneMutasi = { masuk: 'emerald', keluar: 'neutral', penyesuaian: 'amber' };
	// Format untuk komponen Timeline
	const itemTimeline = mutasi.map((m) => ({
		title: `${m.produk}  ${m.jenis === 'masuk' ? '+' : '−'}${Math.abs(m.qty)}`,
		date: tanggal(m.tgl),
		description: `${label[m.jenis]} · ${m.ref}`,
		tone: toneMutasi[m.jenis]
	}));
	// Skala bar: 3x stok minimum = penuh
	const persen = (p) => Math.max(2, Math.min(100, (p.stok / (p.min * 3)) * 100));
	const tonePosisi = { aman: 'emerald', menipis: 'amber', habis: 'red' };
</script>

<svelte:head><title>Stok · UBER POKJA</title></svelte:head>

<PageHeader eyebrow="Inventori" title="Stok" subtitle="Posisi stok setiap produk dan riwayat keluar-masuk barang.">
	{#snippet actions()}
		{#if kelola}
			<Button variant="outline" onclick={() => showToast({ tone: 'info', title: 'Penyesuaian stok', description: 'Form penyesuaian stok barang.' })}><Icon name="edit" class="size-4" /> Penyesuaian</Button>
			<Button variant="outline" onclick={bukaKirim}><Icon name="truck" class="size-4" /> Kirim ke MT</Button>
			<Button onclick={() => goto('/pembelian?baru=1')}><Icon name="plus" class="size-4" strokeWidth={3} /> Stok masuk</Button>
		{/if}
	{/snippet}
</PageHeader>

<!-- HP: ubin ringkas tiga kolom (ikon di atas, angka, label) — StatCard terlalu sempit di sini -->
<div class="grid grid-cols-3 gap-2 sm:hidden">
	{#each ringkasStok as r (r.key)}
		<Card padding="sm" class="flex flex-col items-center gap-1.5 text-center">
			<span class="grid size-9 place-items-center rounded-xl {r.warna}"><Icon name={r.icon} class="size-4" strokeWidth={2.5} /></span>
			<p class="num text-2xl leading-none font-black text-slate-900">{hitung(r.key)}</p>
			<p class="text-xs font-bold text-slate-500">{r.label}</p>
		</Card>
	{/each}
</div>

<!-- Tablet ke atas: StatCard -->
<div class="grid grid-cols-3 gap-4 max-sm:hidden">
	<Stat label="Stok aman" value="{hitung('aman')} produk" hint="Di atas batas minimum" icon="check" />
	<Stat label="Menipis" value="{hitung('menipis')} produk" hint="Perlu segera dibeli" icon="alert" tone="gold" />
	<Stat label="Habis" value="{hitung('habis')} produk" hint="Tidak bisa dijual" icon="x" tone="red" />
</div>

<div class="mt-5 grid gap-5 lg:grid-cols-[1.15fr_1fr]">
	<Card padding="lg">
		<h2 class="font-black">Posisi stok</h2>
		<p class="mt-0.5 text-sm font-bold text-slate-400">Diurutkan dari yang paling kritis</p>
		<ul class="mt-5 space-y-5">
			{#each urut as p}
				{@const s = statusStok(p)}
				<li>
					<div class="mb-2 flex items-center justify-between gap-3 text-sm">
						<span class="truncate font-black">{p.nama}</span>
						<span class="num shrink-0 font-black {s === 'habis' ? 'text-red-600' : s === 'menipis' ? 'text-amber-600' : 'text-slate-500'}">
							{p.stok} <span class="font-bold text-slate-400">{p.satuan} · min {p.min}</span>
						</span>
					</div>
					<Progress value={persen(p)} tone={tonePosisi[s]} size="sm" label="Stok {p.nama}" />
				</li>
			{/each}
		</ul>
	</Card>

	<Card padding="lg">
		<h2 class="font-black">Mutasi terakhir</h2>
		<p class="mt-0.5 mb-5 text-sm font-bold text-slate-400">Keluar-masuk barang</p>
		<Timeline items={itemTimeline} />
	</Card>
</div>

<FormSheet bind:open={kirimOpen} title="Kirim stok ke MT" description="Kirim barang dari Gudang Pusat ke stok titipan MT." size="md">
	<div class="space-y-4">
		<Select label="Tujuan MT" options={majelis.map((m) => ({ value: String(m.id), label: m.nama }))} bind:value={tujuan} />
		<Select label="Produk" options={produk.map((p) => ({ value: String(p.id), label: `${p.nama} (stok ${p.stok} ${p.satuan})` }))} bind:value={produkKirim} />
		<NumberInput label="Jumlah dikirim" min={1} max={maksKirim} bind:value={qtyKirim} />
		{#if maksKirim === 0}<p class="text-sm font-bold text-red-600">Stok Gudang Pusat untuk produk ini habis.</p>{/if}
	</div>
	{#snippet footer()}
		<div class="flex w-full justify-end gap-2">
			<Button variant="outline" onclick={() => (kirimOpen = false)}>Batal</Button>
			<Button disabled={maksKirim === 0 || qtyKirim < 1} onclick={kirimKeMT}><Icon name="truck" class="size-4" /> Kirim</Button>
		</div>
	{/snippet}
</FormSheet>
