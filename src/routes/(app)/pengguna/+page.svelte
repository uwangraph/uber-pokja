<script>
	import { Card, Table } from '@khwarizmi/svelte-ui';
	import PageHeader from '$lib/components/PageHeader.svelte';
	import Badge from '$lib/components/Badge.svelte';
	import Avatar from '$lib/components/Avatar.svelte';
	import { akun, labelRole } from '$lib/data.js';

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
		<Badge tone="brand">{labelRole(row.role)}</Badge>
	{:else}
		<span class="text-slate-500">{row.username}</span>
	{/if}
{/snippet}

<!-- HP: daftar ringkas; tablet ke atas: tabel -->
<Card padding="none" class="overflow-hidden md:hidden">
	<ul class="divide-y divide-slate-100">
		{#each akun as a (a.id)}
			<li class="flex items-center gap-3 px-4 py-3">
				<Avatar nama={a.nama} size="size-9" />
				<div class="min-w-0 flex-1">
					<p class="truncate text-sm font-black">{a.nama}</p>
					<p class="truncate text-xs font-bold text-slate-400">{a.username}</p>
				</div>
				<Badge tone="brand">{labelRole(a.role)}</Badge>
			</li>
		{/each}
	</ul>
</Card>

<Card padding="none" class="overflow-hidden max-md:hidden">
	<Table columns={kolom} rows={akun} cell={sel} emptyText="Belum ada pengguna." />
</Card>
