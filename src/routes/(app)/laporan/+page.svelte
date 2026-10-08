<script>
	import { Button, Card, Tabs, Select, showToast } from '@khwarizmi/svelte-ui';
	import PageHeader from '$lib/components/PageHeader.svelte';
	import Icon from '$lib/components/Icon.svelte';
	import { ikon } from '$lib/icons.js';
	import { ringkasan, penjualan, pembelian, produk } from '$lib/data.js';
	import { rupiah } from '$lib/format.js';
	import { browser } from '$app/environment';

	let jenis = $state('penjualan');
	let role = $state('');
	let periode = $state('2026-09');

	const totalJual = penjualan.reduce((s, t) => s + t.total, 0);
	const totalBeli = pembelian.reduce((s, t) => s + t.total, 0);
	const nilaiStok = produk.reduce((s, p) => s + p.stok * p.beli, 0);
	const utang = pembelian.filter((b) => b.bayar !== 'Lunas').reduce((s, b) => s + b.total, 0);

	const laporan = {
		penjualan: { judul: 'Laporan Penjualan', icon: 'cart', baris: [['Jumlah transaksi', penjualan.length + ' transaksi'], ['Sudah dibayar', rupiah(totalJual - ringkasan.piutang)], ['Piutang', rupiah(ringkasan.piutang)]], total: ['Total penjualan', rupiah(totalJual)] },
		pembelian: { judul: 'Laporan Pembelian', icon: 'receipt', baris: [['Jumlah pembelian', pembelian.length + ' faktur'], ['Sudah dibayar', rupiah(totalBeli - utang)], ['Belum lunas ke supplier', rupiah(utang)]], total: ['Total pembelian', rupiah(totalBeli)] },
		stok: { judul: 'Laporan Stok', icon: 'layers', baris: [['Jumlah produk', produk.length + ' produk'], ['Total unit', produk.reduce((s, p) => s + p.stok, 0) + ' unit'], ['Produk menipis/habis', produk.filter((p) => p.stok <= p.min).length + ' produk']], total: ['Nilai stok (harga beli)', rupiah(nilaiStok)] },
		keuangan: { judul: 'Laporan Keuangan', icon: 'wallet', baris: [['Modal', rupiah(ringkasan.modal)], ['Pemasukan', rupiah(ringkasan.omzetBulan)], ['Pengeluaran', '− ' + rupiah(ringkasan.pengeluaranBulan)]], total: ['Saldo akhir', rupiah(ringkasan.saldo)] }
	};
	const laporanRole = { keuangan: ['keuangan'], gudang: ['stok'], pemasaran: ['penjualan'] };
	const tabJenis = $derived(
		Object.entries(laporan)
			.filter(([value]) => !(laporanRole[role] && !laporanRole[role].includes(value)))
			.map(([value, l]) => ({ value, label: l.judul.replace('Laporan ', ''), icon: ikon[l.icon] }))
	);
	$effect(() => {
		if (!browser) return;
		role = JSON.parse(localStorage.getItem('user') ?? '{}').role ?? '';
		if (laporanRole[role]) jenis = laporanRole[role][0];
	});
	const opsiPeriode = ['2026-09', '2026-08', '2026-07', '2026-06'].map((v) => ({
		value: v,
		label: new Date(v + '-01').toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })
	}));

	const aktif = $derived(laporan[jenis]);
	const namaPeriode = $derived(opsiPeriode.find((o) => o.value === periode)?.label ?? '');

	const unduh = (format) =>
		showToast({ tone: 'info', title: `Mengunduh ${format}`, description: `${aktif.judul} · ${namaPeriode}` });
</script>

<svelte:head><title>Laporan · UBER POKJA</title></svelte:head>

<PageHeader eyebrow="Keuangan" title="Laporan" subtitle="Rekap per periode, siap diunduh atau dicetak." />

<div class="grid grid-cols-1 gap-5 lg:grid-cols-[260px_minmax(0,1fr)]">
	<aside class="min-w-0 space-y-4">
		<Card padding="sm">
			<p class="mb-2 ml-1 text-xs font-black tracking-widest text-slate-400 uppercase">Jenis laporan</p>
			<!-- Tabs vertikal di layar lebar, horizontal di HP -->
			<div class="hidden lg:block **:[[role=tablist]]:w-full **:[[role=tab]]:justify-start">
				<Tabs tabs={tabJenis} bind:value={jenis} orientation="vertical" ariaLabel="Jenis laporan" />
			</div>
			<div class="lg:hidden">
				<Tabs tabs={tabJenis} bind:value={jenis} ariaLabel="Jenis laporan" />
			</div>
		</Card>
		<Card padding="sm">
			<Select label="Periode" options={opsiPeriode} bind:value={periode} />
		</Card>
	</aside>

	<Card padding="none" class="overflow-hidden">
		<div class="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-5 py-4 sm:px-6">
			<p class="text-sm font-black">Pratinjau dokumen</p>
			<div class="flex gap-2">
				<Button variant="outline" size="sm" onclick={() => unduh('Excel')}><Icon name="download" class="size-4" /> Excel</Button>
				<Button size="sm" onclick={() => unduh('PDF')}><Icon name="download" class="size-4" /> PDF</Button>
			</div>
		</div>

		<div class="bg-slate-100/70 p-3 sm:p-8">
			<article class="mx-auto max-w-xl rounded-xl bg-white p-5 shadow-[0_6px_0_0_#E2E8F0] ring-1 ring-slate-200 sm:p-10">
				<header class="flex items-start justify-between gap-3 border-b-2 border-slate-800 pb-5">
					<div class="min-w-0">
						<p class="text-[11px] font-black tracking-widest text-slate-400 uppercase">UBER POKJA · MT Tenjolaya</p>
						<h2 class="mt-2 text-xl font-black tracking-tight">{aktif.judul}</h2>
						<p class="mt-1 text-sm font-bold text-slate-400">Periode {namaPeriode}</p>
					</div>
					<img src="/logo.png" alt="" class="size-10 shrink-0 sm:size-12" />
				</header>
				<dl class="divide-y divide-slate-100">
					{#each aktif.baris as [k, v]}
						<div class="flex justify-between gap-4 py-3.5 text-sm"><dt class="font-bold text-slate-500">{k}</dt><dd class="num shrink-0 text-right font-black whitespace-nowrap">{v}</dd></div>
					{/each}
				</dl>
				<!-- Total: HP label di atas nominal (label panjang tidak terlipat); sm ke atas sebaris. -->
				<div class="mt-2 flex flex-col gap-1 rounded-xl border border-primary-200 bg-primary-50 px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
					<span class="text-xs font-black text-primary-700 sm:text-sm sm:text-primary-800">{aktif.total[0]}</span>
					<span class="num text-xl font-black whitespace-nowrap text-primary-800 sm:text-base">{aktif.total[1]}</span>
				</div>
				<footer class="mt-10 grid grid-cols-2 gap-6 text-center text-xs font-bold text-slate-400 sm:gap-10">
					<div><p>Dibuat oleh</p><div class="mx-auto mt-12 w-4/5 max-w-36 border-t border-slate-300 pt-1.5">Bendahara</div></div>
					<div><p>Mengetahui</p><div class="mx-auto mt-12 w-4/5 max-w-36 border-t border-slate-300 pt-1.5">Penanggung jawab</div></div>
				</footer>
			</article>
		</div>
	</Card>
</div>
