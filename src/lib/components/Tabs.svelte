<script>
	import { Select, Tabs } from '@khwarizmi/svelte-ui';
	// items: [{ value, label, count? }]
	// HP: tab selebar penuh & sama lebar; lebih dari 3 pilihan tidak muat, jadi dropdown.
	// Tablet ke atas: tab biasa selebar isinya, kecuali `fill` (tetap penuh).
	let { items, value = $bindable(), ariaLabel = '', fill = false } = $props();
	const opsi = $derived(items.map((t) => ({ value: t.value, label: t.count == null ? t.label : `${t.label} (${t.count})` })));
</script>

<div class="sm:hidden">
	{#if items.length > 3}
		<Select options={opsi} bind:value aria-label={ariaLabel} />
	{:else}
		<Tabs tabs={items} bind:value {ariaLabel} fill class="w-full" />
	{/if}
</div>
<div class="max-sm:hidden">
	<Tabs tabs={items} bind:value {ariaLabel} {fill} class={fill ? 'w-full' : ''} />
</div>
