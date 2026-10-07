<script>
	import { onMount, untrack } from 'svelte';
	import { goto } from '$app/navigation';
	import { Badge, Button, Card, EmptyState, Input, Modal, SearchInput, Select, showToast, Tabs } from '@khwarizmi/svelte-ui';
	import { ArrowRight, Bell, ClipboardList, Home, MapPin, MessageCircle, PackageCheck, SearchX, ShieldCheck, ShoppingBag, Store, Truck, UserRound } from 'lucide-svelte';
	import { rupiah } from '$lib/format.js';
	import { majelis } from '$lib/data.js';
	import { tokoState, tokoAktif, katalogToko } from '$lib/marketplace.svelte.js';
	import { kurangiStokMT } from '$lib/inventori.svelte.js';
	import { sudahMasukPembeli, urlMasuk } from '$lib/pembeli.js';

	// Tanpa toko dipilih, tampilkan gabungan stok semua MT (bisa disaring manual
	// lewat /marketplace/toko kalau mau belanja dari satu toko saja).
	const toko = $derived(tokoAktif());
	const produkSumber = $derived(katalogToko(tokoState.majelisId));
	let produk = $state([]);
	$effect(() => {
		produk = produkSumber.map((p) => ({ ...p }));
	});
	let cari = $state('');
	let kategoriAktif = $state('Semua');
	let keranjang = $state({});
	let cartOpen = $state(false);
	let suksesOpen = $state(false);
	let pesananOpen = $state(false);
	let profilOpen = $state(false);
	let notifOpen = $state(false);
	let chatOpen = $state(false);
	let pesanBaru = $state('');
	let chat = $state([{ dari: 'admin', isi: 'Assalamu’alaikum, ada yang bisa kami bantu?' }]);
	let pembeli = $state({ nama: '', hp: '', alamat: '' });
	let pengiriman = $state('antar');
	let pembayaran = $state('transfer');
	let pesanan = $state([]);
	let dipilih = $state({}); // id produk -> dipilih untuk checkout
	let storageSiap = $state(false);
	const STORAGE = {
		cart: 'uber-pokja:marketplace:cart',
		buyer: 'uber-pokja:marketplace:buyer',
		selected: 'uber-pokja:marketplace:selected',
		orders: 'uber-pokja:marketplace:orders'
	};

	const kategoriProduk = (p) => {
		if (p.nama.includes('Telur')) return 'Protein & Segar';
		if (p.nama.startsWith('Mi Instan') || p.nama.includes('Teh')) return 'Makanan & Minuman';
		return 'Bahan Pokok';
	};
	const kategori = ['Semua', 'Bahan Pokok', 'Protein & Segar', 'Makanan & Minuman'];
	const visualProduk = {
		1: { emoji: '🍚', tone: 'rice', label: 'Beras pilihan' },
		2: { emoji: '🫙', tone: 'oil', label: 'Minyak goreng' },
		3: { emoji: '🧂', tone: 'sugar', label: 'Gula pasir' },
		4: { emoji: '🥚', tone: 'egg', label: 'Telur segar' },
		5: { emoji: '🌾', tone: 'flour', label: 'Tepung terigu' },
		6: { emoji: '🍜', tone: 'noodle', label: 'Mi instan' },
		7: { emoji: '🍵', tone: 'Teh celup' }
	};
	const visual = (p) => visualProduk[p.id] ?? { emoji: '🛍️', tone: 'default', label: 'Produk pilihan' };
	const daftar = $derived(
		produk.filter((p) => {
			const cocokCari = p.nama.toLowerCase().includes(cari.toLowerCase());
			return cocokCari && (kategoriAktif === 'Semua' || kategoriProduk(p) === kategoriAktif);
		})
	);
	const baris = $derived(produk.filter((p) => keranjang[p.id]).map((p) => ({ ...p, qty: keranjang[p.id] })));
	const jumlah = $derived(baris.reduce((sum, b) => sum + b.qty, 0));
	const barisDipilih = $derived(baris.filter((b) => dipilih[b.id]));
	const jumlahDipilih = $derived(barisDipilih.reduce((sum, b) => sum + b.qty, 0));
	const subtotal = $derived(barisDipilih.reduce((sum, b) => sum + b.qty * b.jual, 0));
	const semuaDipilih = $derived(baris.length > 0 && baris.every((b) => dipilih[b.id]));

	function ubah(p, selisih) {
		const qty = Math.min(p.stok, Math.max(0, (keranjang[p.id] ?? 0) + selisih));
		if (qty) keranjang[p.id] = qty;
		else {
			delete keranjang[p.id];
			delete dipilih[p.id];
		}
	}
	function togglePilih(id) {
		dipilih[id] = !dipilih[id];
	}
	function toggleSemua() {
		const nilaiBerikutnya = !semuaDipilih;
		for (const b of baris) dipilih[b.id] = nilaiBerikutnya;
	}
	function tambah(p) {
		if (!p.stok) {
			showToast({ tone: 'warning', title: 'Stok produk habis', description: 'Silakan pilih produk lain.' });
			return;
		}
		ubah(p, 1);
		dipilih[p.id] = true;
		showToast({ tone: 'success', title: 'Ditambahkan ke keranjang', description: `${p.nama} · ${keranjang[p.id]} ${p.satuan}` });
	}
	function kirimPesan() {
		const isi = pesanBaru.trim();
		if (!isi) return;
		chat.push({ dari: 'customer', isi });
		pesanBaru = '';
	}
	function checkout() {
		if (!barisDipilih.length) {
			showToast({ tone: 'warning', title: 'Pilih produk terlebih dahulu', description: 'Centang produk yang ingin dipesan.' });
			return;
		}
		if (!sudahMasukPembeli()) {
			showToast({ tone: 'info', title: 'Masuk dulu untuk memesan', description: 'Lengkapi data pribadi Anda sebelum membuat pesanan.' });
			goto(urlMasuk('/marketplace'));
			return;
		}
		if (!pembeli.nama.trim() || !pembeli.hp.trim() || !pembeli.alamat.trim()) {
			showToast({ tone: 'warning', title: 'Data belum lengkap', description: 'Isi nama dan nomor WhatsApp terlebih dahulu.' });
			return;
		}
		// Produk di keranjang bisa berasal dari toko (MT) berbeda-beda saat belum
		// memfilter satu toko — pesanan dipecah per toko agar tiap MT hanya
		// melihat pesanan miliknya dan stok yang dikurangi tepat sasaran.
		const perToko = Map.groupBy(barisDipilih, (b) => b.majelisId);
		let urutan = 0;
		for (const [majelisId, barisToko] of perToko) {
			const tokoNama = barisToko[0]?.tokoNama ?? majelis.find((m) => m.id === majelisId)?.nama ?? '';
			pesanan.unshift({
				id: 'MP-' + Date.now() + (urutan++),
				dibuatPada: new Date().toISOString(),
				majelisId,
				tokoNama,
				pembeli: { ...pembeli },
				items: barisToko.map((b) => ({ id: b.id, nama: b.nama, qty: b.qty, satuan: b.satuan, harga: b.jual })),
				total: barisToko.reduce((s, b) => s + b.qty * b.jual, 0),
				pengiriman,
				pembayaran,
				status: pembayaran === 'tunai' ? 'Menunggu diproses' : 'Menunggu pembayaran'
			});
			// Pesanan langsung mengurangi stok titipan MT (bukan stok Gudang Pusat).
			for (const b of barisToko) kurangiStokMT(majelisId, b.id, b.qty);
		}
		cartOpen = false;
		suksesOpen = true;
		for (const b of barisDipilih) {
			delete keranjang[b.id];
			delete dipilih[b.id];
		}
		keranjang = { ...keranjang };
		dipilih = { ...dipilih };
		pembeli = { nama: '', hp: '', alamat: '' };
	}

	// Keranjang tetap ada setelah halaman dimuat ulang. Riwayat pesanan juga
	// disimpan lokal sebagai dasar integrasi ke backend pada tahap berikutnya.
	let cartMentah = $state({});
	onMount(() => {
		try {
			const cartTersimpan = JSON.parse(localStorage.getItem(STORAGE.cart) ?? '{}');
			if (cartTersimpan && typeof cartTersimpan === 'object' && !Array.isArray(cartTersimpan)) cartMentah = cartTersimpan;
			const pembeliTersimpan = JSON.parse(localStorage.getItem(STORAGE.buyer) ?? 'null');
			if (pembeliTersimpan && typeof pembeliTersimpan === 'object') {
				pembeli = { nama: pembeliTersimpan.nama ?? '', hp: pembeliTersimpan.hp ?? '', alamat: pembeliTersimpan.alamat ?? '' };
			}
			const pilihanTersimpan = JSON.parse(localStorage.getItem(STORAGE.selected) ?? '{}');
			if (pilihanTersimpan && typeof pilihanTersimpan === 'object' && !Array.isArray(pilihanTersimpan)) dipilih = pilihanTersimpan;
			const pesananTersimpan = JSON.parse(localStorage.getItem(STORAGE.orders) ?? '[]');
			if (Array.isArray(pesananTersimpan)) pesanan = pesananTersimpan;
		} catch {
			// Data localStorage rusak tidak boleh menghalangi pembeli berbelanja.
		} finally {
			storageSiap = true;
		}
	});

	// Validasi ulang keranjang & pilihan terhadap katalog toko aktif (produk bisa
	// berbeda tiap toko, jadi harus direvalidasi setiap kali `produk` berubah).
	// Dipicu hanya oleh cartMentah/produk/storageSiap — dipilih dibaca lewat
	// untrack agar effect ini tidak memicu dirinya sendiri saat menulis dipilih.
	$effect(() => {
		if (!storageSiap) return;
		const keranjangBaru = Object.fromEntries(
			Object.entries(cartMentah).filter(([id, qty]) => produk.some((p) => String(p.id) === id) && Number.isFinite(+qty) && +qty > 0)
		);
		keranjang = keranjangBaru;
		dipilih = Object.fromEntries(Object.entries(untrack(() => dipilih)).filter(([id, aktif]) => keranjangBaru[id] && aktif));
	});

	$effect(() => {
		if (!storageSiap) return;
		localStorage.setItem(STORAGE.cart, JSON.stringify(keranjang));
		localStorage.setItem(STORAGE.buyer, JSON.stringify(pembeli));
		localStorage.setItem(STORAGE.selected, JSON.stringify(dipilih));
		localStorage.setItem(STORAGE.orders, JSON.stringify(pesanan));
		window.dispatchEvent(new Event('keranjang-berubah'));
	});
