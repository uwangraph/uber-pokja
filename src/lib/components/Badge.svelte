<script>
	import { Badge } from '@khwarizmi/svelte-ui';
	let { tone = 'gray', children } = $props();
	const map = { green: 'emerald', amber: 'amber', red: 'red', gray: 'neutral' };
</script>

<Badge tone={map[tone]} size="sm" pill>{@render children()}</Badge>
