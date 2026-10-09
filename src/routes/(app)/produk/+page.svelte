<script>
	import { Button, Card, Input, NumberInput, Table, EmptyState, showToast } from '@khwarizmi/svelte-ui';
	import { Package, SearchX } from 'lucide-svelte';
	import PageHeader from '$lib/components/PageHeader.svelte';
	import FormSheet from '$lib/components/FormSheet.svelte';
	import Badge from '$lib/components/Badge.svelte';
	import Icon from '$lib/components/Icon.svelte';
	import Tabs from '$lib/components/Tabs.svelte';
	import Search from '$lib/components/Search.svelte';
	import Toolbar from '$lib/components/Toolbar.svelte';
	import { produk as dataProduk, statusStok } from '$lib/data.js';
	import { rupiah } from '$lib/format.js';

	// Salinan lokal supaya tambah & ubah produk langsung terlihat di mockup
	let produk = $state(dataProduk.map((p) => ({ ...p })));

	let cari = $state('');
	let filter = $state('semua');
	let formOpen = $state(false);
	let baru = $state({ nama: '', satuan: '', min: 5, beli: '', jual: '' });

	const list = $derived(
		produk.filter((p) => p.nama.toLowerCase().includes(cari.toLowerCase()) && (filter === 'semua' || statusStok(p) === filter))
	);
	const badge = { aman: ['green', 'Aman'], menipis: ['amber', 'Menipis'], habis: ['red', 'Habis'] };
	const hitung = (s) => produk.filter((p) => statusStok(p) === s).length;
	const persenMargin = (p) => (p.jual ? Math.round(((p.jual - p.beli) / p.jual) * 100) : 0);
	const angka = (v) => +String(v ?? '').replace(/\D/g, '') || 0;
	function bukaTambah() {
		baru = { nama: '', satuan: '', min: 5, beli: '', jual: '' };
		formOpen = true;
	}
	function tutupTambah() {
		formOpen = false;
	}

	function simpan() {
		if (!baru.nama.trim()) {
			showToast({ tone: 'warning', title: 'Nama produk belum diisi' });
			return;
		}
		const no = produk.length + 1;
		produk.push({
			id: Math.max(...produk.map((p) => p.id)) + 1,
			kode: 'P-' + String(no).padStart(3, '0'),
			nama: baru.nama.trim(),
			satuan: baru.satuan.trim() || 'pcs',
			beli: angka(baru.beli),
			jual: angka(baru.jual),
			stok: 0,
			min: baru.min
		});
		showToast({ tone: 'success', title: 'Produk ditambahkan', description: baru.nama });
		baru = { nama: '', satuan: '', min: 5, beli: '', jual: '' };
		formOpen = false;
	}

	// ---- Ubah produk ----
	let editOpen = $state(false);
	let edit = $state(null); // salinan data yang sedang diubah (harga disimpan sebagai teks input)
	const errEdit = $derived.by(() => {
		if (!edit) return {};
		const e = {};
		if (!edit.nama.trim()) e.nama = 'Nama produk wajib diisi.';
		if (angka(edit.jual) < angka(edit.beli)) e.jual = 'Harga jual lebih rendah dari harga beli.';
		return e;
	});
	const marginEdit = $derived(edit ? angka(edit.jual) - angka(edit.beli) : 0);

	function bukaEdit(p) {
		edit = { ...p, beli: String(p.beli), jual: String(p.jual) };
		editOpen = true;
	}
	function simpanEdit() {
		if (Object.keys(errEdit).length) return;
		const p = produk.find((x) => x.id === edit.id);
		Object.assign(p, {
			nama: edit.nama.trim(),
			satuan: edit.satuan.trim() || p.satuan,
			beli: angka(edit.beli),
			jual: angka(edit.jual),
			stok: edit.stok,
			min: edit.min
		});
		showToast({ tone: 'success', title: 'Produk diperbarui', description: p.nama });
		editOpen = false;
	}

	const kolom = [
		{ key: 'nama', label: 'Produk' },
		{ key: 'beli', label: 'Harga beli', align: 'right' },
		{ key: 'jual', label: 'Harga jual', align: 'right' },
		{ key: 'margin', label: 'Margin', align: 'right' },
		{ key: 'stok', label: 'Stok', align: 'right' },
		{ key: 'status', label: 'Status' },
		{ key: 'aksi', label: 'Aksi', align: 'right' }
	];
