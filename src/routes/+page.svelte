<script>
	import { Card, Badge, Avatar } from '@khwarizmi/svelte-ui';
	import Icon from '$lib/components/Icon.svelte';
	import { akun, hakAkses, labelRole, ringkasan, omzetMingguan } from '$lib/data.js';
	import { nav } from '$lib/nav.js';
	import { masuk } from '$lib/auth.js';
	import { rupiah } from '$lib/format.js';

	const tugas = {
		admin: 'Mengelola seluruh sistem, akun, dan semua data usaha.',
		kurir: 'Mengantar pesanan, memperbarui status pengiriman, dan mencatat serah-terima.',
		keuangan: 'Mencatat modal, pembayaran, pengeluaran, saldo, dan laporan keuangan.',
		gudang: 'Mencatat barang masuk, keluar, serta penyesuaian stok.',
		pemasaran: 'Mengelola Majelis Taklim, pesanan, dan status penjualan.',
		mt: 'Mengelola stok titipan dan penjualan ke pembeli umum di tokonya sendiri.'
	};

	const menu = (role) => nav.filter((n) => hakAkses[role].includes(n.href));

	const alur = [
		['Modal', 'Setoran modal anggota dicatat sebagai kas awal.'],
		['Pembelian', 'Barang dibeli dari supplier.'],
		['Stok', 'Stok bertambah saat barang diterima.'],
		['Penjualan', 'Transaksi ke Majelis Taklim atau umum.'],
		['Pembayaran', 'Tercatat lunas saat transaksi.'],
		['Keuangan', 'Pemasukan dan pengeluaran tercatat.'],
		['Laporan', 'Rekap per periode, siap diunduh.']
	];

	const maks = Math.max(...omzetMingguan.map((m) => m.nilai));
</script>

<svelte:head><title>UBER POKJA · Rancangan Aplikasi</title></svelte:head>

