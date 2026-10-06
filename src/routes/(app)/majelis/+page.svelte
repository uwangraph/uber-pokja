<script>
	import { goto } from '$app/navigation';
	import { Button, Card, Progress, EmptyState, Input, Modal, NumberInput, Tooltip, showToast } from '@khwarizmi/svelte-ui';
	import { SearchX } from 'lucide-svelte';
	import PageHeader from '$lib/components/PageHeader.svelte';
	import Badge from '$lib/components/Badge.svelte';
	import Icon from '$lib/components/Icon.svelte';
	import Search from '$lib/components/Search.svelte';
	import Toolbar from '$lib/components/Toolbar.svelte';
	import Avatar from '$lib/components/Avatar.svelte';
	import Stat from '$lib/components/Stat.svelte';
	import { majelis as dataMajelis } from '$lib/data.js';
	import { rupiah } from '$lib/format.js';

	let cari = $state('');
	let majelis = $state(dataMajelis.map((m) => ({ ...m })));
	let formOpen = $state(false);
	let baru = $state({ nama: '', desa: '', ketua: '', hp: '', piutang: 0 });
	const list = $derived(majelis.filter((m) => (m.nama + m.desa + m.ketua).toLowerCase().includes(cari.toLowerCase())));
	const totalPiutang = $derived(majelis.reduce((s, m) => s + m.piutang, 0));
	const totalTransaksi = $derived(majelis.reduce((s, m) => s + m.transaksi, 0));
	const maks = $derived(Math.max(...majelis.map((m) => m.transaksi)));
	function bukaTambah() {
		baru = { nama: '', desa: '', ketua: '', hp: '', piutang: 0 };
		formOpen = true;
	}
	function simpan() {
		if (!baru.nama.trim()) return showToast({ tone: 'warning', title: 'Nama Majelis Taklim belum diisi' });
		majelis.push({ id: Math.max(...majelis.map((m) => m.id)) + 1, nama: baru.nama.trim(), desa: baru.desa.trim(), ketua: baru.ketua.trim(), hp: baru.hp.trim(), piutang: baru.piutang, transaksi: 0 });
		showToast({ tone: 'success', title: 'Majelis Taklim ditambahkan', description: baru.nama });
		formOpen = false;
	}
</script>

<svelte:head><title>Majelis Taklim · UBER POKJA</title></svelte:head>

<PageHeader eyebrow="Relasi" title="Majelis Taklim" subtitle="Majelis Taklim anggota, kontak, dan riwayat transaksinya." />

<div class="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
	<Stat label="Majelis Taklim" value="{majelis.length} MT" hint="Anggota aktif" icon="users" />
	<Stat label="Transaksi" value="{totalTransaksi}×" hint="Sejak awal usaha" icon="cart" tone="gray" />
	<div class="col-span-2 lg:col-span-1">
		<Stat label="Piutang berjalan" value={rupiah(totalPiutang)} hint="{majelis.filter((m) => m.piutang).length} MT belum lunas" icon="coins" tone="gold" />
	</div>
</div>

<h2 class="mt-8 mb-3 text-lg font-black">Daftar Majelis Taklim</h2>
<Toolbar>
	{#snippet search()}
		<Search bind:value={cari} placeholder="Cari nama, desa, atau ketua…" />
	{/snippet}
	{#snippet action()}
		<Button onclick={bukaTambah}>
			<Icon name="plus" class="size-4" strokeWidth={3} /> <span class="hidden sm:inline">Tambah MT</span><span class="sm:hidden">Tambah</span>
		</Button>
	{/snippet}
</Toolbar>

<Modal bind:open={formOpen} title="Tambah Majelis Taklim" description="Lengkapi data Majelis Taklim baru." size="md">
	<div class="grid gap-4 sm:grid-cols-2">
		<div class="sm:col-span-2"><Input label="Nama Majelis Taklim" placeholder="mis. MT Al-Hidayah" bind:value={baru.nama} /></div>
		<Input label="Desa" placeholder="mis. Tenjolaya" bind:value={baru.desa} />
		<Input label="Nama ketua" placeholder="mis. Ibu Aminah" bind:value={baru.ketua} />
		<Input label="No. HP" inputmode="tel" placeholder="08xx-xxxx-xxxx" bind:value={baru.hp} />
		<NumberInput label="Piutang awal" min={0} bind:value={baru.piutang} />
	</div>
	{#snippet footer()}
		<div class="flex w-full justify-end gap-2">
			<Button variant="outline" onclick={() => (formOpen = false)}>Batal</Button>
			<Button onclick={simpan}>Simpan Majelis Taklim</Button>
		</div>
	{/snippet}
</Modal>

{#if list.length}
	<div class="grid-kartu">
		{#each list as m}
			<Card padding="lg" class="flex flex-col">
				<div class="flex items-start justify-between gap-3">
					<Avatar nama={m.nama} size="size-11" />
					{#if m.piutang > 0}<Badge tone="amber">Piutang</Badge>{:else}<Badge tone="green">Lancar</Badge>{/if}
				</div>
				<h3 class="mt-3 truncate font-black" title={m.nama}>{m.nama}</h3>
				<p class="mt-0.5 flex items-center gap-1 truncate text-xs font-bold text-slate-400"><Icon name="pin" class="size-3.5 shrink-0" /> Desa {m.desa}</p>

				<dl class="mt-4 grid grid-cols-[minmax(0,1fr)_auto] gap-x-6 gap-y-3 border-y border-slate-100 py-4 text-sm">
					<div><dt class="text-xs font-bold text-slate-400">Ketua</dt><dd class="mt-0.5 truncate font-black">{m.ketua}</dd></div>
					<div><dt class="text-xs font-bold text-slate-400">Kontak</dt><dd class="num mt-0.5 font-black whitespace-nowrap">{m.hp}</dd></div>
				</dl>

				<div class="mt-4 space-y-3 text-sm">
					<div>
						<div class="mb-1.5 flex justify-between text-xs"><span class="font-bold text-slate-400">Transaksi</span><span class="num font-black">{m.transaksi}×</span></div>
						<Progress value={m.transaksi} max={maks} size="sm" label="Transaksi {m.nama}" />
					</div>
					<div class="flex justify-between text-xs">
						<span class="font-bold text-slate-400">Piutang</span>
						<span class="num font-black {m.piutang ? 'text-amber-600' : 'text-slate-400'}">{m.piutang ? rupiah(m.piutang) : 'Tidak ada'}</span>
					</div>
				</div>

				<div class="mt-5 flex gap-2">
					<Button variant="outline" class="flex-1" onclick={() => goto('/penjualan?tab=riwayat')}>Riwayat</Button>
					<Tooltip text="Telepon {m.ketua}">
						<Button variant="outline" size="icon" aria-label="Telepon {m.ketua}" onclick={() => (location.href = `tel:${m.hp.replaceAll('-', '')}`)}><Icon name="phone" class="size-4" /></Button>
					</Tooltip>
				</div>
			</Card>
		{/each}
	</div>
{:else}
	<EmptyState icon={SearchX} title="Majelis Taklim tidak ditemukan" description="Coba kata kunci lain." />
{/if}
