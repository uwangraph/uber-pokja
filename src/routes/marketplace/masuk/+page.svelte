<script>
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { Button, Card, Input, showToast } from '@khwarizmi/svelte-ui';
	import { ChevronLeft } from 'lucide-svelte';
	import { masukPembeli, tujuanAman } from '$lib/pembeli.js';

	let data = $state({ nama: '', hp: '', email: '', alamat: '', rtRw: '', kelurahan: '', kecamatan: '', kota: '', provinsi: '', kodePos: '' });
	onMount(() => {
		try { data = { ...data, ...JSON.parse(localStorage.getItem('uber-pokja:marketplace:buyer') ?? '{}') }; } catch {}
	});

	function lanjut() {
		if (!data.nama.trim() || !data.hp.trim() || !data.alamat.trim()) {
			showToast({ tone: 'warning', title: 'Data belum lengkap', description: 'Isi nama, nomor WhatsApp, dan alamat untuk melanjutkan.' });
			return;
		}
		masukPembeli(data);
		goto(tujuanAman(page.url.searchParams.get('next')));
	}
</script>

<svelte:head><title>Masuk · UBER Market</title></svelte:head>

<main class="min-h-dvh bg-[#faf9f5] px-4 py-5 text-slate-800 sm:px-6"><div class="mx-auto max-w-2xl">
	<a href="/marketplace" class="inline-flex items-center gap-1.5 text-sm font-black text-primary-700"><ChevronLeft size={18} /> Kembali ke beranda</a>
	<header class="mt-6"><p class="text-xs font-black tracking-widest text-primary-600 uppercase">Sebelum memesan</p><h1 class="mt-1 text-2xl font-black">Masuk & lengkapi data</h1><p class="mt-1 text-sm font-medium text-slate-500">Katalog bisa dilihat tanpa login. Untuk memesan, lengkapi data pribadi agar pesanan bisa diproses dan dikirim.</p></header>
	<Card padding="lg" class="mt-6">
		<div class="grid gap-4 sm:grid-cols-2">
			<div class="sm:col-span-2"><Input label="Nama lengkap" placeholder="Nama lengkap" bind:value={data.nama} /></div>
			<Input label="Nomor WhatsApp" inputmode="tel" placeholder="08xx-xxxx-xxxx" bind:value={data.hp} />
			<Input label="Email (opsional)" inputmode="email" placeholder="nama@email.com" bind:value={data.email} />
			<div class="sm:col-span-2"><Input label="Alamat lengkap" placeholder="Jalan, nomor rumah, patokan" bind:value={data.alamat} /></div>
			<Input label="RT/RW" placeholder="001/002" bind:value={data.rtRw} />
			<Input label="Kelurahan/Desa" bind:value={data.kelurahan} />
			<Input label="Kecamatan" bind:value={data.kecamatan} />
			<Input label="Kota/Kabupaten" bind:value={data.kota} />
			<Input label="Provinsi" bind:value={data.provinsi} />
			<Input label="Kode pos" inputmode="numeric" bind:value={data.kodePos} />
		</div>
	</Card>
	<Button fullWidth size="lg" class="mt-6 mb-8" onclick={lanjut}>Masuk & lanjutkan</Button>
</div></main>
