<script>
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { Button, Card, DatePicker, Input, Select, showToast, Switch } from '@khwarizmi/svelte-ui';
	import FormSheet from '$lib/components/FormSheet.svelte';
	import { Bell, ChevronLeft, ChevronRight, LockKeyhole, MapPin, PackageCheck, Pencil, ShieldCheck, Store, UserRound } from 'lucide-svelte';

	let profil = $state({ nama: '', hp: '', alamat: '', rtRw: '', kelurahan: '', kecamatan: '', kota: '', provinsi: '', kodePos: '', email: '', gender: '', lahir: '', notifPromo: true, notifPesanan: true });
	let editData = $state(false);
	let editAlamat = $state(false);
	const inisial = $derived(profil.nama.trim().split(/\s+/).filter(Boolean).slice(0, 2).map((n) => n[0]).join('').toUpperCase() || 'UM');
	const alamatTampil = $derived([profil.alamat, profil.rtRw && `RT/RW ${profil.rtRw}`, profil.kelurahan, profil.kecamatan, profil.kota, profil.provinsi, profil.kodePos].filter(Boolean).join(', '));
	onMount(() => { try { profil = { ...profil, ...JSON.parse(localStorage.getItem('uber-pokja:marketplace:buyer') ?? '{}') }; } catch {} });
	function simpan() { localStorage.setItem('uber-pokja:marketplace:buyer', JSON.stringify(profil)); showToast({ tone: 'success', title: 'Profil disimpan', description: 'Identitas dan alamat utama diperbarui.' }); }
	function segera(label) { showToast({ tone: 'info', title: label, description: 'Fitur ini akan terhubung ke autentikasi akun saat backend aktif.' }); }
</script>

<svelte:head><title>Profil · UBER Market</title></svelte:head>

