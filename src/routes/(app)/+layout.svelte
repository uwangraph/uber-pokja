<script>
	import { page } from '$app/state';
	import { browser } from '$app/environment';
	import { goto } from '$app/navigation';
	import { Sidebar, Breadcrumb, SearchInput, Avatar, Button, Drawer, Tooltip } from '@khwarizmi/svelte-ui';
	import { keluar } from '$lib/auth.js';
	import Icon from '$lib/components/Icon.svelte';
	import { ikon } from '$lib/icons.js';
	import { nav, navMobile } from '$lib/nav.js';
	import { hakAkses, labelRole } from '$lib/data.js';
	import NotifItem from '$lib/components/NotifItem.svelte';
	import { untukRole, jumlahBaru, tandaiSemua } from '$lib/notif.svelte.js';

	let { children } = $props();
	let menuOpen = $state(false);
	let user = $state(null);
	let ciut = $state(false); // sidebar desktop diciutkan
	let notifOpen = $state(false);
	let cari = $state('');
	let lebarLayar = $state(1280);
	const notifSaya = $derived(untukRole(user?.role));
	const baru = $derived(jumlahBaru(user?.role));

	// Ingat pilihan ciut/lebar di browser ini
	$effect(() => {
		try {
			ciut = localStorage.getItem('sidebar') === 'ciut';
		} catch {}
	});
	function simpanCiut(ciut) {
		try {
			localStorage.setItem('sidebar', ciut ? 'ciut' : 'lebar');
		} catch {}
	}

	// Baca user dari localStorage
	$effect(() => {
		if (browser && !user) {
			const stored = localStorage.getItem('user');
			if (stored) {
				try {
					user = JSON.parse(stored);
					// Kompatibilitas mockup lama: role Koordinator kini menjadi Kurir.
					if (user?.role === 'koordinator') {
						user = { ...user, role: 'kurir', nama: 'Fajar Pratama', username: 'fajar.kurir', inisial: 'FP' };
						localStorage.setItem('user', JSON.stringify(user));
					}
				} catch {
					localStorage.removeItem('user');
				}
			}
			// Belum login -> ke halaman login
			if (!user) goto('/login', { replaceState: true });
		}
	});

	// Pengaman URL langsung: menu yang tidak berhak dibuka tidak cukup hanya
	// disembunyikan dari sidebar.
	$effect(() => {
		if (user && !['/notifikasi', '/profil'].includes(page.url.pathname) && !hakAkses[user.role]?.some((href) => page.url.pathname.startsWith(href))) {
			goto('/login', { replaceState: true });
		}
	});

	const active = (href) => page.url.pathname.startsWith(href);
	const visibleNav = $derived(user ? nav.filter((item) => hakAkses[user.role]?.includes(item.href)) : []);
	// Format grup untuk komponen Sidebar
	const groups = $derived(
		Object.entries(
			visibleNav.reduce((acc, item) => {
				(acc[item.group] ??= []).push({ label: item.label, href: item.href, icon: ikon[item.icon] });
				return acc;
			}, {})
		).map(([label, items]) => ({ label, items }))
	);
	// Tombol Menu hanya perlu kalau ada menu yang tidak muat di bottom bar.
	const adaMenuLain = $derived(visibleNav.length > bottomNav.length);
	// Halaman aktif yang tidak ada di bottom bar (mis. Laporan): tombol Menu tetap
	// berikon & berlabel "Menu", tetapi ikut aktif (hijau). Nama halaman terlihat di
	// judul halaman dan disorot di dalam sheet Menu.
	// Profil dibuka dari avatar, jadi diperlakukan sebagai halaman terpisah tanpa bottom nav.
	const tanpaNavBawah = $derived(page.url.pathname.startsWith('/profil'));
	const aktifDiMenu = $derived(bottomNav.some((n) => active(n.href)) ? null : visibleNav.find((n) => active(n.href)) ?? null);
	const activeHref = $derived(visibleNav.find((n) => active(n.href))?.href ?? '');
	const bottomNav = $derived(
		navMobile
			.map((href) => visibleNav.find((n) => n.href === href))
			.filter(Boolean)
			.slice(0, 4)
	);
	const judul = $derived(nav.find((n) => active(n.href))?.label ?? (active('/notifikasi') ? 'Notifikasi' : active('/profil') ? 'Profil' : ''));
	const hariIni = new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

	// Tutup panel saat pindah halaman
	$effect(() => {
		page.url.pathname;
		menuOpen = false;
		notifOpen = false;
	});
