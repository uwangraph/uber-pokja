<script>
	import { browser } from '$app/environment';
	import { Button, Card, Checkbox, Input, NumberInput, Progress, EmptyState, Select, Textarea, showToast } from '@khwarizmi/svelte-ui';
	import { PackageSearch } from 'lucide-svelte';
	import PageHeader from '$lib/components/PageHeader.svelte';
	import Badge from '$lib/components/Badge.svelte';
	import Stat from '$lib/components/Stat.svelte';
	import Tabs from '$lib/components/Tabs.svelte';
	import Icon from '$lib/components/Icon.svelte';
	import FormSheet from '$lib/components/FormSheet.svelte';
	import { majelis, penjualan } from '$lib/data.js';
	import { inventori, tambahProdukMT, ubahProdukMT, hapusProdukMT } from '$lib/inventori.svelte.js';
	import { rupiah, tanggal } from '$lib/format.js';
	import { fotoProduk, fotoSemua, hargaDiskon, kategoriDari, kategoriList } from '$lib/marketplace.svelte.js';

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

	// ---- Pesanan: tab status & ringkasan penjualan ----
	const kelompok = {
		belum: (p) => p.status === 'Menunggu pembayaran',
		proses: (p) => p.status === 'Menunggu diproses' || p.status === 'Dikemas',
		kirim: (p) => p.status === 'Dikirim',
		selesai: (p) => p.status === 'Selesai',
		batal: (p) => p.status === 'Dibatalkan'
	};
	let tabPesanan = $state('semua');
	const urutPesanan = $derived(pesananToko.toSorted((a, b) => b.dibuatPada.localeCompare(a.dibuatPada)));
	const hitung = (k) => pesananToko.filter(kelompok[k]).length;
	const daftarPesanan = $derived(tabPesanan === 'semua' ? urutPesanan : urutPesanan.filter(kelompok[tabPesanan]));
	const perluDiproses = $derived(hitung('proses'));

	// Omzet = pesanan yang sudah dibayar dan tidak dibatalkan, dihitung per hari (7 hari terakhir).
	const sah = $derived(pesananToko.filter((p) => p.dibayarPada && p.status !== 'Dibatalkan'));
	const kunciHari = (d) => `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
	const omzetHarian = $derived.by(() => {
		const hari = Array.from({ length: 7 }, (_, i) => {
			const d = new Date();
			d.setDate(d.getDate() - (6 - i));
			return { d, label: d.toLocaleDateString('id-ID', { weekday: 'short' }), total: 0 };
		});
		for (const p of sah) {
			const h = hari.find((x) => kunciHari(x.d) === kunciHari(new Date(p.dibuatPada)));
			if (h) h.total += p.total;
		}
		return hari;
	});
	const omzet7 = $derived(omzetHarian.reduce((s, h) => s + h.total, 0));
	const omzetMaks = $derived(Math.max(1, ...omzetHarian.map((h) => h.total)));
	const ringkasRp = (n) => (n >= 1e6 ? `${(n / 1e6).toFixed(1).replace('.', ',')}jt` : n ? `${Math.round(n / 1000)}rb` : '0');
	const terlaris = $derived(
		Object.entries(
			sah.flatMap((p) => p.items).reduce((acc, i) => ((acc[i.nama] = (acc[i.nama] ?? 0) + i.qty), acc), {})
		)
			.sort((a, b) => b[1] - a[1])
			.slice(0, 3)
	);
	const stokTipis = $derived(stok.filter((s) => statusnya(s) !== 'aman'));
	const tanggalPendek = (iso) => new Date(iso).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });

	const tonePesanan = (st) => (st === 'Selesai' ? 'green' : st === 'Dibatalkan' ? 'red' : st === 'Dikirim' || st === 'Dikemas' ? 'blue' : 'amber');

	// ---- Tambah / ubah produk milik toko ----
	const angka = (v) => +String(v ?? '').replace(/\D/g, '') || 0;
	let formOpen = $state(false);
	const FORM_BARU = () => ({ produkId: null, nama: '', satuan: '', jual: '', stok: 0, milikToko: true, fotos: [], kategori: kategoriList[0], diskon: 0, unggulan: false, deskripsi: '' });
	let form = $state(FORM_BARU());
	const err = $derived({
		...(form.nama.trim() ? {} : { nama: 'Nama produk wajib diisi.' }),
		...(angka(form.jual) > 0 ? {} : { jual: 'Harga jual harus lebih dari 0.' })
	});

	function bukaTambah() {
		form = FORM_BARU();
		formOpen = true;
	}
	function bukaUbah(s) {
		form = { produkId: s.produkId, nama: s.nama, satuan: s.satuan, jual: String(s.jual), stok: s.stok, milikToko: !!s.milikToko, fotos: [...fotoSemua(s)], kategori: kategoriDari(s), diskon: s.diskon ?? 0, unggulan: !!s.unggulan, deskripsi: s.deskripsi ?? '' };
		formOpen = true;
	}
	// Maksimal 5 foto per produk, masing-masing diperkecil jadi persegi 480px (JPEG)
	// supaya muat di penyimpanan browser.
	const MAKS_FOTO = 5;
	async function pilihFoto(e) {
		const files = [...(e.currentTarget.files ?? [])];
		e.currentTarget.value = '';
		for (const file of files) {
			if (form.fotos.length >= MAKS_FOTO) {
				showToast({ tone: 'warning', title: `Maksimal ${MAKS_FOTO} foto` });
				break;
			}
			if (!file.type.startsWith('image/')) continue;
			const bmp = await createImageBitmap(file);
			const sisi = Math.min(bmp.width, bmp.height);
			const cv = document.createElement('canvas');
			cv.width = cv.height = 480;
			cv.getContext('2d').drawImage(bmp, (bmp.width - sisi) / 2, (bmp.height - sisi) / 2, sisi, sisi, 0, 0, 480, 480);
			form.fotos.push(cv.toDataURL('image/jpeg', 0.8));
		}
	}
	function simpan() {
		if (Object.keys(err).length || !user) return;
		const data = { nama: form.nama.trim(), satuan: form.satuan.trim() || 'pcs', jual: angka(form.jual), stok: form.stok, fotos: form.fotos, kategori: form.kategori, diskon: Math.min(90, Math.max(0, form.diskon || 0)), unggulan: form.unggulan, deskripsi: form.deskripsi.trim() };
		if (form.produkId) {
			// Titipan Gudang Pusat: nama, satuan, dan stok dikunci.
			ubahProdukMT(user.majelisId, form.produkId, form.milikToko ? data : { jual: data.jual, fotos: data.fotos, kategori: data.kategori, diskon: data.diskon, unggulan: data.unggulan, deskripsi: data.deskripsi });
			showToast({ tone: 'success', title: 'Produk diperbarui', description: data.nama });
		} else {
			tambahProdukMT(user.majelisId, data);
			showToast({ tone: 'success', title: 'Produk ditambahkan', description: 'Sudah tampil di marketplace.' });
		}
		formOpen = false;
	}
	function hapus() {
		if (hapusProdukMT(user.majelisId, form.produkId)) showToast({ tone: 'success', title: 'Produk dihapus', description: form.nama });
		formOpen = false;
	}
</script>

<svelte:head><title>Toko Saya · UBER POKJA</title></svelte:head>

<PageHeader eyebrow="Toko" title={toko?.nama ?? 'Toko Saya'} subtitle="Kelola produk tokomu, stok titipan Gudang Pusat, dan penjualan ke pembeli umum." />

<div class="grid grid-cols-2 gap-3 lg:grid-cols-4 sm:gap-4">
	<Stat label="Perlu diproses" value="{perluDiproses} pesanan" hint={perluDiproses ? 'Segera kemas & kirim' : 'Tidak ada antrean'} icon="cart" tone={perluDiproses ? 'gold' : 'brand'} />
	<Stat label="Omzet 7 hari" value={rupiah(omzet7)} hint="Pesanan terbayar" icon="wallet" />
	<Stat label="Jenis produk" value="{stok.length} produk" hint="Titipan & milik sendiri" icon="box" tone="gray" />
	<Stat label="Nilai stok" value={rupiah(nilaiStok)} hint="Perkiraan harga jual" icon="layers" tone="gray" />
</div>

<!-- Ringkasan penjualan -->
<div class="mt-6 grid gap-4 lg:grid-cols-3">
	<Card class="lg:col-span-2">
		<h2 class="text-base font-black">Penjualan 7 hari terakhir</h2>
		<p class="mt-0.5 text-xs font-bold text-slate-400">Total pesanan yang sudah dibayar per hari</p>
		<div class="mt-5 flex h-36 items-end gap-2 sm:gap-3" role="img" aria-label="Grafik omzet harian: {omzetHarian.map((h) => `${h.label} ${rupiah(h.total)}`).join(', ')}">
			{#each omzetHarian as h}
				<div class="flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-1">
					<span class="num text-[10px] font-black text-slate-500">{h.total ? ringkasRp(h.total) : ''}</span>
					<div class="w-full max-w-10 rounded-t-lg {h.total ? 'bg-primary-500' : 'bg-slate-100'}" style="height: {h.total ? Math.max(6, (h.total / omzetMaks) * 100) : 4}%"></div>
				</div>
			{/each}
		</div>
		<div class="mt-1.5 flex gap-2 border-t border-slate-100 pt-1.5 sm:gap-3">
			{#each omzetHarian as h}<span class="min-w-0 flex-1 text-center text-[11px] font-bold text-slate-400 capitalize">{h.label}</span>{/each}
		</div>
	</Card>
	<div class="space-y-4">
		<Card>
			<h2 class="text-base font-black">Produk terlaris</h2>
			{#if terlaris.length}
				<ol class="mt-3 space-y-2.5">
					{#each terlaris as [nama, jml], i}
						<li class="flex items-center gap-2.5 text-sm">
							<span class="grid size-6 shrink-0 place-items-center rounded-full bg-primary-50 text-xs font-black text-primary-700">{i + 1}</span>
							<span class="min-w-0 flex-1 truncate font-bold text-slate-700">{nama}</span>
							<span class="num shrink-0 font-black">{jml}×</span>
						</li>
					{/each}
				</ol>
			{:else}
				<p class="mt-3 text-sm font-bold text-slate-400">Belum ada penjualan.</p>
			{/if}
		</Card>
		<Card>
			<h2 class="text-base font-black">Stok perlu perhatian</h2>
			{#if stokTipis.length}
				<ul class="mt-3 space-y-2">
					{#each stokTipis as s}
						<li class="flex items-center justify-between gap-2 text-sm"><span class="min-w-0 truncate font-bold text-slate-700">{s.nama}</span><Badge tone={toneStok[statusnya(s)]}>{s.stok} {s.satuan}</Badge></li>
					{/each}
				</ul>
			{:else}
				<p class="mt-3 text-sm font-bold text-slate-400">Semua stok aman.</p>
			{/if}
		</Card>
	</div>
</div>

<div class="mt-8 mb-3 flex items-center justify-between gap-3">
	<h2 class="text-lg font-black">Produk di toko saya</h2>
	<Button onclick={bukaTambah}><Icon name="plus" class="size-4" strokeWidth={3} />Tambah produk</Button>
</div>
{#if stok.length}
	<Card padding="none" class="overflow-hidden">
		<ul class="divide-y divide-slate-100">
			{#each stok as s}
				{@const status = statusnya(s)}
				<li class="flex items-center gap-3 p-4">
					<div class="grid size-14 shrink-0 place-items-center overflow-hidden rounded-xl border border-slate-200 bg-slate-50 text-slate-300">
						{#if fotoProduk(s)}<img src={fotoProduk(s)} alt="" class="size-full object-cover" />{:else}<Icon name="box" class="size-5" />{/if}
					</div>
					<div class="min-w-0 flex-1">
						<p class="truncate font-black text-slate-800">{s.nama}</p>
						<p class="num mt-0.5 text-xs font-bold text-slate-400">{s.stok} {s.satuan} · {#if s.diskon}<span class="line-through">{rupiah(s.jual)}</span> <span class="text-red-600">{rupiah(hargaDiskon(s.jual, s.diskon))}</span> (-{s.diskon}%){:else}{rupiah(s.jual)}{/if} / {s.satuan}{s.unggulan ? ' · ★ Unggulan' : ''}</p>
						<div class="mt-2 max-w-48"><Progress value={Math.min(100, (s.stok / 20) * 100)} tone={toneStok[status]} size="sm" label="Stok {s.nama}" /></div>
					</div>
					<div class="flex shrink-0 items-center gap-1">
						<Badge tone={toneStok[status]}>{labelStok[status]}</Badge>
						<Button variant="ghost" size="icon-sm" aria-label="Ubah {s.nama}" title="Ubah produk" onclick={() => bukaUbah(s)}><Icon name="edit" class="size-4" /></Button>
					</div>
				</li>
			{/each}
		</ul>
	</Card>
{:else}
	<EmptyState icon={PackageSearch} title="Belum ada produk" description="Tambahkan produk sendiri atau tunggu kiriman dari Gudang Pusat." />
{/if}

<FormSheet bind:open={formOpen} title={form.produkId ? 'Ubah produk' : 'Tambah produk'} description={form.produkId && !form.milikToko ? 'Titipan Gudang Pusat: nama, satuan, dan stok tidak bisa diubah.' : 'Produk langsung tampil di marketplace bila stoknya tersedia.'} size="md">
	<div class="grid gap-4 sm:grid-cols-2">
		<div class="sm:col-span-2">
			<p class="mb-2 text-sm font-black text-slate-700">Foto produk <span class="font-bold text-slate-400">({form.fotos.length}/{MAKS_FOTO})</span></p>
			<div class="flex flex-wrap gap-2.5">
				{#each form.fotos as f, i}
					<div class="relative size-20 overflow-hidden rounded-2xl border border-slate-200">
						<img src={f} alt="Foto {i + 1}" class="size-full object-cover" />
						{#if i === 0}<span class="absolute inset-x-0 bottom-0 bg-black/55 py-0.5 text-center text-[10px] font-black text-white">Utama</span>{/if}
						<button type="button" aria-label="Hapus foto {i + 1}" onclick={() => form.fotos.splice(i, 1)} class="absolute top-1 right-1 grid size-5 place-items-center rounded-full bg-black/60 text-xs leading-none font-black text-white">×</button>
					</div>
				{/each}
				{#if form.fotos.length < MAKS_FOTO}
					<label class="grid size-20 cursor-pointer place-items-center rounded-2xl border-2 border-dashed border-slate-300 text-center text-xs font-black text-slate-400 hover:border-primary-400 hover:text-primary-600">
						<span><Icon name="plus" class="mx-auto size-5" strokeWidth={3} />Foto</span>
						<input type="file" accept="image/*" multiple class="sr-only" onchange={pilihFoto} />
					</label>
				{/if}
			</div>
			<p class="mt-1.5 text-xs font-bold text-slate-400">Foto pertama jadi foto utama. Pembeli bisa menggeser untuk melihat foto lainnya.</p>
		</div>
		<div class="sm:col-span-2"><Input label="Nama produk" placeholder="mis. Keripik Singkong 250 g" bind:value={form.nama} error={err.nama} disabled={!form.milikToko} /></div>
		<Input label="Satuan" placeholder="pcs, pack, kg" bind:value={form.satuan} disabled={!form.milikToko} />
		<NumberInput label="Stok" min={0} bind:value={form.stok} disabled={!form.milikToko} />
		<Input label="Harga jual" prefix="Rp" inputmode="numeric" placeholder="0" bind:value={form.jual} error={err.jual} />
		<NumberInput label="Diskon (%)" min={0} max={90} bind:value={form.diskon} />
		{#if form.diskon > 0 && angka(form.jual) > 0}
			<p class="num rounded-xl bg-primary-50 px-3.5 py-2.5 text-sm font-bold text-primary-800 sm:col-span-2">Harga di marketplace: <strong>{rupiah(hargaDiskon(angka(form.jual), Math.min(90, form.diskon)))}</strong> <span class="text-slate-400 line-through">{rupiah(angka(form.jual))}</span></p>
		{/if}
		<div class="sm:col-span-2"><Select label="Kategori" options={kategoriList.map((k) => ({ value: k, label: k }))} bind:value={form.kategori} /></div>
		<div class="sm:col-span-2"><Textarea label="Deskripsi" rows={3} maxlength={300} counter placeholder="Ceritakan produknya: ukuran, kualitas, cara penyimpanan…" bind:value={form.deskripsi} /></div>
		<div class="sm:col-span-2"><Checkbox bind:checked={form.unggulan} label="Jadikan produk unggulan (tampil paling depan di marketplace)" /></div>
	</div>
	{#snippet footer()}
		<div class="flex w-full items-center justify-between gap-2">
			{#if form.produkId && form.milikToko}
				<Button variant="ghost" onclick={hapus}>Hapus</Button>
			{:else}<span></span>{/if}
			<div class="flex gap-2">
				<Button variant="outline" onclick={() => (formOpen = false)}>Batal</Button>
				<Button disabled={Object.keys(err).length > 0} onclick={simpan}>Simpan</Button>
			</div>
		</div>
	{/snippet}
</FormSheet>

<h2 class="mt-8 mb-3 text-lg font-black">Pesanan dari pembeli umum</h2>
{#if pesananToko.length}
	<div class="mb-3">
		<Tabs
			bind:value={tabPesanan}
			ariaLabel="Filter status pesanan"
			items={[
				{ value: 'semua', label: 'Semua', count: pesananToko.length },
				{ value: 'proses', label: 'Perlu diproses', count: hitung('proses') },
				{ value: 'belum', label: 'Belum bayar', count: hitung('belum') },
				{ value: 'kirim', label: 'Dikirim', count: hitung('kirim') },
				{ value: 'selesai', label: 'Selesai', count: hitung('selesai') },
				{ value: 'batal', label: 'Dibatalkan', count: hitung('batal') }
			]}
		/>
	</div>
	{#if daftarPesanan.length}
		<Card padding="none" class="overflow-hidden">
			<ul class="divide-y divide-slate-100">
				{#each daftarPesanan as p (p.id)}
					<!-- Dua baris: [no. pesanan .... total] / [pembeli · barang .... status] -->
					<li>
					<a href="/toko/pesanan/{encodeURIComponent(p.id)}" aria-label="Lihat detail pesanan {p.id}" class="block space-y-1.5 px-4 py-3.5 text-sm transition hover:bg-slate-50 active:bg-slate-50">
						<div class="flex items-center justify-between gap-3">
							<p class="truncate font-black text-slate-800">{p.id} <span class="font-bold text-slate-400">· {tanggalPendek(p.dibuatPada)}</span></p>
							<span class="num shrink-0 font-black">{rupiah(p.total)}</span>
						</div>
						<div class="flex items-center justify-between gap-3">
							<p class="min-w-0 truncate text-xs font-bold text-slate-400">{p.pembeli?.nama} · {p.items.map((i) => `${i.nama} × ${i.qty}`).join(', ')}</p>
							<div class="shrink-0"><Badge tone={tonePesanan(p.status)}>{p.status}</Badge></div>
						</div>
					</a>
					</li>
				{/each}
			</ul>
		</Card>
	{:else}
		<EmptyState icon={PackageSearch} title="Tidak ada pesanan" description="Belum ada pesanan dengan status ini." />
	{/if}
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
						<p class="text-xs font-bold text-slate-400">{tanggal(t.tgl)} · {t.item} item</p>
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