<main class="min-h-dvh bg-[#faf9f5] px-4 py-5 text-slate-800 sm:px-6"><div class="mx-auto max-w-2xl">
	<a href="/marketplace" class="inline-flex items-center gap-1.5 text-sm font-black text-primary-700"><ChevronLeft size={18} /> Kembali ke beranda</a>
	<section class="mt-6 overflow-hidden rounded-3xl bg-linear-to-br from-primary-900 to-primary-700 p-5 text-white shadow-sm sm:p-6"><div class="flex items-center gap-4"><span class="grid size-16 place-items-center rounded-3xl bg-white/15 text-xl font-black ring-1 ring-white/20">{inisial}</span><div class="min-w-0 flex-1"><h1 class="truncate text-xl font-black">{profil.nama || 'Customer UBER Market'}</h1><p class="mt-1 truncate text-sm font-medium text-primary-100">{profil.email || 'Lengkapi email Anda'}</p></div><Button variant="secondary" size="sm" class="shrink-0" onclick={() => (editData = true)}>Edit</Button></div><div class="mt-5 grid grid-cols-2 gap-px overflow-hidden rounded-2xl bg-white/15 text-center"><a href="/marketplace/pesanan" class="bg-primary-800/40 px-3 py-3 text-sm font-bold hover:bg-white/10"><strong class="block text-lg">Pesanan</strong><span class="text-xs text-primary-100">Lihat status belanja</span></a><a href="/marketplace/notifikasi" class="bg-primary-800/40 px-3 py-3 text-sm font-bold hover:bg-white/10"><strong class="block text-lg">Info</strong><span class="text-xs text-primary-100">Promo & notifikasi</span></a></div></section>
	<Card id="data-pribadi" padding="lg" class="mt-5"><div class="flex items-center justify-between gap-3"><div class="flex items-center gap-3"><span class="grid size-10 place-items-center rounded-xl bg-primary-50 text-primary-700"><UserRound size={19} /></span><div><h2 class="font-black">Data pribadi</h2><p class="text-sm font-medium text-slate-500">Digunakan untuk identitas customer.</p></div></div><Button variant="outline" size="sm" onclick={() => (editData = true)}><Pencil size={15} /> Edit</Button></div>
		<div class="mt-5 grid grid-cols-2 gap-x-5 gap-y-4 rounded-2xl bg-slate-50 p-4 text-sm"><div><p class="text-xs font-bold text-slate-400">Nama</p><p class="mt-1 font-black">{profil.nama || 'Belum diisi'}</p></div><div><p class="text-xs font-bold text-slate-400">WhatsApp</p><p class="num mt-1 font-black whitespace-nowrap">{profil.hp || 'Belum diisi'}</p></div><div><p class="text-xs font-bold text-slate-400">Email</p><p class="mt-1 font-black">{profil.email || 'Belum diisi'}</p></div><div><p class="text-xs font-bold text-slate-400">Jenis kelamin</p><p class="mt-1 font-black">{profil.gender || 'Belum diisi'}</p></div></div>
	</Card>
	<Card padding="lg" class="mt-5"><div class="flex items-center justify-between gap-3"><div class="flex items-center gap-3"><span class="grid size-10 place-items-center rounded-xl bg-primary-50 text-primary-700"><MapPin size={19} /></span><div><h2 class="font-black">Alamat saya</h2><p class="text-sm font-medium text-slate-500">Alamat utama untuk pengiriman.</p></div></div><Button variant="outline" size="sm" onclick={() => goto('/marketplace/alamat')}><Pencil size={15} /> Kelola</Button></div><div class="mt-4 rounded-2xl bg-slate-50 p-4"><p class="font-black">{profil.nama || 'Nama penerima'} <span class="font-medium text-slate-500">· {profil.hp || 'Nomor WhatsApp'}</span></p><p class="mt-2 text-sm leading-6 font-medium text-slate-600">{alamatTampil || 'Belum ada alamat utama. Tambahkan alamat agar checkout lebih cepat.'}</p><a href="/marketplace/alamat" class="mt-3 inline-flex text-sm font-black text-primary-700">Kelola beberapa alamat →</a></div></Card>
	<Card padding="none" class="mt-5 overflow-hidden"><div class="px-5 py-4"><h2 class="font-black">Akun & pengaturan</h2></div><a href="/marketplace/pesanan" class="flex items-center gap-3 border-t border-slate-100 px-5 py-4 text-sm font-black text-slate-600 hover:bg-slate-50"><PackageCheck size={19} /><span class="flex-1">Pesanan saya</span><ChevronRight size={18} /></a><a href="/marketplace/notifikasi" class="flex items-center gap-3 border-t border-slate-100 px-5 py-4 text-sm font-black text-slate-600 hover:bg-slate-50"><Bell size={19} /><span class="flex-1">Notifikasi</span><ChevronRight size={18} /></a><div class="border-t border-slate-100 px-2 py-1"><Button variant="ghost" fullWidth class="justify-start" onclick={() => segera('Keamanan akun')}><LockKeyhole size={19} /><span class="flex-1 text-left">Keamanan akun</span><ChevronRight size={18} /></Button></div><div class="border-t border-slate-100 px-2 py-1"><Button variant="ghost" fullWidth class="justify-start" onclick={() => segera('Privasi akun')}><ShieldCheck size={19} /><span class="flex-1 text-left">Privasi & bantuan</span><ChevronRight size={18} /></Button></div><a href="/login" class="flex items-center gap-3 border-t border-slate-100 px-5 py-4 text-sm font-black text-slate-600 hover:bg-slate-50"><Store size={19} /><span class="flex-1">Masuk sebagai pengelola UBER POKJA</span><ChevronRight size={18} /></a></Card>
	<Card padding="lg" class="mt-5"><h2 class="font-black">Preferensi notifikasi</h2><div class="mt-4 space-y-3"><Switch bind:checked={profil.notifPesanan} card label="Status pesanan" description="Pembayaran, proses Gudang, dan pengiriman." /><Switch bind:checked={profil.notifPromo} card label="Promo UBER Market" description="Paket hemat dan produk pilihan." /></div></Card>
	<Button fullWidth size="lg" class="mt-6 mb-8" onclick={simpan}>Simpan perubahan</Button>
</div></main>

<!-- Ubah data pribadi: sheet bawah di HP, modal di laptop -->
<FormSheet bind:open={editData} title="Ubah data pribadi" description="Digunakan untuk identitas dan pengiriman pesanan.">
	<div class="grid gap-4 sm:grid-cols-2"><div class="sm:col-span-2"><Input label="Nama lengkap" placeholder="Nama lengkap" bind:value={profil.nama} /></div><Input label="Nomor WhatsApp" inputmode="tel" placeholder="08xx-xxxx-xxxx" bind:value={profil.hp} /><Input label="Email" inputmode="email" placeholder="nama@email.com" bind:value={profil.email} /><Select label="Jenis kelamin" options={[{ value: '', label: 'Pilih jika ingin diisi' }, { value: 'Perempuan', label: 'Perempuan' }, { value: 'Laki-laki', label: 'Laki-laki' }, { value: 'Lainnya', label: 'Lainnya' }]} bind:value={profil.gender} /><DatePicker label="Tanggal lahir" bind:value={profil.lahir} /></div>
	{#snippet footer()}
		<div class="grid w-full grid-cols-[auto_1fr] gap-2 sm:flex sm:justify-end">
			<Button variant="outline" onclick={() => (editData = false)}>Batal</Button>
			<Button onclick={() => { simpan(); editData = false; }}>Simpan</Button>
		</div>
	{/snippet}
</FormSheet>
