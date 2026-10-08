<script>
	import { browser } from '$app/environment';
	import { Button, Card, Modal, Select, showToast } from '@khwarizmi/svelte-ui';
	import { Camera, CheckCircle2, MapPin, PackageCheck, Truck, Loader2, RefreshCw, UserPlus } from 'lucide-svelte';
	import PageHeader from '$lib/components/PageHeader.svelte';
	import Badge from '$lib/components/Badge.svelte';
	import { akun } from '$lib/data.js';

	function akunAktif() {
		if (!browser) return null;
		try {
			return JSON.parse(localStorage.getItem('user'));
		} catch {
			return null;
		}
	}
	let user = $state(null);
	$effect(() => {
		user = akunAktif();
	});
	const namaKurir = $derived(user?.nama ?? '');
	const isKurir = $derived(user?.role === 'kurir');
	const bisaTugaskan = $derived(user?.role === 'admin' || user?.role === 'gudang');
	const daftarKurir = akun.filter((a) => a.role === 'kurir');

	let kiriman = $state([
		{ id: 'KR-001', pesanan: 'MP-1790566574238', penerima: 'Ibu Rina', hp: '0812-7000-1001', alamat: 'Kp. Tapos I, Tenjolaya', barang: 'Beras Premium 5 kg × 1', status: 'Siap dikirim', kurirId: null },
		{ id: 'KR-002', pesanan: 'MP-17905665396912', penerima: 'Ibu Siti', hp: '0812-7000-1002', alamat: 'Kp. Gunung Malang, Tenjolaya', barang: 'Minyak Goreng 2 L × 2', status: 'Dalam perjalanan', kurirId: 2 },
		{ id: 'KR-003', pesanan: 'MP-1790566461787', penerima: 'Ibu Euis', hp: '0812-7000-1003', alamat: 'Kp. Situ Daun, Tenjolaya', barang: 'Gula Pasir 1 kg × 3', status: 'Selesai', kurirId: 2 }
	]);
	let filter = $state('semua');
	let buktiOpen = $state(false);
	let kirimanAktif = $state(null);
	let fotoBukti = $state('');
	let videoEl = $state(null);
	let canvasEl = $state(null);
	let kameraStream = $state(null);
	let kameraSiap = $state(false);
	let kameraError = $state('');
	let lokasi = $state(null);
	let lokasiStatus = $state('mencari');
	const daftar = $derived(
		kiriman
			.filter((item) => !isKurir || item.kurirId === user?.id)
			.filter((item) => filter === 'semua' || item.status === filter)
	);
	const tone = { 'Siap dikirim': 'amber', 'Dalam perjalanan': 'blue', Selesai: 'green' };
	function tugaskan(item, kurirId) {
		item.kurirId = kurirId ? parseInt(kurirId) : null;
		kiriman = [...kiriman];
		const kurir = akun.find((a) => a.id === item.kurirId);
		if (kurir) showToast({ tone: 'success', title: 'Kurir ditugaskan', description: `${item.pesanan} ditugaskan ke ${kurir.nama}.` });
	}
	function mulai(item) {
		item.status = 'Dalam perjalanan';
		kiriman = [...kiriman];
		showToast({ tone: 'success', title: 'Pengiriman dimulai', description: `${item.pesanan} sedang dalam perjalanan.` });
	}
	async function bukaKonfirmasi(item) {
		kirimanAktif = item;
		fotoBukti = '';
		kameraSiap = false;
		kameraError = '';
		lokasi = null;
		lokasiStatus = 'mencari';
		buktiOpen = true;
		cariLokasi();
		await nyalakanKamera();
	}
	function cariLokasi() {
		if (!navigator.geolocation) {
			lokasiStatus = 'gagal';
			return;
		}
		navigator.geolocation.getCurrentPosition(
			(pos) => {
				lokasi = { lat: pos.coords.latitude, lng: pos.coords.longitude };
				lokasiStatus = 'ok';
			},
			() => {
				lokasiStatus = 'gagal';
			},
			{ enableHighAccuracy: true, timeout: 10000 }
		);
	}
	async function nyalakanKamera() {
		try {
			kameraStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' }, audio: false });
			if (videoEl) {
				videoEl.srcObject = kameraStream;
				await videoEl.play();
			}
			kameraSiap = true;
		} catch {
			kameraError = 'Tidak bisa mengakses kamera. Periksa izin kamera pada browser.';
			kameraSiap = false;
		}
	}
	function matikanKamera() {
		kameraStream?.getTracks().forEach((track) => track.stop());
		kameraStream = null;
		kameraSiap = false;
	}
	function ambilFoto() {
		if (!videoEl || !canvasEl) return;
		const w = videoEl.videoWidth;
		const h = videoEl.videoHeight;
		canvasEl.width = w;
		canvasEl.height = h;
		const ctx = canvasEl.getContext('2d');
		ctx.drawImage(videoEl, 0, 0, w, h);

		const waktu = new Date().toLocaleString('id-ID', { dateStyle: 'full', timeStyle: 'medium' });
		const lokasiText = lokasiStatus === 'ok' && lokasi ? `${lokasi.lat.toFixed(5)}, ${lokasi.lng.toFixed(5)}` : lokasiStatus === 'mencari' ? 'Mencari lokasi…' : 'Lokasi tidak tersedia';
		const baris = [
			kirimanAktif ? `${kirimanAktif.pesanan} · ${kirimanAktif.penerima}` : '',
			`Kurir: ${namaKurir}`,
			waktu,
			`Lokasi: ${lokasiText}`
		].filter(Boolean);

		const fontSize = Math.max(16, Math.round(w / 32));
		const padding = Math.round(fontSize * 0.6);
		const lineHeight = Math.round(fontSize * 1.4);
		const overlayHeight = baris.length * lineHeight + padding * 2;

		ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
		ctx.fillRect(0, h - overlayHeight, w, overlayHeight);

		ctx.fillStyle = '#ffffff';
		ctx.font = `bold ${fontSize}px sans-serif`;
		ctx.textBaseline = 'top';
		baris.forEach((line, i) => {
			ctx.fillText(line, padding, h - overlayHeight + padding + i * lineHeight);
		});

		fotoBukti = canvasEl.toDataURL('image/jpeg', 0.92);
		matikanKamera();
	}
	function ulangiFoto() {
		fotoBukti = '';
		nyalakanKamera();
	}
	function tutupModal() {
		matikanKamera();
		buktiOpen = false;
		kirimanAktif = null;
	}
	function selesai() {
		if (!kirimanAktif || !fotoBukti) {
			showToast({ tone: 'warning', title: 'Bukti foto diperlukan', description: 'Ambil atau pilih foto saat barang diserahkan.' });
			return;
		}
		const item = kirimanAktif;
		item.status = 'Selesai';
		item.buktiFoto = fotoBukti;
		kiriman = [...kiriman];
		matikanKamera();
		buktiOpen = false;
		kirimanAktif = null;
		showToast({ tone: 'success', title: 'Pesanan diserahkan', description: `${item.pesanan} tercatat selesai.` });
	}
