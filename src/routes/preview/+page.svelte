<script>
	import { onMount } from 'svelte';
	import { Button, Tabs, Select, Slider, Card } from '@khwarizmi/svelte-ui';
	import { ExternalLink, Minus, Plus } from 'lucide-svelte';
	import { akun, hakAkses } from '$lib/data.js';
	import { nav } from '$lib/nav.js';

	// Peraga prototipe: pilih role, halaman, dan bingkai perangkat.
	// Mengganti bingkai tidak memuat ulang iframe, hanya ukurannya yang berubah.

	const DEV = {
		phone: { w: 390, h: 798, label: '390 × 844', extraW: 22, extraH: 22 + 46 + 34, maxZ: 1.55 },
		tablet: { w: 820, h: 990, label: '820 × 1024', extraW: 28, extraH: 28 + 34, maxZ: 1.15 },
		desktop: { w: 1280, h: 800, label: '1280 × 800', extraW: 2, extraH: 2 + 84, maxZ: 1 }
	};

	const deskripsi = {
		admin: 'Mengelola seluruh sistem.',
		kurir: 'Mengantar pesanan dan memperbarui status pengiriman.',
		keuangan: 'Mengelola modal, pembayaran, pengeluaran, dan saldo.',
		gudang: 'Mengelola barang masuk, keluar, dan penyesuaian stok.',
		pemasaran: 'Mengelola Majelis Taklim, pesanan, dan status penjualan.'
	};

	let userId = $state(1);
	let device = $state('phone');
	let current = $state('/dashboard');
	let zoom = $state(null); // null = otomatis pas layar
	let fitScale = $state(1);
	let zoomPct = $state(100); // nilai slider, disinkronkan dengan skala
	let clock = $state('');

	let frame;
	let stage = $state();
	let devEl = $state();

	const user = $derived(akun.find((a) => a.id === userId));
	const pages = $derived([
		{ href: '/marketplace', label: 'Marketplace (publik)' },
		{ href: '/login', label: 'Login' },
		...nav.filter((n) => hakAkses[user.role].includes(n.href))
	]);
	const d = $derived(DEV[device]);
	const scale = $derived(zoom ?? fitScale);
	$effect(() => {
		zoomPct = Math.round(scale * 100);
	});
	const currentLabel = $derived(pages.find((p) => p.href === current)?.label ?? current);

	// ---- Browser tiruan (bingkai Desktop): tab, kolom alamat, navigasi ----
	const semuaHalaman = [
		{ href: '/', label: 'Beranda' },
		{ href: '/marketplace', label: 'Marketplace' },
		{ href: '/login', label: 'Login' },
		...nav,
		{ href: '/notifikasi', label: 'Notifikasi' }
	];
	const judulTab = (path) => (semuaHalaman.find((p) => p.href === path.split('?')[0])?.label ?? path) + ' · UBER POKJA';

	// Setiap tab punya riwayat sendiri: daftar path + posisi saat ini
	let tabs = $state([{ id: 1, path: '/dashboard', riwayat: ['/dashboard'], pos: 0 }]);
	let tabAktif = $state(1);
	let nextId = 2;
	const tab = $derived(tabs.find((x) => x.id === tabAktif));

	// Setiap perpindahan halaman di tab aktif dicatat ke riwayatnya
	$effect(() => {
		const t = tabs.find((x) => x.id === tabAktif);
		if (!t || t.riwayat[t.pos] === current) return;
		t.riwayat = [...t.riwayat.slice(0, t.pos + 1), current];
		t.pos = t.riwayat.length - 1;
		t.path = current;
	});

	function bukaTab(id) {
		if (id === tabAktif) return;
		tabAktif = id;
		load(tabs.find((x) => x.id === id).path);
	}
	function tabBaru() {
		const awal = pages[1]?.href ?? '/dashboard';
		const t = { id: nextId++, path: awal, riwayat: [awal], pos: 0 };
		tabs.push(t);
		tabAktif = t.id;
		load(t.path);
	}
	function tutupTab(id) {
		if (tabs.length === 1) return;
		const i = tabs.findIndex((x) => x.id === id);
		tabs.splice(i, 1);
		if (id === tabAktif) {
			const t = tabs[Math.max(0, i - 1)];
			tabAktif = t.id;
			load(t.path);
		}
	}

	function geser(arah) {
		const t = tab;
		const i = t.pos + arah;
		if (i < 0 || i >= t.riwayat.length) return;
		t.pos = i;
		t.path = t.riwayat[i];
		load(t.path);
	}
	const navFrame = {
		back: () => geser(-1),
		forward: () => geser(1),
		reload: () => frame?.contentWindow?.location.reload()
	};

	// Kolom alamat
	let alamat = $state('');
	let alamatFokus = $state(false);
	let saranAktif = $state(0);
	let alamatEl = $state();
	const kunci = (v) => v.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/^uber-pokja\.id/, '');
	const saran = $derived.by(() => {
		const q = kunci(alamat).replace(/^\//, '');
		const daftar = [{ href: '/', label: 'Beranda' }, ...pages, { href: '/notifikasi', label: 'Notifikasi' }];
		return q ? daftar.filter((p) => p.label.toLowerCase().includes(q) || p.href.slice(1).includes(q)) : daftar;
	});
	function fokusAlamat() {
		alamat = 'uber-pokja.id' + current;
		alamatFokus = true;
		saranAktif = 0;
		requestAnimationFrame(() => alamatEl?.select());
	}
	function pergi(href) {
		load(href);
		alamatFokus = false;
		alamatEl?.blur();
	}
	function kirimAlamat() {
		const v = kunci(alamat);
		const persis = saran.find((p) => '/' + v.replace(/^\//, '') === p.href || v === p.label.toLowerCase());
		pergi(persis?.href ?? saran[saranAktif]?.href ?? (v.startsWith('/') ? v : '/' + v));
	}
	function tombolAlamat(e) {
		if (e.key === 'ArrowDown') { e.preventDefault(); saranAktif = Math.min(saran.length - 1, saranAktif + 1); }
		else if (e.key === 'ArrowUp') { e.preventDefault(); saranAktif = Math.max(0, saranAktif - 1); }
		else if (e.key === 'Enter') { e.preventDefault(); kirimAlamat(); }
		else if (e.key === 'Escape') { alamatFokus = false; alamatEl?.blur(); }
		else saranAktif = 0;
	}

	function jam() {
		const n = new Date();
		return String(n.getHours()).padStart(2, '0') + '.' + String(n.getMinutes()).padStart(2, '0');
	}

	function hitungPas() {
		if (!stage || !devEl) return;
		const availW = stage.clientWidth - 24;
		const availH = window.innerHeight - devEl.getBoundingClientRect().top + window.scrollY - 58;
		fitScale = Math.max(0.3, Math.min(d.maxZ, availW / (d.w + d.extraW), availH / (d.h + d.extraH)));
	}

	function load(href) {
		current = href;
		if (!frame) return;
		if (frame.getAttribute('src') === href) frame.contentWindow?.location.reload();
		else frame.setAttribute('src', href);
	}

	function pilihRole(id) {
		userId = id;
		localStorage.setItem('user', JSON.stringify(akun.find((a) => a.id === id)));
		const first = nav.find((n) => hakAkses[akun.find((a) => a.id === id).role].includes(n.href));
		load(first.href);
	}

	function pilihDevice(dev) {
		device = dev;
		zoom = null;
		requestAnimationFrame(hitungPas);
	}

	function setZoom(pct) {
		zoom = Math.min(2, Math.max(0.3, pct / 100));
	}

	// Ikuti navigasi di dalam iframe (klik menu di dalam prototipe).
	// SvelteKit berpindah halaman tanpa reload, jadi URL-nya dicek berkala.
	function onFrameLoad() {
		try {
			const path = frame.contentWindow.location.pathname.replace(/\.html$/, '').replace(/\/index$/, '/') || '/';
			if (path !== current && path !== 'blank') current = path;
		} catch {
			// beda origin, abaikan
		}
	}

	onMount(() => {
		pilihRole(userId);
		// Tautan dari marketplace dapat langsung membuka bingkai perangkatnya.
		const halamanAwal = new URLSearchParams(window.location.search).get('halaman');
		if (halamanAwal === '/marketplace') load(halamanAwal);
		clock = jam();
		const t = setInterval(() => (clock = jam()), 20000);
		const follow = setInterval(onFrameLoad, 400);
		hitungPas();
		window.addEventListener('resize', hitungPas);
		return () => {
			clearInterval(t);
			clearInterval(follow);
			window.removeEventListener('resize', hitungPas);
		};
	});
</script>

<svelte:head><title>Pratinjau · UBER POKJA</title></svelte:head>

<div class="min-h-dvh bg-linear-to-b from-ground to-[#e9e5d9]">
	<div class="mx-auto max-w-375 px-4 pt-3.5 pb-7">
		<header class="mb-3 flex items-center justify-between gap-4">
			<div class="flex items-center gap-3">
				<img src="/logo.png" alt="" class="size-10" />
				<div class="leading-tight">
					<p class="font-black">UBER POKJA</p>
					<p class="text-xs font-bold text-slate-400">Pratinjau tampilan</p>
				</div>
			</div>
			<Button variant="outline" size="sm" onclick={() => window.open(current, '_blank', 'noopener')}><ExternalLink size={15} strokeWidth={2.5} /> Buka di tab baru</Button>
		</header>

		<Card padding="sm" class="flex flex-wrap items-end gap-x-5 gap-y-4 px-4">
			<div class="flex max-w-full flex-col gap-1.5">
				<span class="pv-lb">Role</span>
				<Tabs
					ariaLabel="Role"
					tabs={akun.map((a) => ({ value: String(a.id), label: a.role[0].toUpperCase() + a.role.slice(1) }))}
					value={String(userId)}
					onChange={(v) => pilihRole(+v)}
				/>
			</div>

			<div class="min-w-52 flex-1 max-md:order-3 max-md:min-w-full">
				<Select
					label="Halaman"
					options={pages.map((p) => ({ value: p.href, label: p.label }))}
					value={current}
					triggerLabel={currentLabel}
					onChange={(v) => load(v)}
				/>
			</div>

			<div class="flex flex-col gap-1.5">
				<span class="pv-lb">Bingkai <span class="num ml-1 tracking-normal normal-case">{d.label}</span></span>
				<Tabs
					ariaLabel="Bingkai perangkat"
					tabs={[{ value: 'phone', label: 'HP' }, { value: 'tablet', label: 'Tablet' }, { value: 'desktop', label: 'Desktop' }]}
					value={device}
					onChange={(v) => pilihDevice(v)}
				/>
			</div>

			<div class="flex flex-col gap-1.5">
				<span class="pv-lb">Ukuran</span>
				<div class="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-2 py-1.5 shadow-[0_2px_0_0_#E2E8F0]">
					<Button variant="ghost" size="icon-xs" aria-label="Perkecil" onclick={() => setZoom(Math.round(scale * 100) - 10)}><Minus size={14} strokeWidth={3} /></Button>
					<div class="w-28">
						<Slider bind:value={zoomPct} min={30} max={200} step={5} showValue={false} aria-label="Ukuran bingkai" oninput={() => setZoom(zoomPct)} />
					</div>
					<Button variant="ghost" size="icon-xs" aria-label="Perbesar" onclick={() => setZoom(Math.round(scale * 100) + 10)}><Plus size={14} strokeWidth={3} /></Button>
					<Button variant={zoom === null ? 'default' : 'secondary'} size="xs" onclick={() => (zoom = null)}>Pas</Button>
					<span class="num min-w-9 text-right text-xs font-black text-slate-500">{Math.round(scale * 100)}%</span>
				</div>
			</div>
		</Card>

		<p class="mt-3 ml-1 text-sm font-bold text-slate-400">
			Masuk sebagai <strong class="font-black text-slate-700">{user.nama}</strong> · {deskripsi[user.role]}
		</p>

		<div
			bind:this={stage}
			class="mt-3.5 flex flex-col {(d.w + d.extraW) * scale > (stage?.clientWidth ?? 9999) - 10 ? 'items-start overflow-x-auto' : 'items-center'}"
			style="min-height: {(d.h + d.extraH) * scale + 16}px"
			onwheel={(e) => {
				if (!(e.ctrlKey || e.metaKey)) return;
				e.preventDefault();
				setZoom(Math.round(scale * 100) + (e.deltaY < 0 ? 5 : -5));
			}}
		>
			<div bind:this={devEl} class="dev dev-{device}" style="--dw: {d.w}px; --dh: {d.h}px; --scale: {scale.toFixed(3)}">
				<div class="dev-chrome">
					{#if device === 'desktop'}
						<!-- Baris tab -->
						<div class="br-tabs">
							<span class="dots"><i></i><i></i><i></i></span>
							{#each tabs as t (t.id)}
								<div class="br-tab" class:aktif={t.id === tabAktif}>
									<button type="button" class="flex min-w-0 flex-1 items-center gap-2 self-stretch text-left" onclick={() => bukaTab(t.id)} title={judulTab(t.path)}>
										<img src="/logo.png" alt="" class="size-4 shrink-0" />
										<span class="truncate">{judulTab(t.path)}</span>
									</button>
									{#if tabs.length > 1}
										<button type="button" class="br-x" aria-label="Tutup tab" onclick={() => tutupTab(t.id)}>
											<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><path d="M7 7l10 10M17 7L7 17" /></svg>
										</button>
									{/if}
								</div>
							{/each}
							<button type="button" class="br-plus" aria-label="Tab baru" title="Tab baru" onclick={tabBaru}>
								<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M12 6v12M6 12h12" /></svg>
							</button>
						</div>
						<!-- Toolbar -->
						<div class="br-bar">
							<span class="br-nav">
								<button type="button" aria-label="Kembali" title="Kembali" disabled={!tab || tab.pos === 0} onclick={navFrame.back}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 6l-6 6 6 6" /></svg></button>
								<button type="button" aria-label="Maju" title="Maju" disabled={!tab || tab.pos >= tab.riwayat.length - 1} onclick={navFrame.forward}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 6l6 6-6 6" /></svg></button>
								<button type="button" aria-label="Muat ulang" title="Muat ulang" onclick={navFrame.reload}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 12a8 8 0 1 1-2.3-5.7M20 4v5h-5" /></svg></button>
							</span>
							<div class="br-url" class:fokus={alamatFokus}>
								<svg viewBox="0 0 24 24" class="br-lock" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="5" y="11" width="14" height="10" rx="2" /><path d="M8 11V8a4 4 0 0 1 8 0v3" /></svg>
								{#if alamatFokus}
									<input
										bind:this={alamatEl}
										bind:value={alamat}
										class="min-w-0 flex-1 bg-transparent text-ink outline-none"
										aria-label="Alamat halaman"
										spellcheck="false"
										autocomplete="off"
										onkeydown={tombolAlamat}
										onblur={() => setTimeout(() => (alamatFokus = false), 150)}
									/>
								{:else}
									<button type="button" class="min-w-0 flex-1 truncate text-left" aria-label="Ubah alamat" onclick={fokusAlamat}>
										<span class="text-ink">uber-pokja.id</span><span>{current === '/' ? '' : current}</span>
									</button>
								{/if}
								<svg viewBox="0 0 24 24" class="br-star" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" aria-hidden="true"><path d="M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.9l-5.2 2.7 1-5.8-4.3-4.1 5.9-.9z" /></svg>
								{#if alamatFokus && saran.length}
									<ul class="br-saran" role="listbox" aria-label="Saran halaman">
										{#each saran as p, i}
											<li role="option" aria-selected={i === saranAktif}>
												<button type="button" class:aktif={i === saranAktif} onmousedown={(e) => { e.preventDefault(); pergi(p.href); }} onmouseenter={() => (saranAktif = i)}>
													<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="6" /><path d="M20 20l-4.3-4.3" /></svg>
													<span class="font-medium text-ink">{p.label}</span>
													<span class="truncate">uber-pokja.id{p.href === '/' ? '' : p.href}</span>
												</button>
											</li>
										{/each}
									</ul>
								{/if}
							</div>
							<span class="br-avatar">A</span>
						</div>
					{:else}
						<span>{clock}</span>
						<span class={device === 'phone' ? 'notch' : 'cam'}></span>
						<span class="flex items-center gap-1.5">
							<svg viewBox="0 0 18 11" fill="currentColor" class="h-2.75" aria-hidden="true"><rect x="0" y="7" width="3" height="4" rx=".6" /><rect x="5" y="4.6" width="3" height="6.4" rx=".6" /><rect x="10" y="2.3" width="3" height="8.7" rx=".6" /><rect x="15" y="0" width="3" height="11" rx=".6" /></svg>
							<svg viewBox="0 0 16 11" fill="currentColor" class="h-2.75" aria-hidden="true"><path d="M8 10.6 5.6 8a3.4 3.4 0 0 1 4.8 0L8 10.6Z" /><path d="M3.6 6a6.2 6.2 0 0 1 8.8 0l-1.2 1.3a4.5 4.5 0 0 0-6.4 0L3.6 6Z" /><path d="M1.3 3.7a9.5 9.5 0 0 1 13.4 0l-1.2 1.3a7.8 7.8 0 0 0-11 0L1.3 3.7Z" /></svg>
							<svg viewBox="0 0 25 12" fill="none" class="h-3" aria-hidden="true"><rect x=".6" y=".6" width="19.6" height="10.8" rx="3" stroke="currentColor" stroke-width="1.1" opacity=".45" /><rect x="2.2" y="2.2" width="14.5" height="7.6" rx="1.8" fill="currentColor" /><path d="M22 4.2v3.6a2 2 0 0 0 0-3.6Z" fill="currentColor" opacity=".45" /></svg>
						</span>
					{/if}
				</div>
				<div class="dev-screen">
					<iframe bind:this={frame} title="Pratinjau halaman" onload={onFrameLoad}></iframe>
				</div>
			</div>
		</div>
	</div>
</div>

<style>
	.pv-lb {
		margin-left: 0.25rem;
		font-size: 0.75rem;
		font-weight: 900;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		color: #94a3b8;
	}

	/* ---- bingkai perangkat ---- */
	.dev {
		width: var(--dw);
		flex-shrink: 0;
		position: relative;
		transform: scale(var(--scale));
		transform-origin: top center;
		box-shadow: 0 26px 60px rgba(17, 65, 47, 0.3);
	}
	.dev-screen {
		overflow: hidden;
		background: #fff;
		height: var(--dh);
	}
	.dev iframe {
		width: 100%;
		height: 100%;
		border: 0;
		display: block;
	}
	.dev-phone .dev-chrome,
	.dev-tablet .dev-chrome {
		position: relative;
		display: flex;
		align-items: center;
		justify-content: space-between;
		background: #fff;
		color: #1f2a24;
		font-weight: 700;
		font-variant-numeric: tabular-nums;
	}

	/* HP */
	.dev-phone {
		background: #16231d;
		border-radius: 46px;
		padding: 11px;
	}
	.dev-phone .dev-chrome {
		height: 46px;
		padding: 0 26px 0 30px;
		font-size: 14.5px;
		border-radius: 35px 35px 0 0;
	}
	.dev-phone .dev-screen {
		border-radius: 0 0 35px 35px;
	}
	.notch {
		position: absolute;
		top: 0;
		left: 50%;
		transform: translateX(-50%);
		width: 120px;
		height: 30px;
		background: #16231d;
		border-radius: 0 0 18px 18px;
	}
	.dev-phone::after {
		content: '';
		position: absolute;
		bottom: 17px;
		left: 50%;
		transform: translateX(-50%);
		width: 128px;
		height: 5px;
		border-radius: 99px;
		background: rgba(31, 42, 36, 0.35);
	}

	/* Tablet */
	.dev-tablet {
		background: #16231d;
		border-radius: 26px;
		padding: 14px;
	}
	.dev-tablet .dev-chrome {
		height: 34px;
		padding: 0 20px;
		font-size: 13px;
		border-radius: 12px 12px 0 0;
	}
	.dev-tablet .dev-screen {
		border-radius: 0 0 12px 12px;
	}
	.cam {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		width: 6px;
		height: 6px;
		border-radius: 50%;
		background: #c3cdd6;
	}

	/* Desktop: bingkai browser */
	.dev-desktop {
		overflow: hidden;
		border: 1px solid rgb(16 26 21 / 0.14);
		border-radius: 12px;
		background: #fbfaf7;
		box-shadow:
			0 40px 80px -24px rgb(16 26 21 / 0.35),
			0 8px 20px -8px rgb(16 26 21 / 0.15);
	}
	.dev-desktop .dev-chrome {
		display: block;
	}
	.br-tabs {
		display: flex;
		align-items: flex-end;
		gap: 8px;
		height: 40px;
		padding: 0 12px 0 16px;
		background: #e6e3db;
	}
	.dots {
		display: flex;
		gap: 8px;
		align-self: center;
		margin-right: 10px;
	}
	.dots i {
		width: 12px;
		height: 12px;
		border-radius: 50%;
		background: #ff5f57;
		box-shadow: inset 0 0 0 0.5px rgb(0 0 0 / 0.12);
	}
	.dots i:nth-child(2) {
		background: #febc2e;
	}
	.dots i:nth-child(3) {
		background: #28c840;
	}
	/* Tab aktif menyatu dengan toolbar, lengkap dengan sudut lengkung ke luar */
	.dev-desktop .dev-chrome {
		position: relative;
		z-index: 10;
	}
	.br-tab {
		position: relative;
		display: flex;
		flex: 0 1 240px;
		min-width: 72px;
		align-items: center;
		gap: 6px;
		height: 32px;
		padding: 0 8px 0 12px;
		font-size: 12px;
		font-weight: 500;
		color: #5f6b65;
		border-radius: 10px 10px 0 0;
		transition: background 0.15s;
	}
	.br-tab:not(.aktif):hover {
		background: rgb(255 255 255 / 0.45);
	}
	/* pemisah tipis antar tab tidak aktif */
	.br-tab:not(.aktif) + .br-tab:not(.aktif)::before {
		content: '';
		position: absolute;
		left: -4px;
		top: 9px;
		width: 1px;
		height: 14px;
		background: #c9c4b8;
	}
	.br-tab.aktif {
		color: #1f2a24;
		background: #fbfaf7;
	}
	.br-tab.aktif::before,
	.br-tab.aktif::after {
		content: '';
		position: absolute;
		bottom: 0;
		width: 10px;
		height: 10px;
	}
	.br-tab.aktif::before {
		left: -10px;
		background: radial-gradient(circle at 0 0, transparent 10px, #fbfaf7 10.5px);
	}
	.br-tab.aktif::after {
		right: -10px;
		background: radial-gradient(circle at 100% 0, transparent 10px, #fbfaf7 10.5px);
	}
	.br-x {
		display: grid;
		place-items: center;
		width: 18px;
		height: 18px;
		flex-shrink: 0;
		color: #5f6b65;
		border-radius: 50%;
	}
	.br-x svg {
		width: 12px;
		height: 12px;
	}
	.br-x:hover {
		background: rgb(16 26 21 / 0.1);
		color: #1f2a24;
	}
	.br-plus {
		display: grid;
		place-items: center;
		flex-shrink: 0;
		width: 28px;
		height: 28px;
		align-self: center;
		margin-left: 4px;
		color: #5f6b65;
		border-radius: 50%;
	}
	.br-plus svg {
		width: 16px;
		height: 16px;
	}
	.br-plus:hover {
		background: rgb(255 255 255 / 0.6);
		color: #1f2a24;
	}
	.br-bar {
		display: flex;
		align-items: center;
		gap: 10px;
		height: 44px;
		padding: 0 12px;
		background: #fbfaf7;
		border-bottom: 1px solid #e7e9e4;
	}
	.br-nav {
		display: flex;
		gap: 4px;
		color: #3d4a42;
	}
	.br-nav button {
		display: grid;
		place-items: center;
		width: 28px;
		height: 28px;
		border-radius: 50%;
		transition: background 0.15s;
	}
	.br-nav button:hover {
		background: rgb(16 26 21 / 0.07);
	}
	.br-nav button:disabled {
		opacity: 0.35;
		background: none;
	}
	.br-nav button:active {
		background: rgb(16 26 21 / 0.12);
	}
	.br-nav svg {
		width: 16px;
		height: 16px;
	}
	.br-url {
		display: flex;
		flex: 1;
		align-items: center;
		gap: 8px;
		height: 32px;
		padding: 0 12px;
		font-size: 13px;
		color: #7a857f;
		background: #eeebe4;
		border-radius: 99px;
		position: relative;
		transition: background 0.15s, box-shadow 0.15s;
	}
	.br-url:hover {
		background: #e8e5dd;
	}
	.br-url.fokus {
		background: #fff;
		box-shadow: 0 0 0 2px var(--color-brand-500);
	}
	.br-saran {
		position: absolute;
		top: calc(100% + 6px);
		left: 0;
		right: 0;
		max-height: 320px;
		overflow-y: auto;
		padding: 6px;
		margin: 0;
		list-style: none;
		background: #fff;
		border: 1px solid #e7e9e4;
		border-radius: 14px;
		box-shadow: 0 16px 40px -8px rgb(16 26 21 / 0.25);
	}
	.br-saran button {
		display: flex;
		align-items: center;
		gap: 10px;
		width: 100%;
		padding: 8px 10px;
		font-size: 13px;
		color: #7a857f;
		text-align: left;
		border-radius: 8px;
	}
	.br-saran button.aktif {
		background: var(--color-brand-50);
	}
	.br-saran svg {
		width: 14px;
		height: 14px;
		flex-shrink: 0;
	}
	.br-lock {
		width: 14px;
		height: 14px;
		flex-shrink: 0;
		color: #5f6b65;
	}
	.br-star {
		width: 16px;
		height: 16px;
		flex-shrink: 0;
		margin-left: auto;
		color: #5f6b65;
	}
	.br-avatar {
		display: grid;
		place-items: center;
		width: 26px;
		height: 26px;
		font-size: 11px;
		font-weight: 700;
		color: #fff;
		background: var(--color-brand-600);
		border-radius: 50%;
	}
</style>
