<script>
	import { goto } from '$app/navigation';
	import { MapPin, Store, ChevronRight, ChevronLeft, LayoutGrid, LocateFixed, Loader2 } from 'lucide-svelte';
	import { showToast } from '@khwarizmi/svelte-ui';
	import { majelis } from '$lib/data.js';
	import { inventori } from '$lib/inventori.svelte.js';
	import { pilihToko, tokoTerdekat } from '$lib/marketplace.svelte.js';

	let urutanJarak = $state(null); // null = belum dicari; array = hasil urut terdekat
	let mencariLokasi = $state(false);

	const dasar = $derived(
		majelis.map((m) => ({ ...m, jenisProduk: inventori.stokMajelis.filter((s) => s.majelisId === m.id && s.stok > 0).length }))
	);
	const daftar = $derived(
		urutanJarak
			? urutanJarak.map((t) => ({ ...t, jenisProduk: dasar.find((d) => d.id === t.id)?.jenisProduk ?? 0 }))
			: dasar
	);

	function cariTerdekat() {
		if (!navigator.geolocation) {
			showToast({ tone: 'warning', title: 'Lokasi tidak didukung', description: 'Browser ini tidak mendukung layanan lokasi.' });
			return;
		}
		mencariLokasi = true;
		navigator.geolocation.getCurrentPosition(
			(pos) => {
				urutanJarak = tokoTerdekat(pos.coords.latitude, pos.coords.longitude);
				mencariLokasi = false;
				showToast({ tone: 'success', title: 'Toko diurutkan dari terdekat', description: `${urutanJarak[0].nama} · ${urutanJarak[0].jarakKm.toFixed(1)} km dari Anda.` });
			},
			() => {
				mencariLokasi = false;
				showToast({ tone: 'warning', title: 'Tidak bisa mengakses lokasi', description: 'Izinkan akses lokasi pada browser untuk mencari toko terdekat.' });
			},
			{ enableHighAccuracy: true, timeout: 10000 }
		);
	}

	function kunjungi(m) {
		goto(`/marketplace/toko/${m.id}`);
	}
	function lihatSemua() {
		pilihToko(null);
		goto('/marketplace');
	}
</script>

<svelte:head><title>Daftar Toko · UBER Market</title></svelte:head>

<main class="min-h-dvh bg-[#faf9f5] px-4 py-8 text-slate-800 sm:px-6">
	<div class="mx-auto max-w-2xl">
		<a href="/marketplace" class="inline-flex items-center gap-1.5 text-sm font-black text-primary-700"><ChevronLeft size={18} /> Kembali ke marketplace</a>
		<header class="mt-6 text-center">
			<span class="mx-auto grid size-14 place-items-center rounded-2xl bg-primary-100 text-primary-700"><Store size={26} /></span>
			<h1 class="mt-4 text-2xl font-black">Toko Majelis Taklim</h1>
			<p class="mt-2 text-sm font-medium text-slate-500">Kunjungi toko untuk lihat semua produknya, atau filter langsung dari marketplace.</p>
		</header>

		<button
			type="button"
			class="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-brand-700 px-4 py-3 text-sm font-black text-white shadow-[0_3px_0_0_#072e1f] transition hover:translate-y-px hover:shadow-[0_2px_0_0_#072e1f] disabled:opacity-70"
			onclick={cariTerdekat}
			disabled={mencariLokasi}
		>
			{#if mencariLokasi}<Loader2 size={17} class="animate-spin" /> Mencari lokasi Anda…{:else}<LocateFixed size={17} /> Cari toko terdekat{/if}
		</button>

		<div class="mt-6 space-y-3">
			<button
				type="button"
				class="flex w-full items-center gap-4 rounded-3xl border border-dashed border-primary-300 bg-primary-50 p-4 text-left transition hover:border-primary-400"
				onclick={lihatSemua}
			>
				<span class="grid size-12 shrink-0 place-items-center rounded-2xl bg-white text-primary-700"><LayoutGrid size={22} /></span>
				<div class="min-w-0 flex-1">
					<p class="font-black text-primary-900">Lihat semua toko</p>
					<p class="mt-0.5 text-xs font-bold text-primary-700">Gabungan produk dari semua MT</p>
				</div>
				<ChevronRight class="shrink-0 text-primary-300" size={20} />
			</button>
			{#each daftar as m, i (m.id)}
				<button
					type="button"
					class="flex w-full items-center gap-4 rounded-3xl border p-4 text-left shadow-sm transition hover:border-primary-300 hover:shadow-md {urutanJarak && i === 0 ? 'border-primary-400 bg-primary-50/40 shadow-[0_3px_0_0_var(--primary-300)]' : 'border-slate-200 bg-white'}"
					onclick={() => kunjungi(m)}
				>
					<span class="grid size-12 shrink-0 place-items-center rounded-2xl bg-primary-50 text-primary-700"><Store size={22} /></span>
					<div class="min-w-0 flex-1">
						<div class="flex flex-wrap items-center gap-2">
							<p class="font-black text-slate-800">{m.nama}</p>
							{#if urutanJarak && i === 0}<span class="rounded-full bg-primary-100 px-2 py-0.5 text-[10px] font-black text-primary-800">Terdekat</span>{/if}
						</div>
						<p class="mt-0.5 flex items-center gap-1 text-xs font-bold text-slate-400"><MapPin size={13} /> Desa {m.desa}{urutanJarak ? ` · ${m.jarakKm.toFixed(1)} km` : ''}</p>
						<p class="mt-1 text-xs font-bold text-slate-400">{m.jenisProduk} produk tersedia</p>
					</div>
					<ChevronRight class="shrink-0 text-slate-300" size={20} />
				</button>
			{/each}
		</div>
	</div>
</main>