</script>

<svelte:head>
	<title>Marketplace · UBER POKJA</title>
	<meta name="description" content="Belanja produk UBER POKJA Majelis Taklim Tenjolaya." />
</svelte:head>

<div class="marketplace min-h-dvh text-ink">

	<main>
		<section class="px-4 pt-5 sm:px-6 sm:pt-7">
			<div id="market-beranda" class="hero-shell mx-auto max-w-6xl scroll-mt-24 overflow-hidden rounded-[2rem] text-white">
				<div class="relative z-10 grid gap-9 px-6 py-10 sm:px-10 sm:py-14 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:px-14">
					<div>
						<h1 class="max-w-2xl text-[2.4rem] leading-[1.09] font-black tracking-tight sm:text-5xl lg:text-[3.4rem]">Belanja sembako jadi <span class="text-gold-400">lebih dekat.</span></h1>
						<p class="mt-5 max-w-lg text-sm leading-7 font-medium text-brand-100 sm:text-base">Marketplace kebutuhan harian untuk masyarakat dan jaringan Majelis Taklim. Harga jelas, pesanan mudah, dan stok terhubung ke UBER POKJA.</p>
						<Button variant="warning" size="lg" class="mt-7 !bg-none !bg-gold-400 !text-brand-900 !shadow-[0_6px_0_0_#b58d16] hover:!translate-y-px hover:!shadow-[0_5px_0_0_#b58d16] active:!translate-y-1 active:!shadow-[0_2px_0_0_#b58d16]" onclick={() => document.getElementById('katalog')?.scrollIntoView({ behavior: 'smooth' })}>Jelajahi produk <ArrowRight size={17} strokeWidth={2.5} /></Button>
					</div>
					<div class="hero-art relative mx-auto w-full max-w-md" aria-hidden="true">
						<div class="hero-orbit"></div>
						<div class="hero-basket"><span>🛍️</span></div>
						<div class="hero-float hero-float-a"><span>🍚</span><b>Beras pilihan</b></div>
						<div class="hero-float hero-float-b"><span>🥚</span><b>Telur segar</b></div>
						<div class="hero-float hero-float-c"><span>🫙</span><b>Minyak goreng</b></div>
					</div>
				</div>
			</div>
		</section>

		<section class="mx-auto grid max-w-6xl gap-3 px-4 pt-5 sm:grid-cols-3 sm:px-6">
			<Card padding="none" class="flex min-h-[78px] items-center gap-3 !border-[#e9eadd] !bg-[#fffefa] !p-4 sm:!p-[17px]">
				<span class="grid size-10 shrink-0 place-items-center rounded-[13px] bg-[#eaf4e9] text-[#176846]"><PackageCheck size={19} /></span>
				<div class="min-w-0"><strong class="block text-[13px] text-[#19392b]">Produk pilihan</strong><small class="mt-0.5 block text-[11px] text-[#66776d]">Kebutuhan harian tersedia</small></div>
			</Card>
			<Card padding="none" class="flex min-h-[78px] items-center gap-3 !border-[#e9eadd] !bg-[#fffefa] !p-4 sm:!p-[17px]">
				<span class="grid size-10 shrink-0 place-items-center rounded-[13px] bg-[#eaf4e9] text-[#176846]"><ShieldCheck size={19} /></span>
				<div class="min-w-0"><strong class="block text-[13px] text-[#19392b]">Harga transparan</strong><small class="mt-0.5 block text-[11px] text-[#66776d]">Terlihat sebelum memesan</small></div>
			</Card>
			<Card padding="none" class="flex min-h-[78px] items-center gap-3 !border-[#e9eadd] !bg-[#fffefa] !p-4 sm:!p-[17px]">
				<span class="grid size-10 shrink-0 place-items-center rounded-[13px] bg-[#eaf4e9] text-[#176846]"><MapPin size={19} /></span>
				<div class="min-w-0"><strong class="block text-[13px] text-[#19392b]">Dari Tenjolaya</strong><small class="mt-0.5 block text-[11px] text-[#66776d]">Belanja dari usaha bersama</small></div>
			</Card>
		</section>

		<section id="katalog" class="mx-auto max-w-6xl scroll-mt-24 px-4 py-10 sm:px-6 sm:py-14">
			<div class="flex flex-wrap items-end justify-between gap-4">
				<div>
					<p class="text-xs font-black tracking-[0.18em] text-primary-600 uppercase">Pilihan untuk rumah</p>
					<h2 class="mt-1 text-2xl font-black tracking-tight sm:text-3xl">Belanja kebutuhanmu</h2>
					<p class="mt-2 text-sm text-slate-500">Dari bahan pokok sampai camilan untuk stok di rumah.</p>
				</div>
				<p class="rounded-full bg-white px-3 py-1.5 text-xs font-bold text-slate-500 ring-1 ring-slate-200">{daftar.length} produk ditemukan</p>
			</div>

			<div class="mt-7 flex flex-col gap-4 rounded-2xl border border-[#e8e9df] bg-white p-3 shadow-card sm:p-4">
				<div class="min-w-0 overflow-x-auto pb-1">
					<Tabs tabs={kategori.map((item) => ({ value: item, label: item }))} bind:value={kategoriAktif} ariaLabel="Kategori produk" />
				</div>
				<SearchInput bind:value={cari} aria-label="Cari produk" placeholder="Cari produk..." class="w-full" />
			</div>

			{#if daftar.length}
				<div class="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
					{#each daftar as p (p.id)}
						{@const qty = keranjang[p.id] ?? 0}
						{@const habis = p.stok === 0}
						<article class="product-card flex flex-col overflow-hidden rounded-[1.5rem] border border-[#e8e9df] bg-white">
							<div class="product-visual {visual(p).tone} relative grid aspect-[4/2.65] place-items-center">
								<span class="product-emoji" role="img" aria-label={visual(p).label}>{visual(p).emoji}</span>
								<span class="absolute top-3 left-3 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-black text-brand-900 shadow-sm">{kategoriProduk(p)}</span>
							</div>
							<div class="flex flex-1 flex-col p-4 sm:p-5">
								{#if p.tokoNama}
									<a href="/marketplace/toko/{p.majelisId}" class="mb-1.5 inline-flex w-fit items-center gap-1 rounded-full bg-slate-100 px-2 py-1 text-[11px] font-black text-slate-600 transition hover:bg-primary-50 hover:text-primary-700">
										<Store size={11} /> {p.tokoNama}
									</a>
								{/if}
								<h3 class="min-h-11 text-[15px] leading-snug font-black text-slate-800">{p.nama}</h3>
								<div class="mt-2 flex items-center justify-between gap-2">
									<p class="text-xs font-medium text-slate-500">Stok {p.stok} {p.satuan}</p>
									{#if habis}<Badge tone="red">Habis</Badge>{:else if p.stok <= p.min}<Badge tone="amber">Terbatas</Badge>{/if}
								</div>
								<div class="mt-4 flex items-baseline gap-1"><p class="num text-xl font-black tracking-tight text-brand-800">{rupiah(p.jual)}</p><span class="text-xs font-medium text-slate-400">/ {p.satuan}</span></div>
								{#if qty}
									<div class="mt-4 flex items-center justify-between rounded-2xl border border-primary-300 bg-primary-50 p-1.5 shadow-[0_3px_0_0_#a8dbc0]">
										<Button variant="ghost" size="icon-sm" class="!rounded-xl !border !border-primary-300 !bg-white !text-primary-700 !shadow-[0_2px_0_0_#a8dbc0] hover:!translate-y-px hover:!shadow-[0_1px_0_0_#a8dbc0] active:!translate-y-[2px] active:!shadow-none" aria-label="Kurangi {p.nama}" onclick={() => ubah(p, -1)}>−</Button>
										<span class="num min-w-24 text-center text-sm font-black text-primary-900">{qty} <span class="font-bold text-primary-600">{p.satuan}</span></span>
										<Button variant="ghost" size="icon-sm" class="!rounded-xl !border !border-primary-300 !bg-white !text-primary-700 !shadow-[0_2px_0_0_#a8dbc0] hover:!translate-y-px hover:!shadow-[0_1px_0_0_#a8dbc0] active:!translate-y-[2px] active:!shadow-none" aria-label="Tambah {p.nama}" disabled={qty >= p.stok} onclick={() => tambah(p)}>+</Button>
									</div>
								{:else}
									<Button fullWidth class="mt-4 !bg-none !bg-white !border-primary-700 !text-primary-700 !shadow-[0_3px_0_0_#0f5a3a] hover:!translate-y-px hover:!shadow-[0_2px_0_0_#0f5a3a] active:!translate-y-[3px] active:!shadow-none" variant="outline" disabled={habis} onclick={() => tambah(p)}><ShoppingBag size={16} /> {habis ? 'Stok habis' : 'Tambah ke keranjang'}</Button>
								{/if}
							</div>
						</article>
					{/each}
				</div>
			{:else}
				<EmptyState class="mt-10" icon={SearchX} title="Produk tidak ditemukan" description="Coba kata kunci atau kategori lain." />
			{/if}
		</section>
	</main>


	<Modal bind:open={cartOpen} title="Keranjang belanja" description={baris.length ? jumlahDipilih + ' item dipilih dari ' + jumlah + ' item di keranjang' : 'Keranjang Anda masih kosong.'} size="lg">
		<div class="cart-body">
		{#if baris.length}
			<div class="mb-4 flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
				<label class="flex cursor-pointer items-center gap-3 text-sm font-black text-slate-700">
					<input class="cart-check" type="checkbox" checked={semuaDipilih} onchange={toggleSemua} />
					Pilih semua
				</label>
				<span class="text-xs font-bold text-slate-400">{barisDipilih.length} produk dipilih</span>
			</div>
			<div class="space-y-4">
				{#each baris as b}
					<div class="grid grid-cols-[auto_auto_minmax(0,1fr)] gap-3 rounded-3xl border p-4 transition {dipilih[b.id] ? 'border-primary-300 bg-primary-50/30' : 'border-slate-200 bg-white'} sm:grid-cols-[auto_auto_minmax(0,1fr)_auto] sm:items-center">
						<label class="flex cursor-pointer items-center self-center" aria-label="Pilih {b.nama}">
							<input class="cart-check" type="checkbox" checked={Boolean(dipilih[b.id])} onchange={() => togglePilih(b.id)} />
						</label>
						<div class="product-visual {visual(b).tone} grid size-16 shrink-0 place-items-center rounded-2xl text-3xl" role="img" aria-label={visual(b).label}>{visual(b).emoji}</div>
						<div class="min-w-0">
							<p class="truncate text-base font-black text-slate-800">{b.nama}</p>
							<p class="num mt-1 text-sm font-bold text-slate-400">{rupiah(b.jual)} / {b.satuan}</p>
							<p class="num mt-2 text-sm font-black text-brand-800">Subtotal {rupiah(b.qty * b.jual)}</p>
						</div>
						<div class="col-span-2 flex items-center justify-between border-t border-slate-100 pt-3 sm:col-span-1 sm:border-t-0 sm:pt-0">
							<span class="text-xs font-bold text-slate-400 sm:hidden">Atur jumlah</span>
							<div class="flex items-center gap-1 rounded-2xl border border-slate-200 bg-slate-50 p-1">
								<Button variant="ghost" size="icon-sm" aria-label="Kurangi {b.nama}" onclick={() => ubah(b, -1)}>−</Button>
								<span class="num min-w-8 text-center text-base font-black">{b.qty}</span>
								<Button variant="ghost" size="icon-sm" aria-label="Tambah {b.nama}" disabled={b.qty >= b.stok} onclick={() => tambah(b)}>+</Button>
							</div>
						</div>
					</div>
				{/each}
			</div>
			<div class="mt-6 border-t border-slate-200 pt-5">
				<div class="flex items-baseline justify-between gap-4"><span class="font-black text-slate-500">Total pesanan</span><strong class="num text-2xl font-black text-brand-800">{rupiah(subtotal)}</strong></div>
				<p class="mt-2 text-sm font-bold text-slate-400">{jumlahDipilih ? 'Pilih pengiriman dan pembayaran sebelum membuat pesanan.' : 'Centang produk yang ingin dipesan untuk melanjutkan.'}</p>
			</div>
			{#if barisDipilih.length}
			<div class="mt-7">
				<p class="text-xs font-black tracking-widest text-slate-400 uppercase">Data pemesan</p>
				<div class="mt-3 grid gap-4 sm:grid-cols-2">
				<div class="sm:col-span-2"><Input label="Nama pemesan" placeholder="Nama lengkap" bind:value={pembeli.nama} /></div>
				<Input label="Nomor WhatsApp" inputmode="tel" placeholder="08xx-xxxx-xxxx" bind:value={pembeli.hp} />
				<Input label="Alamat pengiriman" placeholder="Alamat lengkap" bind:value={pembeli.alamat} />
				<Select label="Metode pengiriman" options={[{ value: 'antar', label: 'Diantar ke alamat' }, { value: 'ambil', label: 'Ambil di UBER POKJA' }]} bind:value={pengiriman} />
				<Select label="Metode pembayaran" options={[{ value: 'transfer', label: 'Transfer bank' }, { value: 'tunai', label: 'Tunai saat pengambilan' }]} bind:value={pembayaran} />
				</div>
			</div>
			{/if}
		{/if}
		</div>
		{#snippet footer()}
			<div class="flex w-full justify-end gap-2">
				<Button variant="outline" onclick={() => (cartOpen = false)}>{baris.length ? 'Lanjut belanja' : 'Tutup'}</Button>
				{#if baris.length}<Button disabled={!barisDipilih.length} onclick={checkout}>Pesan ({jumlahDipilih})</Button>{/if}
			</div>
		{/snippet}
	</Modal>

	<Modal bind:open={suksesOpen} title="Pesanan berhasil dibuat" description="Terima kasih sudah berbelanja di UBER Market." size="sm">
		<div class="py-2 text-center">
			<span class="mx-auto grid size-14 place-items-center rounded-full bg-primary-50 text-primary-700"><PackageCheck size={28} strokeWidth={2.5} /></span>
			<p class="mt-4 font-black text-slate-800">Selesaikan pembayaran. Setelah diverifikasi, Gudang akan memproses dan mengirim pesanan Anda.</p>
		</div>
		{#snippet footer()}<a href="/marketplace/pesanan" class="inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-primary-700 px-4 text-sm font-black text-white">Lacak pesanan</a>{/snippet}
	</Modal>

	<Modal bind:open={pesananOpen} title="Pesanan saya" description="Riwayat pembelian dan status pesanan Anda." size="lg">
		{#if pesanan.length}
			<div class="space-y-3">
				{#each pesanan as p (p.id)}
					{@const statusTampil = p.pembayaran === 'tunai' && p.status === 'Menunggu pembayaran' ? 'Menunggu diproses' : p.status}
					<div class="rounded-2xl border border-slate-200 p-4">
						<div class="flex items-start justify-between gap-3"><div><p class="font-black text-slate-800">{p.id}</p><p class="mt-1 text-xs font-bold text-slate-400">{new Date(p.dibuatPada).toLocaleDateString('id-ID', { dateStyle: 'medium' })}</p></div><Badge tone={statusTampil === 'Selesai' ? 'green' : 'amber'}>{statusTampil}</Badge></div>
						<p class="mt-3 text-sm font-bold text-slate-600">{p.items.map((i) => `${i.nama} × ${i.qty}`).join(', ')}</p>
						<div class="mt-3 flex items-center justify-between border-t border-slate-100 pt-3"><span class="flex items-center gap-1.5 text-xs font-bold text-slate-400"><Truck size={14} /> {p.pengiriman === 'ambil' ? 'Ambil di UBER POKJA' : 'Diantar ke alamat'}</span><strong class="num text-brand-800">{rupiah(p.total)}</strong></div>
					</div>
				{/each}
			</div>
		{:else}<EmptyState title="Belum ada pesanan" description="Pesanan yang dibuat akan muncul di sini." />{/if}
	</Modal>

	<Modal bind:open={profilOpen} title="Profil customer" description="Data ini dipakai saat membuat pesanan." size="sm">
		<div class="space-y-4">
			<Input label="Nama" placeholder="Nama lengkap" bind:value={pembeli.nama} />
			<Input label="Nomor WhatsApp" inputmode="tel" placeholder="08xx-xxxx-xxxx" bind:value={pembeli.hp} />
			<Input label="Alamat utama" placeholder="Alamat lengkap" bind:value={pembeli.alamat} />
		</div>
		{#snippet footer()}<Button fullWidth onclick={() => (profilOpen = false)}>Simpan profil</Button>{/snippet}
	</Modal>

	<Modal bind:open={notifOpen} title="Notifikasi" description="Informasi terbaru mengenai pesanan dan promo." size="sm">
		<div class="space-y-3">
			<div class="rounded-2xl border border-primary-200 bg-primary-50 p-4"><p class="font-black text-primary-900">Pesanan mudah dilacak</p><p class="mt-1 text-sm font-medium text-primary-800">Status pembayaran, proses gudang, dan pengiriman tampil di menu Pesanan.</p></div>
			<div class="rounded-2xl border border-amber-200 bg-amber-50 p-4"><p class="font-black text-amber-900">Promo minyak goreng</p><p class="mt-1 text-sm font-medium text-amber-800">Nantikan paket hemat kebutuhan harian dari UBER Market.</p></div>
		</div>
	</Modal>

	<Modal bind:open={chatOpen} title="Chat bantuan" description="Tim UBER Market siap membantu pesanan Anda." size="sm">
		<div class="space-y-3">
			{#each chat as pesan}
				<div class="flex {pesan.dari === 'customer' ? 'justify-end' : 'justify-start'}"><p class="max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm font-medium {pesan.dari === 'customer' ? 'bg-primary-700 text-white' : 'bg-slate-100 text-slate-700'}">{pesan.isi}</p></div>
			{/each}
		</div>
		{#snippet footer()}<form class="flex w-full gap-2" onsubmit={(e) => { e.preventDefault(); kirimPesan(); }}><Input aria-label="Tulis pesan" placeholder="Tulis pesan…" bind:value={pesanBaru} /><Button type="submit">Kirim</Button></form>{/snippet}
	</Modal>
</div>

<style>
	.marketplace {
		background: #faf9f5;
		background-image: radial-gradient(circle at 5% 33%, rgb(234 236 218 / 0.5), transparent 26%), radial-gradient(circle at 93% 72%, rgb(235 243 230 / 0.65), transparent 24%);
	}
	.hero-shell {
		position: relative;
		background: linear-gradient(124deg, #0a3a28 0%, #105537 62%, #176a45 100%);
		box-shadow: 0 20px 45px -28px rgb(7 46 31 / 0.7);
	}
	.market-nav {
		display: flex;
		min-height: 3.8rem;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 0.18rem;
		border-radius: 0.85rem;
		color: #758078;
		font-size: 0.69rem;
		font-weight: 800;
		transition: color 160ms ease, background-color 160ms ease;
	}
	.header-action {
		align-items: center;
		gap: 0.38rem;
		border-radius: 0.7rem;
		padding: 0.52rem 0.62rem;
		color: #607083;
		font-size: 0.78rem;
		font-weight: 800;
		transition: background-color 160ms ease, color 160ms ease;
	}
	.header-action:hover {
		transform: translateY(1px);
	}
	.chat-float {
		box-shadow: 0 13px 24px -9px rgb(5 69 42 / 0.58), 0 4px 0 #0d5435;
	}
	.chat-float:hover {
		box-shadow: 0 10px 20px -9px rgb(5 69 42 / 0.58), 0 3px 0 #0d5435;
	}
	.market-nav.aktif {
		background: #edf8f0;
		color: #0f6a42;
	}
	.hero-shell::before,
	.hero-shell::after {
		content: '';
		position: absolute;
		border: 1px solid rgb(255 255 255 / 0.1);
		border-radius: 50%;
		pointer-events: none;
	}
	.hero-shell::before {
		width: 35rem;
		height: 35rem;
		right: -12rem;
		top: -14rem;
	}
	.hero-shell::after {
		width: 21rem;
		height: 21rem;
		right: 3rem;
		bottom: -15rem;
	}
	.hero-art {
		height: 300px;
	}
	.hero-orbit {
		position: absolute;
		inset: 14px 50px;
		border: 1px dashed rgb(255 255 255 / 0.28);
		border-radius: 50%;
		transform: rotate(-18deg);
	}
	.hero-basket {
		position: absolute;
		inset: 48px 106px;
		display: grid;
		place-items: center;
		border: 1px solid rgb(255 255 255 / 0.36);
		border-radius: 36px;
		background: linear-gradient(145deg, rgb(255 255 255 / 0.25), rgb(255 255 255 / 0.08));
		box-shadow: 0 25px 45px -20px rgb(0 0 0 / 0.5), inset 0 1px rgb(255 255 255 / 0.26);
		transform: rotate(-7deg);
	}
	.hero-basket span {
		font-size: 6rem;
		filter: drop-shadow(0 16px 12px rgb(0 0 0 / 0.16));
	}
	.hero-float {
		position: absolute;
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 8px 13px 8px 9px;
		border-radius: 15px;
		background: #fffdf8;
		box-shadow: 0 14px 28px -12px rgb(0 0 0 / 0.35);
		color: #153d2d;
		font-size: 12px;
	}
	.hero-float span {
		font-size: 1.5rem;
	}
	.hero-float-a { top: 14px; left: 10px; transform: rotate(-7deg); }
	.hero-float-b { top: 55px; right: 0; transform: rotate(7deg); }
	.hero-float-c { bottom: 12px; right: 22px; transform: rotate(-4deg); }
	.product-card {
		box-shadow: 0 6px 0 #e2e8f0, 0 14px 24px -20px rgb(11 67 44 / 0.42);
		transition: box-shadow 180ms ease;
	}
	.product-card:hover {
		box-shadow: 0 6px 0 #e2e8f0, 0 17px 28px -20px rgb(11 67 44 / 0.48);
	}
	.product-visual {
		position: relative;
		isolation: isolate;
		overflow: hidden;
	}
	.product-visual::after {
		content: '';
		position: absolute;
		z-index: -1;
		width: 54%;
		aspect-ratio: 1;
		border-radius: 50%;
		background: rgb(255 255 255 / 0.45);
	}
	.product-emoji {
		font-size: clamp(4rem, 8vw, 5.5rem);
		line-height: 1;
		filter: drop-shadow(0 12px 10px rgb(76 64 36 / 0.14));
		transition: transform 180ms ease;
	}
	.product-card:hover .product-emoji { transform: scale(1.08) rotate(-5deg); }
	.product-visual.rice { background: linear-gradient(135deg, #f6e8c7, #e6d2a0); }
	.product-visual.oil { background: linear-gradient(135deg, #ffefd1, #f9d98d); }
	.product-visual.sugar { background: linear-gradient(135deg, #eee8dd, #ded0b8); }
	.product-visual.egg { background: linear-gradient(135deg, #fae7d8, #f3cbb5); }
	.product-visual.flour { background: linear-gradient(135deg, #f3ead6, #e1d6b3); }
	.product-visual.noodle { background: linear-gradient(135deg, #fae3c7, #eebea2); }
	.product-visual.default { background: linear-gradient(135deg, #e7eadc, #cddbc8); }
	@media (max-width: 1023px) {
		.hero-art { height: 230px; max-width: 360px; }
		.hero-basket { inset: 27px 95px; }
		.hero-basket span { font-size: 4.5rem; }
	}
	@media (max-width: 639px) {
		.hero-art { display: none; }
	}
	/* Batasi tinggi modal terhadap viewport di semua perangkat. Header dan
	   footer selalu terlihat; yang bergulir hanya daftar produk serta form. */
	:global([role='dialog'][aria-label='Keranjang belanja']) {
		display: flex;
		max-height: calc(100vh - 2rem);
		max-height: calc(100dvh - 2rem);
		flex-direction: column;
	}
	:global([role='dialog'][aria-label='Keranjang belanja'] > div:first-child),
	:global([role='dialog'][aria-label='Keranjang belanja'] > div:last-child) {
		flex-shrink: 0;
	}
	:global([role='dialog'][aria-label='Keranjang belanja'] > div:nth-child(2)) {
		min-height: 0;
		flex: 1 1 auto;
		overflow-y: auto;
		overscroll-behavior: contain;
		-webkit-overflow-scrolling: touch;
	}
	.cart-body {
		min-height: 0;
	}
	.cart-check {
		width: 1.25rem;
		height: 1.25rem;
		accent-color: var(--primary);
		cursor: pointer;
	}
</style>