<div class="min-h-dvh">
	<!-- Hero -->
	<header class="dots-bg relative overflow-hidden bg-brand-800 text-white">
		<div class="mx-auto max-w-6xl px-5 sm:px-8">
			<nav class="flex h-20 items-center justify-between gap-4">
				<div class="flex items-center gap-3">
					<span class="grid size-11 shrink-0 place-items-center rounded-2xl bg-white shadow-sm"><img src="/logo.png" alt="" class="size-8" /></span>
					<div class="leading-tight">
						<p class="font-bold">UBER POKJA</p>
						<p class="text-xs text-brand-100">Majelis Taklim Tenjolaya</p>
					</div>
				</div>
			</nav>

			<div class="grid items-center gap-12 pt-10 pb-28 lg:grid-cols-[1.1fr_1fr] lg:pt-16 lg:pb-36">
				<div>
					<h1 class="text-[34px] leading-[1.1] font-black tracking-tight sm:text-5xl lg:text-[56px]">
						Rancangan aplikasi<br />UBER POKJA
					</h1>
					<p class="mt-5 max-w-xl text-base leading-relaxed text-brand-100 sm:text-lg">
						Satu tempat untuk mencatat modal, pembelian, stok, penjualan, dan keuangan Usaha Bersama POKJA Majelis Taklim Tenjolaya, lengkap dengan laporannya.
					</p>
				</div>

				<!-- Cuplikan dashboard -->
				<div class="relative hidden lg:block" aria-hidden="true">
					<div class="rotate-1 rounded-3xl bg-white p-5 text-ink shadow-[0_40px_80px_-20px_rgb(0_0_0/0.45)]">
						<div class="flex items-center justify-between">
							<div>
								<p class="eyebrow">September 2026</p>
								<p class="mt-1 font-bold">Assalamu'alaikum, Ahmad</p>
							</div>
							<span class="rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-semibold text-white">+ Penjualan</span>
						</div>
						<div class="mt-4 grid grid-cols-2 gap-3">
							<div class="rounded-2xl bg-brand-800 p-4 text-white">
								<p class="text-xs text-brand-100">Saldo kas</p>
								<p class="num mt-1 text-lg font-bold">{rupiah(ringkasan.saldo)}</p>
								<div class="mt-3 h-1 rounded-full bg-white/15"><div class="h-full w-1/3 rounded-full bg-gold-400"></div></div>
							</div>
							<div class="rounded-2xl border border-line p-4">
								<p class="text-xs text-muted">Omzet bulan ini</p>
								<p class="num mt-1 text-lg font-bold">{rupiah(ringkasan.omzetBulan)}</p>
								<p class="mt-2 text-[11px] text-muted">{ringkasan.transaksiBulan} transaksi</p>
							</div>
						</div>
						<div class="mt-3 flex h-28 items-end gap-3 rounded-2xl border border-line p-4">
							{#each omzetMingguan as m, i}
								<div class="flex-1 rounded-t-md {i === omzetMingguan.length - 1 ? 'bg-brand-600' : 'bg-brand-200'}" style="height: {(m.nilai / maks) * 100}%"></div>
							{/each}
						</div>
					</div>
					<div class="absolute -bottom-6 -left-8 flex -rotate-2 items-center gap-3 rounded-2xl bg-white px-4 py-3 text-ink shadow-pop">
						<span class="grid size-9 place-items-center rounded-full bg-brand-50 text-brand-700"><Icon name="check" class="size-4" /></span>
						<div class="leading-tight">
							<p class="text-sm font-semibold">Penjualan tersimpan</p>
							<p class="text-xs text-muted">MT Al-Hidayah · Rp 612.000</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	</header>

	<main class="mx-auto max-w-6xl px-5 pb-20 sm:px-8">
		<!-- Dua pilihan -->
		<div class="relative -mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:-mt-20">
			<Card href="/marketplace" padding="lg" class="group flex items-start gap-4">
				<span class="grid size-12 shrink-0 place-items-center rounded-2xl border border-amber-200 bg-amber-50 text-amber-600">
					<Icon name="cart" class="size-6" strokeWidth={2.2} />
				</span>
				<span class="flex-1">
					<span class="block text-lg font-black">Belanja di marketplace</span>
					<span class="mt-1 block text-sm leading-relaxed font-bold text-slate-400">Katalog publik untuk pembeli umum, lengkap dengan keranjang dan pemesanan.</span>
				</span>
				<Icon name="chevron" class="mt-1 size-5 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-primary-600" strokeWidth={2.5} />
			</Card>
			<Card href="/preview" padding="lg" class="group flex items-start gap-4">
				<span class="grid size-12 shrink-0 place-items-center rounded-2xl border border-primary-200 bg-primary-50 text-primary-600">
					<svg viewBox="0 0 24 24" class="size-6" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="2" y="4" width="14" height="10" rx="1.5" /><path d="M6 18h6M9 14v4" /><rect x="17" y="8" width="5" height="11" rx="1.2" /></svg>
				</span>
				<span class="flex-1">
					<span class="block text-lg font-black">Lihat pratinjau</span>
					<span class="mt-1 block text-sm leading-relaxed font-bold text-slate-400">Lihat tampilan di HP, tablet, dan komputer, lalu ganti peran dan halaman dengan mudah.</span>
				</span>
				<Icon name="chevron" class="mt-1 size-5 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-primary-600" strokeWidth={2.5} />
			</Card>
			<Card href="/login" padding="lg" class="group flex items-start gap-4">
				<span class="grid size-12 shrink-0 place-items-center rounded-2xl border border-amber-200 bg-amber-50 text-amber-600">
					<Icon name="cart" class="size-6" strokeWidth={2.2} />
				</span>
				<span class="flex-1">
					<span class="block text-lg font-black">Coba langsung</span>
					<span class="mt-1 block text-sm leading-relaxed font-bold text-slate-400">Masuk ke aplikasi dan coba sendiri, misalnya mencatat penjualan atau melihat stok.</span>
				</span>
				<Icon name="chevron" class="mt-1 size-5 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-primary-600" strokeWidth={2.5} />
			</Card>
		</div>

		<!-- Peran -->
		<section class="mt-20">
			<div class="max-w-2xl">
				<p class="text-xs font-black tracking-widest text-primary-600 uppercase">Peran pengguna</p>
				<h2 class="mt-2 text-2xl font-black tracking-tight sm:text-3xl">Setiap peran melihat menu sesuai tugasnya</h2>
				<p class="mt-2 font-bold text-slate-400">Klik salah satu peran untuk langsung masuk dan mencobanya.</p>
			</div>

			<div class="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
				{#each akun as a}
					<Card padding="md" class="group flex flex-col" onclick={() => masuk(a)} aria-label="Masuk sebagai {a.role}">
						<div class="flex items-center gap-3">
							<Avatar name={a.nama} size="md" />
							<div class="min-w-0 flex-1">
								<p class="font-black">{labelRole(a.role)}</p>
								<p class="truncate text-xs font-bold text-slate-400">{a.nama}</p>
							</div>
							<span class="text-xs font-black text-primary-600 opacity-0 transition group-hover:opacity-100">Masuk →</span>
						</div>
						<p class="mt-4 text-sm leading-relaxed font-bold text-slate-600">{tugas[a.role]}</p>
						<div class="mt-4 flex flex-wrap gap-1.5 border-t border-slate-100 pt-4">
							{#each menu(a.role) as m}
								<Badge size="sm">{m.label}</Badge>
							{/each}
						</div>
					</Card>
				{/each}
			</div>
		</section>

		<!-- Alur -->
		<section class="mt-20">
			<div class="max-w-2xl">
				<p class="text-xs font-black tracking-widest text-primary-600 uppercase">Alur usaha</p>
				<h2 class="mt-2 text-2xl font-black tracking-tight sm:text-3xl">Dari modal sampai laporan, tercatat berurutan</h2>
			</div>
			<ol class="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-7">
				{#each alur as [judul, ket], i}
					<li>
						<Card padding="sm" class="h-full">
							<span class="num grid size-7 place-items-center rounded-full border-2 border-primary-700 bg-linear-to-br from-primary-400 to-primary-600 text-xs font-black text-white">{i + 1}</span>
							<p class="mt-3 text-sm font-black">{judul}</p>
							<p class="mt-1 text-xs leading-relaxed font-bold text-slate-400">{ket}</p>
						</Card>
					</li>
				{/each}
			</ol>
		</section>
	</main>

	<footer class="border-t border-slate-200">
		<div class="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-5 py-6 text-xs font-bold text-slate-400 sm:px-8">
			<p>© 2026 UBER POKJA · Majelis Taklim Tenjolaya</p>
			<p>Ini rancangan untuk ditinjau. Semua nama, angka, dan transaksi adalah contoh.</p>
		</div>
	</footer>
</div>
