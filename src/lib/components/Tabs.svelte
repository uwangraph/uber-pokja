<script>
	import { Tabs } from '@khwarizmi/svelte-ui';
	// items: [{ value, label, count? }]
	let { items, value = $bindable(), ariaLabel = '' } = $props();
</script>

<Tabs tabs={items} bind:value {ariaLabel} />
