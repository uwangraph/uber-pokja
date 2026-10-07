<script>
	// Baris alat daftar yang seragam di semua halaman:
	//   layar lebar (xl) : [pencarian][filter] ............ [aksi]
	//   di bawah xl      : [pencarian ........][aksi]
	//                      [filter (bisa digeser)]
	// Semua elemen setinggi 48px.
	let { search, filters, action, class: cls = '' } = $props();
</script>

<div class="toolbar mb-4 flex flex-col gap-3 xl:flex-row xl:items-center {cls}">
	{#if search || action}
		<div class="flex min-w-0 items-center gap-2 xl:contents">
			{#if search}
				<div class="min-w-0 flex-1 xl:order-1 xl:max-w-72 xl:min-w-56">{@render search()}</div>
			{/if}
			{#if action}
				<div class="toolbar-aksi ml-auto flex shrink-0 items-center gap-2 xl:order-3">{@render action()}</div>
			{/if}
		</div>
	{/if}
	{#if filters}
		<div class="toolbar-filter min-w-0 xl:order-2">{@render filters()}</div>
	{/if}
</div>
