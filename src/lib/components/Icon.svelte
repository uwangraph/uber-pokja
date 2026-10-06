<script>
	import { ikon } from '../icons.js';
	let { name, class: cls = 'size-5', strokeWidth = 2 } = $props();
	const C = $derived(ikon[name]);
</script>

<C class={cls} {strokeWidth} aria-hidden="true" />
