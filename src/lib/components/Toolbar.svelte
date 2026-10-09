<script>
	import { tick } from 'svelte';
	import { Button } from '@khwarizmi/svelte-ui';
	import { Search } from 'lucide-svelte';
	// Baris alat daftar yang seragam di semua halaman:
	//   layar lebar (xl) : [pencarian][filter] ............ [aksi]
	//   di bawah xl      : [pencarian ........][aksi]
	//                      [filter (bisa digeser)]
	//   tanpa pencarian  : [filter ............][aksi] (satu baris di semua layar)
	//   pencarian + filter tanpa aksi: satu baris; di HP pencarian ringkas dan
	//   melebar saat diketik (filter disembunyikan sementara).
	let { search, filters, action, class: cls = '' } = $props();
	let fokus = $state(false);
	let adaIsi = $state(false);
	let kotakCari = $state(null);
	async function bukaCari() {
		fokus = true;
		await tick();
		kotakCari?.querySelector('input')?.focus();
	}
</script>

{#if search && filters && !action}
	<div class="mb-4 flex items-center gap-2 {cls}">
		<!-- HP: diam = tombol 🔍 (kolom pencarian disembunyikan); diketuk = kolom penuh & fokus.
		     Bila masih ada teks pencarian, kolom tetap tampil setengah lebar. -->
		{#if !fokus && !adaIsi}
			<span class="shrink-0 sm:hidden">
				<Button variant="outline" size="icon-lg" aria-label="Cari" onclick={bukaCari}><Search size={18} strokeWidth={2.5} /></Button>
			</span>
		{/if}
		<div
			bind:this={kotakCari}
			class="min-w-0 transition-[flex-basis] duration-200 sm:flex-1 xl:max-w-72 {fokus ? 'max-sm:basis-full' : adaIsi ? 'max-sm:basis-1/2' : 'max-sm:hidden'}"
			onfocusin={() => (fokus = true)}
			onfocusout={(e) => {
				fokus = false;
				adaIsi = Boolean(e.target?.value);
			}}
		>
			{@render search()}
		</div>
		<div class="min-w-0 flex-1 sm:flex-none {fokus ? 'max-sm:hidden' : ''}">{@render filters()}</div>
	</div>
{:else if !search && filters}
	<div class="mb-4 flex items-center gap-2 {cls}">
		<div class="min-w-0 flex-1">{@render filters()}</div>
		{#if action}<div class="flex shrink-0 items-center gap-2">{@render action()}</div>{/if}
	</div>
{:else}
<div class="mb-4 flex flex-col gap-3 xl:flex-row xl:items-center {cls}">
	{#if search || action}
		<div class="flex min-w-0 items-center gap-2 xl:contents">
			{#if search}
				<div class="min-w-0 flex-1 xl:order-1 xl:max-w-72 xl:min-w-56">{@render search()}</div>
			{/if}
			{#if action}
				<div class="ml-auto flex shrink-0 items-center gap-2 xl:order-3">{@render action()}</div>
			{/if}
		</div>
	{/if}
	{#if filters}
		<div class="min-w-0 xl:order-2">{@render filters()}</div>
	{/if}
</div>
{/if}
