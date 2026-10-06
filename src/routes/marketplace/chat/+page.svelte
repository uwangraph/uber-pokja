<script>
	import { Button, Input } from '@khwarizmi/svelte-ui';
	import { ChevronLeft, MessageCircle } from 'lucide-svelte';
	let teks = $state('');
	let chat = $state([{ dari: 'admin', isi: 'Assalamu’alaikum, ada yang bisa kami bantu?' }]);
	function kirim() { if (teks.trim()) { chat.push({ dari: 'customer', isi: teks.trim() }); teks = ''; } }
</script>

<svelte:head><title>Chat Bantuan · UBER Market</title></svelte:head>
<main class="min-h-dvh bg-[#faf9f5] px-4 py-5 text-slate-800 sm:px-6"><div class="mx-auto flex min-h-[calc(100dvh-2.5rem)] max-w-2xl flex-col">
	<a href="/marketplace" class="inline-flex items-center gap-1.5 text-sm font-black text-primary-700"><ChevronLeft size={18} /> Kembali ke beranda</a>
	<header class="mt-6 flex items-center gap-3 border-b border-slate-200 pb-5"><span class="grid size-11 place-items-center rounded-2xl bg-primary-100 text-primary-700"><MessageCircle size={21} /></span><div><h1 class="font-black">Chat bantuan</h1><p class="text-sm font-medium text-slate-500">Tim UBER Market siap membantu Anda.</p></div></header>
	<section class="flex flex-1 flex-col justify-end gap-3 py-6">{#each chat as pesan}<div class="flex {pesan.dari === 'customer' ? 'justify-end' : 'justify-start'}"><p class="max-w-[85%] rounded-2xl px-4 py-3 text-sm font-medium {pesan.dari === 'customer' ? 'bg-primary-700 text-white' : 'bg-white text-slate-700 shadow-sm ring-1 ring-slate-200'}">{pesan.isi}</p></div>{/each}</section>
	<form class="flex gap-2 border-t border-slate-200 pt-4" onsubmit={(e) => { e.preventDefault(); kirim(); }}><Input aria-label="Tulis pesan" placeholder="Tulis pesan…" bind:value={teks} /><Button type="submit">Kirim</Button></form>
</div></main>
