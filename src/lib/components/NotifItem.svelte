<script>
	import Icon from './Icon.svelte';
	import { tandaiDibaca, toneIcon } from '../notif.svelte.js';
	let { n, onpick = () => {} } = $props();
</script>

<a
	href={n.href}
	onclick={() => {
		tandaiDibaca(n.id);
		onpick();
	}}
	class="flex gap-3 px-4 py-3.5 transition hover:bg-slate-50 {n.baru ? 'bg-primary-50' : ''}"
>
	<span class="grid size-9 shrink-0 place-items-center rounded-xl {toneIcon[n.tone]}"><Icon name={n.icon} class="size-4" /></span>
	<span class="min-w-0 flex-1">
		<span class="flex items-start justify-between gap-2">
			<span class="text-sm font-black text-slate-800">{n.judul}</span>
			{#if n.baru}<span class="mt-1.5 size-2 shrink-0 rounded-full bg-primary-500" aria-label="Belum dibaca"></span>{/if}
		</span>
		<span class="mt-0.5 block text-[13px] leading-snug font-bold text-slate-500">{n.isi}</span>
		<span class="mt-1 block text-xs font-bold text-slate-400">{n.waktu}</span>
	</span>
</a>