</script>

<svelte:window bind:innerWidth={lebarLayar} />

{#snippet bellBadge()}
	{#if baru}
		<span class="num pointer-events-none absolute -top-1 -right-1 grid h-4.5 min-w-4.5 place-items-center rounded-full bg-gold-400 px-1 text-[10px] font-black text-brand-900 ring-2 ring-white">{baru}</span>
	{/if}
{/snippet}

<div class="min-h-dvh lg:flex">
	<!-- Sidebar desktop -->
	<aside class="sticky top-0 z-30 hidden h-dvh shrink-0 flex-col border-r border-line bg-white transition-[width] duration-200 lg:flex {ciut ? 'w-16' : 'w-64'}">

		<a href="/" class="flex h-16 shrink-0 items-center gap-3 {ciut ? 'justify-center' : 'px-5'}" title={ciut ? 'UBER POKJA' : undefined}>
			<img src="/logo.png" alt={ciut ? 'UBER POKJA' : ''} class="size-9" />
			{#if !ciut}
				<div class="leading-tight whitespace-nowrap">
					<p class="text-[15px] font-black tracking-tight">UBER POKJA</p>
					<p class="text-xs font-bold text-muted">MT Tenjolaya</p>
				</div>
			{/if}
		</a>

		<!-- Menu: komponen Sidebar dengan tombol ciut bawaannya -->
		<div class="scroll-tipis min-h-0 flex-1 overflow-y-auto">
			<Sidebar {groups} active={activeHref} variant="minimal" collapsible bind:collapsed={ciut} onCollapsedChange={simpanCiut} />
		</div>

		<div class="border-t border-line p-3">
			{#if ciut}
				<div class="flex flex-col items-center gap-2">
					<Tooltip text="{user?.nama ?? ''} · {labelRole(user?.role)}" side="right"><a href="/profil" aria-label="Profil saya"><Avatar name={user?.nama ?? ''} size="sm" /></a></Tooltip>
					<Button variant="ghost" size="icon-sm" aria-label="Keluar" title="Keluar" onclick={keluar}><Icon name="logout" class="size-4" /></Button>
				</div>
			{:else}
				<div class="flex items-center gap-3 rounded-2xl bg-ground/70 p-2.5">
					<a href="/profil" class="flex min-w-0 flex-1 items-center gap-3" aria-label="Profil saya">
						<Avatar name={user?.nama ?? ''} size="md" />
						<div class="min-w-0 flex-1 leading-tight">
							<p class="truncate text-sm font-black">{user?.nama ?? ''}</p>
							<p class="text-xs font-bold text-muted">{labelRole(user?.role)}</p>
						</div>
					</a>
					<Button variant="ghost" size="icon-sm" aria-label="Keluar" title="Keluar" onclick={keluar}><Icon name="logout" class="size-4" /></Button>
				</div>
			{/if}
		</div>
	</aside>

	<div class="flex min-w-0 flex-1 flex-col">
		<!-- Top bar desktop -->
		<header class="sticky top-0 z-20 hidden h-16 items-center gap-4 border-b border-line bg-ground/80 px-8 backdrop-blur-md lg:flex">
			<Breadcrumb items={[{ label: 'UBER POKJA', href: '/' }, { label: judul }]} />
			<div class="ml-auto w-72">
				<SearchInput id="cari-global" bind:value={cari} placeholder="Cari produk, transaksi, MT…" aria-label="Cari" />
			</div>
			<span class="hidden items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-bold text-muted xl:flex">
				<Icon name="calendar" class="size-4" />{hariIni}
			</span>
			<div class="relative">
				<Button variant="outline" size="icon" aria-label="Notifikasi{baru ? `, ${baru} baru` : ''}" onclick={() => (notifOpen = true)}>
					<Icon name="bell" class="size-4.5" />
				</Button>
				{@render bellBadge()}
			</div>
		</header>

		<!-- Header HP -->
		<header class="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-line bg-white/90 px-4 backdrop-blur-md lg:hidden">
			<a href="/" class="flex items-center gap-2.5">
				<img src="/logo.png" alt="" class="size-8" />
				<p class="text-[15px] font-black tracking-tight">UBER POKJA</p>
			</a>
			<div class="flex items-center gap-1.5">
				<div class="relative">
					<Button variant="ghost" size="icon" onclick={() => goto("/notifikasi")} aria-label="Notifikasi{baru ? `, ${baru} baru` : ''}">
						<Icon name="bell" class="size-5" />
					</Button>
					{@render bellBadge()}
				</div>
				<a href="/profil" class="rounded-full" aria-label="Profil saya">
					<Avatar name={user?.nama ?? ''} size="sm" />
				</a>
			</div>
		</header>

		<main class="flex-1 px-4 pt-5 sm:px-6 lg:px-8 lg:pt-8 lg:pb-12 {tanpaNavBawah ? 'pb-8' : 'pb-28'}">
			<div class="mx-auto max-w-6xl">
				{@render children()}
			</div>
		</main>
	</div>

	<!-- Notifikasi: panel kanan di tablet/desktop, lembar bawah selebar layar di HP -->
	<Drawer bind:open={notifOpen} title="Notifikasi" description={baru ? `${baru} belum dibaca` : 'Semua sudah dibaca'} side={lebarLayar >= 768 ? 'right' : 'bottom'} size={lebarLayar >= 768 ? 'lg' : 'full'}>
		<div class="-mx-6 divide-y divide-line border-y border-line">
			{#each notifSaya as n (n.id)}
				<NotifItem {n} onpick={() => (notifOpen = false)} />
			{/each}
		</div>
		{#snippet footer()}
			<div class="grid w-full grid-cols-2 gap-2">
				<Button variant="outline" disabled={!baru} onclick={() => tandaiSemua(user?.role)} class="whitespace-nowrap">Tandai dibaca</Button>
				<Button onclick={() => goto('/notifikasi')} class="whitespace-nowrap">Lihat semua</Button>
			</div>
		{/snippet}
	</Drawer>

	<!-- Menu lengkap HP: grid ikon, setinggi isinya -->
	<Drawer bind:open={menuOpen} title="Menu" side="bottom" size="full">
		<a href="/profil" onclick={() => (menuOpen = false)} class="flex items-center gap-3 rounded-2xl bg-ground/70 p-3">
			<Avatar name={user?.nama ?? ''} size="md" />
			<div class="min-w-0 flex-1 leading-tight">
				<p class="truncate text-sm font-black">{user?.nama ?? ''}</p>
				<p class="text-xs font-bold text-muted">{labelRole(user?.role)} · Lihat profil</p>
			</div>
			<Icon name="chevron" class="size-4 text-slate-400" />
		</a>
		<div class="mt-4 grid grid-cols-3 gap-2 pb-2">
			{#each visibleNav as item}
				<a href={item.href} onclick={() => (menuOpen = false)} class="flex flex-col items-center gap-2 rounded-2xl p-3 text-center text-xs font-black {active(item.href) ? 'bg-brand-50 text-brand-700' : 'text-slate-600 active:bg-slate-50'}">
					<span class="grid size-12 place-items-center rounded-2xl {active(item.href) ? 'bg-white' : 'bg-slate-50'}"><Icon name={item.icon} class="size-5" strokeWidth={2.5} /></span>
					{item.labelPendek ?? item.label}
				</a>
			{/each}
		</div>
	</Drawer>

	<!-- Bottom nav HP (disembunyikan di halaman Profil) -->
	{#if !tanpaNavBawah}
	<nav class="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md lg:hidden" aria-label="Menu cepat">
		<div class="grid" style="grid-template-columns: repeat({bottomNav.length + (adaMenuLain ? 1 : 0)}, minmax(0, 1fr))">
			{#each bottomNav as item}
				<a href={item.href} class="flex min-h-16 flex-col items-center justify-center gap-1 text-[11px] font-black {active(item.href) ? 'text-brand-700' : 'text-slate-400'}">
					<span class="grid h-7 w-12 place-items-center rounded-full transition {active(item.href) ? 'bg-brand-50' : ''}">
						<Icon name={item.icon} class="size-5" strokeWidth={2.5} />
					</span>
					{item.labelPendek ?? item.label}
				</a>
			{/each}
			{#if adaMenuLain}
			<button class="flex min-h-16 min-w-0 flex-col items-center justify-center gap-1 text-[11px] font-black {aktifDiMenu ? 'text-brand-700' : 'text-slate-400'}" aria-label={aktifDiMenu ? `Menu, sedang di ${aktifDiMenu.label}` : 'Menu'} onclick={() => (menuOpen = true)}>
				<span class="grid h-7 w-12 place-items-center rounded-full transition {aktifDiMenu ? 'bg-brand-50' : ''}"><Icon name="menu" class="size-5" strokeWidth={2.5} /></span>
				Menu
			</button>
			{/if}
		</div>
	</nav>
	{/if}
</div>
