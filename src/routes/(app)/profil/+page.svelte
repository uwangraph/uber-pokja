<script>
	import { onMount } from 'svelte';
	import { Avatar, Button, Card } from '@khwarizmi/svelte-ui';
	import PageHeader from '$lib/components/PageHeader.svelte';
	import Badge from '$lib/components/Badge.svelte';
	import Icon from '$lib/components/Icon.svelte';
	import { hakAkses, labelRole, majelis } from '$lib/data.js';
	import { nav } from '$lib/nav.js';
	import { keluar } from '$lib/auth.js';
	import TombolKembali from '$lib/components/TombolKembali.svelte';

	let user = $state(null);
	onMount(() => {
		try { user = JSON.parse(localStorage.getItem('user') ?? 'null'); } catch {}
	});

	const toko = $derived(majelis.find((m) => m.id === user?.majelisId));
	const menu = $derived(nav.filter((n) => hakAkses[user?.role]?.includes(n.href)));
</script>

<svelte:head><title>Profil · UBER POKJA</title></svelte:head>

<TombolKembali />

<PageHeader eyebrow="Akun" title="Profil saya" subtitle="Informasi akun dan menu yang bisa Anda akses." />

{#if user}
	<Card padding="lg">
		<div class="flex items-center gap-4">
			<Avatar name={user.nama} size="lg" />
			<div class="min-w-0 flex-1">
				<h2 class="truncate text-xl font-black">{user.nama}</h2>
				<p class="mt-0.5 truncate text-sm font-bold text-slate-400">{user.username}</p>
				<div class="mt-2"><Badge tone="brand">{labelRole(user.role)}</Badge></div>
			</div>
		</div>
		{#if toko}
			<div class="mt-5 rounded-2xl bg-slate-50 p-4 text-sm">
				<p class="text-xs font-bold text-slate-400">Toko</p>
				<p class="mt-1 font-black">{toko.nama}</p>
			</div>
		{/if}
	</Card>

	<h2 class="mt-8 mb-3 text-lg font-black">Menu yang bisa diakses</h2>
	<Card padding="none" class="overflow-hidden">
		<ul class="divide-y divide-slate-100">
			{#each menu as item}
				<li><a href={item.href} class="flex items-center gap-3 p-4 text-sm font-black text-slate-700 hover:bg-slate-50"><Icon name={item.icon} class="size-4 text-slate-400" /> {item.label}</a></li>
			{/each}
		</ul>
	</Card>

	<Button variant="outline" fullWidth class="mt-6" onclick={keluar}><Icon name="logout" class="size-4" /> Keluar</Button>
{/if}
