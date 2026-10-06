<script>
	import { StatCard } from '@khwarizmi/svelte-ui';
	import { ikon } from '../icons.js';
	let { label, value, hint = '', icon = 'chart', tone = 'brand' } = $props();
	const map = { brand: 'primary', gold: 'amber', red: 'red', gray: 'neutral' };
</script>

<StatCard {label} {value} trendLabel={hint || undefined} icon={ikon[icon]} tone={map[tone]} class="stat-kartu h-full" />
