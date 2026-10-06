<script>
	import { Card, Table } from '@khwarizmi/svelte-ui';
	import PageHeader from '$lib/components/PageHeader.svelte';
	import Badge from '$lib/components/Badge.svelte';
	import Avatar from '$lib/components/Avatar.svelte';
	import { akun } from '$lib/data.js';

	const kolom = [
		{ key: 'nama', label: 'Pengguna' },
		{ key: 'username', label: 'Username' },
		{ key: 'role', label: 'Role' }
	];
</script>

<svelte:head><title>Pengguna · UBER POKJA</title></svelte:head>

<PageHeader eyebrow="Administrasi" title="Pengguna & hak akses" subtitle="Manajemen akun dan hak akses hanya tersedia untuk Admin." />

{#snippet sel(row, col)}
	{#if col.key === 'nama'}
		<div class="flex items-center gap-3"><Avatar nama={row.nama} size="size-8" /><strong>{row.nama}</strong></div>
	{:else if col.key === 'role'}
		<Badge tone="brand">{row.role[0].toUpperCase() + row.role.slice(1)}</Badge>
	{:else}
		<span class="text-slate-500">{row.username}</span>
	{/if}
{/snippet}

<Card padding="none" class="overflow-hidden">
	<Table columns={kolom} rows={akun} cell={sel} emptyText="Belum ada pengguna." />
</Card>
