<script>
	let { title, subtitle = '', eyebrow = '', actions } = $props();
</script>

<div class="mb-6 flex flex-wrap items-end justify-between gap-4 lg:mb-8">
	<div class="min-w-0">
		{#if eyebrow}<p class="mb-1.5 text-xs font-black tracking-widest text-slate-400 uppercase">{eyebrow}</p>{/if}
		<h1 class="text-2xl font-black tracking-tight text-slate-900 lg:text-[28px]">{title}</h1>
		{#if subtitle}<p class="mt-1.5 text-sm font-bold text-slate-400">{subtitle}</p>{/if}
	</div>
	<!-- HP: tombol aksi jadi grid 2 kolom selebar layar; tombol terakhir (aksi utama)
	     penuh satu baris bila jumlahnya ganjil. Tablet ke atas: berjajar biasa. -->
	{#if actions}<div class="grid w-full grid-cols-2 gap-2 *:w-full *:justify-center [&>*:last-child:nth-child(odd)]:col-span-2 sm:flex sm:w-auto sm:flex-wrap sm:*:w-auto">{@render actions()}</div>{/if}
</div>
