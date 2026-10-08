<script>
	import { Button, Card, EmptyState } from '@khwarizmi/svelte-ui';
	import { CircleCheck } from 'lucide-svelte';
	import PageHeader from '$lib/components/PageHeader.svelte';
	import TombolKembali from '$lib/components/TombolKembali.svelte';
	import Tabs from '$lib/components/Tabs.svelte';
	import Toolbar from '$lib/components/Toolbar.svelte';
	import Icon from '$lib/components/Icon.svelte';
	import NotifItem from '$lib/components/NotifItem.svelte';
	import { untukRole, jumlahBaru, tandaiSemua } from '$lib/notif.svelte.js';
	import { browser } from '$app/environment';

	let role = $state('');
	$effect(() => {
		if (browser) role = JSON.parse(localStorage.getItem('user') ?? '{}').role ?? '';
	});
	let filter = $state('semua');
	const notifSaya = $derived(untukRole(role));
	const baru = $derived(jumlahBaru(role));
	const daftar = $derived(filter === 'baru' ? notifSaya.filter((n) => n.baru) : notifSaya);
</script>

<svelte:head><title>Notifikasi · UBER POKJA</title></svelte:head>

<TombolKembali />

<PageHeader title="Notifikasi" subtitle="Pengingat stok, piutang, pembelian, dan transaksi terbaru." />

<div class="mx-auto max-w-3xl">
	<Toolbar>
		{#snippet filters()}
			<Tabs
				bind:value={filter}
				ariaLabel="Filter notifikasi"
				items={[
					{ value: 'semua', label: 'Semua', count: notifSaya.length },
					{ value: 'baru', label: 'Belum dibaca', count: baru }
				]}
			/>
		{/snippet}
		{#snippet action()}
			<Button variant="outline" disabled={!baru} onclick={() => tandaiSemua(role)}>
				<Icon name="check" class="size-4" strokeWidth={3} /> <span class="hidden sm:inline">Tandai semua dibaca</span><span class="sm:hidden">Tandai dibaca</span>
			</Button>
		{/snippet}
	</Toolbar>
	{#if daftar.length}
		<Card padding="none" class="overflow-hidden">
			<div class="divide-y divide-slate-100">
				{#each daftar as n (n.id)}
					<NotifItem {n} />
				{/each}
			</div>
		</Card>
	{:else}
		<EmptyState icon={CircleCheck} title="Semua sudah dibaca" description="Tidak ada notifikasi baru." />
	{/if}
</div>