</script>

<svelte:head><title>Produk · UBER POKJA</title></svelte:head>

<PageHeader eyebrow="Inventori" title="Produk" subtitle="Daftar barang yang dijual beserta harga dan stoknya." />

<Toolbar>
	{#snippet search()}
		<Search bind:value={cari} placeholder="Cari produk…" />
	{/snippet}
	{#snippet filters()}
		<Tabs
			bind:value={filter}
			ariaLabel="Filter status stok"
			items={[
				{ value: 'semua', label: 'Semua', count: produk.length },
				{ value: 'aman', label: 'Aman', count: hitung('aman') },
				{ value: 'menipis', label: 'Menipis', count: hitung('menipis') },
				{ value: 'habis', label: 'Habis', count: hitung('habis') }
			]}
		/>
	{/snippet}
	{#snippet action()}
		<Button onclick={bukaTambah}>
			<Icon name="plus" class="size-4" strokeWidth={3} />
			<span class="hidden xl:inline">Tambah produk</span>
			<span class="xl:hidden">Tambah</span>
		</Button>
	{/snippet}
</Toolbar>

<!-- Modal tambah produk -->
<FormSheet bind:open={formOpen} title="Tambah produk" description="Kode produk dibuat otomatis." size="md">
	<div class="grid gap-4 sm:grid-cols-2">
		<div class="sm:col-span-2"><Input label="Nama produk" placeholder="mis. Beras Premium 5 kg" bind:value={baru.nama} /></div>
		<Input label="Satuan" placeholder="pcs, pack, karung" bind:value={baru.satuan} />
		<NumberInput label="Stok minimum" min={0} bind:value={baru.min} />
		<Input label="Harga beli" prefix="Rp" inputmode="numeric" placeholder="0" bind:value={baru.beli} />
		<Input label="Harga jual" prefix="Rp" inputmode="numeric" placeholder="0" bind:value={baru.jual} />
	</div>
	{#snippet footer()}
		<div class="flex w-full justify-end gap-2">
			<Button variant="outline" onclick={tutupTambah}>Batal</Button>
			<Button onclick={simpan}>Simpan produk</Button>
		</div>
	{/snippet}
</FormSheet>

{#snippet sel(row, col)}
	{#if col.key === 'nama'}
		<div class="flex items-center gap-3">
			<span class="grid size-9 shrink-0 place-items-center rounded-xl border border-slate-200 bg-slate-50 text-slate-400"><Package size={16} strokeWidth={2.5} /></span>
			<div class="min-w-0">
				<p class="font-black whitespace-nowrap text-slate-800">{row.nama}</p>
				<p class="text-xs font-bold text-slate-400">{row.kode} · per {row.satuan}</p>
			</div>
		</div>
	{:else if col.key === 'beli'}
		<span class="num whitespace-nowrap text-slate-400">{rupiah(row.beli)}</span>
	{:else if col.key === 'jual'}
		<span class="num font-black whitespace-nowrap">{rupiah(row.jual)}</span>
	{:else if col.key === 'margin'}
		<p class="num font-black whitespace-nowrap text-primary-600">{rupiah(row.jual - row.beli)}</p>
		<p class="num text-xs text-slate-400">{persenMargin(row)}%</p>
	{:else if col.key === 'stok'}
		<span class="num font-black">{row.stok}</span>
	{:else if col.key === 'status'}
		{@const [t, l] = badge[statusStok(row)]}
		<Badge tone={t}>{l}</Badge>
	{:else}
		<Button variant="ghost" size="icon-sm" aria-label="Ubah {row.nama}" title="Ubah produk" onclick={() => bukaEdit(row)}>
			<Icon name="edit" class="size-4" />
		</Button>
	{/if}
{/snippet}

<!-- Tabel -->
<div class="hidden md:block">
	<Table columns={kolom} rows={list} cell={sel} emptyText="Tidak ada produk yang cocok." />
</div>

<!-- Daftar (HP) -->
<div class="md:hidden">
	{#if list.length}
		<Card padding="none" class="overflow-hidden">
			<ul class="divide-y divide-slate-100">
				{#each list as p}
					{@const [t, l] = badge[statusStok(p)]}
					<li class="px-4 py-4">
						<div class="flex items-start justify-between gap-3">
							<div class="min-w-0">
								<p class="font-black">{p.nama}</p>
								<p class="text-xs font-bold text-slate-400">{p.kode} · per {p.satuan}</p>
							</div>
							<div class="flex shrink-0 items-center gap-1">
								<Badge tone={t}>{l}</Badge>
								<Button variant="ghost" size="icon-sm" aria-label="Ubah {p.nama}" onclick={() => bukaEdit(p)}><Icon name="edit" class="size-4" /></Button>
							</div>
						</div>
						<dl class="mt-3 grid grid-cols-3 gap-2 rounded-xl bg-slate-50 p-3 text-xs">
							<div><dt class="font-bold text-slate-400">Jual</dt><dd class="num mt-0.5 font-black">{rupiah(p.jual)}</dd></div>
							<div><dt class="font-bold text-slate-400">Margin</dt><dd class="num mt-0.5 font-black text-primary-600">{persenMargin(p)}%</dd></div>
							<div><dt class="font-bold text-slate-400">Stok</dt><dd class="num mt-0.5 font-black">{p.stok} {p.satuan}</dd></div>
						</dl>
					</li>
				{/each}
			</ul>
		</Card>
	{:else}
		<EmptyState icon={SearchX} title="Produk tidak ditemukan" description="Coba kata kunci atau filter lain." />
	{/if}
</div>

<!-- Modal ubah produk -->
<FormSheet bind:open={editOpen} title="Ubah produk" description={edit ? `${edit.kode} · ${edit.nama}` : ''} size="md">
	{#if edit}
		<div class="grid gap-4 sm:grid-cols-2">
			<div class="sm:col-span-2"><Input label="Nama produk" bind:value={edit.nama} error={errEdit.nama} /></div>
			<Input label="Satuan" bind:value={edit.satuan} />
			<NumberInput label="Stok minimum" min={0} bind:value={edit.min} />
			<Input label="Harga beli" prefix="Rp" inputmode="numeric" bind:value={edit.beli} />
			<Input label="Harga jual" prefix="Rp" inputmode="numeric" bind:value={edit.jual} error={errEdit.jual} />
			<div class="sm:col-span-2"><NumberInput label="Stok saat ini" min={0} bind:value={edit.stok} /></div>
		</div>
		<div class="mt-4 flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm">
			<span class="font-bold text-slate-500">Margin per {edit.satuan || 'unit'}</span>
			<span class="num font-black {marginEdit < 0 ? 'text-red-600' : 'text-primary-600'}">
				{rupiah(marginEdit)} · {persenMargin({ beli: angka(edit.beli), jual: angka(edit.jual) })}%
			</span>
		</div>
	{/if}
	{#snippet footer()}
		<div class="flex w-full justify-end gap-2">
			<Button variant="outline" onclick={() => (editOpen = false)}>Batal</Button>
			<Button disabled={Object.keys(errEdit).length > 0} onclick={simpanEdit}>Simpan perubahan</Button>
		</div>
	{/snippet}
</FormSheet>
