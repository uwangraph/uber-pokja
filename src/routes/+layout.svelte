<script>
	import '../app.css';
	import { Toast } from '@khwarizmi/svelte-ui';
	let { children } = $props();
</script>

{@render children()}
<Toast />
