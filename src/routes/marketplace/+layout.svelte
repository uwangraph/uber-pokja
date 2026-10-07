<script>
	import { browser } from '$app/environment';
	import { page } from '$app/state';
	import { Bell, ClipboardList, Home, MessageCircle, ShoppingBag, Store, UserRound } from 'lucide-svelte';
	import { tokoAktif } from '$lib/marketplace.svelte.js';

	let { children } = $props();

	// Header dan bottom nav dipakai bersama semua halaman marketplace agar
	// navigasi sama di HP, tablet, dan desktop.
	const toko = $derived(tokoAktif());
	const path = $derived(page.url.pathname);
	const aktif = (href) => (href === '/marketplace' ? path === href : path.startsWith(href));
	// Halaman alur fokus (checkout, bayar, chat, masuk) tanpa bottom nav & tombol chat.
	const fokus = $derived(['/marketplace/checkout', '/marketplace/pembayaran', '/marketplace/chat', '/marketplace/masuk'].some((h) => path.startsWith(h)));

	// Jumlah item keranjang dibaca dari localStorage; halaman katalog mengirim
	// event `keranjang-berubah` setiap kali keranjang disimpan.
	let jumlah = $state(0);
	function bacaKeranjang() {
		try {
			jumlah = Object.values(JSON.parse(localStorage.getItem('uber-pokja:marketplace:cart') ?? '{}')).reduce((s, q) => s + (Number(q) || 0), 0);
		} catch {
			jumlah = 0;
		}
	}
	$effect(() => {
		path;
		if (browser) bacaKeranjang();
	});
	$effect(() => {
		window.addEventListener('keranjang-berubah', bacaKeranjang);
		window.addEventListener('storage', bacaKeranjang);
		return () => {
			window.removeEventListener('keranjang-berubah', bacaKeranjang);
			window.removeEventListener('storage', bacaKeranjang);
		};
	});

	const navBawah = [
		{ href: '/marketplace', label: 'Beranda', icon: Home },
		{ href: '/marketplace/notifikasi', label: 'Notifikasi', icon: Bell, badge: 2 },
		{ href: '/marketplace/pesanan', label: 'Pesanan', icon: ClipboardList },
		{ href: '/marketplace/profil', label: 'Profil', icon: UserRound }
	];
</script>

<div class="min-h-dvh bg-[#faf9f5] {fokus ? '' : 'pb-20 lg:pb-0'}">
	<header class="sticky top-0 z-30 border-b border-brand-900/10 bg-[#fffdf8]/95 backdrop-blur-xl">
		<div class="mx-auto flex h-17 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
			<a href="/marketplace" class="flex min-w-0 items-center gap-2.5">
				<span class="grid size-11 shrink-0 place-items-center rounded-2xl bg-white shadow-sm ring-1 ring-brand-900/10"><img src="/logo.png" alt="UBER POKJA" class="size-8" /></span>
				<span class="min-w-0 leading-tight">
					<span class="block text-sm font-black tracking-tight text-brand-900">UBER Market</span>
					<span class="block truncate text-[11px] font-bold text-slate-500">Marketplace UBER POKJA</span>
				</span>
			</a>
			<div class="flex shrink-0 items-center gap-1 sm:gap-2">
				<!-- HP/tablet: menu utama di bottom nav; desktop: semua menu di header. -->
				<a href="/marketplace/toko" class="header-action" class:aktif={aktif('/marketplace/toko')} aria-label="Pilih toko"><Store size={16} /> <span class="hidden max-w-40 truncate sm:inline">{toko ? toko.nama : 'Semua toko'}</span></a>
				<a href="/marketplace/pesanan" class="header-action hidden lg:inline-flex" class:aktif={aktif('/marketplace/pesanan')}><ClipboardList size={16} /> Pesanan saya</a>
				<a href="/marketplace/notifikasi" class="header-action relative hidden lg:inline-flex" class:aktif={aktif('/marketplace/notifikasi')} aria-label="Notifikasi"><Bell size={16} /><b class="num absolute -top-1 -right-1 grid size-4 place-items-center rounded-full bg-gold-400 text-[9px] text-brand-900">2</b></a>
				<a href="/marketplace/profil" class="header-action hidden lg:inline-flex" class:aktif={aktif('/marketplace/profil')} aria-label="Profil"><UserRound size={16} /></a>
				<a href="/marketplace/keranjang" class="ml-1 inline-flex min-h-9 items-center gap-1.5 rounded-xl bg-brand-700 px-3 text-sm font-black text-white shadow-[0_3px_0_0_#072e1f] transition hover:translate-y-px hover:shadow-[0_2px_0_0_#072e1f]" aria-label="Buka keranjang{jumlah ? `, ${jumlah} item` : ''}">
					<ShoppingBag size={17} strokeWidth={2.5} />
					<span class="hidden min-[380px]:inline">Keranjang</span>
					{#if jumlah}<span class="num grid size-5 place-items-center rounded-full bg-white text-[11px] font-black text-primary-700">{jumlah}</span>{/if}
				</a>
			</div>
		</div>
	</header>

	{@render children()}

	{#if !fokus}
		<nav class="fixed inset-x-0 bottom-0 z-40 border-t border-brand-900/10 bg-white/95 px-2 pt-1.5 pb-[env(safe-area-inset-bottom)] shadow-[0_-8px_24px_-18px_rgb(7_46_31_/_0.42)] backdrop-blur-xl lg:hidden" aria-label="Navigasi marketplace">
			<div class="mx-auto grid max-w-2xl grid-cols-4">
				{#each navBawah as item}
					<a href={item.href} class="market-nav relative" class:aktif={aktif(item.href)}>
						<item.icon size={20} strokeWidth={2.5} />
						{#if item.badge}<b class="num absolute top-0 right-[calc(50%-1.5rem)] grid size-4 place-items-center rounded-full bg-gold-400 text-[9px] text-brand-900">{item.badge}</b>{/if}
						<span>{item.label}</span>
					</a>
				{/each}
			</div>
		</nav>
		<a href="/marketplace/chat" class="chat-float fixed right-3 bottom-22 z-40 grid size-10 place-items-center rounded-full bg-primary-700 text-white transition hover:translate-y-px lg:right-6 lg:bottom-6" aria-label="Buka chat bantuan" title="Chat bantuan"><MessageCircle size={18} strokeWidth={2.5} /></a>
	{/if}
</div>

<style>
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
	.market-nav.aktif {
		background: #edf8f0;
		color: #0f6a42;
	}
	.header-action {
		display: inline-flex;
		align-items: center;
		gap: 0.38rem;
		border-radius: 0.7rem;
		padding: 0.52rem 0.62rem;
		color: #607083;
		font-size: 0.78rem;
		font-weight: 800;
		transition: background-color 160ms ease, color 160ms ease;
	}
	.header-action.hidden {
		display: none;
	}
	@media (min-width: 1024px) {
		.header-action.hidden {
			display: inline-flex;
		}
	}
	.header-action:hover,
	.header-action.aktif {
		background: #edf8f0;
		color: #0f6a42;
	}
	.chat-float {
		box-shadow: 0 13px 24px -9px rgb(5 69 42 / 0.58), 0 4px 0 #0d5435;
	}
	.chat-float:hover {
		box-shadow: 0 10px 20px -9px rgb(5 69 42 / 0.58), 0 3px 0 #0d5435;
	}
</style>
