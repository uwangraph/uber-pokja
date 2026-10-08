<script>
	import { browser } from '$app/environment';
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { Badge, Button } from '@khwarizmi/svelte-ui';
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
					<span class="block truncate text-[11px] font-bold text-slate-500 max-sm:hidden">Marketplace UBER POKJA</span>
				</span>
			</a>
			<div class="flex shrink-0 items-center gap-1 sm:gap-2">
				<!-- HP/tablet: menu utama di bottom nav; desktop: semua menu di header. -->
				<Button size="sm" variant={aktif('/marketplace/toko') ? 'default' : 'outline'} onclick={() => goto('/marketplace/toko')} aria-label="Pilih toko"><Store size={16} /> <span class="hidden max-w-40 truncate sm:inline">{toko ? toko.nama : 'Semua toko'}</span></Button>
				<Button size="sm" variant={aktif('/marketplace/pesanan') ? 'default' : 'outline'} class="max-lg:hidden" onclick={() => goto('/marketplace/pesanan')}><ClipboardList size={16} /> Pesanan saya</Button>
				<Button size="sm" variant={aktif('/marketplace/notifikasi') ? 'default' : 'outline'} class="relative max-lg:hidden" onclick={() => goto('/marketplace/notifikasi')} aria-label="Notifikasi"><Bell size={16} /><b class="num absolute -top-1 -right-1 grid size-4 place-items-center rounded-full bg-gold-400 text-[9px] text-brand-900">2</b></Button>
				<Button size="sm" variant={aktif('/marketplace/profil') ? 'default' : 'outline'} class="max-lg:hidden" onclick={() => goto('/marketplace/profil')} aria-label="Profil"><UserRound size={16} /></Button>
				<Button size="sm" class="ml-1" onclick={() => goto('/marketplace/keranjang')} aria-label="Buka keranjang{jumlah ? `, ${jumlah} item` : ''}">
					<ShoppingBag size={17} strokeWidth={2.5} />
					<span class="hidden min-[380px]:inline">Keranjang</span>
					{#if jumlah}<Badge size="sm" pill>{jumlah}</Badge>{/if}
				</Button>
			</div>
		</div>
	</header>

	{@render children()}

	{#if !fokus}
		<nav class="fixed inset-x-0 bottom-0 z-40 border-t border-brand-900/10 bg-white/95 px-2 pt-1.5 pb-[env(safe-area-inset-bottom)] shadow-[0_-8px_24px_-18px_rgb(7_46_31_/_0.42)] backdrop-blur-xl lg:hidden" aria-label="Navigasi marketplace">
			<div class="mx-auto grid max-w-2xl grid-cols-4">
				{#each navBawah as item}
					<a href={item.href} class="relative flex min-h-15 flex-col items-center justify-center gap-0.5 rounded-xl text-[11px] font-extrabold transition-colors {aktif(item.href) ? 'bg-primary-50 text-primary-700' : 'text-slate-500'}">
						<item.icon size={20} strokeWidth={2.5} />
						{#if item.badge}<b class="num absolute top-0 right-[calc(50%-1.5rem)] grid size-4 place-items-center rounded-full bg-gold-400 text-[9px] text-brand-900">{item.badge}</b>{/if}
						<span>{item.label}</span>
					</a>
				{/each}
			</div>
		</nav>
		<Button size="icon" class="fixed right-3 bottom-22 z-40 rounded-full lg:right-6 lg:bottom-6" onclick={() => goto('/marketplace/chat')} aria-label="Buka chat bantuan" title="Chat bantuan"><MessageCircle size={18} strokeWidth={2.5} /></Button>
	{/if}
</div>
