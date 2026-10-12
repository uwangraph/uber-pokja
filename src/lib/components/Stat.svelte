<script>
	import { StatCard } from '@khwarizmi/svelte-ui';
	import { ikon } from '../icons.js';
	// compact: angka lebih kecil & tidak boleh patah baris (untuk deret 4 kartu atau nilai rupiah panjang).
	let { label, value, hint = '', icon = 'chart', tone = 'brand', compact = false } = $props();
	const map = { brand: 'primary', gold: 'amber', red: 'red', gray: 'neutral' };
</script>

<StatCard {label} {value} trendLabel={hint || undefined} icon={ikon[icon]} tone={map[tone]} class="h-full {compact ? '[&_.text-3xl]:text-xl [&_.text-3xl]:whitespace-nowrap sm:[&_.text-3xl]:text-2xl xl:[&_.text-3xl]:text-xl 2xl:[&_.text-3xl]:text-2xl' : ''}" />