</script>

<svelte:head><title>Pengiriman · UBER POKJA</title></svelte:head>

<PageHeader eyebrow="Operasional" title="Pengiriman" subtitle="Antar pesanan yang sudah disiapkan Gudang, lalu perbarui status serah-terima." />

<div class="mb-5 max-w-xs"><Select label="Status pengiriman" options={[{ value: 'semua', label: 'Semua pengiriman' }, { value: 'Siap dikirim', label: 'Siap dikirim' }, { value: 'Dalam perjalanan', label: 'Dalam perjalanan' }, { value: 'Selesai', label: 'Selesai' }]} bind:value={filter} /></div>

<div class="grid gap-4 xl:grid-cols-2">
	{#each daftar as item (item.id)}
		{@const kurirItem = akun.find((a) => a.id === item.kurirId)}
		<Card padding="lg" class="flex flex-col">
			<div class="flex items-start justify-between gap-3"><div><p class="text-xs font-black tracking-widest text-primary-600 uppercase">{item.id} · {item.pesanan}</p><h2 class="mt-1 font-black">{item.penerima}</h2></div><Badge tone={tone[item.status]}>{item.status}</Badge></div>
			<div class="mt-5 space-y-3 rounded-2xl bg-slate-50 p-4 text-sm"><p class="flex items-start gap-2 font-bold text-slate-600"><MapPin class="mt-0.5 shrink-0 text-primary-700" size={17} /> <span>{item.alamat}<br /><span class="text-slate-400">{item.hp}</span></span></p><p class="flex items-start gap-2 font-bold text-slate-600"><PackageCheck class="mt-0.5 shrink-0 text-primary-700" size={17} /> {item.barang}</p></div>

			{#if bisaTugaskan && item.status === 'Siap dikirim'}
				<div class="mt-3 max-w-xs"><Select label="Tugaskan kurir" placeholder="Pilih kurir" options={daftarKurir.map((k) => ({ value: String(k.id), label: k.nama }))} value={item.kurirId ? String(item.kurirId) : ''} onChange={(v) => tugaskan(item, v)} /></div>
			{:else if kurirItem}
				<p class="mt-3 flex items-center gap-2 text-sm font-bold text-slate-500"><UserPlus size={16} class="text-primary-700" /> Kurir: {kurirItem.nama}</p>
			{/if}

			{#if item.buktiFoto}<div class="mt-4 overflow-hidden rounded-2xl border border-primary-200 bg-primary-50"><img src={item.buktiFoto} alt="Bukti serah-terima {item.pesanan}" class="h-40 w-full object-cover" /><p class="flex items-center gap-2 px-3 py-2 text-xs font-black text-primary-800"><Camera size={15} /> Bukti serah-terima</p></div>{/if}
			<div class="mt-5 flex justify-end gap-2">
				{#if item.status === 'Siap dikirim' && isKurir}<Button onclick={() => mulai(item)}><Truck size={17} /> Mulai antar</Button>{/if}
				{#if item.status === 'Siap dikirim' && !isKurir && !kurirItem}<span class="text-sm font-bold text-amber-600">Belum ditugaskan ke kurir</span>{/if}
				{#if item.status === 'Dalam perjalanan' && isKurir}<Button onclick={() => bukaKonfirmasi(item)}><CheckCircle2 size={17} /> Konfirmasi diterima</Button>{/if}
				{#if item.status === 'Selesai'}<span class="inline-flex items-center gap-2 text-sm font-black text-primary-700"><CheckCircle2 size={18} /> Sudah diserahkan</span>{/if}
			</div>
		</Card>
	{:else}
		<Card padding="lg" class="xl:col-span-2 text-center"><Truck class="mx-auto text-slate-300" size={28} /><p class="mt-3 font-black">Tidak ada pengiriman pada status ini.</p></Card>
	{/each}
</div>

<Modal bind:open={buktiOpen} title="Bukti serah-terima" description={kirimanAktif ? `${kirimanAktif.pesanan} · ${kirimanAktif.penerima}` : ''} size="md" onclose={tutupModal}>
	<p class="mb-3 text-sm font-medium text-slate-500">Ambil foto langsung dari kamera. Waktu, lokasi, dan nama kurir tercatat otomatis di dalam foto.</p>

	<canvas bind:this={canvasEl} class="hidden"></canvas>

	{#if fotoBukti}
		<img src={fotoBukti} alt="Pratinjau bukti serah-terima" class="h-72 w-full rounded-2xl object-cover" />
		<Button variant="link" class="mt-3" onclick={ulangiFoto}><RefreshCw size={16} /> Ambil ulang foto</Button>
	{:else}
		<div class="relative overflow-hidden rounded-2xl border border-dashed border-primary-300 bg-slate-900">
			{#if kameraError}
				<div class="flex h-72 flex-col items-center justify-center gap-2 p-5 text-center">
					<Camera class="text-slate-300" size={28} />
					<p class="font-black text-white">{kameraError}</p>
				</div>
			{:else}
				<video bind:this={videoEl} class="h-72 w-full object-cover" playsinline muted></video>
				{#if !kameraSiap}
					<div class="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-slate-900/80 text-white"><Loader2 class="animate-spin" size={24} /><p class="text-sm font-bold">Membuka kamera…</p></div>
				{/if}
				<div class="absolute bottom-2 left-2 right-2 rounded-xl bg-black/55 px-3 py-2 text-xs font-bold text-white">
					<p>Kurir: {namaKurir}</p>
					<p>{lokasiStatus === 'ok' && lokasi ? `${lokasi.lat.toFixed(5)}, ${lokasi.lng.toFixed(5)}` : lokasiStatus === 'mencari' ? 'Mencari lokasi…' : 'Lokasi tidak tersedia'}</p>
				</div>
			{/if}
		</div>
		<Button class="mt-4 w-full" disabled={!kameraSiap} onclick={ambilFoto}><Camera size={17} /> Ambil foto</Button>
	{/if}

	{#snippet footer()}<div class="grid w-full grid-cols-[auto_1fr] gap-2 sm:flex sm:justify-end"><Button variant="outline" onclick={tutupModal}>Batal</Button><Button class="whitespace-nowrap" disabled={!fotoBukti} onclick={selesai}><CheckCircle2 size={17} /> Simpan & selesai</Button></div>{/snippet}
</Modal>
