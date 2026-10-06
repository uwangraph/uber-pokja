<script>
	import { onMount } from 'svelte';
	import { Button, Card, Input, showToast } from '@khwarizmi/svelte-ui';
	import { Check, ChevronLeft, Home, MapPin, Plus } from 'lucide-svelte';

	const STORAGE = 'uber-pokja:marketplace:addresses';
	let alamat = $state([]);
	let formBuka = $state(false);
	let baru = $state({ label: 'Rumah', nama: '', hp: '', detail: '', kota: '', kodePos: '' });
	const formatAlamat = (item) => [item.detail, item.kota, item.kodePos].filter(Boolean).join(', ');

	function simpan() { localStorage.setItem(STORAGE, JSON.stringify(alamat)); }
	function jadikanUtama(id) {
		alamat = alamat.map((item) => ({ ...item, utama: item.id === id }));
		const utama = alamat.find((item) => item.utama);
		if (utama) {
			const pembeli = JSON.parse(localStorage.getItem('uber-pokja:marketplace:buyer') ?? '{}');
			localStorage.setItem('uber-pokja:marketplace:buyer', JSON.stringify({ ...pembeli, nama: utama.nama, hp: utama.hp, alamat: utama.detail, kota: utama.kota, kodePos: utama.kodePos }));
		}
		simpan();
		showToast({ tone: 'success', title: 'Alamat utama diperbarui' });
	}
	function tambahAlamat() {
		if (!baru.nama.trim() || !baru.hp.trim() || !baru.detail.trim()) { showToast({ tone: 'warning', title: 'Alamat belum lengkap', description: 'Isi penerima, nomor WhatsApp, dan detail alamat.' }); return; }
		alamat = [...alamat, { ...baru, id: crypto.randomUUID(), utama: alamat.length === 0 }];
		simpan();
		if (alamat.length === 1) jadikanUtama(alamat[0].id);
		baru = { label: 'Rumah', nama: '', hp: '', detail: '', kota: '', kodePos: '' };
		formBuka = false;
	}
	onMount(() => {
		try {
			alamat = JSON.parse(localStorage.getItem(STORAGE) ?? '[]');
			if (!alamat.length) {
				const pembeli = JSON.parse(localStorage.getItem('uber-pokja:marketplace:buyer') ?? '{}');
				if (pembeli.nama || pembeli.alamat) alamat = [{ id: 'utama', label: 'Rumah', nama: pembeli.nama ?? '', hp: pembeli.hp ?? '', detail: pembeli.alamat ?? '', kota: pembeli.kota ?? '', kodePos: pembeli.kodePos ?? '', utama: true }];
				simpan();
			}
		} catch {}
	});
</script>

<svelte:head><title>Alamat Saya · UBER Market</title></svelte:head>

<main class="min-h-dvh bg-[#faf9f5] px-4 py-5 text-slate-800 sm:px-6"><div class="mx-auto max-w-2xl">
	<a href="/marketplace/profil" class="inline-flex items-center gap-1.5 text-sm font-black text-primary-700"><ChevronLeft size={18} /> Kembali ke profil</a>
	<header class="mt-6 flex items-start justify-between gap-4"><div><h1 class="text-2xl font-black">Alamat saya</h1><p class="mt-1 text-sm font-medium text-slate-500">Simpan beberapa alamat dan pilih satu alamat utama untuk checkout.</p></div><Button size="sm" class="shrink-0 !bg-none !bg-brand-600 !shadow-[0_4px_0_0_#0b432c] hover:!translate-y-[2px] hover:!shadow-[0_2px_0_0_#0b432c] active:!translate-y-[4px] active:!shadow-none" onclick={() => (formBuka = !formBuka)}><Plus size={16} /> Tambah</Button></header>
	{#if formBuka}<Card padding="lg" class="mt-6"><h2 class="font-black">Tambah alamat baru</h2><div class="mt-5 grid gap-4 sm:grid-cols-2"><Input label="Label alamat" placeholder="Rumah, Kantor, dll." bind:value={baru.label} /><Input label="Nama penerima" placeholder="Nama lengkap" bind:value={baru.nama} /><Input label="Nomor WhatsApp" inputmode="tel" placeholder="08xx-xxxx-xxxx" bind:value={baru.hp} /><Input label="Kota / kabupaten" placeholder="Nama kota atau kabupaten" bind:value={baru.kota} /><div class="sm:col-span-2"><Input label="Alamat lengkap" placeholder="Jalan, nomor rumah, RT/RW, kelurahan, kecamatan" bind:value={baru.detail} /></div><Input label="Kode pos" inputmode="numeric" placeholder="Contoh: 16370" bind:value={baru.kodePos} /></div><div class="mt-5 flex justify-end gap-2"><Button variant="outline" class="!border-slate-300 !bg-white !text-slate-700 !shadow-[0_3px_0_0_#cbd5e1] hover:!translate-y-px hover:!bg-white hover:!shadow-[0_2px_0_0_#cbd5e1] active:!translate-y-[3px] active:!shadow-none" onclick={() => (formBuka = false)}>Batal</Button><Button class="!bg-none !bg-brand-600 !shadow-[0_4px_0_0_#0b432c] hover:!translate-y-[2px] hover:!shadow-[0_2px_0_0_#0b432c] active:!translate-y-[4px] active:!shadow-none" onclick={tambahAlamat}>Simpan alamat</Button></div></Card>{/if}
	<section class="mt-6 space-y-4">{#each alamat as item (item.id)}<Card padding="lg" tone={item.utama ? 'primary' : 'neutral'} class={item.utama ? '!shadow-[0_6px_0_0_var(--primary-300)]' : ''}><div class="flex gap-3"><span class="grid size-10 shrink-0 place-items-center rounded-xl bg-primary-50 text-primary-700"><MapPin size={19} /></span><div class="min-w-0 flex-1"><div class="flex flex-wrap items-center gap-2"><h2 class="font-black">{item.label || 'Alamat'}</h2>{#if item.utama}<span class="inline-flex items-center gap-1 rounded-full bg-primary-100 px-2.5 py-1 text-xs font-black text-primary-800"><Check size={13} /> Utama</span>{/if}</div><p class="mt-3 font-black">{item.nama} <span class="font-medium text-slate-500">· {item.hp}</span></p><p class="mt-2 text-sm leading-6 font-medium text-slate-600">{formatAlamat(item)}</p>{#if !item.utama}<Button variant="outline" size="sm" class="mt-4 !border-primary-200 !bg-primary-50 !text-primary-800 !shadow-[0_2px_0_0_var(--primary-200)] hover:!translate-y-px hover:!bg-primary-50 hover:!shadow-[0_1px_0_0_var(--primary-200)] active:!translate-y-[2px] active:!shadow-none" onclick={() => jadikanUtama(item.id)}><Home size={15} /> Jadikan utama</Button>{/if}</div></div></Card>{:else}<Card padding="lg" class="mt-6 text-center"><MapPin class="mx-auto text-primary-700" size={26} /><h2 class="mt-3 font-black">Belum ada alamat</h2><p class="mt-1 text-sm text-slate-500">Tambahkan alamat pertama untuk pengiriman pesanan.</p></Card>{/each}</section>
</div></main>
