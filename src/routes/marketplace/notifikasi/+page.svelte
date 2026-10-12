<script>
	import { Button, EmptyState } from '@khwarizmi/svelte-ui';
	import { Bell, CheckCheck, ChevronLeft } from 'lucide-svelte';
	import NotifItem from '$lib/components/NotifItem.svelte';
	import { notifPembeli, jumlahBaruPembeli, tandaiSemuaPembeli } from '$lib/notif.svelte.js';

	const daftar = $derived(notifPembeli());
	const baru = $derived(jumlahBaruPembeli());
</script>

<svelte:head><title>Notifikasi · UBER Market</title></svelte:head>

<main class="min-h-dvh bg-[#faf9f5] px-4 py-5 text-slate-800 sm:px-6">
	<div class="mx-auto max-w-2xl">
		<a href="/marketplace" class="inline-flex items-center gap-1.5 text-sm font-black text-primary-700"><ChevronLeft size={18} /> Kembali ke beranda</a>
		<header class="mt-6 flex items-center gap-3">
			<span class="grid size-12 place-items-center rounded-2xl bg-primary-100 text-primary-700"><Bell size={22} /></span>
			<div class="min-w-0 flex-1"><h1 class="text-2xl font-black">Notifikasi</h1><p class="text-sm font-medium text-slate-500">{baru ? `${baru} belum dibaca` : 'Info status pesananmu.'}</p></div>
			<Button variant="outline" size="sm" disabled={!baru} onclick={tandaiSemuaPembeli}><CheckCheck size={16} /> <span class="max-sm:hidden">Tandai dibaca</span></Button>
		</header>
		{#if daftar.length}
			<section class="mt-6 divide-y divide-slate-100 overflow-hidden rounded-2xl border border-slate-200 bg-white">
				{#each daftar as n (n.id)}
					<NotifItem {n} />
				{/each}
			</section>
		{:else}
			<div class="mt-12"><EmptyState icon={Bell} title="Belum ada notifikasi" description="Status pesananmu akan muncul di sini." /></div>
		{/if}
	</div>
</main>
