<script>
	let { title, subtitle = '', eyebrow = '', actions } = $props();
</script>

<div class="mb-6 flex flex-wrap items-end justify-between gap-4 lg:mb-8">
	<div class="min-w-0">
		{#if eyebrow}<p class="mb-1.5 text-xs font-black tracking-widest text-slate-400 uppercase">{eyebrow}</p>{/if}
		<h1 class="text-2xl font-black tracking-tight text-slate-900 lg:text-[28px]">{title}</h1>
		{#if subtitle}<p class="mt-1.5 text-sm font-bold text-slate-400">{subtitle}</p>{/if}
	</div>
	{#if actions}<div class="flex flex-wrap gap-2">{@render actions()}</div>{/if}
</div>
