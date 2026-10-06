<script>
	import { SearchInput } from '@khwarizmi/svelte-ui';
	let { value = $bindable(''), placeholder = 'Cari…', id = 'cari', class: cls = '' } = $props();
</script>

<div class={cls}>
	<SearchInput {id} bind:value {placeholder} aria-label={placeholder.replace(/…$/, '')} />
</div>
